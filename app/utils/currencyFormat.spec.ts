import { describe, expect, it, beforeEach } from 'vitest'
import {
  applyCurrencyFromSetting,
  formatMoneyFen,
  formatMoneyYuan,
  formatOrderAmountDisplay,
  getCurrencySymbol,
  resetCurrencySymbol,
  resolveCurrencySymbolFromSetting,
  setCurrencySymbol,
} from './currencyFormat'

describe('currencyFormat', () => {
  beforeEach(() => {
    resetCurrencySymbol()
  })

  it('defaults to CNY symbol', () => {
    expect(getCurrencySymbol()).toBe('¥')
    expect(formatMoneyYuan(99.9)).toBe('¥99.90')
  })

  it('uses configured symbol for yuan and fen amounts', () => {
    setCurrencySymbol('$')
    expect(formatMoneyYuan(99.9)).toBe('$99.90')
    expect(formatMoneyFen(12345)).toBe('$123.45')
  })

  it('formats order amount strings with thousands separators', () => {
    setCurrencySymbol('$')
    expect(formatOrderAmountDisplay('1,234.50')).toBe('$1,234.50')
  })

  it('resolves symbol from backend setting and applies it', () => {
    const symbol = applyCurrencyFromSetting({
      currency: {
        symbol: '$',
      },
    })
    expect(symbol).toBe('$')
    expect(getCurrencySymbol()).toBe('$')
    expect(resolveCurrencySymbolFromSetting({ symbol: '$' })).toBe('$')
    expect(resolveCurrencySymbolFromSetting(undefined)).toBe('¥')
  })
})
