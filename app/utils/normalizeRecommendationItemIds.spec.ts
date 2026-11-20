import { describe, expect, it } from 'vitest'
import {
  normalizeRecommendationItemIds,
  resolveRecommendationMainItemId,
} from './normalizeRecommendationItemIds'

describe('normalizeRecommendationItemIds', () => {
  it('deduplicates and filters invalid ids', () => {
    expect(normalizeRecommendationItemIds(['12', 12, '0', '', 'abc', 34])).toEqual([12, 34])
  })

  it('resolves main item id from goods_id for multi-spec sku', () => {
    expect(
      resolveRecommendationMainItemId({
        productId: '6781',
        goods_id: '6778',
      })
    ).toBe('6778')
  })

  it('falls back to productId for single-spec items', () => {
    expect(resolveRecommendationMainItemId({ productId: '6778' })).toBe('6778')
  })
})
