import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { paymentApiClient } from '~/infrastructure/http/clients'
import { usePayment } from './usePayment'

vi.mock('~/infrastructure/http/clients', () => ({
  paymentApiClient: {
    getOrderPaymentInfo: vi.fn(),
    getOrderInfo: vi.fn(),
  },
}))

const payUrl = 'https://pay.example.com/doumen'

describe('doumen_intl external redirect waiting state', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-28T00:00:00Z'))
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.mocked(paymentApiClient.getOrderPaymentInfo).mockResolvedValue({ data: { pay_url: payUrl } })
    vi.mocked(paymentApiClient.getOrderInfo).mockResolvedValue({ data: { payStatus: 'pending' } })
    vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
    vi.stubGlobal('window', {
      open: vi.fn(),
      location: { origin: 'https://shop.example.com', assign: vi.fn() },
      innerWidth: 1280,
    })
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0',
    })
  })

  afterEach(() => {
    warnSpy.mockRestore()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('opens external_redirect in a new tab and keeps the current page waiting', async () => {
    const payment = usePayment(ref('order-1'))
    payment.selectedPayType.value = 'doumen_intl'

    await payment.payNow()

    expect(window.open).toHaveBeenCalledWith(payUrl, '_blank')
    expect(window.location.assign).not.toHaveBeenCalled()
    expect(payment.isExternalWaiting.value).toBe(true)
    expect(payment.payResult.value).toBe('pending')
    expect(payment.remainingTimeText.value).toBe('00 : 01 : 00')

    vi.advanceTimersByTime(5000)
    await vi.runOnlyPendingTimersAsync()
    expect(paymentApiClient.getOrderInfo).toHaveBeenCalledWith('order-1', {
      pay_type: 'doumen_intl',
    })
  })

  it('reopens the same external pay url after payment starts', async () => {
    const payment = usePayment(ref('order-1'))
    payment.selectedPayType.value = 'doumen_intl'

    await payment.payNow()
    vi.mocked(window.open).mockClear()
    payment.reopenExternalPay()

    expect(window.open).toHaveBeenCalledWith(payUrl, '_blank')
  })

  it('marks external payment as unconfirmed instead of failed when polling times out', async () => {
    const payment = usePayment(ref('order-1'))
    payment.selectedPayType.value = 'doumen_intl'

    await payment.payNow()

    vi.advanceTimersByTime(65000)
    await vi.runOnlyPendingTimersAsync()

    expect(payment.payResult.value).toBe('unconfirmed')
    expect(payment.isExternalWaiting.value).toBe(false)
    expect(payment.error.value).toBeNull()
  })

  it('marks payment success when manual recheck finds a paid order', async () => {
    const payment = usePayment(ref('order-1'))
    payment.selectedPayType.value = 'doumen_intl'

    await payment.payNow()
    vi.advanceTimersByTime(65000)
    await vi.runOnlyPendingTimersAsync()

    vi.mocked(paymentApiClient.getOrderInfo).mockResolvedValue({ data: { payStatus: 'paid' } })
    await payment.recheckPaymentResult()

    expect(payment.payResult.value).toBe('success')
    expect(payment.isExternalWaiting.value).toBe(false)
  })
})
