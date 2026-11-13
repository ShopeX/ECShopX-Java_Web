import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

test('order item delivery util aligns with admin getItemShipLabel rules', () => {
  const utilSource = readFileSync(
    resolve(process.cwd(), 'app/utils/orderItemDelivery.ts'),
    'utf8'
  )
  assert.match(utilSource, /deliveryStatus === 'PENDING'/)
  assert.match(utilSource, /deliveryItemNum < quantity/)
  assert.match(utilSource, /deliveryStatus === 'DONE' \|\| shipStatus === 1/)
  assert.match(utilSource, /PARTAIL/)
})

test('aftersales helpers align with vshop partial-delivery selection', () => {
  const utilSource = readFileSync(
    resolve(process.cwd(), 'app/utils/orderItemDelivery.ts'),
    'utf8'
  )
  assert.match(utilSource, /resolveLeftRefundOnlyNum/)
  assert.match(utilSource, /canSelectAftersalesItem/)
  assert.match(utilSource, /resolveAftersalesItemDeliveryTagKind/)
  assert.match(utilSource, /isOrderFullyShippedDelivery/)
})

test('aftersales item delivery tag reuses order list ship label rules', () => {
  const utilSource = readFileSync(
    resolve(process.cwd(), 'app/utils/orderItemDelivery.ts'),
    'utf8'
  )
  assert.match(utilSource, /resolveOrderItemShipLabelKind\(\{/)
  assert.doesNotMatch(utilSource, /aftersalesType === 'REFUND_GOODS'/)
  assert.doesNotMatch(utilSource, /isPartialDeliveryStatus\(orderStatus\)/)
})

test('order list and detail render item ship badge component', () => {
  const listSource = readFileSync(
    resolve(process.cwd(), 'app/pages/account/orders/index.vue'),
    'utf8'
  )
  const detailItemsSource = readFileSync(
    resolve(process.cwd(), 'app/pages/account/components/OrderDetailItems.vue'),
    'utf8'
  )
  const transformerSource = readFileSync(
    resolve(process.cwd(), 'app/infrastructure/transformers/orderTransformer.ts'),
    'utf8'
  )

  assert.match(listSource, /OrderItemThumb/)
  assert.match(detailItemsSource, /OrderItemThumb/)
  assert.match(transformerSource, /deliveryItemNum/)
  assert.match(transformerSource, /isPartialDelivery/)
})
