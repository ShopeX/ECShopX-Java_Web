import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 请求配置扩展
export interface IRequestConfig extends AxiosRequestConfig {
  showError?: boolean // 是否显示错误提示
  skipAuth?: boolean // 是否跳过认证
  skipCompanyId?: boolean // 是否跳过公司ID
}

// 响应数据结构
export interface IApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

// 错误响应
export interface IApiError {
  code: number
  msg: string
  data?: any
}

// 请求实例配置
export interface IRequestOptions {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

// 请求拦截器上下文
export interface IRequestContext {
  app: {
    $cookies: {
      get: (key: string) => string | undefined
      set: (key: string, value: string, options?: any) => void
      remove: (key: string) => void
    }
  }
  req?: {
    headers: Record<string, string>
  }
}
