import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const orderTransformerSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/transformers/orderTransformer.ts'),
  'utf8'
)
const orderDetailComposableSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useOrderDetail.ts'),
  'utf8'
)

test('eligible order items expose remaining aftersales count from api payload', () => {
  assert.match(
    orderTransformerSource,
    /const leftAftersalesNum = Number\(apiItem\.left_aftersales_num \?\? quantity\)/
  )
})

test('shipped orders only support aftersales when remaining item count is available', () => {
  assert.match(
    orderTransformerSource,
    /canApplyAftersales:\s*\['shipped',\s*'completed'\]\.includes\(status\)\s*&&\s*canApplyAftersales/
  )
})

test('order list aftersales visibility can use top-level left_aftersales_num when present', () => {
  assert.match(
    orderTransformerSource,
    /const orderLeftAftersalesNum = Number\(apiOrder\.left_aftersales_num \?\? NaN\)/
  )
  assert.match(
    orderTransformerSource,
    /const canApplyAftersales = Number\.isFinite\(orderLeftAftersalesNum\)\s*\?\s*orderLeftAftersalesNum > 0\s*:\s*items\.some\(\(item: any\) => item\.leftAftersalesNum > 0\)/
  )
})

test('order detail status mapping upgrades paid orders to shipped when detail delivery status shows shipped', () => {
  assert.match(orderTransformerSource, /const deliveryStatus = String\(apiOrder\.delivery_status \|\| '0'\)/)
  assert.match(orderTransformerSource, /if \(\['1', 'DONE'\]\.includes\(deliveryStatus\)\) \{\s*status = 'shipped'/)
})

test('order detail actions still expose aftersales when model allows it', () => {
  assert.match(orderDetailComposableSource, /if \(order\.value\.canApplyAftersales\) actions\.push\('aftersales'\)/)
})
