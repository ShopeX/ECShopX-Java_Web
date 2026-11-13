import { useDistributorStore } from '~/stores/distributor'

function normalizeDistributorId(value?: string | number | null): string {
  const normalized = Number(value ?? 0)
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return '0'
  }
  return String(normalized)
}

function isB2cMode(): boolean {
  try {
    const mode = useRuntimeConfig().public.businessMode || 'b2c'
    return (mode === 'b2b' ? 'bbc' : mode) === 'b2c'
  } catch {
    return true
  }
}

/**
 * 解析请求用 distributor_id：
 * - 优先使用传入的有效店铺 ID（>0）
 * - B2C：否则回退默认线上门店
 * - BBC：不回退默认店（传店铺 ID 会导致数据异常），未指定时返回 '0'
 * - 调用方 / HTTP 层应避免把 0 发出去
 */
export function resolveDistributorId(value?: string | number | null): string {
  const preferred = normalizeDistributorId(value)
  if (preferred !== '0') {
    return preferred
  }

  if (!isB2cMode()) {
    return '0'
  }

  return normalizeDistributorId(useDistributorStore().distributorId)
}

export function resolveDistributorIdNumber(value?: string | number | null): number {
  return Number(resolveDistributorId(value)) || 0
}
