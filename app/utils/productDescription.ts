/** 商品描述取值：图文详情(intro) 优先，简介(brief) 兜底，占位文案再兜底 */
export function resolveItemDescription(
  data: { intro?: string | null; brief?: string | null } | null | undefined,
  fallback: string
): string {
  const intro = data?.intro?.trim()
  if (intro) return intro
  const brief = data?.brief?.trim()
  if (brief) return brief
  return fallback
}
