import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/orders/index.vue'),
  'utf8'
)

test('order list preloads order detail and reason options before opening aftersales panel', () => {
  assert.match(source, /const openingAftersalesOrderIds = ref/)
  assert.match(source, /await Promise\.all\(\[/)
  assert.match(source, /orderApiClient\.getOrderDetail\(order\.orderId\)/)
  assert.match(source, /loadReasonOptions\(\)/)
  assert.match(source, /aftersalesVisible\.value = true/)
})
