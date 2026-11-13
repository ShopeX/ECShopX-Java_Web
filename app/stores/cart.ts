import { defineStore } from 'pinia'
import { cartApiClient } from '~/infrastructure/http/clients'
import { CartTransformer } from '~/infrastructure/transformers/cartTransformer'
import type { ICartItemModel, ICartStoreGroupMeta } from '~/types/cart'
import type { IAddCartRequest } from '~/types/api/cart'
import { useCartUIStore } from './cartUI'
import { useDistributorStore } from './distributor'
import { MoneyValueObject, QuantityValueObject } from '~/shared/value-objects'
import { normalizeCartQuantityParts } from '~/utils/cartQuantity'
import { getBusinessMode } from '~/composables/useTemplate'
import { scopeCachedCartState, scopeCartGroupsToDistributor } from '~/utils/b2cCartScope'

interface CartState {
  /** 有效商品列表 */
  items: ICartItemModel[]
  /** 按店铺分组顺序（来自 valid_cart） */
  storeGroups: ICartStoreGroupMeta[]
  /** 失效商品列表 */
  invalidItems: ICartItemModel[]
  /** 购物车商品总计（单位：分），由后端返回 */
  cartTotalPrice: number
  /** 购物车优惠金额（单位：分），由后端返回 */
  discountFee: number
  /** 是否已初始化 */
  initialized: boolean
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    // 首屏不读 localStorage。客户端若在水合前恢复缓存，角标数字会和服务端的 0 不一致。
    items: [],
    storeGroups: [],
    invalidItems: [],
    cartTotalPrice: 0,
    discountFee: 0,
    initialized: false,
  }),

  getters: {
    totalItems: (state) => state.items.reduce((total, item) => total + item.quantity.value, 0),

    totalPrice: (state) => {
      return state.items.reduce((total, item) => total + item.price.amount * item.quantity.value, 0)
    },

    estimatedTotal: (state) => {
      return state.items.reduce((total, item) => total + item.price.amount * item.quantity.value, 0)
    },
  },

  actions: {
    restoreCachedCart() {
      if (!import.meta.client || this.initialized || this.items.length || this.invalidItems.length) {
        return
      }

      let initialItems: ICartItemModel[] = []
      let initialInvalidItems: ICartItemModel[] = []
      let initialStoreGroups: ICartStoreGroupMeta[] = []

      try {
        const cached = localStorage.getItem('cart_cache')
        if (!cached) return
        const parsed = JSON.parse(cached)
        let rawItems: any[] = []
        let rawInvalidItems: any[] = []

        if (Array.isArray(parsed)) {
          rawItems = parsed
        } else {
          rawItems = parsed.items || []
          rawInvalidItems = parsed.invalidItems || []
          if (Array.isArray(parsed.storeGroups)) {
            initialStoreGroups = parsed.storeGroups
              .filter((group: unknown) => group && typeof group === 'object')
              .map((group: any) => ({
                id: String(group.id ?? ''),
                storeName: String(group.storeName ?? ''),
                ...(group.storeLogo ? { storeLogo: String(group.storeLogo) } : {}),
              }))
              .filter((group: ICartStoreGroupMeta) => group.id)
          }
        }

        const toCartItem = (item: any) => {
          const salePrice = MoneyValueObject.of(item.price.amount || item.price)
          const effectivePrice = MoneyValueObject.of(
            item.effectivePrice?.amount ?? (item.price.amount || item.price)
          )
          const { num, store, max } = normalizeCartQuantityParts(
            item.quantity?.value ?? item.quantity,
            item.stock
          )
          return {
            ...item,
            price: salePrice,
            marketPrice: MoneyValueObject.of(item.marketPrice.amount || item.marketPrice),
            memberPrice: item.memberPrice
              ? MoneyValueObject.of(item.memberPrice.amount || item.memberPrice)
              : null,
            activityPrice: item.activityPrice
              ? MoneyValueObject.of(item.activityPrice.amount || item.activityPrice)
              : null,
            packagePrice: item.packagePrice
              ? MoneyValueObject.of(item.packagePrice.amount || item.packagePrice)
              : null,
            effectivePrice,
            stock: store,
            quantity: QuantityValueObject.of(num, 1, max),
          }
        }

        initialItems = rawItems.map(toCartItem)
        initialInvalidItems = rawInvalidItems.map(toCartItem)

        if (getBusinessMode() === 'b2c') {
          const scoped = scopeCachedCartState(
            {
              items: initialItems,
              invalidItems: initialInvalidItems,
              storeGroups: initialStoreGroups,
            },
            { businessMode: 'b2c', distributorId: readCachedDefaultDistributorId() }
          )
          initialItems = scoped.items
          initialInvalidItems = scoped.invalidItems
          initialStoreGroups = scoped.storeGroups
        }
      } catch (e) {
        console.warn('Failed to parse cart cache', e)
        return
      }

      this.items = initialItems
      this.invalidItems = initialInvalidItems
      this.storeGroups = initialStoreGroups
    },

    /**
     * 加载购物车并同步缓存
     * @param options.silent 静默模式，不显示 loading 状态
     * @param options.summaryOnly 仅更新汇总数据，不更新商品列表（用于乐观更新后同步）
     */
    async loadCart(options: { silent?: boolean; summaryOnly?: boolean } = {}) {
      const { silent = false, summaryOnly = false } = options
      const cartUI = useCartUIStore()

      if (!silent) {
        cartUI.setLoading(true)
      }

      try {
        // B2C 先取 is_valid 店铺再拉购物车；BBC 仍跨店聚合
        const businessMode = getBusinessMode()
        const distributorId =
          businessMode === 'b2c' ? await resolveB2cCartDistributorId() : '0'
        const data = await cartApiClient.getCartList(
          businessMode === 'b2c' ? distributorId : undefined
        )

        // ✅ 修复：API 返回的是分组结构，需要从 list 中提取所有商品
        // 接口若仍返回其他店铺，B2C 再按 is_valid 店铺裁剪
        const validCartGroups = scopeCartGroupsToDistributor(data?.valid_cart || [], {
          businessMode,
          distributorId,
        })
        const invalidCartGroups = scopeCartGroupsToDistributor(data?.invalid_cart || [], {
          businessMode,
          distributorId,
        })

        // ✅ 根据模式决定是否更新商品列表
        if (!summaryOnly) {
          // 从每个分组中提取 list，并回填分组上的店铺信息（shop_id / 店名）
          const rawItems = validCartGroups.flatMap((group: any) =>
            (group.list || []).map((item: any) =>
              CartTransformer.enrichItemWithGroup(item, group)
            )
          )
          const rawInvalidItems = invalidCartGroups.flatMap((group: any) =>
            (group.list || []).map((item: any) =>
              CartTransformer.enrichItemWithGroup(item, group)
            )
          )

          this.items = CartTransformer.toModelList(rawItems)
          this.invalidItems = CartTransformer.toModelList(rawInvalidItems)
          this.storeGroups = validCartGroups.map((group: any, index: number) =>
            CartTransformer.toStoreGroupMeta(group, index)
          )
        }

        // ✅ 提取 API 返回的汇总数据（始终更新）
        // 从第一个分组中提取汇总数据（通常所有分组的汇总数据都在第一个）
        const firstGroup = validCartGroups[0] || {}
        this.cartTotalPrice = Number(firstGroup.cart_total_price || 0) // 商品总计（分）
        this.discountFee = Number(firstGroup.discount_fee || 0) // 优惠金额（分）

        this.initialized = true
        cartUI.updateLastUpdateTime()

        // 只有在完整加载时才同步缓存
        if (!summaryOnly) {
          this.syncToCache()
        }
      } catch (error) {
        console.error('Failed to load cart:', error)
      } finally {
        if (!silent) {
          cartUI.setLoading(false)
        }
      }
    },

    /**
     * 添加商品到购物车
     */
    async addItem(params: IAddCartRequest) {
      const cartUI = useCartUIStore()
      cartUI.setLoading(true)
      try {
        await cartApiClient.addToCart({
          item_id: params.item_id,
          num: params.num,
          distributor_id: params.distributor_id,
          shop_type: params.shop_type,
          cart_type: params.cart_type,
        })
        await this.loadCart()
      } catch (error) {
        console.error('Failed to add item:', error)
        throw error
      } finally {
        cartUI.setLoading(false)
      }
    },

    /**
     * 删除购物车商品（乐观更新 + 后台同步）
     */
    /**
     * 删除购物车商品（乐观更新 + 后台同步）
     */
    async removeItem(itemId: string) {
      const cartUI = useCartUIStore()

      // 1. 找到要删除的商品并保存（用于回滚）
      // 先在有效商品列表中找
      let targetList = this.items
      let itemIndex = this.items.findIndex((i) => i.id === itemId)

      // 如果没找到，在失效商品列表中找
      if (itemIndex === -1) {
        targetList = this.invalidItems
        itemIndex = this.invalidItems.findIndex((i) => i.id === itemId)
      }

      if (itemIndex === -1) return

      const removedItem = targetList[itemIndex]! // 断言：已检查 index 存在

      // 2. 乐观更新：立即从列表中移除
      targetList.splice(itemIndex, 1)

      // 3. 调用 API
      cartUI.setActionLoading(itemId, true)
      try {
        await cartApiClient.removeCartItem(itemId)
        // 删除成功后重新拉取列表与汇总，保持与购物车页一致
        await this.loadCart({ silent: true })
      } catch (error) {
        // ❌ 失败：恢复商品到原位置
        console.error('Failed to remove item:', error)
        targetList.splice(itemIndex, 0, removedItem)
        throw error
      } finally {
        cartUI.setActionLoading(itemId, false)
      }
    },

    /**
     * 更新购物车商品数量（乐观更新 + 后台同步）
     */
    async updateQuantity(itemId: string, quantity: number) {
      const cartUI = useCartUIStore()

      // 1. 找到要更新的商品并保存旧数量
      const item = this.items.find((i) => i.id === itemId)
      if (!item) return

      const oldQuantity = item.quantity.value

      // 2. 乐观更新：立即更新本地状态
      try {
        item.quantity = QuantityValueObject.of(quantity, item.quantity.min, item.quantity.max)
      } catch (error) {
        // 数量验证失败
        throw error
      }

      // 3. 调用 API
      cartUI.setActionLoading(itemId, true)
      try {
        await cartApiClient.updateCartItem(itemId, quantity)
        // ✅ 成功：静默更新汇总数据，保持已更新的商品数量
        await this.loadCart({ silent: true, summaryOnly: true })
      } catch (error) {
        // ❌ 失败：回滚到旧数量
        console.error('Failed to update quantity:', error)
        item.quantity = QuantityValueObject.of(oldQuantity, item.quantity.min, item.quantity.max)
        throw error
      } finally {
        cartUI.setActionLoading(itemId, false)
      }
    },

    /**
     * 切换商品选中状态（乐观更新 + 后台同步）
     */
    async toggleItemSelection(itemId: string) {
      const cartUI = useCartUIStore()

      // 1. 找到要更新的商品并保存旧状态
      const item = this.items.find((i) => i.id === itemId)
      if (!item) return

      const oldSelected = item.selected
      const newSelected = !oldSelected

      // 2. 乐观更新：立即切换本地状态
      item.selected = newSelected

      // 3. 同步到本地缓存
      this.syncToCache()

      // 4. 调用 API
      cartUI.setActionLoading(`${itemId}-selection`, true)
      try {
        await cartApiClient.updateCartItemChecked(itemId, newSelected)
        // ✅ 成功：只更新汇总数据（商品总计、优惠等），不重新加载商品列表
        await this.loadCart({ silent: true, summaryOnly: true })
      } catch (error) {
        // ❌ 失败：回滚到旧状态
        console.error('Failed to toggle selection:', error)
        item.selected = oldSelected
        this.syncToCache()
        throw error
      } finally {
        cartUI.setActionLoading(`${itemId}-selection`, false)
      }
    },

    /**
     * 全选/取消全选（乐观更新 + 后台批量同步）
     * 注意：只对可购买的商品（有库存）进行全选操作
     */
    async toggleAllSelection(selected: boolean) {
      const cartUI = useCartUIStore()

      // 1. 筛选可购买的商品（有库存且数量不超过库存）
      const availableItems = this.items.filter(
        (item) => item.stock > 0 && item.quantity.value <= item.stock
      )

      if (availableItems.length === 0) return

      // 2. 保存所有可购买商品的旧选中状态
      const oldStates = availableItems.map((item) => ({ id: item.id, selected: item.selected }))

      // 3. 乐观更新：立即更新可购买商品的选中状态
      availableItems.forEach((item) => {
        item.selected = selected
      })

      // 4. 同步到本地缓存
      this.syncToCache()

      // 5. 调用 API - 批量更新可购买商品的选中状态
      cartUI.setActionLoading('toggle-all', true)
      try {
        const cartIds = availableItems.map((item) => item.id)
        await cartApiClient.batchUpdateCartItemChecked(cartIds, selected)
        // ✅ 成功：只更新汇总数据（商品总计、优惠等），不重新加载商品列表
        await this.loadCart({ silent: true, summaryOnly: true })
      } catch (error) {
        // ❌ 失败：恢复所有商品的旧状态
        console.error('Failed to toggle all selection:', error)
        oldStates.forEach((oldState) => {
          const item = this.items.find((i) => i.id === oldState.id)
          if (item) {
            item.selected = oldState.selected
          }
        })
        this.syncToCache()
        throw error
      } finally {
        cartUI.setActionLoading('toggle-all', false)
      }
    },

    /**
     * 删除选中的商品
     */
    async removeSelectedItems() {
      const cartUI = useCartUIStore()
      cartUI.setLoading(true)
      try {
        await cartApiClient.removeSelectedItems()
        await this.loadCart()
      } catch (error) {
        console.error('Failed to remove selected items:', error)
        throw error
      } finally {
        cartUI.setLoading(false)
      }
    },

    /**
     * 清空购物车
     */
    async clearCart() {
      const cartUI = useCartUIStore()
      cartUI.setLoading(true)
      try {
        await cartApiClient.clearCart()
        this.items = []
        this.storeGroups = []
        this.invalidItems = []
        this.syncToCache()
      } catch (error) {
        console.error('Failed to clear cart:', error)
        throw error
      } finally {
        cartUI.setLoading(false)
      }
    },

    resetLocalCart() {
      this.items = []
      this.storeGroups = []
      this.invalidItems = []
      this.cartTotalPrice = 0
      this.discountFee = 0
      this.initialized = false

      if (import.meta.client) {
        localStorage.removeItem('cart_cache')
      }

      const cartUI = useCartUIStore()
      cartUI.reset()
    },

    /**
     * 将当前购物车状态同步到本地缓存（商品列表 + 店铺分组 + 失效商品）
     */
    syncToCache() {
      if (import.meta.client) {
        localStorage.setItem(
          'cart_cache',
          JSON.stringify({
            items: this.items,
            invalidItems: this.invalidItems,
            storeGroups: this.storeGroups,
          })
        )
      }
    },
  },
})

/** 读取 is_valid 写入的默认店 cookie，供购物车缓存按店铺裁剪 */
function readCachedDefaultDistributorId(): string {
  if (!import.meta.client) return '0'

  const read = (name: string): string => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    if (!match?.[1]) return '0'
    try {
      const parsed = JSON.parse(decodeURIComponent(match[1]))
      const id = Number(parsed?.distributorId ?? 0)
      if (!Number.isFinite(id) || id <= 0) return '0'
      return String(id)
    } catch {
      return '0'
    }
  }

  const current = read('default-distributor')
  return current !== '0' ? current : read('b2c-default-distributor')
}

/** B2C 购物车店铺以 is_valid 为准；接口未就绪时等待同一条请求 */
async function resolveB2cCartDistributorId(): Promise<string> {
  const distributorStore = useDistributorStore()
  if (!distributorStore.isReady) {
    try {
      await distributorStore.fetchDefaultDistributor()
    } catch {
      // is_valid 失败时不回退到其他店铺
    }
  }
  return distributorStore.distributorId
}
