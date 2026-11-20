/**
 * 站点语言配置（PC Web / ECX-10024）
 * Front API：GET /wxapp/setting/language
 */
import {
  DEFAULT_LOCALE_CODE,
  LOCALE_DEFINITIONS,
  type AppLocaleCode,
  type AppLocaleDefinition,
} from '~/shared/localeConfig'
import { getPathLocale, isSupportedLocale, stripLocalePrefix, withLocalePrefix } from '~/utils/localeRoute'
import {
  clearPreferredLocale,
  getPreferredLocale,
  setPreferredLocale,
} from '~/utils/localePreference'
import { commonApiClient } from '~/infrastructure/http/clients/CommonApiClient'

const CACHE_KEY = 'ecx_web_site_language_setting'
const CACHE_TTL_MS = 60 * 1000

const API_CODE_TO_LOCALE: Record<string, AppLocaleCode> = {
  'zh-CN': 'zh',
  'zh-cn': 'zh',
  zh: 'zh',
  zhcn: 'zh',
  'zh-TW': 'zhtw',
  'zh-tw': 'zhtw',
  zhtw: 'zhtw',
  'en-CN': 'en',
  'en-US': 'en',
  'en-us': 'en',
  en: 'en',
  'ar-SA': 'ar',
  'ar-sa': 'ar',
  ar: 'ar',
  'ja-JP': 'ja',
  'ja-jp': 'ja',
  ja: 'ja',
  'ru-RU': 'ru',
  'ru-ru': 'ru',
  ru: 'ru',
}

export type SiteLanguageItem = {
  code: string
  locale: AppLocaleCode
  name: string
  sort: number
}

export type SiteLanguageSetting = {
  defaultLanguage: AppLocaleCode
  enabledLanguages: SiteLanguageItem[]
  updatedAt?: number
}

function mapApiCodeToLocale(code?: string | null): AppLocaleCode | '' {
  const raw = String(code || '').trim()
  if (!raw) return ''
  if (API_CODE_TO_LOCALE[raw]) return API_CODE_TO_LOCALE[raw]
  const lower = raw.toLowerCase()
  if (API_CODE_TO_LOCALE[lower]) return API_CODE_TO_LOCALE[lower]
  if (isSupportedLocale(raw)) return raw
  return ''
}

function localeDefinition(locale: AppLocaleCode): AppLocaleDefinition {
  return (
    LOCALE_DEFINITIONS.find((item) => item.code === locale) ||
    LOCALE_DEFINITIONS.find((item) => item.code === DEFAULT_LOCALE_CODE)!
  )
}

function pickPayload(raw: any): Record<string, any> {
  if (!raw || typeof raw !== 'object') return {}
  if (raw.defaultLanguage !== undefined || raw.enabledLanguages || raw.enabled_languages) {
    return raw
  }
  if (raw.data && typeof raw.data === 'object') return pickPayload(raw.data)
  return raw
}

export function normalizeSiteLanguageSetting(raw: any): SiteLanguageSetting {
  const payload = pickPayload(raw)
  const enabledRaw = payload.enabledLanguages || payload.enabled_languages || []
  const enabledLanguages = (Array.isArray(enabledRaw) ? enabledRaw : [])
    .map((item: any, index: number) => {
      const code = String(item?.code || item?.id || item?.language || '')
      const locale = mapApiCodeToLocale(code)
      if (!locale) return null
      const def = localeDefinition(locale)
      return {
        code,
        locale,
        name: item?.name || def.name,
        sort: Number(item?.sort) || index + 1,
      } as SiteLanguageItem
    })
    .filter(Boolean)
    .sort((a: SiteLanguageItem, b: SiteLanguageItem) => a.sort - b.sort) as SiteLanguageItem[]

  const fallbackEnabled: SiteLanguageItem[] =
    enabledLanguages.length > 0
      ? enabledLanguages
      : [
          {
            code: 'zh-CN',
            locale: DEFAULT_LOCALE_CODE,
            name: localeDefinition(DEFAULT_LOCALE_CODE).name,
            sort: 1,
          },
        ]

  const defaultLocale =
    mapApiCodeToLocale(payload.defaultLanguage || payload.default_language) ||
    fallbackEnabled[0].locale

  const defaultInEnabled = fallbackEnabled.some((el) => el.locale === defaultLocale)
    ? defaultLocale
    : fallbackEnabled[0].locale

  return {
    defaultLanguage: defaultInEnabled,
    enabledLanguages: fallbackEnabled,
    updatedAt: payload.updatedAt ?? payload.updated_at,
  }
}

function readCache(): SiteLanguageSetting | null {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.normalized || !parsed?.ts) return null
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null
    return parsed.normalized as SiteLanguageSetting
  } catch {
    return null
  }
}

function writeCache(normalized: SiteLanguageSetting) {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), normalized }))
  } catch {
    // ignore
  }
}

export function clearSiteLanguageSettingCache() {
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}

export async function fetchSiteLanguageSetting(options?: {
  force?: boolean
}): Promise<SiteLanguageSetting> {
  const force = Boolean(options?.force)
  if (!force) {
    const cached = readCache()
    if (cached) return cached
  }

  try {
    const res = await commonApiClient.getLanguageSetting()
    const normalized = normalizeSiteLanguageSetting(res)
    writeCache(normalized)
    return normalized
  } catch (err) {
    console.warn('[site-language-setting] fetch failed', err)
    const cached = readCache()
    if (cached) return cached
    return normalizeSiteLanguageSetting(null)
  }
}

export function getEnabledLocales(setting?: SiteLanguageSetting | null) {
  const normalized = setting || normalizeSiteLanguageSetting(null)
  return normalized.enabledLanguages.map((item) => ({
    code: item.locale,
    name: item.name,
  }))
}

export function resolveActiveLocale(
  setting?: SiteLanguageSetting | null,
  preferred?: AppLocaleCode | null
): AppLocaleCode {
  const normalized = setting || normalizeSiteLanguageSetting(null)
  const enabled = normalized.enabledLanguages.map((el) => el.locale)
  const pref = preferred === undefined ? (import.meta.client ? getPreferredLocale() : null) : preferred

  if (pref && enabled.includes(pref)) return pref

  if (pref && !enabled.includes(pref) && import.meta.client) {
    clearPreferredLocale()
  }

  return enabled.includes(normalized.defaultLanguage)
    ? normalized.defaultLanguage
    : enabled[0] || DEFAULT_LOCALE_CODE
}

/**
 * 无个人偏好时，将路由对齐到站点默认语言
 */
export async function alignRouteToSiteDefault(setting?: SiteLanguageSetting | null) {
  if (!import.meta.client) return
  const normalized = setting || (await fetchSiteLanguageSetting())
  const preferred = getPreferredLocale()
  if (preferred) {
    // 偏好已关闭时清掉并回落
    const enabled = normalized.enabledLanguages.map((el) => el.locale)
    if (!enabled.includes(preferred)) {
      clearPreferredLocale()
    } else {
      return
    }
  }

  const next = resolveActiveLocale(normalized, null)
  const route = useRoute()
  const currentPathLocale = getPathLocale(route.fullPath || route.path)
  if (next === currentPathLocale) return

  const targetPath = withLocalePrefix(stripLocalePrefix(route.fullPath || route.path), next)
  if (targetPath === route.path || targetPath === route.fullPath) return

  await navigateTo(
    {
      path: targetPath,
      query: route.query,
      hash: route.hash,
    },
    { replace: true }
  )
}

export function markUserPreferredLocale(locale: AppLocaleCode) {
  setPreferredLocale(locale)
}
