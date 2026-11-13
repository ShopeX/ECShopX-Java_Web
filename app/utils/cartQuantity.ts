/**
 * 将接口/缓存中的数量、库存规范为非负整数。
 * 库存为 0 或缺省、数量大于库存时仍保留行数量，
 * 避免整车 loadCart 因 QuantityValueObject 抛错而失败。
 */
export function normalizeCartQuantityParts(
  rawNum: unknown,
  rawStore: unknown
): { num: number; store: number; max: number } {
  const parsedNum = typeof rawNum === 'string' ? Number.parseFloat(rawNum) : Number(rawNum)
  const num =
    Number.isFinite(parsedNum) && parsedNum > 0 ? Math.floor(parsedNum) : 1

  const parsedStore =
    typeof rawStore === 'string' ? Number.parseFloat(rawStore) : Number(rawStore)
  const store =
    Number.isFinite(parsedStore) && parsedStore >= 0 ? Math.floor(parsedStore) : 0

  // QuantityValueObject 要求 max >= value；超卖/零库存行仍需可展示
  const max = Math.max(store, num, 1)
  return { num, store, max }
}
