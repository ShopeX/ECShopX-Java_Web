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
  it('does not expose a separate partial shipment tab', () => {
    expect(orderStatusSource).toContain("PARTIAL_SHIPMENT = 'partial_shipment'")
    expect(orderListPageSource).not.toContain('OrderStatus.PARTIAL_SHIPMENT, label:')
  })

  it('maps partial shipment filter to the same api status as pending shipment', () => {
    expect(ordersComposableSource).toMatch(
      /case OrderStatus\.PENDING_SHIPMENT:[\s\S]*case OrderStatus\.PARTIAL_SHIPMENT:[\s\S]*apiStatus = 6/
    )
    expect(ordersComposableSource).not.toMatch(
      /case OrderStatus\.PARTIAL_SHIPMENT:\s*apiStatus = 8/
    )
  })
})
