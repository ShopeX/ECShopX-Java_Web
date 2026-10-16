import type {
  IDefaultDistributor,
  IDistributorIsValidResponse,
} from '~/types/api/distributor'

function isValidDistributorFlag(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1'
  }
  return false
}

export class DistributorTransformer {
  static toDefaultDistributor(data: IDistributorIsValidResponse | null | undefined) {
    const distributorId = Number(data?.distributor_id ?? 0)
    if (!data || !Number.isFinite(distributorId) || distributorId <= 0) {
      return null
    }

    const distributor: IDefaultDistributor = {
      distributorId: String(distributorId),
      name: String(data.name || data.store_name || ''),
      storeName: String(data.store_name || data.name || ''),
      logo: String(data.logo || ''),
      address: String(data.address || data.store_address || ''),
      phone: String(data.mobile || data.phone || ''),
      companyId: String(data.company_id ?? ''),
      isValid: isValidDistributorFlag(data.is_valid),
    }

    return distributor
  }
}
