function normalizePositiveDistributorId(value: unknown): string | null {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return String(Math.trunc(n))
}

/** 从 order_new / 订单详情等原始结构解析 BBC 店铺 ID（>0）；缺省为平台店 0 */
export function extractOrderDistributorId(order: Record<string, any> | null | undefined): string {
  if (!order || typeof order !== 'object') return '0'

  const nestedOrderInfo = order.orderInfo ?? order.order_info
  const items =
    order.item_infos ??
    order.items ??
    nestedOrderInfo?.item_infos ??
    nestedOrderInfo?.items ??
    []
  const firstItem = Array.isArray(items) ? items[0] : null

  const positiveCandidates = [
    order.distributor_id,
    order.distributorId,
    order.shop_id,
    order.shopId,
    order.team_id,
    order.teamId,
    nestedOrderInfo?.distributor_id,
    nestedOrderInfo?.distributorId,
    nestedOrderInfo?.shop_id,
    nestedOrderInfo?.team_id,
    firstItem?.distributor_id,
    firstItem?.distributorId,
    firstItem?.shop_id,
  ]

  for (const candidate of positiveCandidates) {
    const resolved = normalizePositiveDistributorId(candidate)
    if (resolved) return resolved
  }

  for (const candidate of [order.distributor_id, nestedOrderInfo?.distributor_id]) {
    if (candidate === 0 || candidate === '0') return '0'
  }

  return '0'
}
