import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const panelSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AftersalesPanel.vue'),
  'utf8'
)
const formSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AftersalesFormContent.vue'),
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
const deliveryUtilSource = readFileSync(
  path.resolve(process.cwd(), 'app/utils/orderItemDelivery.ts'),
  'utf8'
)

test('aftersales selection follows vshop ONLY_REFUND / REFUND_GOODS rules', () => {
  assert.match(deliveryUtilSource, /export function canSelectAftersalesItem/)
  assert.match(deliveryUtilSource, /aftersalesType === 'ONLY_REFUND'/)
  assert.match(deliveryUtilSource, /isUnshippedAftersalesItem\(item\) && Number\(item\.leftRefundOnlyNum\) > 0/)
  assert.match(deliveryUtilSource, /Number\(item\.leftAftersalesNum\) > 0/)
  assert.match(panelSource, /canSelectAftersalesItem\(item, aftersalesType\.value\)/)
  assert.match(panelSource, /resolveAftersalesQuantityMax\(item, aftersalesType\.value\)/)
  assert.match(formSource, /:disabled="!isItemSelectable\(item\)"/)
  assert.match(formSource, /quantityFor\(item\.itemId\) >= maxQuantityFor\(item\)/)
  assert.match(formSource, /aftersales-type-tabs/)
  assert.match(formSource, /aftersales-item-delivery-tag/)
})

test('aftersales panel supports multi-select like vshop checked items', () => {
  assert.match(panelSource, /selectedItemIds/)
  assert.match(panelSource, /function toggleItem/)
  assert.match(panelSource, /selectedItems\.value\.map/)
  assert.match(formSource, /selectedItemIds/)
  assert.match(formSource, /toggleItem/)
  assert.match(formSource, /role="checkbox"/)
  assert.match(formSource, /isItemChecked\(item\.itemId\)/)
  assert.match(formSource, /showOnlyRefundBlockedTip/)
  assert.match(formSource, /0747dfee\.47107ea8/)
})

test('order pages forward aftersales quota and delivery fields into shared aftersales items', () => {
  assert.match(orderListSource, /leftAftersalesNum: item\.leftAftersalesNum/)
  assert.match(orderListSource, /leftRefundOnlyNum: item\.leftRefundOnlyNum/)
  assert.match(orderListSource, /deliveryStatus: item\.deliveryStatus/)
  assert.match(orderListSource, /order-delivery-status="aftersalesItem\.orderDeliveryStatus"/)
  assert.match(orderDetailSource, /leftAftersalesNum: item\.leftAftersalesNum/)
  assert.match(orderDetailSource, /leftRefundOnlyNum: item\.leftRefundOnlyNum/)
  assert.match(orderDetailSource, /deliveryStatus: item\.deliveryStatus/)
  assert.match(orderDetailSource, /order-delivery-status="aftersalesItem\.orderDeliveryStatus"/)
})
