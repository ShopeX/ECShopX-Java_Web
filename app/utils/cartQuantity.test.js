import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { normalizeCartQuantityParts } from './cartQuantity.ts'

test('normalizeCartQuantityParts keeps zero-stock rows displayable', () => {
  const parts = normalizeCartQuantityParts(1, 0)
  assert.equal(parts.num, 1)
  assert.equal(parts.store, 0)
  assert.equal(parts.max, 1)
})

test('normalizeCartQuantityParts allows num above store', () => {
  const parts = normalizeCartQuantityParts(5, 2)
  assert.equal(parts.num, 5)
  assert.equal(parts.store, 2)
  assert.equal(parts.max, 5)
})

test('normalizeCartQuantityParts coerces string num and store', () => {
  const parts = normalizeCartQuantityParts('3', '10')
  assert.equal(parts.num, 3)
  assert.equal(parts.store, 10)
  assert.equal(parts.max, 10)
})

test('normalizeCartQuantityParts falls back when num is invalid', () => {
  const parts = normalizeCartQuantityParts(undefined, 8)
  assert.equal(parts.num, 1)
  assert.equal(parts.store, 8)
  assert.equal(parts.max, 8)
})

test('cartTransformer and cart store use normalizeCartQuantityParts', () => {
  const transformer = readFileSync(
    path.resolve(process.cwd(), 'app/infrastructure/transformers/cartTransformer.ts'),
    'utf8'
  )
  const cartStore = readFileSync(path.resolve(process.cwd(), 'app/stores/cart.ts'), 'utf8')
  assert.match(transformer, /normalizeCartQuantityParts\(apiItem\.num,\s*apiItem\.store\)/)
  assert.match(transformer, /QuantityValueObject\.of\(num,\s*1,\s*max\)/)
  assert.match(cartStore, /normalizeCartQuantityParts\(/)
})
