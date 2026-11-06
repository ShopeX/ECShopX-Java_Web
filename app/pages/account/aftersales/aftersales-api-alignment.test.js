import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const aftersalesComposableSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useAftersalesOrders.ts'),
  'utf8'
)
const apiClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/AftersalesApiClient.ts'),
  'utf8'
)
const transformerSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/transformers/aftersalesTransformer.ts'),
  'utf8'
)

test('aftersales tabs map to numeric status query values from live api', () => {
  assert.match(aftersalesComposableSource, /pending:\s*'0'/)
  assert.match(aftersalesComposableSource, /processing:\s*'1'/)
  assert.match(aftersalesComposableSource, /processed:\s*'2'/)
  assert.match(aftersalesComposableSource, /rejected:\s*'3'/)
  assert.match(aftersalesComposableSource, /closed:\s*'4'/)
})

test('aftersales list request includes normal order type', () => {
  assert.match(apiClientSource, /order_type:\s*params\.order_type\s*\|\|\s*'normal'/)
})

test('aftersales transformer reads detail lines and live record identifiers', () => {
  assert.match(transformerSource, /record\.detail/)
  assert.match(transformerSource, /aftersalesId:\s*String\(record\.aftersales_id \|\| record\.id \|\| record\.aftersales_bn \|\| ''\)/)
  assert.match(
    transformerSource,
    /storeName:\s*String\(\s*record\.store_name\s*\|\|\s*record\.shop_name\s*\|\|\s*record\.distributor_name\s*\|\|\s*record\.distributor_info\?\.store_name\s*\|\|\s*record\.distributor_info\?\.name\s*\|\|\s*''\s*\)/
  )
})

test('aftersales transformer maps numeric status codes from live api', () => {
  assert.match(transformerSource, /const statusCodeMap: Record<string,\s*Exclude<AftersalesTabKey, 'all'>> =/)
  assert.match(transformerSource, /'0':\s*'pending'/)
  assert.match(transformerSource, /'1':\s*'processing'/)
  assert.match(transformerSource, /'2':\s*'processed'/)
  assert.match(transformerSource, /'3':\s*'rejected'/)
  assert.match(transformerSource, /'4':\s*'closed'/)
})

test('aftersales refund fee keeps live api yuan values without fen conversion', () => {
  assert.match(transformerSource, /private static normalizeRefundAmount\(value: unknown\): number/)
  assert.match(transformerSource, /return Number\(value \|\| 0\) \|\| 0/)
  assert.match(transformerSource, /refundAmount:\s*AftersalesTransformer\.normalizeRefundAmount\(/)
})
