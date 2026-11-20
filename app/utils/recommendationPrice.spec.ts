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

  it('hides market-based original when allowMarketPrice is false', () => {
    const result = resolveRecommendationPriceDisplay({
      price: 1999,
      marketPrice: 3600,
      allowMarketPrice: false,
    })

    expect(result).toEqual({
      displayPrice: 1999,
      originalPrice: null,
      showOriginalPrice: false,
    })
  })

  it('hides sale-as-original when allowMarketPrice is false even with member discount', () => {
    const result = resolveRecommendationPriceDisplay({
      price: 12000,
      memberPrice: 9000,
      marketPrice: 15000,
      allowMarketPrice: false,
    })

    expect(result).toEqual({
      displayPrice: 9000,
      originalPrice: null,
      showOriginalPrice: false,
    })
  })
})
