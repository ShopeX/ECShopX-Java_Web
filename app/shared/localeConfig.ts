export const DEFAULT_LOCALE_CODE = 'zh'

export const LOCALE_DEFINITIONS = [
  {
    code: 'en',
    file: 'en-US.json',
    name: 'English',
    apiCountryCode: 'en-CN',
  },
  {
    code: 'zh',
    file: 'zh-CN.json',
    name: '简体中文',
    apiCountryCode: 'zh-CN',
  },
  {
    code: 'ar',
    file: 'ar.json',
    name: 'العربية',
    apiCountryCode: 'ar-SA',
  },
  {
    code: 'zhtw',
    file: 'zh-TW.json',
    name: '繁體中文',
    language: 'zh-TW',
    apiCountryCode: 'zh-TW',
  },
  {
    code: 'ja',
    file: 'ja-JP.json',
    name: '日本語',
    language: 'ja-JP',
    apiCountryCode: 'ja-JP',
  },
  {
    code: 'ru',
    file: 'ru-RU.json',
    name: 'Русский',
    language: 'ru-RU',
    apiCountryCode: 'ru-RU',
  },
] as const

export type AppLocaleDefinition = (typeof LOCALE_DEFINITIONS)[number]
export type AppLocaleCode = AppLocaleDefinition['code']

const localeDefinitionMap = new Map(
  LOCALE_DEFINITIONS.map(
    (locale) => [locale.code, locale] satisfies [AppLocaleCode, AppLocaleDefinition]
  )
)

export const NON_DEFAULT_LOCALE_CODES = LOCALE_DEFINITIONS.filter(
  (locale) => locale.code !== DEFAULT_LOCALE_CODE
).map((locale) => locale.code)

export function normalizeLocaleCode(locale?: string | null): string | undefined {
  if (!locale) return undefined

  const normalizedLocale = locale.trim().toLowerCase()
  if (!normalizedLocale) return undefined

  // Prefer exact locale codes such as `zhtw` before stripping region tags.
  if (localeDefinitionMap.has(normalizedLocale as AppLocaleCode)) {
    return normalizedLocale
  }

  return normalizedLocale.split('-')[0]
}

export function getApiCountryCodeByLocale(locale?: string | null): string {
  const normalizedLocale = normalizeLocaleCode(locale)

  if (normalizedLocale) {
    const matchedLocale = localeDefinitionMap.get(normalizedLocale as AppLocaleCode)
    if (matchedLocale) {
      return matchedLocale.apiCountryCode
    }
  }

  return localeDefinitionMap.get(DEFAULT_LOCALE_CODE)!.apiCountryCode
}
