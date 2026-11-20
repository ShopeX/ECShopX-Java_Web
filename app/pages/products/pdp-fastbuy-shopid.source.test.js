import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const source = readFileSync(path.resolve(process.cwd(), 'app/pages/products/[id].vue'), 'utf8')

test('PDP fastbuy carries shopid into checkout for freight fee', () => {
  assert.match(source, /resolvePurchaseDistributorId/)
  assert.match(source, /shopId\.value\s*\|\|/)
  assert.match(source, /checkoutQuery\.shopid\s*=\s*purchaseDistributorId/)
  assert.match(source, /mode:\s*['"]fastbuy['"]/)
})
