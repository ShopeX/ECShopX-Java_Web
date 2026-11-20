import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDistributorStore } from '~/stores/distributor'
import { resolveDistributorId } from './resolveDistributorId'

const runtimeConfig = vi.hoisted(() => ({
  public: { businessMode: 'b2c' as string },
}))

vi.stubGlobal('useRuntimeConfig', () => runtimeConfig)

describe('resolveDistributorId', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    runtimeConfig.public.businessMode = 'b2c'
  })

  it('uses preferred distributor id when provided', () => {
    expect(resolveDistributorId(123)).toBe('123')
  })

  it('falls back to default store id in B2C mode', () => {
    const store = useDistributorStore()
    store.defaultDistributor = {
      distributorId: '269',
      name: 'Java线上店',
      storeName: 'Java线上店',
      logo: '',
      address: '',
      phone: '',
      companyId: '38',
      isValid: true,
    }

    expect(resolveDistributorId(0)).toBe('269')
    expect(resolveDistributorId(undefined)).toBe('269')
  })

  it('does not fall back to default store in BBC mode', () => {
    runtimeConfig.public.businessMode = 'bbc'
    const store = useDistributorStore()
    store.defaultDistributor = {
      distributorId: '284',
      name: 'BBC店',
      storeName: 'BBC店',
      logo: '',
      address: '',
      phone: '',
      companyId: '141',
      isValid: true,
    }

    expect(resolveDistributorId(0)).toBe('0')
    expect(resolveDistributorId(undefined)).toBe('0')
    expect(resolveDistributorId(99)).toBe('99')
  })

  it('returns 0 only when preferred and default store are both unavailable', () => {
    expect(resolveDistributorId(undefined)).toBe('0')
  })
})
