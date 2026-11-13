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

test('eligible order items expose remaining aftersales and refund-only counts from api payload', () => {
  assert.match(orderTransformerSource, /resolveLeftRefundOnlyNum/)
  assert.match(orderTransformerSource, /leftRefundOnlyNum/)
  assert.match(orderTransformerSource, /rawLeftAftersales/)
  assert.match(orderTransformerSource, /leftRefundOnlyNum > 0/)
})

test('shipped orders only support aftersales when remaining item count is available', () => {
  assert.match(orderTransformerSource, /hasAftersalesQuota/)
  assert.match(
    orderTransformerSource,
    /canApplyAftersales:\s*hasAftersalesQuota\s*&&\s*\(isPartialDelivery \|\| \['shipped',\s*'completed'\]\.includes\(status\)\)/
  )
})

test('order list aftersales visibility uses order and item quotas including left_refund_only_num', () => {
  assert.match(
    orderTransformerSource,
    /const orderLeftAftersalesNum = Number\(apiOrder\.left_aftersales_num \?\? NaN\)/
  )
  assert.match(orderTransformerSource, /hasItemAftersalesQuota/)
  assert.match(orderTransformerSource, /item\.leftRefundOnlyNum/)
  assert.match(
    orderTransformerSource,
    /orderLeftAftersalesNum > 0 \|\| hasItemAftersalesQuota/
  )
})

test('order detail status mapping upgrades paid orders to shipped when detail delivery status shows shipped', () => {
  assert.match(orderTransformerSource, /deliveryStatusRaw/)
  assert.match(orderTransformerSource, /isPartialDelivery/)
  assert.match(
    orderTransformerSource,
    /if \(\['1', 'DONE'\]\.includes\(deliveryStatus\)\) \{\s*status = 'shipped'/
  )
})

test('partial delivery actions align with vshop PAYED+PARTAIL', () => {
  assert.match(orderTransformerSource, /!isPartialDelivery &&/)
  assert.match(orderTransformerSource, /canConfirmReceipt: status === 'shipped' && !isPartialDelivery/)
  assert.match(
    orderTransformerSource,
    /canViewLogistics:\s*isPartialDelivery \|\| \['shipped',\s*'completed'\]\.includes\(status\)/
  )
  assert.match(
    orderTransformerSource,
    /} else if \(isPartialDelivery\) \{\s*(?:\/\/[^\n]*\n\s*)*status = 'pending_shipment'/
  )
})

test('order list status text shows partial delivery label when flagged', () => {
  const useOrdersSource = readFileSync(
    path.resolve(process.cwd(), 'app/composables/useOrders.ts'),
    'utf8'
  )
  assert.match(useOrdersSource, /order\?\.isPartialDelivery/)
  assert.match(useOrdersSource, /de8076e6\.5296ac/)
})

test('order detail actions still expose aftersales when model allows it', () => {
  assert.match(
    orderDetailComposableSource,
    /if \(order\.value\.canApplyAftersales\) actions\.push\('aftersales'\)/
  )
})
