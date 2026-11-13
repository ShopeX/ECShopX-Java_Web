/**
 * 订单商品行发货状态（对齐 ecshopx-admin OrderListTable.getItemShipLabel）
 * 售后选品规则对齐 vshop after-sale.js
 */

export type OrderItemShipLabelKind = 'partial' | 'shipped'
export type AftersalesType = 'ONLY_REFUND' | 'REFUND_GOODS'
export type AftersalesItemDeliveryTagKind = 'shipped' | 'partial' | 'pending'

export function normalizeDeliveryStatus(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
}

export function isPartialDeliveryStatus(value: unknown): boolean {
  const normalized = normalizeDeliveryStatus(value)
  return normalized === 'PARTAIL' || normalized === 'PARTIAL' || normalized === 'PARTAIL_DELIVERY'
}

/** 整单已发货（对齐 vshop OnlyRefundShow: deliveryStatus != DONE） */
export function isOrderFullyShippedDelivery(value: unknown): boolean {
  const normalized = normalizeDeliveryStatus(value)
  return (
    normalized === 'DONE' ||
    normalized === '1' ||
    normalized === 'FINISHED' ||
    normalized === 'COMPLETED' ||
    normalized === '2'
  )
}

/** 未发货行：deliveryStatus !== DONE（PARTAIL/PENDING 均视为未整行发完） */
export function isUnshippedAftersalesItem(item: { deliveryStatus?: unknown }): boolean {
  return normalizeDeliveryStatus(item.deliveryStatus) !== 'DONE'
}

/**
 * 未发货仅退款可退件数（后端无 left_refund_only_num 时按 num - 已发 - 已取消 推算）
 */
export function resolveLeftRefundOnlyNum(item: {
  left_refund_only_num?: unknown
  leftRefundOnlyNum?: unknown
  num?: unknown
  quantity?: unknown
  delivery_item_num?: unknown
  deliveryItemNum?: unknown
  cancel_item_num?: unknown
  cancelItemNum?: unknown
}): number {
  const raw = item.left_refund_only_num ?? item.leftRefundOnlyNum
  if (raw != null && raw !== '') {
    return Math.max(0, Number(raw) || 0)
  }
  const num = Number(item.num ?? item.quantity) || 0
  const deliveryNum = Number(item.delivery_item_num ?? item.deliveryItemNum) || 0
  const cancelNum = Number(item.cancel_item_num ?? item.cancelItemNum) || 0
  return Math.max(0, num - deliveryNum - cancelNum)
}

export function canSelectAftersalesItem(
  item: {
    deliveryStatus?: unknown
    leftAftersalesNum?: unknown
    leftRefundOnlyNum?: unknown
  },
  aftersalesType: AftersalesType
): boolean {
  if (aftersalesType === 'ONLY_REFUND') {
    return isUnshippedAftersalesItem(item) && Number(item.leftRefundOnlyNum) > 0
  }
  return Number(item.leftAftersalesNum) > 0
}

export function resolveAftersalesQuantityMax(
  item: {
    deliveryStatus?: unknown
    quantity?: unknown
    leftAftersalesNum?: unknown
    leftRefundOnlyNum?: unknown
  },
  aftersalesType: AftersalesType
): number {
  if (aftersalesType === 'ONLY_REFUND' && isUnshippedAftersalesItem(item)) {
    return Math.max(0, Number(item.leftRefundOnlyNum) || 0)
  }
  const left = Math.max(0, Number(item.leftAftersalesNum) || 0)
  const quantity = Math.max(0, Number(item.quantity) || 0)
  return quantity > 0 ? Math.min(left, quantity) : left
}

/**
 * 售后页行级发货标签（与订单列表 OrderItemThumb 同一套行级规则，另补仅退款双额度行）
 */
export function resolveAftersalesItemDeliveryTagKind(params: {
  itemDeliveryStatus?: unknown
  deliveryItemNum?: unknown
  quantity?: unknown
  shipStatus?: unknown
  leftRefundOnlyNum?: unknown
  leftAftersalesNum?: unknown
}): AftersalesItemDeliveryTagKind {
  const lineKind = resolveOrderItemShipLabelKind({
    deliveryStatus: params.itemDeliveryStatus,
    deliveryItemNum: params.deliveryItemNum,
    quantity: params.quantity,
    shipStatus: params.shipStatus,
  })
  if (lineKind === 'shipped') return 'shipped'
  if (lineKind === 'partial') return 'partial'

  if (Number(params.leftRefundOnlyNum) > 0 && Number(params.leftAftersalesNum) > 0) {
    return 'partial'
  }

  const itemStatus = normalizeDeliveryStatus(params.itemDeliveryStatus)
  if (itemStatus === 'DONE') return 'shipped'

  return 'pending'
}

export interface OrderItemShipSource {
  deliveryStatus?: unknown
  deliveryItemNum?: unknown
  quantity?: unknown
  shipStatus?: unknown
}

export function resolveOrderItemShipLabelKind(
  item: OrderItemShipSource
): OrderItemShipLabelKind | null {
  const deliveryStatus = normalizeDeliveryStatus(item.deliveryStatus)
  const quantity = Number(item.quantity ?? 0)
  const deliveryItemNum = Number(item.deliveryItemNum ?? 0)
  const shipStatus = Number(item.shipStatus ?? 0)

  if (
    deliveryStatus === 'PENDING' &&
    deliveryItemNum > 0 &&
    quantity > 0 &&
    deliveryItemNum < quantity
  ) {
    return 'partial'
  }

  if (deliveryStatus === 'DONE' || shipStatus === 1) {
    return 'shipped'
  }

  return null
}

export const ORDER_ITEM_SHIP_LABEL_I18N: Record<OrderItemShipLabelKind, string> = {
  partial: 'de8076e6.5296ac',
  shipped: 'de8076e6.355409',
}

export const AFTERSALES_ITEM_DELIVERY_TAG_I18N: Record<AftersalesItemDeliveryTagKind, string> = {
  shipped: 'de8076e6.355409',
  partial: 'de8076e6.5296ac',
  pending: 'de8076e6.d8476e',
}
