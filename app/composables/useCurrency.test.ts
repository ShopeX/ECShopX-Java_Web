import { describe, expect, it, beforeEach } from 'vitest'
import {
  applyCurrencyFromSetting,
  getCurrencySymbol,
  resetCurrencySymbol,
  resolveCurrencySymbolFromSetting,
} from '~/utils/currencyFormat'

describe('useCurrency setting resolution', () => {
  beforeEach(() => {
    resetCurrencySymbol()
  })

  it('registers backend USD symbol', () => {
    applyCurrencyFromSetting({
      currency: {
        id: '1',
        company_id: '5',
        currency: 'USD',
        title: 'US Dollar',
        symbol: '$',
        rate: 1,
        is_default: true,
      },
    })

    expect(getCurrencySymbol()).toBe('$')
    expect(resolveCurrencySymbolFromSetting({ symbol: '$' })).toBe('$')
  })

  it('falls back to default symbol when setting is missing', () => {
    applyCurrencyFromSetting({})
    expect(getCurrencySymbol()).toBe('¥')
    expect(resolveCurrencySymbolFromSetting(undefined)).toBe('¥')
  })
})
