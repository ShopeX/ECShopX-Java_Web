/**
 * 后台通用配置 API 类型
 */

export interface PaginationParams {
  page?: string
  pageSize?: string
}

export interface PaginationResponse<T> {
  list: T[]
  total_count: number
}

export interface ICurrencySetting {
  id: string
  company_id: string
  currency: string
  title: string
  symbol: string
  rate: number
  is_default: boolean
  use_platform?: string
}

export interface IFrontendCommonSetting {
  currency?: ICurrencySetting
  [key: string]: unknown
}
