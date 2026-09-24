export interface RecommendationPriceInput {
  /** 销售价（元） */
  price: number
  marketPrice?: number
  memberPrice?: number
  activityPrice?: number
}

/**
 * 推荐商品双价展示（对齐商品列表 / 购物车成交价优先级）
 *
 * - 成交价：activity_price > member_price > price
 * - 原价：有活动/会员优惠时用销售价，否则用市场价（高于成交价时）
 */
export function resolveRecommendationPriceDisplay(input: RecommendationPriceInput) {
  const salePrice = input.price
  const activityPrice = input.activityPrice
  const memberPrice = input.memberPrice
  const marketPrice = input.marketPrice

  let displayPrice = salePrice

  if (activityPrice != null && activityPrice > 0 && activityPrice < salePrice) {
    displayPrice = activityPrice
  } else if (memberPrice != null && memberPrice > 0 && memberPrice < salePrice) {
    displayPrice = memberPrice
  }

  let originalPrice: number | null = null

  if (displayPrice < salePrice) {
    originalPrice = salePrice
  } else if (marketPrice != null && marketPrice > displayPrice) {
    originalPrice = marketPrice
  }

  return {
    displayPrice,
    originalPrice,
    showOriginalPrice: originalPrice != null && originalPrice > displayPrice,
  }
}
