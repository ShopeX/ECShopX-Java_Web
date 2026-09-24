/**
 * 购物车业务组合式函数（轻量级 DDD）
 *
 * 职责：
 * - 管理购物车状态和业务逻辑
 * - 封装业务规则和验证
 * - 提供统一的 API 给视图层
 *
 * 特点：
 * - 使用值对象保证数据安全
 * - 直接操作简单对象，不使用复杂的领域模型
 * - 业务逻辑内聚在 Composable 中
 *
 * @example
 * ```vue
 * <script setup>
 * const {
 *   cart,
 *   loading,
 *   addToCart,
 *   updateQuantity
 * } = useCart()
 *
 * onMounted(() => {
 *   loadCart()
 * })
 * </script>
 * ```
 */

import { MoneyValueObject, QuantityValueObject, DiscountValueObject } from '~/shared/value-objects'
import { hasCartMemberPriceLayout } from '~/utils/cartItemPrice'
import { BusinessError } from '~/shared/errors'
import { useCartUIStore } from '~/stores/cartUI'
import { cartApiClient } from '~/infrastructure/http/clients'
import { CartTransformer } from '~/infrastructure/transformers/cartTransformer'
import type { IAddCartRequest, IUpdateCartRequest } from '~/types/api/cart'
import type { ICartItemModel, ICartModel, ICartStoreGroupMeta } from '~/types/cart'
import { useToastMessage } from '~/composables/useToastMessage'
import { logger } from '~/utils/log'
import { resolveDistributorId } from '~/utils/resolveDistributorId'

/**
 * 购物车 UI 数据接口
 */
export interface ICartUI {
  // ... (removing the old definitions of ICartItemModel and ICartModel)

  /** 购物车商品列表 */
  items: {
    id: string
    productId: string
    productBn?: string
    productName: string
    productImage: string
    specId: string
    specName: string
    price: number
    priceDisplay: string
    salePriceCents: number
    memberPriceCents: number
    marketPrice: number
    marketPriceCents: number
    marketPriceDisplay: string
    effectivePriceDisplay: string
    hasMemberPriceLayout: boolean
    hasMarketDiscount: boolean
    quantity: number
    quantityMin: number
    quantityMax: number
    stock: number
    selected: boolean
    subtotal: number
    subtotalDisplay: string
    canBePurchased: boolean
    hasDiscount: boolean
    discountPercent: number
  }[]
  /** 合计金额显示 */
  total: string
  /** 合计金额数值 */
  totalAmount: number
  /** 选中商品合计显示 */
  selectedTotal: string
  /** 选中商品合计数值 */
  selectedAmount: number
  /** 商品总数 */
  itemCount: number
  /** 选中商品数量 */
  selectedCount: number
  /** 是否全选 */
  isAllSelected: boolean
  /** 是否有选中商品 */
  hasSelectedItems: boolean
  /** 是否可以结算 */
  canCheckout: boolean
  /** 购物车是否为空 */
  isEmpty: boolean
}

/** 购物袋按店铺分组的 UI 结构 */
export interface ICartStoreGroupUI {
  id: string
  storeName: string
  storeLogo?: string
  items: ICartUI['items']
}

/**
 * 购物车业务组合式函数
 */
