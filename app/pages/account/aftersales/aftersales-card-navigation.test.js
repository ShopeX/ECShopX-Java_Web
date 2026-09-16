import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AftersalesOrderCard.vue'),
  'utf8'
)

test('aftersales order card navigates to detail route with item context', () => {
  assert.match(source, /useLocalePath\(\)/)
  assert.match(source, /navigateTo\(/)
  assert.match(source, /name:\s*'account-aftersales-id'/)
  assert.match(source, /id:\s*props\.order\.aftersalesId/)
  assert.match(source, /itemId:\s*props\.order\.items\?\.\[0\]\?\.itemId\s*\|\|\s*''/)
})
