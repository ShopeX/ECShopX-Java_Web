import { describe, expect, it } from 'vitest'
import { parseFormBody, stringifyFormBody } from './formUrlencoded'

describe('formUrlencoded (URLSearchParams)', () => {
  it('stringifies flat fields', () => {
    expect(stringifyFormBody({ order_id: '1', company_id: 2 })).toBe('order_id=1&company_id=2')
  })

  it('stringifies bracket array keys like vshop voucher_pic[0]', () => {
    expect(stringifyFormBody({ order_id: '1', 'voucher_pic[0]': 'https://a' })).toBe(
      'order_id=1&voucher_pic%5B0%5D=https%3A%2F%2Fa'
    )
  })

  it('parses string body like vshop', () => {
    expect(parseFormBody('order_id=1&foo=bar')).toEqual({ order_id: '1', foo: 'bar' })
  })
})
