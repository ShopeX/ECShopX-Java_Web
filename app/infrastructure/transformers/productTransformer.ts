import type { IProductListItem } from '~/types/api/item'
import type { IProduct } from '~/components/BCProductCard/types'
import { MoneyValueObject, DiscountValueObject } from '~/shared/value-objects'
import { mapPromotionTags } from '~/utils/promotionTags'

type ProductLike = Partial<IProductListItem> & {
  item_name?: string
  pics?: string[] | string
}

/**
 * 商品数据转换器
 *
 * 职责：
 * - API 响应数据 → UI 数据模型转换
 * - 数据结构映射和默认值处理
 *
 * 不负责：
 * - ❌ 业务规则（由值对象负责）
 * - ❌ 格式化显示（由值对象负责）
 * - ❌ 价格计算逻辑（由值对象负责）
 *
 * 设计原则：
 * - 纯函数，无副作用
 * - 单向数据流（API → Model）
 * - 类型安全
 *
 * @example
 * ```typescript
 * // 转换单个商品
 * const product = ProductTransformer.toModel(apiProduct)
 *
 * // 批量转换
 * const products = ProductTransformer.toModelList(apiProducts)
 * ```
 */
export class ProductTransformer {
  private static normalizePics(pics: ProductLike['pics']): string[] {
    if (Array.isArray(pics)) {
      return pics.filter((pic): pic is string => typeof pic === 'string' && Boolean(pic))
    }

    if (typeof pics !== 'string' || !pics) {
      return []
    }

    try {
      const parsed = JSON.parse(pics)
      return Array.isArray(parsed)
        ? parsed.filter((pic): pic is string => typeof pic === 'string' && Boolean(pic))
        : []
    } catch {
      return [pics]
    }
  }

  private static normalizeProduct(apiProduct: ProductLike): IProductListItem | null {
    const itemName = apiProduct.itemName || apiProduct.item_name
    const pics = this.normalizePics(apiProduct.pics)
    const price =
      typeof apiProduct.price === 'number'
        ? apiProduct.price
        : Number(apiProduct.price)

    if (!apiProduct.item_id || !itemName || Number.isNaN(price)) {
      return null
    }

    return {
      ...(apiProduct as IProductListItem),
      itemName,
      pics,
      price,
      activity_price:
        typeof apiProduct.activity_price === 'number' ? apiProduct.activity_price : 0,
      market_price:
        typeof apiProduct.market_price === 'number' ? apiProduct.market_price : 0,
      member_price: typeof apiProduct.member_price === 'number' ? apiProduct.member_price : 0,
      sales: typeof apiProduct.sales === 'number' ? apiProduct.sales : 0,
    }
  }

  /**
   * API 响应 → UI 数据模型
   *
   * 职责：纯数据结构转换，字段映射和默认值处理
   *
   * @param apiProduct - API 返回的商品数据
   * @returns UI 数据模型
   */
  static toModel(apiProduct: ProductLike): IProduct {
    const normalizedProduct = this.normalizeProduct(apiProduct)

    if (!normalizedProduct) {
      return {
        itemId: '',
        itemName: '',
        img: '',
        imgs: [],
        price: 0,
        activityPrice: 0,
        marketPrice: 0,
        memberPrice: 0,
        sales: 0,
        specId: undefined,
        specName: undefined,
        stock: undefined,
        marketingTags: [],
      }
    }

    return {
      itemId: normalizedProduct.item_id,
      itemName: normalizedProduct.itemName,
      img: normalizedProduct.pics?.[0] || '',
      imgs: normalizedProduct.pics || [],
      price: normalizedProduct.price || 0,
      activityPrice: normalizedProduct.activity_price || 0,
      marketPrice: normalizedProduct.market_price || 0,
      memberPrice: normalizedProduct.member_price || 0,
      sales: normalizedProduct.sales || 0,
      // 注意：API 返回的数据中可能没有规格和库存信息
      // 这些字段在商品详情中才有，列表中为可选
      specId: undefined,
      specName: undefined,
      stock: undefined,
      // 对齐 vshop：promotion_activity → marketingTags
      marketingTags: mapPromotionTags(apiProduct),
    }
  }

  /**
   * 批量转换：API 响应列表 → UI 数据模型列表
   *
   * @param apiProducts - API 返回的商品列表
   * @returns UI 数据模型列表
   */
  static toModelList(apiProducts: ProductLike[]): IProduct[] {
    return apiProducts
      .map((item) => this.normalizeProduct(item))
      .filter((item): item is IProductListItem => Boolean(item))
      .map((item) => this.toModel(item))
  }

  /**
   * 验证商品数据完整性
   *
   * @param item - 商品数据（可能不完整）
   * @returns 是否有效
   */
  static validateProduct(item: ProductLike): item is IProductListItem {
    return Boolean(this.normalizeProduct(item))
  }

  /**
   * 批量验证
   *
   * @param items - 商品列表
   * @returns 有效的商品列表
   */
  static validateProductList(items: ProductLike[]): IProductListItem[] {
    return items
      .map((item) => this.normalizeProduct(item))
      .filter((item): item is IProductListItem => Boolean(item))
  }
}
