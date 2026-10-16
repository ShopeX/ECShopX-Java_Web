import { describe, expect, it } from 'vitest'
import {
  getApiCountryCodeByLocale,
  NON_DEFAULT_LOCALE_CODES,
  normalizeLocaleCode,
} from './localeConfig'

describe('localeConfig zhtw/ja/ru support', () => {
  it('maps zhtw locale to zh-TW api country code', () => {
    expect(getApiCountryCodeByLocale('zhtw')).toBe('zh-TW')
    expect(getApiCountryCodeByLocale('ZHTW')).toBe('zh-TW')
  })

  it('maps ja/ru locales to ja-JP/ru-RU api country codes', () => {
    expect(getApiCountryCodeByLocale('ja')).toBe('ja-JP')
    expect(getApiCountryCodeByLocale('ru')).toBe('ru-RU')
  })

  it('includes zhtw/ja/ru in non-default locale codes', () => {
    expect(NON_DEFAULT_LOCALE_CODES).toContain('zhtw')
    expect(NON_DEFAULT_LOCALE_CODES).toContain('ja')
    expect(NON_DEFAULT_LOCALE_CODES).toContain('ru')
  })

  it('normalizes exact zhtw codes without stripping as a region tag', () => {
    expect(normalizeLocaleCode('zhtw')).toBe('zhtw')
  })

  it('keeps existing locale mappings', () => {
    expect(getApiCountryCodeByLocale('zh')).toBe('zh-CN')
    expect(getApiCountryCodeByLocale('en')).toBe('en-CN')
    expect(getApiCountryCodeByLocale('ar')).toBe('ar-SA')
  })
})
