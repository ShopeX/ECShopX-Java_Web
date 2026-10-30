import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const transformerSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/transformers/aftersalesTransformer.ts'),
  'utf8'
)

test('aftersales transformer exposes dedicated detail mapping', () => {
  assert.match(transformerSource, /static toAftersalesDetailModel\(/)
  assert.match(transformerSource, /const orderInfo = record\.app_info\?\.order_info \|\| record\.order_info \|\| \{\}/)
  assert.match(transformerSource, /const refundInfo = record\.refund_info \|\| \{\}/)
  assert.match(transformerSource, /progressSteps:/)
})

test('aftersales detail mapping reads live payload sections', () => {
  assert.match(transformerSource, /receiverName:\s*String\(orderInfo\.receiver_name \|\| record\.contact \|\| ''\)/)
  assert.match(transformerSource, /receiverMobile:\s*String\(orderInfo\.receiver_mobile \|\| record\.mobile \|\| ''\)/)
  assert.match(transformerSource, /reason:\s*String\(record\.reason \|\| ''\)/)
  assert.match(transformerSource, /description:\s*String\(record\.description \|\| ''\)/)
  assert.match(transformerSource, /paymentMethod:\s*String\(orderInfo\.app_pay_type_desc \|\| orderInfo\.pay_type \|\| ''\)/)
  assert.match(transformerSource, /payTime:\s*AftersalesTransformer\.formatTimestamp\(/)
})

test('aftersales detail mapping uses detail order item data and refund values', () => {
  assert.match(transformerSource, /const source = record\.detail \|\| \[\]/)
  assert.match(transformerSource, /const orderItem = item\.orderItem \|\| item/)
  assert.match(transformerSource, /goodsAmount:\s*AftersalesTransformer\.normalizeFenAmount\(orderInfo\.item_fee\)/)
  assert.match(transformerSource, /freightAmount:\s*AftersalesTransformer\.normalizeFenAmount\(orderInfo\.freight_fee\)/)
  assert.match(transformerSource, /discountAmount:\s*AftersalesTransformer\.normalizeFenAmount\(orderInfo\.discount_fee\)/)
  assert.match(transformerSource, /paidAmount:\s*AftersalesTransformer\.normalizeFenAmount\(orderInfo\.total_fee\)/)
  assert.match(transformerSource, /refundAmount:\s*AftersalesTransformer\.normalizeRefundAmount\(/)
})
