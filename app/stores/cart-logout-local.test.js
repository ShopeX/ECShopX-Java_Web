import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()
const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('resetLocalCart only clears local cart state and cache', () => {
  const cartStoreSource = read('app/stores/cart.ts')

  assert.match(cartStoreSource, /resetLocalCart\(\)/)
  assert.match(cartStoreSource, /this\.items = \[\]/)
  assert.match(cartStoreSource, /this\.invalidItems = \[\]/)
  assert.match(cartStoreSource, /this\.cartTotalPrice = 0/)
  assert.match(cartStoreSource, /this\.discountFee = 0/)
  assert.match(cartStoreSource, /localStorage\.removeItem\('cart_cache'\)/)
  assert.doesNotMatch(cartStoreSource, /resetLocalCart\(\)[\s\S]*cartApiClient\.clearCart\(/)
})
