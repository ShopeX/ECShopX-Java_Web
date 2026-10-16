import { describe, expect, it } from 'vitest'
import { DistributorTransformer } from './distributorTransformer'

describe('DistributorTransformer', () => {
  it('treats numeric is_valid as valid', () => {
    const result = DistributorTransformer.toDefaultDistributor({
      distributor_id: 269,
      is_valid: 1,
    })

    expect(result?.isValid).toBe(true)
  })

  it('maps is_valid response to default distributor model', () => {
    const result = DistributorTransformer.toDefaultDistributor({
      distributor_id: 269,
      name: 'Java线上店',
      store_name: 'Java线上店',
      logo: 'https://example.com/logo.png',
      address: '新漕河泾国际商务中心',
      mobile: '13809090909',
      company_id: 38,
      is_valid: 'true',
    })

    expect(result).toEqual({
      distributorId: '269',
      name: 'Java线上店',
      storeName: 'Java线上店',
      logo: 'https://example.com/logo.png',
      address: '新漕河泾国际商务中心',
      phone: '13809090909',
      companyId: '38',
      isValid: true,
    })
  })
})
