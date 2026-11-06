import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const {
  DEFAULT_ITEM_PRICE_SETTING,
  normalizeItemPriceSetting,
  shouldShowMarketPrice,
  shouldShowNonMemberPrice,
} = jiti('./itemPriceSetting.ts')
const { resolveRecommendationPriceDisplay } = jiti('./recommendationPrice.ts')

test('defaults market_price to true when setting payload is empty', () => {
  assert.deepEqual(normalizeItemPriceSetting(null), DEFAULT_ITEM_PRICE_SETTING)
  assert.equal(normalizeItemPriceSetting({}).item_page.market_price, true)
})

test('preserves explicit false for item_page.market_price', () => {
  const setting = normalizeItemPriceSetting({
    item_page: { market_price: false, member_price: true, svip_price: false },
    cart_page: { market_price: false },
    order_page: { market_price: true },
  })

  assert.equal(setting.item_page.market_price, false)
  assert.equal(setting.cart_page.market_price, false)
  assert.equal(setting.order_page.market_price, true)
})

test('hides market price when allowMarketPrice is false (ECX-10405)', () => {
  assert.equal(
    shouldShowMarketPrice({
      salePriceCents: 1300000,
      marketPriceCents: 1600000,
      hasMemberPrice: false,
      allowMarketPrice: false,
    }),
    false
  )
})

test('shows market price only when allowed and discounted', () => {
  assert.equal(
    shouldShowMarketPrice({
      salePriceCents: 1300000,
      marketPriceCents: 1600000,
      hasMemberPrice: false,
      allowMarketPrice: true,
    }),
    true
  )
  assert.equal(
    shouldShowMarketPrice({
      salePriceCents: 1300000,
      marketPriceCents: 1600000,
      hasMemberPrice: true,
      allowMarketPrice: true,
    }),
    false
  )
})

test('hides market-based original price when allowMarketPrice is false', () => {
  assert.deepEqual(
    resolveRecommendationPriceDisplay({
      price: 1999,
      marketPrice: 3600,
      allowMarketPrice: false,
    }),
    {
      displayPrice: 1999,
      originalPrice: null,
      showOriginalPrice: false,
    }
  )
})

test('hides sale-as-original when allowMarketPrice is false even with member discount', () => {
  assert.deepEqual(
    resolveRecommendationPriceDisplay({
      price: 7500,
      memberPrice: 6750,
      marketPrice: 9000,
      allowMarketPrice: false,
    }),
    {
      displayPrice: 6750,
      originalPrice: null,
      showOriginalPrice: false,
    }
  )
})

test('hides non-member price row when allowMarketPrice is false (ECX-10405)', () => {
  assert.equal(
    shouldShowNonMemberPrice({
      hasMemberPrice: true,
      allowMarketPrice: false,
      salePriceCents: 1200000,
    }),
    false
  )
  assert.equal(
    shouldShowNonMemberPrice({
      hasMemberPrice: true,
      allowMarketPrice: true,
      salePriceCents: 1200000,
    }),
    true
  )
  assert.equal(
    shouldShowNonMemberPrice({
      hasMemberPrice: false,
      allowMarketPrice: true,
      salePriceCents: 1200000,
    }),
    false
  )
})
