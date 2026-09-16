/**
 * 后台通用配置 API 类型
 */

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
