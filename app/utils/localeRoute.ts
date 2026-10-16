import {
  DEFAULT_LOCALE_CODE,
  LOCALE_DEFINITIONS,
  NON_DEFAULT_LOCALE_CODES,
  type AppLocaleCode,
} from '../shared/localeConfig'

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const SUPPORTED_LOCALE_CODES = new Set<AppLocaleCode>(
  LOCALE_DEFINITIONS.map((locale) => locale.code)
)
const NON_DEFAULT_LOCALE_PREFIX_RE =
  NON_DEFAULT_LOCALE_CODES.length > 0
    ? new RegExp(`^/(${NON_DEFAULT_LOCALE_CODES.map(escapeRegex).join('|')})(?=/|$)`)
    : null

function getPathname(path: string): string {
  const queryIndex = path.indexOf('?')
  const hashIndex = path.indexOf('#')
  const endIndexes = [queryIndex, hashIndex].filter((index) => index >= 0)
  const pathname = endIndexes.length > 0 ? path.slice(0, Math.min(...endIndexes)) : path

  if (!pathname) return '/'
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

export function isSupportedLocale(locale: string): locale is AppLocaleCode {
  return SUPPORTED_LOCALE_CODES.has(locale as AppLocaleCode)
}

export function getPathLocale(path: string): AppLocaleCode {
  const pathname = getPathname(path)
  const locale = pathname.split('/')[1]

  return locale && isSupportedLocale(locale) ? locale : DEFAULT_LOCALE_CODE
}

export function stripLocalePrefix(path: string): string {
  if (!path) return path

  const pathname = getPathname(path)
  const normalizedPath = NON_DEFAULT_LOCALE_PREFIX_RE
    ? pathname.replace(NON_DEFAULT_LOCALE_PREFIX_RE, '')
    : pathname
  return normalizedPath || '/'
}

export function withLocalePrefix(path: string, locale: AppLocaleCode): string {
  const basePath = stripLocalePrefix(path)

  if (locale === DEFAULT_LOCALE_CODE) return basePath
  if (basePath === '/') return `/${locale}`

  return `/${locale}${basePath}`
}
