import { describe, expect, it } from 'vitest'
import { scopeCachedCartState, scopeCartGroupsToDistributor } from './b2cCartScope'

const groups = [
  { shop_id: 269, cart_total_price: 1000, list: [{ cart_id: 'a' }] },
  { shop_id: 310, cart_total_price: 2000, list: [{ cart_id: 'b' }] },
  { shop_id: '289', list: [{ cart_id: 'c' }] },
]

describe('scopeCartGroupsToDistributor', () => {
  it('keeps every store group in BBC mode', () => {
    expect(
      scopeCartGroupsToDistributor(groups, { businessMode: 'bbc', distributorId: '269' })
    ).toEqual(groups)
  })

  it('keeps only the is_valid store in B2C mode', () => {
    expect(
      scopeCartGroupsToDistributor(groups, { businessMode: 'b2c', distributorId: 269 })
    ).toEqual([groups[0]])
  })

  it('returns no groups in B2C when the default store is not ready', () => {
    expect(
      scopeCartGroupsToDistributor(groups, { businessMode: 'b2c', distributorId: '0' })
    ).toEqual([])
  })

  it('keeps matching rows when the group itself has no shop id', () => {
    const ungrouped = [
      {
        list: [
          { distributor_id: 269, cart_id: 'a' },
          { distributor_id: 310, cart_id: 'b' },
        ],
      },
    ]

    expect(
      scopeCartGroupsToDistributor(ungrouped, { businessMode: 'b2c', distributorId: '269' })
    ).toEqual([
      {
        list: [{ distributor_id: 269, cart_id: 'a' }],
      },
    ])
  })
})

describe('scopeCachedCartState', () => {
  const cached = {
    items: [{ distributorId: '269' }, { distributorId: '310' }],
    invalidItems: [{ distributorId: '289' }, { distributorId: '269' }],
    storeGroups: [
      { id: '269', storeName: '线上店' },
      { id: '310', storeName: '其他店' },
    ],
  }

  it('drops other stores from the B2C cache', () => {
    expect(
      scopeCachedCartState(cached, { businessMode: 'b2c', distributorId: '269' })
    ).toEqual({
      items: [{ distributorId: '269' }],
      invalidItems: [{ distributorId: '269' }],
      storeGroups: [{ id: '269', storeName: '线上店' }],
    })
  })

  it('keeps the BBC cache unchanged', () => {
    expect(scopeCachedCartState(cached, { businessMode: 'bbc', distributorId: '269' })).toEqual(
      cached
    )
  })
})
