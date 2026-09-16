/** 推荐匹配接口 main_item_ids：多规格商品传 SPU/默认规格 ID，而非当前 SKU ID */
export function resolveRecommendationMainItemId(item: Record<string, any>): string {
  const mainId =
    item.goods_id ??
    item.goodsId ??
    item.default_item_id ??
    item.defaultItemId

  if (mainId != null && mainId !== '' && Number(mainId) > 0) {
    return String(mainId)
  }

  return String(item.productId ?? item.item_id ?? item.itemId ?? item.id ?? '')
}

export function normalizeRecommendationItemIds(
  ids: Array<string | number | null | undefined>
): number[] {
  const seen = new Set<number>()
  const result: number[] = []

  for (const id of ids) {
    const num = Number(id)
    if (!Number.isFinite(num) || num <= 0 || seen.has(num)) {
      continue
    }

    seen.add(num)
    result.push(num)
  }

  return result
}
