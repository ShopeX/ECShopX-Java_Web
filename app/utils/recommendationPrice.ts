export interface RecommendationPriceInput {
  /** 销售价（元） */
  price: number
  marketPrice?: number
  memberPrice?: number
  activityPrice?: number
  /** 通用设置 item_page.market_price；默认 true 保持历史行为 */
  allowMarketPrice?: boolean
}

/**
 * 推荐商品双价展示（对齐商品列表 / 购物车成交价优先级）
 *
 * - 成交价：activity_price > member_price > price
 * - 划线原价：受通用设置 item_page.market_price 约束；关闭时不展示任何划线价
 *   - 有活动/会员优惠时：原价取销售价
 *   - 否则：原价取市场价（高于成交价时）
 */
export function resolveRecommendationPriceDisplay(input: RecommendationPriceInput) {
  const salePrice = input.price
  const activityPrice = input.activityPrice
  const memberPrice = input.memberPrice
  const marketPrice = input.marketPrice
  const allowMarketPrice = input.allowMarketPrice !== false

  let displayPrice = salePrice

  if (activityPrice != null && activityPrice > 0 && activityPrice < salePrice) {
    displayPrice = activityPrice
  } else if (memberPrice != null && memberPrice > 0 && memberPrice < salePrice) {
    displayPrice = memberPrice
  }

  let originalPrice: number | null = null

  // 原价开关关闭：推荐卡不展示划线价（含会员/活动场景下的销售价划线）
  if (allowMarketPrice) {
    if (displayPrice < salePrice) {
      originalPrice = salePrice
    } else if (marketPrice != null && marketPrice > displayPrice) {
      originalPrice = marketPrice
    }
  }

  return {
    displayPrice,
    originalPrice,
    showOriginalPrice: originalPrice != null && originalPrice > displayPrice,
  }
}
