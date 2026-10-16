import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const apiClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/AftersalesApiClient.ts'),
  'utf8'
)
const panelSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AftersalesPanel.vue'),
  'utf8'
)
const orderTransformerSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/transformers/orderTransformer.ts'),
  'utf8'
)
const orderListSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/orders/index.vue'),
  'utf8'
)
const orderDetailSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/orders/[id].vue'),
  'utf8'
)

test('aftersales api client submits form body with detail item fields', () => {
  assert.match(apiClientSource, /method: 'POST'/)
  assert.match(apiClientSource, /body,/)
  assert.match(apiClientSource, /detail\[\$\{index\}\]\[id\]/)
  assert.match(apiClientSource, /detail\[\$\{index\}\]\[num\]/)
  assert.match(apiClientSource, /return_type: params\.return_type \?\? 'logistics'/)
  assert.match(apiClientSource, /evidence_pic: params\.evidence_pic \?\? ''/)
  assert.doesNotMatch(apiClientSource, /query: \{ \.\.\.params \}/)
})

test('aftersales api client exposes local image upload endpoint', () => {
  assert.match(apiClientSource, /uploadLocalImage/)
  assert.match(apiClientSource, /\/wxapp\/espier\/uploadlocal/)
  assert.doesNotMatch(apiClientSource, /getAftersalesItemPrice/)
})

test('aftersales panel submits selected item in detail payload', () => {
  assert.match(panelSource, /detail:\s*\[/)
  assert.match(panelSource, /id: selectedItem\.value\.detailId/)
  assert.match(panelSource, /num: selectedQuantity\.value/)
  assert.match(panelSource, /freight: 0/)
  assert.match(panelSource, /return_type: 'logistics'/)
  assert.match(panelSource, /uploadedImages\.value[\s\S]*item\.uploadedUrl/)
  assert.match(panelSource, /readFileAsDataUrl/)
  assert.match(panelSource, /uploadLocalImage/)
  assert.doesNotMatch(panelSource, /refreshRefundAmount/)
})

test('order item transformation and page mappings preserve the order item row id for aftersales payloads', () => {
  assert.match(orderTransformerSource, /detailId: String\(apiItem\.id \|\| apiItem\.item_id \|\| ''\)/)
  assert.match(orderListSource, /detailId: item\.detailId/)
  assert.match(orderDetailSource, /detailId: item\.detailId/)
})
