import { computed } from 'vue'
import { aftersalesApiClient } from '~/infrastructure/http/clients/AftersalesApiClient'

export interface AftersalesReasonOption {
  label: string
  value: string
}

function normalizeReasonOption(raw: unknown): AftersalesReasonOption | null {
  if (typeof raw === 'string') {
    const value = raw.trim()
    return value ? { label: value, value } : null
  }

  if (!raw || typeof raw !== 'object') return null

  const record = raw as Record<string, unknown>
  const label =
    String(record.label ?? record.name ?? record.reason ?? record.text ?? record.value ?? '').trim()
  const value = String(record.value ?? record.reason ?? record.name ?? record.label ?? '').trim()

  if (!label || !value) return null

  return { label, value }
}

export function useAftersalesReasonOptions() {
  const reasonOptions = useState<AftersalesReasonOption[]>('aftersales-reason-options', () => [])
  const reasonOptionsLoaded = useState<boolean>('aftersales-reason-options-loaded', () => false)
  const loading = useState<boolean>('aftersales-reason-options-loading', () => false)

  async function loadReasonOptions(forceRefresh = false) {
    if (!forceRefresh && reasonOptionsLoaded.value && reasonOptions.value.length > 0) {
      return reasonOptions.value
    }

    if (loading.value) {
      return reasonOptions.value
    }

    loading.value = true

    try {
      const response = await aftersalesApiClient.getAftersalesReasonList()
      const payload = response?.data ?? response ?? []
      const normalized = (Array.isArray(payload) ? payload : [])
        .map((item) => normalizeReasonOption(item))
        .filter((item): item is AftersalesReasonOption => Boolean(item))

      reasonOptions.value = normalized
      reasonOptionsLoaded.value = true
      return reasonOptions.value
    } finally {
      loading.value = false
    }
  }

  return {
    reasonOptions: computed(() => reasonOptions.value),
    reasonOptionsLoaded: computed(() => reasonOptionsLoaded.value),
    loading: computed(() => loading.value),
    loadReasonOptions,
  }
}
