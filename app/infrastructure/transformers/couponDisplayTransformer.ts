import { DiscountValueObject } from '~/shared/value-objects'

export type CouponCardType = 'discount' | 'cash' | 'gift'
export type CouponUsageTimeKind = 'range' | 'until' | 'from' | 'longTerm'

export interface II18nText {
  key: string
  params?: Record<string, string | number>
}

export interface ICouponModel {
  id: string
  couponCode: string
  code: string
  cardType: CouponCardType
  typeLabel: string
  title: string
  displayValue: string
  displayPrefix?: string
  displaySuffix?: string
  amount: number
  minFee: number
  usageTimeText: string
  usageTimeKind?: CouponUsageTimeKind
  ruleText: string
  typeLabelI18n?: II18nText
  titleI18n?: II18nText
  displayValueI18n?: II18nText
  displaySuffixI18n?: II18nText
  usageTimeI18n?: II18nText
  ruleTextI18n?: II18nText
  usable: boolean
}

interface ResolvedText {
  text: string
  i18n?: II18nText
}

interface ResolvedUsageTime extends ResolvedText {
  kind: CouponUsageTimeKind
}

const USE_BOUND_TEXT_MAP: Record<string, II18nText> = {
  '0': { key: '045498f1.428a6d' },
  '1': { key: '045498f1.53be82' },
  '2': { key: '045498f1.f629c6' },
  '3': { key: '045498f1.622b48' },
  '4': { key: '045498f1.1c08b8' },
}

function parseMoneyFromCent(value: unknown): number {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? amount / 100 : 0
}

function normalizeDate(value: unknown): string {
  if (!value) return ''
  return String(value).split(' ')[0] || ''
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return value
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')
}

function isSerializedBackendText(value: string): boolean {
  const text = value.trim()
  if (!text) return false

  return /^(?:a|s|i|b|d|O|C):\d+:/i.test(text)
}

function i18nText(key: string, params?: Record<string, string | number>): II18nText {
  return params ? { key, params } : { key }
}

function resolvedText(text: string, i18n?: II18nText): ResolvedText {
  return { text, i18n }
}

function normalizeScopeCopy(value: string, minFee: number): ResolvedText {
  const text = value.trim()
  if (!text) return resolvedText('')

  if (isSerializedBackendText(text)) {
    return resolvedText('')
  }

  if (text.includes('无门槛')) {
    return resolvedText('045498f1.ee701d', i18nText('045498f1.ee701d'))
  }

  if (minFee <= 0 && (text === '全场可用' || text === '全部商品使用' || text === '全部商品可用')) {
    return resolvedText('045498f1.ee701d', i18nText('045498f1.ee701d'))
  }

  if (text === '全场可用' || text === '全部商品可用') {
    return resolvedText('045498f1.428a6d', i18nText('045498f1.428a6d'))
  }

  return resolvedText(text)
}

function normalizeCardType(value: unknown): CouponCardType {
  const cardType = String(value || '').toLowerCase()

  if (cardType === 'discount') return 'discount'
  if (cardType === 'gift' || cardType === 'new_gift') return 'gift'
  return 'cash'
}

function resolveUsageTimeText(item: any): ResolvedUsageTime {
  const beginDate = normalizeDate(item.begin_date || item.start_time || item.begin_time)
  const endDate = normalizeDate(item.end_date || item.expire_time || item.end_time)

  if (beginDate && endDate) {
    return {
      kind: 'range',
      text: `${beginDate} - ${endDate}`,
    }
  }

  if (endDate) {
    return {
      kind: 'until',
      text: '045498f1.e130f1',
      i18n: i18nText('045498f1.e130f1', { date: endDate }),
    }
  }

  if (beginDate) {
    return {
      kind: 'from',
      text: '045498f1.743f70',
      i18n: i18nText('045498f1.743f70', { date: beginDate }),
    }
  }

  return {
    kind: 'longTerm',
    text: '045498f1.1c5029',
    i18n: i18nText('045498f1.1c5029'),
  }
}

function resolveRuleText(item: any, minFee: number, cardType: CouponCardType): ResolvedText {
  const applyScope = normalizeScopeCopy(String(item.apply_scope ?? '').trim(), minFee)
  if (applyScope.text) return applyScope

  const useCondition = normalizeScopeCopy(String(item.use_condition ?? '').trim(), minFee)
  if (useCondition.text) return useCondition

  const description = normalizeScopeCopy(String(item.description ?? item.desc ?? '').trim(), minFee)
  if (description.text) return description

  const useBound = String(item.use_bound ?? '').trim()
  if (USE_BOUND_TEXT_MAP[useBound]) {
    const useBoundText = USE_BOUND_TEXT_MAP[useBound]
    return minFee <= 0
      ? resolvedText('045498f1.ee701d', i18nText('045498f1.ee701d'))
      : resolvedText(useBoundText.key, useBoundText)
  }

  if (cardType === 'gift' && minFee > 0) {
    return resolvedText(
      '045498f1.72206b',
      i18nText('045498f1.72206b', { amount: formatNumber(minFee) })
    )
  }

  if (minFee > 0) {
    return resolvedText(
      '045498f1.2f0fb2',
      i18nText('045498f1.2f0fb2', { amount: formatNumber(minFee) })
    )
  }

  return resolvedText('045498f1.ee701d', i18nText('045498f1.ee701d'))
}

