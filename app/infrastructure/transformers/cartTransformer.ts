import type { ICartItem } from '~/types/api/cart'
import type { ICartItemModel, ICartStoreGroupMeta } from '~/types/cart'
import { MoneyValueObject, QuantityValueObject } from '~/shared/value-objects'
import {
  parseCartPriceCents,
  resolveCartEffectivePriceCents,
  type CartItemPriceRaw,
} from '~/utils/cartItemPrice'
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
    const quantity = QuantityValueObject.of(apiItem.num || 1, 1, apiItem.store || 0)

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
      stock: apiItem.store || 0,
      selected: apiItem.is_checked ?? false,
      // 对齐 vshop cart：promotions / activity_info → marketingTags
      marketingTags: mapPromotionTags(apiItem),
      distributorId: String(
        apiItem.distributor_id ?? apiItem.distributor_info?.distributor_id ?? ''
      ),
      storeName: String(
        apiItem.store_name ??
          apiItem.distributor_name ??
          apiItem.shop_name ??
          apiItem.distributor_info?.store_name ??
          apiItem.distributor_info?.name ??
          ''
      ),
      storeLogo: String(
        apiItem.store_logo ??
          apiItem.shop_logo ??
          apiItem.distributor_info?.logo ??
          apiItem.distributor_info?.image_url ??
          ''
      ),
    }
  }

  /** valid_cart 分组 → 店铺元信息 */
  static toStoreGroupMeta(group: Record<string, any>, index: number): ICartStoreGroupMeta {
    const id = String(group.distributor_id ?? group.shop_id ?? group.store_id ?? index)
    return {
      id,
      storeName: String(
        group.store_name ??
          group.distributor_name ??
          group.shop_name ??
          group.name ??
          ''
      ),
      storeLogo: String(
        group.store_logo ??
          group.shop_logo ??
          group.logo ??
          group.distributor_info?.logo ??
          ''
      ),
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
