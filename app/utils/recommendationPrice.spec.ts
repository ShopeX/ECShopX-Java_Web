import { describe, expect, it } from 'vitest'
import { resolveRecommendationPriceDisplay } from './recommendationPrice'

describe('resolveRecommendationPriceDisplay', () => {
  it('shows market price as original when sale is discounted', () => {
    const result = resolveRecommendationPriceDisplay({
      price: 1999,
      marketPrice: 3600,
    })

    expect(result).toEqual({
      displayPrice: 1999,
      originalPrice: 3600,
      showOriginalPrice: true,
    })
  })

  it('shows sale price as original when member price applies', () => {
    const result = resolveRecommendationPriceDisplay({
      price: 7500,
      memberPrice: 6750,
    })

    expect(result).toEqual({
      displayPrice: 6750,
      originalPrice: 7500,
      showOriginalPrice: true,
    })
  })

  it('prefers activity price over member price', () => {
    const result = resolveRecommendationPriceDisplay({
      price: 1000,
      memberPrice: 900,
      activityPrice: 800,
    })

    expect(result).toEqual({
      displayPrice: 800,
      originalPrice: 1000,
      showOriginalPrice: true,
    })
  })

  it('hides original price when no discount', () => {
    const result = resolveRecommendationPriceDisplay({
      price: 1999,
      marketPrice: 1999,
    })

    expect(result).toEqual({
      displayPrice: 1999,
      originalPrice: null,
      showOriginalPrice: false,
    })
  })
})
