import { describe, expect, it } from 'vitest'
import {
  buildCancelOrderPayload,
  CANCEL_ORDER_REASONS,
  isPaidOrder,
} from '../orderCancel'

describe('order cancel rules', () => {
  it('treats PAYED pay status as paid order', () => {
    expect(isPaidOrder({ payStatus: 'PAYED' })).toBe(true)
  })

  it('treats numeric non-zero pay status as paid order', () => {
    expect(isPaidOrder({ payStatus: '1' })).toBe(true)
  })

  it('treats numeric zero pay status as unpaid order', () => {
    expect(isPaidOrder({ payStatus: '0' })).toBe(false)
  })

  it('treats shipped paid order status as paid order', () => {
    expect(isPaidOrder({ payStatus: 'WAIT_BUYER_CONFIRM' })).toBe(true)
  })

  it('builds order_id only payload for unpaid orders', () => {
    expect(buildCancelOrderPayload({ orderId: '1001', isPaid: false })).toEqual({
      order_id: '1001',
    })
  })

  it('builds cancel_reason payload for fixed paid reason', () => {
    expect(
      buildCancelOrderPayload({
        orderId: '1001',
        isPaid: true,
        reason: CANCEL_ORDER_REASONS[0].value,
      })
    ).toEqual({
      order_id: '1001',
      cancel_reason: '多买/错买',
    })
  })

  it('rejects other reason when custom text is empty', () => {
    expect(() =>
      buildCancelOrderPayload({
        orderId: '1001',
        isPaid: true,
        reason: 'other',
        otherReason: '   ',
      })
    ).toThrow('other_reason_required')
  })

  it('builds other_reason payload for paid other reason', () => {
    expect(
      buildCancelOrderPayload({
        orderId: '1001',
        isPaid: true,
        reason: 'other',
        otherReason: '我想改地址',
      })
    ).toEqual({
      order_id: '1001',
      other_reason: '我想改地址',
    })
  })
})
