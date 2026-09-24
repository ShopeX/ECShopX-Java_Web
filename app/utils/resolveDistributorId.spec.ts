import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDistributorStore } from '~/stores/distributor'
import { resolveDistributorId } from './resolveDistributorId'

vi.mock('~/composables/useTemplate', () => ({
  getBusinessMode: vi.fn(() => 'b2c'),
}))

describe('resolveDistributorId', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('uses preferred distributor id when provided', () => {
    expect(resolveDistributorId(123)).toBe('123')
  })

  it('falls back to default store id in b2c mode', () => {
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
})