function resolveTitle(
  item: any,
  cardType: CouponCardType,
  amount: number,
  minFee: number
): ResolvedText {
  const title = String(item.title || item.name || '').trim()
  if (title) return resolvedText(title)

  if (cardType === 'discount') {
    const discount = resolveDiscountDisplayValue(item)
    return resolvedText('045498f1.208636', i18nText('045498f1.208636', { discount }))
  }

  if (cardType === 'gift') {
    return resolvedText('045498f1.8bc752', i18nText('045498f1.8bc752'))
  }

  if (minFee > 0) {
    return resolvedText(
      '045498f1.434d80',
      i18nText('045498f1.434d80', {
        minFee: formatNumber(minFee),
        amount: formatNumber(amount),
      })
    )
  }

  return resolvedText(
    '045498f1.49b81f',
    i18nText('045498f1.49b81f', { amount: formatNumber(amount) })
  )
}

function resolveDiscountDisplayValue(item: any): string {
  const rawDiscount = Number(item.discount ?? item.coupon?.discount ?? 0)
  if (!Number.isFinite(rawDiscount) || rawDiscount <= 0) {
    return '0'
  }

  const discountValue =
    rawDiscount <= 1
      ? DiscountValueObject.fromDecimal(rawDiscount)
      : DiscountValueObject.of(rawDiscount)

  return formatNumber(Number(discountValue.displayChinese.replace(/折$/, '')))
}

function resolveDisplay(cardType: CouponCardType, item: any, amount: number) {
  if (cardType === 'discount') {
    return {
      displayValue: resolveDiscountDisplayValue(item),
      displayPrefix: '',
      displaySuffix: '045498f1.96c015',
      displaySuffixI18n: i18nText('045498f1.96c015'),
      typeLabel: '045498f1.9268f9',
      typeLabelI18n: i18nText('045498f1.9268f9'),
    }
  }

  if (cardType === 'gift') {
    return {
      displayValue: '045498f1.8bc752',
      displayValueI18n: i18nText('045498f1.8bc752'),
      displayPrefix: '',
      displaySuffix: '',
      typeLabel: '045498f1.8bc752',
      typeLabelI18n: i18nText('045498f1.8bc752'),
    }
  }

  return {
    displayValue: formatNumber(amount),
    displayPrefix: '¥',
    displaySuffix: '',
    typeLabel: '045498f1.f23195',
    typeLabelI18n: i18nText('045498f1.f23195'),
  }
}

function resolveUsable(item: any): boolean {
  if (item.status !== undefined && item.status !== null && String(item.status) !== '') {
    return String(item.status) === '1'
  }

  if (item.valid !== undefined && item.valid !== null && String(item.valid) !== '') {
    return String(item.valid) === 'true' || item.valid === true
  }

  return true
}

export class CouponDisplayTransformer {
  static toCouponModel(item: any): ICouponModel {
    const cardType = normalizeCardType(item.card_type || item.coupon?.card_type)
    const amount = parseMoneyFromCent(
      item.reduce_cost ?? item.discount ?? item.amount ?? item.deduct_money ?? item.price
    )
    const minFee = parseMoneyFromCent(item.least_cost ?? item.min_fee ?? item.min_charge)
    const usageTime = resolveUsageTimeText(item)
    const ruleText = resolveRuleText(item, minFee, cardType)
    const title = resolveTitle(item, cardType, amount, minFee)
    const display = resolveDisplay(cardType, item, amount)

    return {
      id: String(item.id || item.card_id || ''),
      couponCode: String(item.coupon_code || item.code || item.card_code || ''),
      code: String(item.code || item.coupon_code || item.card_code || ''),
      cardType,
      typeLabel: display.typeLabel,
      typeLabelI18n: display.typeLabelI18n,
      title: title.text,
      titleI18n: title.i18n,
      displayValue: display.displayValue,
      displayValueI18n: display.displayValueI18n,
      displayPrefix: display.displayPrefix,
      displaySuffix: display.displaySuffix,
      displaySuffixI18n: display.displaySuffixI18n,
      amount,
      minFee,
      usageTimeText: usageTime.text,
      usageTimeKind: usageTime.kind,
      usageTimeI18n: usageTime.i18n,
      ruleText: ruleText.text,
      ruleTextI18n: ruleText.i18n,
      usable: resolveUsable(item),
    }
  }
}
