import { getBusinessMode } from '~/composables/useTemplate'
import { useDistributorStore } from '~/stores/distributor'

function normalizeDistributorId(value?: string | number | null): string {
  const normalized = Number(value ?? 0)
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return '0'
  }
  return String(normalized)
}

/**
 * 解析请求用 distributor_id：
 * - BBC：优先使用传入值，否则 0
 * - B2C：优先使用传入有效值，否则回退默认线上门店
 */
export function resolveDistributorId(value?: string | number | null): string {
  const preferred = normalizeDistributorId(value)
  if (preferred !== '0') {
    return preferred
  }

  if (getBusinessMode() === 'b2c') {
    return useDistributorStore().distributorId || '0'
  }

  return '0'
}

export function resolveDistributorIdNumber(value?: string | number | null): number {
  return Number(resolveDistributorId(value)) || 0
}
