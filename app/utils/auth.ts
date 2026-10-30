import { useRuntimeConfig } from '#imports'
import { resolveCompanyId } from '~/utils/company'

/**
 * API 响应数据接口
 */
export interface IApiResponse<T = any> {
  status_code: number
  data: T
  message?: string
}

/**
 * 获取认证头信息
 */
export function getAuthHeaders(): Record<string, string> {
  // 这里可以添加token等认证信息
  // const token = useCookie('token').value
  // if (token) {
  //   return { Authorization: `Bearer ${token}` }
  // }
  return {}
}

/**
 * 获取公司ID
 */
export function getCompanyId(): string | undefined {
  return resolveCompanyId()
}

/**
 * 获取基础URL
 */
export function getBaseURL(): string {
  const config = useRuntimeConfig()
  return config.public.apiBase || '/api'
}

/**
 * 处理API响应
 */
export function handleResponse<T>(response: IApiResponse<T>): T {
  if (!response) {
    throw new Error('edda4090.25ecc5')
  }

  if (response.status_code === undefined) {
    console.warn('响应数据格式不正确:', response)
    return response as any
  }

  if (response.status_code === 200) {
    return response.data
  }

  throw new Error(response.message || 'edda4090.f50bf4')
}
