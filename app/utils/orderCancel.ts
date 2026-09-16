export const CANCEL_ORDER_REASONS = [
  { label: '多买/错买', value: '多买/错买' },
  { label: '不想要了', value: '不想要了' },
  { label: '买多了', value: '买多了' },
  { label: '其他', value: 'other' },
] as const

export type CancelOrderReasonValue = (typeof CANCEL_ORDER_REASONS)[number]['value']

export interface CancelOrderPayload {
  order_id: string
  cancel_reason?: string
  other_reason?: string
}

export function isPaidOrder(order: { isPaid?: boolean; payStatus?: string | null | undefined }) {
  if (typeof order.isPaid === 'boolean') return order.isPaid
  const payStatus = String(order.payStatus || '').trim().toUpperCase()
  if (!payStatus) return false
  if (['PAYED', 'WAIT_BUYER_CONFIRM', 'DONE'].includes(payStatus)) return true
  if (/^\d+$/.test(payStatus)) return payStatus !== '0'
  return false
}

export function buildCancelOrderPayload(params: {
  orderId: string
  isPaid: boolean
  reason?: CancelOrderReasonValue
  otherReason?: string
}): CancelOrderPayload {
  const payload: CancelOrderPayload = { order_id: params.orderId }
  if (!params.isPaid) return payload

  if (params.reason === 'other') {
    const otherReason = params.otherReason?.trim()
    if (!otherReason) throw new Error('other_reason_required')
    return { ...payload, other_reason: otherReason }
  }

  if (!params.reason) throw new Error('cancel_reason_required')
  return { ...payload, cancel_reason: params.reason }
}
