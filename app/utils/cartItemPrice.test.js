import assert from 'node:assert/strict'
import test from 'node:test'
import {
  hasCartMemberPriceField,
  hasCartMemberPriceLayout,
  parseCartPriceCents,
  resolveCartEffectivePriceCents,
} from './cartItemPrice.ts'

test('parseCartPriceCents accepts number and string values', () => {
  assert.equal(parseCartPriceCents(100), 100)
  assert.equal(parseCartPriceCents('219900'), 219900)
  assert.equal(parseCartPriceCents(undefined), null)
})

test('resolveCartEffectivePriceCents follows mobile priority', () => {
  assert.equal(
    resolveCartEffectivePriceCents({
      price: 100,
      activity_price: 80,
      member_price: 60,
      package_price: 70,
    }),
    80
  )
  assert.equal(
    resolveCartEffectivePriceCents({
      price: 100,
      package_price: 70,
      member_price: 60,
    }),
    70
  )
  assert.equal(
    resolveCartEffectivePriceCents({
      price: 100,
      member_price: 60,
    }),
    60
  )
  assert.equal(
    resolveCartEffectivePriceCents({
      price: 100,
      market_price: 219900,
    }),
    100
  )
})

test('hasCartMemberPriceField detects member_price presence', () => {
  assert.equal(hasCartMemberPriceField({ member_price: 60 }), true)
  assert.equal(hasCartMemberPriceField({ price: 100 }), false)
})

test('hasCartMemberPriceLayout requires member price below sale price', () => {
  assert.equal(hasCartMemberPriceLayout(100, 60), true)
  assert.equal(hasCartMemberPriceLayout(100, 100), false)
  assert.equal(hasCartMemberPriceLayout(100, null), false)
})
