export interface IDistributorIsValidResponse {
  distributor_id: number | string
  is_distributor?: boolean
  company_id?: number | string
  name?: string
  store_name?: string
  logo?: string
  address?: string
  store_address?: string
  mobile?: string
  phone?: string
  is_valid?: boolean | string
  [key: string]: unknown
}

export interface IDefaultDistributor {
  distributorId: string
  name: string
  storeName: string
  logo: string
  address: string
  phone: string
  companyId: string
  isValid: boolean
}
