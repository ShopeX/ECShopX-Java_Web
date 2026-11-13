import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PaymentApiClient,
  buildOfflineVoucherFormBody,
} from './PaymentApiClient'

const httpMock = vi.fn()

vi.stubGlobal('useNuxtApp', () => ({
  $api: httpMock,
}))

describe('buildOfflineVoucherFormBody', () => {
  it('expands voucher_pic as indexed form keys like vshop', () => {
    const body = buildOfflineVoucherFormBody({
      order_id: '5405702000080261',
      bank_account_id: 11,
      pay_fee: 79900,
      voucher_pic: [
        'https://example.com/a.jpg',
        'https://example.com/b.jpg',
      ],
      pay_sn: 'ref-1',
    })

    expect(body.order_id).toBe('5405702000080261')
    expect(body['voucher_pic[0]']).toBe('https://example.com/a.jpg')
    expect(body['voucher_pic[1]']).toBe('https://example.com/b.jpg')
    expect(body).not.toHaveProperty('voucher_pic')
  })
})

describe('PaymentApiClient.uploadOfflineVoucher', () => {
  beforeEach(() => {
    httpMock.mockReset()
    httpMock.mockResolvedValue({})
  })

  it('posts indexed voucher_pic fields', async () => {
    const client = new PaymentApiClient()
    await client.uploadOfflineVoucher({
      order_id: '1',
      bank_account_id: 11,
      pay_fee: 100,
      voucher_pic: ['https://example.com/pic.jpg'],
    })

    expect(httpMock).toHaveBeenCalledWith('/wxapp/order/offline/upload/voucher', {
      method: 'POST',
      body: {
        order_id: '1',
        bank_account_id: 11,
        pay_fee: 100,
        'voucher_pic[0]': 'https://example.com/pic.jpg',
      },
    })
  })
})
