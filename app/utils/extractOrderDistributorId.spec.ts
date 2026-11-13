import { describe, expect, it } from 'vitest'
import { extractOrderDistributorId } from './extractOrderDistributorId'

describe('extractOrderDistributorId', () => {
  it('reads top-level distributor_id', () => {
    expect(extractOrderDistributorId({ distributor_id: 285 })).toBe('285')
  })

  it('falls back to shop_id and order line items', () => {
    expect(extractOrderDistributorId({ shop_id: '285' })).toBe('285')
    expect(
      extractOrderDistributorId({
        item_infos: [{ distributor_id: 285 }],
      })
    ).toBe('285')
  })

  it('returns 0 for platform store when explicitly set', () => {
    expect(extractOrderDistributorId({ distributor_id: 0 })).toBe('0')
  })

  it('defaults to 0 when no store fields exist', () => {
    expect(extractOrderDistributorId({ order_id: '1' })).toBe('0')
    expect(extractOrderDistributorId(null)).toBe('0')
  })
})
