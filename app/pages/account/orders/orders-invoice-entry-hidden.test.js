import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const orderListSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/orders/index.vue'),
  'utf8'
)
const orderDetailSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/orders/[id].vue'),
  'utf8'
)
const orderDetailComposableSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useOrderDetail.ts'),
  'utf8'
)

test('order list hides invoice entry from desktop and mobile actions', () => {
  assert.doesNotMatch(orderListSource, /v-if="order\.canInvoice"/)
  assert.doesNotMatch(orderListSource, /actions\.push\('invoice'\)/)
  assert.doesNotMatch(orderListSource, /case 'invoice':[\s\S]*applyInvoice\(order\.orderId\)/)
})

test('order detail hides invoice action entry and invoice modal', () => {
  assert.doesNotMatch(orderDetailSource, /@invoice="applyInvoice"/)
  assert.doesNotMatch(orderDetailSource, /<BCInvoiceModal/)
  assert.doesNotMatch(orderDetailSource, /invoiceDialogVisible/)
  assert.doesNotMatch(orderDetailSource, /submitOrderInvoice/)
  assert.doesNotMatch(orderDetailComposableSource, /actions\.push\('invoice'\)/)
})
