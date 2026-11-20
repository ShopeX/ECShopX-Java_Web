/**
 * 购物车行价格解析（对齐 mobile comp-goodsitem.js）
 *
 * 成交价优先级：activity_price > package_price > member_price > price
 */

export interface CartItemPriceRaw {
  price?: unknown
  market_price?: unknown
  member_price?: unknown
  activity_price?: unknown
  package_price?: unknown
}

export function parseCartPriceCents(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const num = typeof value === 'string' ? Number.parseFloat(value) : Number(value)
  return Number.isFinite(num) ? num : null
}

/** mobile: !isNaN(member_price) — 接口返回了会员价字段 */
export function hasCartMemberPriceField(raw: CartItemPriceRaw): boolean {
  return parseCartPriceCents(raw.member_price) !== null
}

/** 与 BCProductPrice / collections 一致：会员价低于销售价时展示双价 */
export function hasCartMemberPriceLayout(
  salePriceCents: number,
  memberPriceCents: number | null
): boolean {
  return memberPriceCents !== null && memberPriceCents > 0 && memberPriceCents < salePriceCents
}

/** 按 mobile 规则解析购物车行展示/计价单价（分） */
export function resolveCartEffectivePriceCents(raw: CartItemPriceRaw): number {
  const activityPrice = parseCartPriceCents(raw.activity_price)
  if (activityPrice !== null) {
    return activityPrice
  }

  const packagePrice = parseCartPriceCents(raw.package_price)
  if (packagePrice !== null) {
    return packagePrice
  }

  const memberPrice = parseCartPriceCents(raw.member_price)
  if (memberPrice !== null) {
    return memberPrice
  }

  return parseCartPriceCents(raw.price) ?? 0
}
