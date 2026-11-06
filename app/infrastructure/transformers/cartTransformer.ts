import type { ICartItem } from '~/types/api/cart'
import type { ICartItemModel, ICartStoreGroupMeta } from '~/types/cart'
import { MoneyValueObject, QuantityValueObject } from '~/shared/value-objects'
import {
  parseCartPriceCents,
  resolveCartEffectivePriceCents,
  type CartItemPriceRaw,
} from '~/utils/cartItemPrice'
import { normalizeCartQuantityParts } from '~/utils/cartQuantity'
import { mapPromotionTags } from '~/utils/promotionTags'

/**
 * 购物车数据转换器（轻量级 DDD）
 *
 * 职责：
 * - API 数据 → 应用模型转换
 * - 数据验证和清洗
 * - 提供默认值处理
 *
 * 不负责：
 * - ❌ 业务规则（由值对象负责）
 * - ❌ 格式化显示（由值对象负责）
 * - ❌ 业务计算（由 Composable 负责）
 *
 * 特点：
 * - 纯函数，无副作用
 * - 只做数据结构转换
 * - 将原始数据转换为值对象
 *
 * @example
 * ```typescript
 * // API 数据转换为应用模型
 * const model = CartTransformer.toModel(apiItem)
 *
 * // 批量转换
 * const models = CartTransformer.toModelList(apiItems)
 * ```
 */
export class CartTransformer {
  private static toMoneyFromCents(value: unknown): MoneyValueObject | null {
    const cents = parseCartPriceCents(value)
    if (cents === null) {
      return null
    }
    return MoneyValueObject.of(cents / 100)
  }

  /**
   * API 数据 → 应用模型
   *
   * 核心职责：将原始 API 数据转换为包含值对象的应用模型
   *
   * @param apiItem - API 返回的购物车商品
   * @returns 应用模型（包含值对象）
   */
  static toModel(apiItem: CartItemPriceRaw & Record<string, any>): ICartItemModel {
    const priceRaw = apiItem as CartItemPriceRaw
    const salePrice = this.toMoneyFromCents(priceRaw.price) ?? MoneyValueObject.zero()
    const marketPrice =
      this.toMoneyFromCents(priceRaw.market_price) ??
      salePrice
    const memberPrice = this.toMoneyFromCents(priceRaw.member_price)
    const activityPrice = this.toMoneyFromCents(priceRaw.activity_price)
    const packagePrice = this.toMoneyFromCents(priceRaw.package_price)
    const effectivePrice =
      this.toMoneyFromCents(resolveCartEffectivePriceCents(priceRaw)) ?? salePrice
    const { num, store, max } = normalizeCartQuantityParts(apiItem.num, apiItem.store)
    const quantity = QuantityValueObject.of(num, 1, max)

    return {
      id: apiItem.cart_id || apiItem.id,
      productId: apiItem.item_id || apiItem.goods_id,
      goodsId: String(
        apiItem.goods_id || apiItem.default_item_id || apiItem.item_id || ''
      ),
      productBn: apiItem.item_bn || '',
      productName: apiItem.item_name || '77b4648d.2b7890',
      productImage: apiItem.pics || '',
      specId: apiItem.item_id || 'default',
      specName: apiItem.item_spec_desc || '77b4648d.064eb9',
      price: salePrice,
      marketPrice,
      memberPrice,
      activityPrice,
      packagePrice,
      effectivePrice,
      quantity,
      stock: store,
      selected: apiItem.is_checked ?? false,
      // 对齐 vshop cart：promotions / activity_info → marketingTags
      marketingTags: mapPromotionTags(apiItem),
      distributorId: this.resolveStoreId(apiItem),
      storeName: this.resolveStoreName(apiItem),
      storeLogo: this.resolveStoreLogo(apiItem),
    }
  }

  /** 解析店铺 ID（cart 分组多为 shop_id，行项目可能为 distributor_id） */
  static resolveStoreId(source: Record<string, any>): string {
    const raw =
      source.distributor_id ??
      source.shop_id ??
      source.store_id ??
      source.distributor_info?.distributor_id ??
      source.shop_info?.shop_id ??
      source.shopInfo?.shop_id ??
      ''
    if (raw === '' || raw == null) return ''
    return String(raw)
  }

  static resolveStoreName(source: Record<string, any>): string {
    return String(
      source.store_name ??
        source.storeName ??
        source.distributor_name ??
        source.distributorName ??
        source.shop_name ??
        source.shopName ??
        source.merchant_name ??
        source.name ??
        source.shop_info?.store_name ??
        source.shop_info?.name ??
        source.shop_info?.shop_name ??
        source.shopInfo?.store_name ??
        source.shopInfo?.name ??
        source.shopInfo?.shop_name ??
        source.shop?.store_name ??
        source.shop?.name ??
        source.shop?.shop_name ??
        source.distributor_info?.store_name ??
        source.distributor_info?.name ??
        source.distributor?.store_name ??
        source.distributor?.name ??
        ''
    )
  }

