import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test, vi } from 'vitest'
import type { PaymentClientRuntime } from './usePayment'

vi.mock('~/infrastructure/http/clients', () => ({ paymentApiClient: {} }))

const source = readFileSync(path.resolve(process.cwd(), 'app/composables/usePayment.ts'), 'utf8')
const { resolvePaymentExecutionType } = await import('./usePayment')

test('doumen_intl resolves to external redirect before platform-specific payment routing', () => {
  expect(source).toMatch(/\|\s*'external_redirect'/)
  expect(source).toMatch(
    /if \(normalizePayType\(selectedPayType\) === 'doumenintl'\) \{\s*return 'external_redirect'\s*\}/
  )
  expect(source).toMatch(/case 'external_redirect': \{[\s\S]*data\?\.pay_url/)
  expect(source).toMatch(/case 'external_redirect': \{[\s\S]*extractPaymentRedirectUrl\(data\)/)
  expect(source).toMatch(/case 'external_redirect': \{[\s\S]*openPaymentUrl\(payUrl\)/)

  const doumenBranch = source.indexOf("normalizePayType(selectedPayType) === 'doumenintl'")
  const wechatBranch = source.indexOf('if (isWechatPayType(selectedPayType))')
  const alipayBranch = source.indexOf('if (isAlipayPayType(selectedPayType))')
  expect(doumenBranch).toBeGreaterThanOrEqual(0)
  expect(wechatBranch).toBeGreaterThanOrEqual(0)
  expect(alipayBranch).toBeGreaterThanOrEqual(0)
  expect(doumenBranch).toBeLessThan(wechatBranch)
  expect(doumenBranch).toBeLessThan(alipayBranch)
})

test('doumen_intl resolves to external redirect for pc h5 and wechat browser runtimes', () => {
  const pcRuntime: PaymentClientRuntime = {
    platform: 'pc',
    isWechatBrowser: false,
    isAlipayBrowser: false,
  }
  const h5Runtime: PaymentClientRuntime = {
    platform: 'h5',
    isWechatBrowser: false,
    isAlipayBrowser: false,
  }
  const wechatRuntime: PaymentClientRuntime = {
    platform: 'h5',
    isWechatBrowser: true,
    isAlipayBrowser: false,
  }

  expect(
    resolvePaymentExecutionType({ runtime: pcRuntime, selectedPayType: 'doumen_intl' })
  ).toBe('external_redirect')
  expect(
    resolvePaymentExecutionType({ runtime: h5Runtime, selectedPayType: 'doumen_intl' })
  ).toBe('external_redirect')
  expect(
    resolvePaymentExecutionType({ runtime: wechatRuntime, selectedPayType: 'doumen_intl' })
  ).toBe('external_redirect')
  expect(resolvePaymentExecutionType({ runtime: pcRuntime, selectedPayType: 'wxpayh5' })).toBe(
    'qrcode'
  )
})
