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

describe('order list pending shipment tab', () => {
  it('places pending shipment tab after pending payment and before partial shipment', () => {
    expect(orderStatusSource).toContain("PENDING_SHIPMENT = 'pending_shipment'")
    expect(orderListPageSource).toContain(
      "OrderStatus.PENDING_SHIPMENT, label: t('de8076e6.d8476e')"
    )

    const pendingPaymentIdx = orderListPageSource.indexOf(
      "OrderStatus.PENDING_PAYMENT, label: t('de8076e6.9246fe')"
    )
    const pendingShipmentIdx = orderListPageSource.indexOf(
      "OrderStatus.PENDING_SHIPMENT, label: t('de8076e6.d8476e')"
    )
    const partialShipmentIdx = orderListPageSource.indexOf(
      "OrderStatus.PARTIAL_SHIPMENT, label: t('de8076e6.5296ac')"
    )

    expect(pendingPaymentIdx).toBeGreaterThan(-1)
    expect(pendingShipmentIdx).toBeGreaterThan(pendingPaymentIdx)
    expect(partialShipmentIdx).toBeGreaterThan(pendingShipmentIdx)
  })

  it('queries backend status 6', () => {
    expect(ordersComposableSource).toMatch(
      /case OrderStatus\.PENDING_SHIPMENT:\s*apiStatus = 6/
    )
  })
})
