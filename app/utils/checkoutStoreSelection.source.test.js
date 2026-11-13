import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const checkoutSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useCheckout.ts'),
  'utf8'
)
const cartSource = readFileSync(path.resolve(process.cwd(), 'app/composables/useCart.ts'), 'utf8')
const cartPageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/cart/index.vue'),
  'utf8'
)

test('checkout uses selected cart store id instead of bare resolveDistributorId', () => {
  assert.match(checkoutSource, /resolveCheckoutDistributorId/)
  assert.match(checkoutSource, /resolveSelectedCheckoutStoreId/)
  assert.match(checkoutSource, /distributor_id:\s*resolveCheckoutDistributorId\(\)/)
  assert.match(checkoutSource, /route\.query\.shopid/)
  assert.doesNotMatch(
    checkoutSource,
    /distributor_id:\s*resolveDistributorId\(\)/
  )
})

test('cart checkout validates BBC single-store selection', () => {
  assert.match(cartSource, /validateCheckoutSelection/)
  assert.match(cartSource, /hasMultipleCheckoutStores/)
  assert.match(cartPageSource, /validateCheckoutSelection/)
})

test('checkout session refreshes cart selection and busts stale cache', () => {
  assert.match(checkoutSource, /refreshCheckoutSession/)
  assert.match(checkoutSource, /resetCheckoutCalculationState/)
  assert.match(checkoutSource, /loadCart\(\{\s*silent:\s*true\s*\}\)/)
  assert.match(cartPageSource, /query:\s*\{\s*t:\s*Date\.now\(\)\.toString\(\)/)
})
