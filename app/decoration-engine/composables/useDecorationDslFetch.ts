import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { isDecorationPreviewActiveOnRoute } from '~/decoration-engine/composables/useDecorationRouteContext'
import {
  normalizeDecorationDSL,
  type DecorationDSL,
  type PageType,
} from '~/decoration-engine/types/decoration'
import { getApiCountryCodeByLocale } from '~/shared/localeConfig'

export interface UseDecorationDslFetchOptions {
  pageType: PageType
  pageId?: MaybeRefOrGetter<string>
}

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value
  }

  const text = value.trim()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return value
  }
}

function pickDslCandidate(value: unknown): unknown {
  const parsed = parseJsonValue(value)

  if (Array.isArray(parsed)) {
    const preferred = parsed.find(
      (item) => item && typeof item === 'object' && 'dsl' in (item as Record<string, unknown>)
    )
    return preferred ?? parsed[0] ?? null
  }

  if (parsed && typeof parsed === 'object' && 'dsl' in (parsed as Record<string, unknown>)) {
    return (parsed as Record<string, unknown>).dsl
  }

  return parsed
}

function normalizeRowDsl(
  value: unknown,
  fallbackPageType: PageType,
  fallbackPageId: string
): DecorationDSL | null {
  const row = value as Record<string, unknown> | null
  const candidate = pickDslCandidate(row?.config)
  const normalized = normalizeDecorationDSL(candidate, null)
  if (normalized) {
    return normalized
  }

  if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
    const record = candidate as Record<string, unknown>
    if (record.sections && Array.isArray(record.order)) {
      return normalizeDecorationDSL(
        {
          pageType:
            typeof record.pageType === 'string' ? (record.pageType as PageType) : fallbackPageType,
          pageId: typeof record.pageId === 'string' ? record.pageId : fallbackPageId,
          sections: record.sections as DecorationDSL['sections'],
          order: record.order as string[],
        },
        null
      )
    }
  }

  return null
}

export async function useDecorationDslFetch(options: UseDecorationDslFetchOptions) {
  const route = useRoute()
  const nuxtApp = useNuxtApp()
  const { locale } = useI18n()
  const pageType = computed(() => options.pageType)
  const pageId = computed(() => toValue(options.pageId) ?? pageType.value)
  const countryCode = computed(() => getApiCountryCodeByLocale(locale.value))
  const shouldFetch = computed(() => !isDecorationPreviewActiveOnRoute(route))

  const cacheKey = computed(
    () => `decoration-dsl-${countryCode.value}-${pageType.value}-${pageId.value}`
  )

  const { data: dsl } = await useAsyncData(
    () => cacheKey.value,
    async () => {
      if (!shouldFetch.value) {
        return null
      }

      const response = await nuxtApp.$api('/wxapp/pctemplate/getTemplateContent', {
        method: 'GET',
        skipAuth: true,
        query: {
          page_type: pageType.value,
          country_code: countryCode.value,
          ...(pageType.value === 'custom' ? { page_id: pageId.value } : {}),
        },
      })

      return normalizeRowDsl(response, pageType.value, pageId.value)
    },
    {
      watch: [pageType, pageId, shouldFetch, countryCode],
      default: () => null,
    }
  )

  return { dsl, pageId, pageType }
}