export function useCart() {
  // ✅ 使用自定义 Toast 消息提示
  const toast = useToastMessage()
  const { t } = useI18n()

  // ✅ Pinia Store 完全支持 SSR，可以直接调用
  const cartStore = useCartStore()
  const cartUIStore = useCartUIStore()

  // 移除本地 ref，改用 store 的计算属性
  const items = computed(() => cartStore.items as ICartItemModel[])
  const invalidItems = computed(() => cartStore.invalidItems as ICartItemModel[])
  const error = ref<string | null>(null)
  const loading = computed(() => cartUIStore.loading)

  /**
   * 获取用户 ID（临时实现）
   */
  const getUserId = (): string => {
    return 'current-user'
  }

  /**
   * 获取购物车商品列表（类型安全）
   */
  const getCartItems = (): ICartItemModel[] => {
    return items.value
  }

  // ==================== 业务规则（内聚在 Composable 中） ====================

  /**
   * 验证商品是否可购买
   */
  const canItemBePurchased = (item: ICartItemModel): boolean => {
    return item.stock > 0 && item.quantity.value <= item.stock
  }

  /**
   * 计算商品小计
   */
  const calculateItemSubtotal = (item: ICartItemModel): MoneyValueObject => {
    return item.effectivePrice.multiply(item.quantity.value)
  }

  /**
   * 计算总金额
   */
  const calculateTotal = (): MoneyValueObject => {
    return getCartItems().reduce<MoneyValueObject>(
      (total, item) => total.add(calculateItemSubtotal(item)),
      MoneyValueObject.zero()
    )
  }

  /**
   * 计算选中商品的总价
   */
  const calculateSelectedTotal = (): MoneyValueObject => {
    return getCartItems()
      .filter((item) => item.selected)
      .reduce<MoneyValueObject>(
        (total, item) => total.add(calculateItemSubtotal(item)),
        MoneyValueObject.zero()
      )
  }

  /**
   * 获取选中商品数量
   */
  const getSelectedCount = (): number => {
    return getCartItems().filter((item) => item.selected).length
  }

  /**
   * 判断是否全部选中
   */
  const isAllSelected = (): boolean => {
    const availableItems = getCartItems().filter((item) => canItemBePurchased(item))
    if (availableItems.length === 0) {
      return false
    }
    return availableItems.every((item) => item.selected)
  }

  /**
   * 判断是否有选中商品
   */
  const hasSelectedItems = (): boolean => {
    return getCartItems().some((item) => item.selected)
  }

  /**
   * 判断是否可以结算
   */
  const canCheckout = (): boolean => {
    const selectedItems = getCartItems().filter((item) => item.selected)
    if (selectedItems.length === 0) {
      return false
    }
    return selectedItems.every((item) => canItemBePurchased(item))
  }

  /**
   * 计算商品折扣
   */
  const calculateDiscount = (item: ICartItemModel): DiscountValueObject => {
    return DiscountValueObject.fromPrices(item.price, item.marketPrice)
  }

  // ==================== UI 数据转换 ====================

  const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

  const translateIfGeneratedKey = (value: string): string => {
    return generatedKeyPattern.test(value) ? t(value) : value
  }

  const translateErrorMessage = (
    value: string,
    params?: Record<string, string | number>
  ): string => {
    return generatedKeyPattern.test(value) ? t(value, params || {}) : value
  }

  /**
   * 将模型转换为 UI 展现格式
   */
  const mapToUIItem = (item: ICartItemModel) => {
    const subtotal = calculateItemSubtotal(item)
    const discount = calculateDiscount(item)
    const salePriceCents = Math.round(item.price.amount * 100)
    const memberPriceCentsForLayout = item.memberPrice
      ? Math.round(item.memberPrice.amount * 100)
      : null
    const memberPriceCents = memberPriceCentsForLayout ?? 0
    const marketPriceCents = Math.round(item.marketPrice.amount * 100)
    const hasMemberPriceLayout = hasCartMemberPriceLayout(
      salePriceCents,
      memberPriceCentsForLayout
    )
    const hasMarketDiscount = !hasMemberPriceLayout && discount.hasDiscount()

    return {
      id: item.id,
      productId: item.productId,
      goodsId: item.goodsId || item.productId,
      productBn: item.productBn || '',
      productName: translateIfGeneratedKey(item.productName),
      productImage: item.productImage,
      specId: item.specId,
      specName: translateIfGeneratedKey(item.specName),
      price: item.effectivePrice.amount,
      priceDisplay: item.effectivePrice.display,
      salePriceCents,
      memberPriceCents,
      marketPrice: item.marketPrice.amount,
      marketPriceCents,
      marketPriceDisplay: item.marketPrice.display,
      effectivePriceDisplay: item.effectivePrice.display,
      hasMemberPriceLayout,
      hasMarketDiscount,
      quantity: item.quantity.value,
      quantityMin: item.quantity.min,
      quantityMax: item.quantity.max,
      stock: item.stock,
      selected: item.selected,
      subtotal: subtotal.amount,
      subtotalDisplay: subtotal.display,
      canBePurchased: canItemBePurchased(item),
      hasDiscount: hasMemberPriceLayout || hasMarketDiscount,
      discountPercent: discount.percent,
      marketingTags: item.marketingTags || [],
      distributorId: item.distributorId || '',
      storeName: item.storeName || '',
      storeLogo: item.storeLogo || '',
    }
  }

  const buildCartStoreGroupsUI = (
    uiItems: ICartUI['items'],
    groups: ICartStoreGroupMeta[]
  ): ICartStoreGroupUI[] => {
    if (!groups.length) {
      return [{ id: 'default', storeName: '', items: uiItems }]
    }

    const assigned = new Set<string>()
    const grouped = groups
      .map((group) => {
        const groupItems = uiItems.filter((item) => {
          const distributorId = item.distributorId || '0'
          const matched =
            distributorId === group.id ||
            (distributorId === '0' && group.id === '0') ||
            (!item.distributorId && group.id === '0')
          if (matched) {
            assigned.add(item.id)
          }
          return matched
        })

        return {
          id: group.id,
          storeName: group.storeName || groupItems[0]?.storeName || '',
          storeLogo: group.storeLogo || groupItems[0]?.storeLogo,
          items: groupItems,
        }
      })
      .filter((group) => group.items.length > 0)

    const orphanItems = uiItems.filter((item) => !assigned.has(item.id))
    if (orphanItems.length > 0) {
      grouped.push({
        id: 'orphan',
        storeName: orphanItems[0]?.storeName || '',
        storeLogo: orphanItems[0]?.storeLogo,
        items: orphanItems,
      })
    }

    return grouped.length > 0 ? grouped : [{ id: 'default', storeName: '', items: uiItems }]
  }

  /**
   * 转换为 UI 数据
   */
  const cartUI = computed<
    ICartUI & {
      invalidItems: any[]
      cartTotalDisplay: string
      discountFeeDisplay: string
      finalTotalDisplay: string
    }
  >(() => {
    const total = calculateTotal()
    const selectedTotal = calculateSelectedTotal()

    // ✅ 使用 API 返回的汇总数据（单位：分）
    const cartTotalPrice = cartStore.cartTotalPrice / 100 // 转换为元
    const discountFee = cartStore.discountFee / 100 // 转换为元
    const finalTotal = cartTotalPrice - discountFee // 最终总计（商品总计 - 优惠）

    return {
      items: getCartItems().map(mapToUIItem),
      invalidItems: invalidItems.value.map(mapToUIItem),
      total: total.display,
      totalAmount: total.amount,
      selectedTotal: selectedTotal.display,
      selectedAmount: selectedTotal.amount,
      itemCount: cartStore.totalItems,
      selectedCount: getSelectedCount(),
      isAllSelected: isAllSelected(),
      hasSelectedItems: hasSelectedItems(),
      canCheckout: canCheckout(),
      isEmpty: items.value.length === 0 && invalidItems.value.length === 0,
      // ✅ API 返回的汇总数据
      cartTotalDisplay: MoneyValueObject.of(cartTotalPrice).display, // 商品总计
      discountFeeDisplay: MoneyValueObject.of(discountFee).display, // 优惠金额
      finalTotalDisplay: MoneyValueObject.of(finalTotal).display, // 最终总计
    }
  })

  const cartStoreGroupsUI = computed(() =>
    buildCartStoreGroupsUI(
      getCartItems().map(mapToUIItem),
      cartStore.storeGroups
    )
  )

  // ==================== API 操作（委托给 Store） ====================

  /**
   * 加载购物车
   * @param options.silent 静默模式，不显示 loading 状态
   * @param options.summaryOnly 仅更新汇总数据，不更新商品列表
   */
  const loadCart = async (options?: { silent?: boolean; summaryOnly?: boolean }) => {
    try {
      await cartStore.loadCart(options)
    } catch (err: any) {
      error.value = err.message || t('5e601ea3.87cb99')
      throw err
    }
  }

  /**
   * 添加商品到购物车
   */
  const addToCart = async (params: {
    cart_type?: 'cart' | 'fastbuy'
    item_id: string
    num: number
    distributor_id?: string
    shop_type?: 'distributor'
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. 业务验证
      if (params.num <= 0) {
        throw BusinessError.quantityInvalid(params.num)
      }
      // if (params.stock !== undefined && params.num > params.stock) {
      //   throw BusinessError.insufficientStock(params.productName || '商品', params.stock)
      // }

      // 2. 调用 Store 执行底层操作
      await cartStore.addItem({
        item_id: params.item_id,
        num: params.num,
        distributor_id: resolveDistributorId(params.distributor_id),
        shop_type: params.shop_type ?? 'distributor',
        cart_type: params.cart_type ?? 'cart',
      })

      params.cart_type === 'cart' && toast.show(t('5e601ea3.ba20ce'))

      return { success: true }
    } catch (err: any) {
      const errorMsg = err.message
        ? translateErrorMessage(err.message, err.details)
        : t('5e601ea3.6452a0')
      toast.show(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 更新商品数量
   */
  const updateQuantity = async (
    itemId: string,
    quantity: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await cartStore.updateQuantity(itemId, quantity)
      return { success: true }
    } catch (err: any) {
      // ❌ HTTP 插件已经显示过错误消息，这里不再重复显示
      const errorMsg = err.message || t('5e601ea3.930442')
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 切换商品选中状态
   */
  const toggleItemSelection = async (
    itemId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await cartStore.toggleItemSelection(itemId)
      return { success: true }
    } catch (err: any) {
      // ❌ HTTP 插件已经显示过错误消息，这里不再重复显示
      const errorMsg = err.message || t('5e601ea3.2d5fba')
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 全选/取消全选
   */
  const toggleAllSelection = async (
    selected: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await cartStore.toggleAllSelection(selected)
      return { success: true }
    } catch (err: any) {
      // ❌ HTTP 插件已经显示过错误消息，这里不再重复显示
      const errorMsg = err.message || t('5e601ea3.197197')
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 删除选中的商品
   */
  const removeSelectedItems = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await cartStore.removeSelectedItems()
      // ✅ 只有成功时才显示成功消息
      toast.show(t('5e601ea3.d38be8'))
      return { success: true }
    } catch (err: any) {
      // ❌ HTTP 插件已经显示过错误消息，这里不再重复显示
      const errorMsg = err.message || t('5e601ea3.acf066')
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 删除商品
   */
  const removeItem = async (itemId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await cartStore.removeItem(itemId)
      // ✅ 只有成功时才显示成功消息
      toast.show(t('5e601ea3.450d0f'))
      return { success: true }
    } catch (err: any) {
      // ❌ HTTP 插件已经显示过错误消息，这里不再重复显示
      const errorMsg = err.message || t('5e601ea3.acf066')
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 清空购物车
   */
  const clearCart = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await cartStore.clearCart()
      // ✅ 只有成功时才显示成功消息
      toast.show(t('5e601ea3.f8b666'))
      return { success: true }
    } catch (err: any) {
      // ❌ HTTP 插件已经显示过错误消息，这里不再重复显示
      const errorMsg = err.message || t('5e601ea3.ec25de')
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 其他 UI 状态查询保持不变，但使用 Store
   */
  const isItemLoading = (itemId: string, action: 'update' | 'remove'): boolean => {
    const key = `${action}-${itemId}`
    return cartUIStore.isActionLoading(key)
  }

  return {
    // 响应式状态
    items,
    invalidItems,
    cartUI,
    cartStoreGroupsUI,
    loading,
    error,

    // 方法
    loadCart,
    addToCart,
    updateQuantity,
    toggleItemSelection,
    toggleAllSelection,
    removeSelectedItems,
    removeItem,
    clearCart,
    isItemLoading,

    // 兼容原有接口（如果其他地方在用）
    cart: computed(() => ({
      items: items.value,
      itemCount: items.value.length,
      totalQuantity: cartStore.totalItems,
    })),
  }
}
