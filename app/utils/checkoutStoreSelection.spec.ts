import { describe, expect, it } from 'vitest'
import {
  collectSelectedStoreIds,
  hasMultipleCheckoutStores,
  resolveSelectedCheckoutStoreId,
} from './checkoutStoreSelection'

describe('checkoutStoreSelection', () => {
  it('collects unique store ids from selected items', () => {
    expect(
      collectSelectedStoreIds([
        { selected: true, distributorId: '285' },
        { selected: true, distributorId: 285 },
        { selected: false, distributorId: '0' },
        { selected: true, distributorId: '' },
      ])
    ).toEqual(['285', '0'])
  })

  it('resolves single selected store id including self-operated 0', () => {
    expect(
      resolveSelectedCheckoutStoreId([{ selected: true, distributorId: '285' }])
    ).toBe('285')
    expect(
      resolveSelectedCheckoutStoreId([{ selected: true, distributorId: 0 }])
    ).toBe('0')
    expect(
      resolveSelectedCheckoutStoreId([
        { selected: true, distributorId: '285' },
        { selected: true, distributorId: '0' },
      ])
    ).toBeNull()
  })

  it('detects multi-store selection', () => {
    expect(
      hasMultipleCheckoutStores([
        { selected: true, distributorId: '285' },
        { selected: true, distributorId: '0' },
      ])
    ).toBe(true)
    expect(
      hasMultipleCheckoutStores([
        { selected: true, distributorId: '285' },
        { selected: true, distributorId: '285' },
      ])
    ).toBe(false)
  })
})
