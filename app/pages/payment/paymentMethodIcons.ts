export interface PaymentMethodIconConfig {
  src: string
  altKey: string
  wrapperClass: string
  imageClass: string
}

export const PAYMENT_METHOD_ICON_MAP: Record<string, PaymentMethodIconConfig> = {
  wxpaypc: {
    src: '/images/payment/wechat-pay.svg',
    altKey: 'f410ffb1.9374f6',
    wrapperClass: 'size-[24px]',
    imageClass: 'size-full',
  },
  alipay: {
    src: '/images/payment/alipay.svg',
    altKey: 'f410ffb1.5ecd69',
    wrapperClass: 'size-[24px]',
    imageClass: 'size-full',
  },
  unionpay: {
    src: '/images/payment/bank-transfer.svg',
    altKey: 'f410ffb1.028bc6',
    wrapperClass: 'relative size-[24px]',
    imageClass: 'absolute left-1/2 top-1/2 h-[12px] w-[24px] -translate-x-1/2 -translate-y-1/2',
  },
  deposit: {
    src: '/images/payment/balance-pay.svg',
    altKey: 'f410ffb1.depositIcon',
    wrapperClass: 'size-[24px]',
    imageClass: 'size-full',
  },
}

export function resolvePaymentMethodIcon(code?: string | null): PaymentMethodIconConfig | null {
  if (!code) return null
  const normalized = String(code)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
  return PAYMENT_METHOD_ICON_MAP[code] ?? PAYMENT_METHOD_ICON_MAP[normalized] ?? null
}
