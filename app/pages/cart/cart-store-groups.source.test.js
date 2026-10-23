import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const cartPageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/cart/index.vue'),
  'utf8'
)
const cartStoreSource = readFileSync(
  path.resolve(process.cwd(), 'app/stores/cart.ts'),
  'utf8'
)
const transformerSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/transformers/cartTransformer.ts'),
  'utf8'
)
const storeHeaderSource = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCMiniCart/BCMiniCartStoreHeader.vue'),
  'utf8'
)

test('cart page renders store groups with store header', () => {
  assert.match(cartPageSource, /cartStoreGroupsUI/)
  assert.match(cartPageSource, /BCMiniCartStoreHeader/)
  assert.match(cartPageSource, /v-for="group in cartStoreGroupsUI"/)
})

test('mini cart store header uses IconPark application icon fallback', () => {
  assert.match(storeHeaderSource, /i-icon-park-outline:application/)
  assert.doesNotMatch(storeHeaderSource, /building-storefront/)
  assert.match(storeHeaderSource, /gap-\[10px\]/)
})

test('cart store enriches line items with group shop fields', () => {
  assert.match(cartStoreSource, /enrichItemWithGroup/)
  assert.match(transformerSource, /resolveStoreId/)
  assert.match(transformerSource, /resolveStoreName/)
  assert.match(transformerSource, /shop_id/)
})
