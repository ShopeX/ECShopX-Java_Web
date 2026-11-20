/** 仅对字符串做 trim；非字符串（对象/数组等）视为无效描述 */
function trimText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** 商品描述取值：图文详情(intro) 优先，简介(brief) 兜底，占位文案再兜底 */
export function resolveItemDescription(
  data: { intro?: unknown; brief?: unknown } | null | undefined,
  fallback: string
): string {
  const intro = trimText(data?.intro)
  if (intro) return intro
  const brief = trimText(data?.brief)
  if (brief) return brief
  return fallback
}
