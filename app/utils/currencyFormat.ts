const DEFAULT_CURRENCY_SYMBOL = '¥'

let currencySymbol = DEFAULT_CURRENCY_SYMBOL

export function resetCurrencySymbol(): void {
  currencySymbol = DEFAULT_CURRENCY_SYMBOL
}

export function setCurrencySymbol(symbol: string): void {
  currencySymbol = symbol?.trim() || DEFAULT_CURRENCY_SYMBOL
}

export function getCurrencySymbol(): string {
  return currencySymbol
}

export function resolveCurrencySymbolFromSetting(
  currency?: { symbol?: string } | null
): string {
  const symbol = currency?.symbol?.trim()
  return symbol || DEFAULT_CURRENCY_SYMBOL
}

export function applyCurrencyFromSetting(setting?: { currency?: { symbol?: string } } | null): string {
  const symbol = resolveCurrencySymbolFromSetting(setting?.currency)
  setCurrencySymbol(symbol)
  return symbol
}

function formatWithThousandsSeparator(amount: number): string {
  const fixed = amount.toFixed(2)
  const [integerPart, decimalPart] = fixed.split('.')
  const formattedInteger = (integerPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${formattedInteger}.${decimalPart || '00'}`
}

/** 格式化为带符号的金额（单位：元） */
export function formatMoneyYuan(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  return `${getCurrencySymbol()}${formatWithThousandsSeparator(safeAmount)}`
}

/** 格式化为带符号的金额（单位：分） */
export function formatMoneyFen(fen: number): string {
  return formatMoneyYuan(Number(fen || 0) / 100)
}

/** 解析订单页金额字符串（已为元，可能含千分位） */
export function parseOrderAmount(value: string | number): number {
  if (typeof value === 'number') return value
  return parseFloat(String(value).replace(/,/g, '')) || 0
}

/** 格式化订单页金额展示（单位：元，支持字符串） */
export function formatOrderAmountDisplay(value: string | number): string {
  return formatMoneyYuan(parseOrderAmount(value))
}
