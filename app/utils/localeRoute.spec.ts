import { describe, expect, it } from 'vitest'
import {
  getPathLocale,
  isSupportedLocale,
  stripLocalePrefix,
  withLocalePrefix,
} from './localeRoute'

describe('localeRoute', () => {
  it('parses default locale paths as zh', () => {
    expect(getPathLocale('/account/orders')).toBe('zh')
    expect(stripLocalePrefix('/account/orders')).toBe('/account/orders')
  })

  it('parses non-default locale paths without query or hash in the base path', () => {
    expect(getPathLocale('/en/account/orders/123?status=1#top')).toBe('en')
    expect(stripLocalePrefix('/en/account/orders/123?status=1#top')).toBe('/account/orders/123')
  })

  it('builds non-default locale paths from default paths', () => {
    expect(withLocalePrefix('/account/orders', 'en')).toBe('/en/account/orders')
    expect(withLocalePrefix('/account/orders', 'ar')).toBe('/ar/account/orders')
    expect(withLocalePrefix('/account/orders', 'zhtw')).toBe('/zhtw/account/orders')
    expect(withLocalePrefix('/account/orders', 'ja')).toBe('/ja/account/orders')
    expect(withLocalePrefix('/account/orders', 'ru')).toBe('/ru/account/orders')
  })

  it('parses zhtw locale paths and strips the prefix', () => {
    expect(getPathLocale('/zhtw/cart')).toBe('zhtw')
    expect(stripLocalePrefix('/zhtw/cart')).toBe('/cart')
    expect(isSupportedLocale('zhtw')).toBe(true)
  })

  it('parses ja/ru locale paths and strips the prefix', () => {
    expect(getPathLocale('/ja/cart')).toBe('ja')
    expect(getPathLocale('/ru/cart')).toBe('ru')
    expect(stripLocalePrefix('/ja/cart')).toBe('/cart')
    expect(stripLocalePrefix('/ru/cart')).toBe('/cart')
    expect(isSupportedLocale('ja')).toBe(true)
    expect(isSupportedLocale('ru')).toBe(true)
  })

  it('builds default locale paths from non-default base paths', () => {
    expect(withLocalePrefix('/account/orders', 'zh')).toBe('/account/orders')
  })

  it('preserves root path style for non-default locales', () => {
    expect(withLocalePrefix('/', 'en')).toBe('/en')
  })

  it('does not treat unsupported locale-like prefixes as supported locale prefixes', () => {
    expect(isSupportedLocale('fr')).toBe(false)
    expect(getPathLocale('/fr/account/orders')).toBe('zh')
    expect(stripLocalePrefix('/fr/account/orders')).toBe('/fr/account/orders')
  })

  it('preserves query and hash when building a corrected middleware target', () => {
    const targetPath = withLocalePrefix(stripLocalePrefix('/account/orders?status=paid#list'), 'en')

    expect(targetPath).toBe('/en/account/orders')
  })
})
