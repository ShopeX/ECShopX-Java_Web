/**
 * BBC 结算店铺选择：购物袋不支持多门店一起结算，需用已选商品的店铺 ID。
 */

export function normalizeCheckoutStoreId(value?: string | number | null): string {
  const normalized = Number(value ?? 0)
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return '0'
  }
  return String(normalized)
}

export function collectSelectedStoreIds(
  items: ReadonlyArray<{ selected?: boolean; distributorId?: string | number | null }>
): string[] {
  const ids = items
    .filter((item) => item.selected)
    .map((item) => normalizeCheckoutStoreId(item.distributorId))
  return [...new Set(ids)]
}

/**
 * 从已选商品解析结算用 distributor_id。
 * - 仅一店：返回该店 ID（含自营 0）
 * - 多店 / 无选中：返回 null（由调用方拦截或回退）
 */
export function resolveSelectedCheckoutStoreId(
  items: ReadonlyArray<{ selected?: boolean; distributorId?: string | number | null }>
): string | null {
  const storeIds = collectSelectedStoreIds(items)
  if (storeIds.length === 1) {
    return storeIds[0]!
  }
  return null
}

export function hasMultipleCheckoutStores(
  items: ReadonlyArray<{ selected?: boolean; distributorId?: string | number | null }>
): boolean {
  return collectSelectedStoreIds(items).length > 1
}