  static resolveStoreLogo(source: Record<string, any>): string {
    return String(
      source.store_logo ??
        source.shop_logo ??
        source.logo ??
        source.shop_info?.logo ??
        source.shop_info?.image_url ??
        source.shopInfo?.logo ??
        source.distributor_info?.logo ??
        source.distributor_info?.image_url ??
        source.distributor?.logo ??
        ''
    )
  }

  /**
   * 将 valid_cart 分组上的店铺信息回填到行项目，保证分组匹配与店铺名可用
   */
  static enrichItemWithGroup(
    item: Record<string, any>,
    group: Record<string, any>
  ): Record<string, any> {
    const groupId = this.resolveStoreId(group)
    const groupName = this.resolveStoreName(group)
    const groupLogo = this.resolveStoreLogo(group)

    return {
      ...item,
      distributor_id: item.distributor_id ?? item.shop_id ?? groupId,
      shop_id: item.shop_id ?? group.shop_id ?? groupId,
      store_name: item.store_name ?? item.shop_name ?? item.distributor_name ?? groupName,
      store_logo: item.store_logo ?? item.shop_logo ?? groupLogo,
    }
  }

  /** valid_cart 分组 → 店铺元信息 */
  static toStoreGroupMeta(group: Record<string, any>, index: number): ICartStoreGroupMeta {
    const firstItem = Array.isArray(group.list) ? group.list[0] : null
    const id = this.resolveStoreId(group) || String(index)
    return {
      id,
      storeName:
        this.resolveStoreName(group) ||
        (firstItem ? this.resolveStoreName(firstItem) : ''),
      storeLogo:
        this.resolveStoreLogo(group) ||
        (firstItem ? this.resolveStoreLogo(firstItem) : '') ||
        undefined,
    }
  }

  /**
   * 批量转换：API 数据列表 → 应用模型列表
   *
   * @param apiItems - API 返回的购物车商品列表
   * @returns 应用模型列表
   */
  static toModelList(apiItems: ICartItem[] = []): ICartItemModel[] {
    if (!apiItems || !Array.isArray(apiItems)) {
      return []
    }
    return apiItems.map((item) => this.toModel(item))
  }

  /**
   * 验证购物车商品数据完整性
   *
   * 职责：检查 API 数据是否包含必需字段
   *
   * @param item - 购物车商品（可能不完整）
   * @returns 是否有效
   */
  static validateCartItem(item: Partial<ICartItem>): item is ICartItem {
    return !!(
      item.cart_id &&
      item.item_id &&
      item.item_name &&
      (typeof item.price === 'number' || typeof item.price === 'string') &&
      typeof item.num === 'number' &&
      typeof item.store === 'number'
    )
  }

  /**
   * 清洗购物车商品数据
   *
   * 职责：
   * - 确保数据格式正确
   * - 为缺失字段提供默认值
   * - 处理数据类型转换
   *
   * @param item - 购物车商品（可能不完整）
   * @returns 清洗后的完整 API 数据
   */
  static sanitizeCartItem(item: Partial<ICartItem>): ICartItem {
    return {
      cart_id: item.cart_id || '',
      item_id: item.item_id || '',
      goods_id: item.goods_id || '',
      item_name: item.item_name || '77b4648d.2b7890',
      pics: item.pics || '',
      item_spec_desc: item.item_spec_desc || '77b4648d.064eb9',
      price: typeof item.price === 'number' || typeof item.price === 'string' ? item.price : 0,
      market_price:
        typeof item.market_price === 'number' || typeof item.market_price === 'string'
          ? item.market_price
          : item.price || 0,
      num: typeof item.num === 'number' ? item.num : 1,
      store: typeof item.store === 'number' ? item.store : 0,
      is_checked: item.is_checked ?? false,
      created: item.created || 0,
      updated: item.updated || 0,
    }
  }

  /**
   * 批量验证
   *
   * @param items - 购物车商品列表
   * @returns 有效的购物车商品列表
   */
  static validateCartList(items: Partial<ICartItem>[]): ICartItem[] {
    return items.filter((item) => this.validateCartItem(item)) as ICartItem[]
  }

  /**
   * 批量清洗
   *
   * @param items - 购物车商品列表（可能不完整）
   * @returns 清洗后的购物车商品列表
   */
  static sanitizeCartList(items: Partial<ICartItem>[]): ICartItem[] {
    return items.map((item) => this.sanitizeCartItem(item))
  }
}
