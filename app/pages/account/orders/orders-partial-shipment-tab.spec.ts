import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const orderListPageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/orders/index.vue'),
  'utf8'
)
const ordersComposableSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useOrders.ts'),
  'utf8'
)
const orderStatusSource = readFileSync(
  path.resolve(process.cwd(), 'app/types/api/order.ts'),
  'utf8'
)

describe('order list partial shipment tab', () => {
  it('queries backend status 8', () => {
    expect(orderStatusSource).toContain("PARTIAL_SHIPMENT = 'partial_shipment'")
    expect(orderListPageSource).toContain(
      "OrderStatus.PARTIAL_SHIPMENT, label: t('de8076e6.5296ac')"
    )
    expect(ordersComposableSource).toMatch(
      /case OrderStatus\.PARTIAL_SHIPMENT:\s*apiStatus = 8/
    )
  })
})
