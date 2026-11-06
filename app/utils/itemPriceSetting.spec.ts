import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ITEM_PRICE_SETTING,
  normalizeItemPriceSetting,
  shouldShowMarketPrice,
} from './itemPriceSetting'
import { resolveRecommendationPriceDisplay } from './recommendationPrice'

describe('itemPriceSetting', () => {
  it('defaults market_price to true when setting payload is empty', () => {
    expect(normalizeItemPriceSetting(null)).toEqual(DEFAULT_ITEM_PRICE_SETTING)
    expect(normalizeItemPriceSetting({}).item_page.market_price).toBe(true)
  })

  it('preserves explicit false for item_page.market_price', () => {
    const setting = normalizeItemPriceSetting({
      item_page: { market_price: false, member_price: true, svip_price: false },
      cart_page: { market_price: false },
      order_page: { market_price: true },
    })

    expect(setting.item_page.market_price).toBe(false)
    expect(setting.cart_page.market_price).toBe(false)
    expect(setting.order_page.market_price).toBe(true)
  })

  it('hides market price when allowMarketPrice is false (ECX-10405)', () => {
    expect(
      shouldShowMarketPrice({
        salePriceCents: 1300000,
        marketPriceCents: 1600000,
        hasMemberPrice: false,
        allowMarketPrice: false,
      })
    ).toBe(false)
  })

  it('shows market price only when allowed and discounted', () => {
    expect(
      shouldShowMarketPrice({
        salePriceCents: 1300000,
        marketPriceCents: 1600000,
        hasMemberPrice: false,
        allowMarketPrice: true,
      })
    ).toBe(true)

    expect(
      shouldShowMarketPrice({
        salePriceCents: 1300000,
        marketPriceCents: 1600000,
        hasMemberPrice: true,
        allowMarketPrice: true,
      })
    ).toBe(false)
  })
})

describe('resolveRecommendationPriceDisplay + market price setting', () => {
  it('hides market-based original price when allowMarketPrice is false', () => {
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
      price: 7500,
      memberPrice: 6750,
      marketPrice: 9000,
      allowMarketPrice: false,
    })

    expect(result).toEqual({
      displayPrice: 6750,
      originalPrice: null,
      showOriginalPrice: false,
    })
  })
})
