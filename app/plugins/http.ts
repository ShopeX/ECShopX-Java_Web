import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig, navigateTo } from 'nuxt/app'
import type { ApiResponse, HttpError } from '~/types/http'
import { ContentType, ErrorType } from '~/types/http'
import { useUserStore } from '~/stores/user'
import { getApiCountryCodeByLocale } from '~/shared/localeConfig'
import { resolveCompanyId } from '~/utils/company'
import { resolveDistributorId } from '~/utils/resolveDistributorId'
import { parseFormBody, stringifyFormBody } from '~/utils/formUrlencoded'

export default defineNuxtPlugin({
  name: 'http',
  setup() {
    const config = useRuntimeConfig()
    const companyId = resolveCompanyId()
    const nuxtApp = useNuxtApp()
    const userStore = useUserStore()
    const t = (key: string) => (nuxtApp.$i18n as any)?.t?.(key) || key
    const countryCodeCookie = useCookie<string>('i18n_redirected')
    const localePath = useLocalePath()

    /** 全局参数 country_code：按当前 locale 映射接口值，未命中时回退默认值 */
    const getCountryCode = (): string => {
      const currentLocale = (nuxtApp.$i18n as any)?.locale?.value || countryCodeCookie.value
      const countryCode = getApiCountryCodeByLocale(currentLocale)
      return countryCode || (config.public.defaultCountryCode as string) || 'zh-CN'
    }

    /**
     * 全局参数 distributor_id（仅 B2C 自动注入）：
     * - BBC 传店铺 ID 易导致数据异常，默认不注入
     * - B2C：优先路由 shopid，否则默认线上门店；已有有效 ID（>0）不覆盖
     * - 未就绪时不注入 0；可用 skipDistributorId 跳过
     */
    const isB2cMode = (): boolean => {
      const mode = (config.public.businessMode as string) || 'b2c'
      return (mode === 'b2b' ? 'bbc' : mode) === 'b2c'
    }

    const getRequestDistributorId = (): string => {
      try {
        const route = useRoute()
        return resolveDistributorId(route.query?.shopid as string | undefined)
      } catch {
        return resolveDistributorId()
      }
    }

    const readDistributorId = (source: Record<string, any> | FormData): string | null => {
      if (source instanceof FormData) {
        if (!source.has('distributor_id')) return null
        return String(source.get('distributor_id') ?? '')
      }
      if (source.distributor_id == null || source.distributor_id === '') return null
      return String(source.distributor_id)
    }

    const hasRealDistributorId = (source: Record<string, any> | FormData): boolean => {
      const current = readDistributorId(source)
      return current != null && Number(current) > 0
    }

    const applyDistributorId = (
      source: Record<string, any> | FormData,
      skipDistributorId?: boolean
    ) => {
      if (skipDistributorId || !isB2cMode() || hasRealDistributorId(source)) {
        return
      }

      const distributorId = getRequestDistributorId()
      // 默认店未就绪时不要发 0，等 store 就绪后再由后续请求带上真实 ID
      if (distributorId === '0') {
        return
      }

      if (source instanceof FormData) {
        if (source.has('distributor_id')) {
          source.delete('distributor_id')
        }
        source.append('distributor_id', distributorId)
        return
      }

      source.distributor_id = distributorId
    }

    /** 对齐 vshop intereptorReq：合并 company_id / country_code / distributor_id */
    const injectGlobalRequestParams = (
      target: Record<string, any>,
      skipCompanyId?: boolean,
      skipCountryCode?: boolean,
      skipDistributorId?: boolean
    ) => {
      if (!skipCompanyId && companyId) {
        target.company_id = companyId
      }
      if (!skipCountryCode && !target.country_code) {
        target.country_code = getCountryCode()
      }
      applyDistributorId(target, skipDistributorId)
    }

    // ============ 辅助函数 ============

    /**
     * 判断是否为业务成功响应
     */
    const isBusinessSuccess = (data: any): boolean => {
      if (!data || typeof data !== 'object' || 'status_code' in data) {
        return false
      }
      return true
    }

    /**
     * 创建业务错误
     */
    const createBusinessError = (response: ApiResponse): HttpError => {
      const error = new Error(response.message || t('f0f85a55.186e5b')) as HttpError
      error.type = ErrorType.BUSINESS_ERROR
      error.code = response.status_code
      error.details = response
      error.retry = false
      return error
    }

    /**
     * 创建 HTTP 错误
     */
    const createHttpError = (
      message: string,
      type: ErrorType,
      status?: number,
      details?: any
    ): HttpError => {
      const error = new Error(message) as HttpError
      error.type = type
      error.status = status
      error.details = details
      // 可重试的HTTP状态码
      error.retry = [408, 429, 500, 502, 503, 504].includes(status || 0)
      return error
    }

    /**
     * 根据状态码获取错误类型
     */
    const getErrorType = (status: number): ErrorType => {
      if (status === 401) return ErrorType.AUTH_ERROR
      if (status === 403) return ErrorType.PERMISSION_ERROR
      if (status === 422) return ErrorType.VALIDATION_ERROR
      if (status >= 500) return ErrorType.SERVER_ERROR
      return ErrorType.HTTP_ERROR
    }

    const normalizeRequestMethod = (method?: string) => (method || 'GET').toUpperCase()

    const getRequestHeader = (headers: HeadersInit | undefined, name: string): string | undefined => {
      if (!headers) return undefined
      const lower = name.toLowerCase()
      if (headers instanceof Headers) {
        return headers.get(name) ?? headers.get(lower) ?? undefined
      }
      if (Array.isArray(headers)) {
        const found = headers.find(([key]) => key.toLowerCase() === lower)
        return found?.[1]
      }
      for (const [key, value] of Object.entries(headers as Record<string, string>)) {
        if (key.toLowerCase() === lower) return value
      }
      return undefined
    }

    /** 与 vshop req.js 一致：调用方已设置 Content-Type 时不覆盖 */
    const setDefaultRequestHeader = (options: { headers?: HeadersInit }, name: string, value: string) => {
      if (getRequestHeader(options.headers, name)) return
      const headers = options.headers
      if (headers instanceof Headers) {
        headers.set(name, value)
        return
      }
      if (Array.isArray(headers)) {
        options.headers = [...headers, [name, value]]
        return
      }
      options.headers = { ...(headers as Record<string, string> | undefined), [name]: value }
    }

    /**
     * 非 GET 默认 form-urlencoded；useJson 为 JSON；FormData/Blob 不改动（multipart 等）
     */
    const applyDefaultContentType = (fetchOptions: {
      method?: string
      body?: unknown
      headers?: HeadersInit
      useJson?: boolean
    }) => {
      if (normalizeRequestMethod(fetchOptions.method) === 'GET') return

      const body = fetchOptions.body
      if (fetchOptions.useJson) {
        setDefaultRequestHeader(fetchOptions, 'Content-Type', ContentType.JSON)
        return
      }
      if (body instanceof FormData || body instanceof Blob) {
        return
      }
      setDefaultRequestHeader(fetchOptions, 'Content-Type', ContentType.FORM_URLENCODED)
    }

    /**
     * 显示错误消息（仅客户端）
     */
    const showErrorMessage = async (error: HttpError) => {
      // 只在客户端显示消息
      if (import.meta.server) return

      try {
        const { useToastMessage } = await import('~/composables/useToastMessage')
        const toast = useToastMessage()

        switch (error.type) {
          case ErrorType.AUTH_ERROR:
            toast.show(t('f0f85a55.d3ab82'))
            break
          case ErrorType.PERMISSION_ERROR:
            toast.show(t('f0f85a55.ac1548'))
            break
          case ErrorType.VALIDATION_ERROR:
            toast.show(t('f0f85a55.bb6cb4'))
            break
          case ErrorType.NETWORK_ERROR:
          case ErrorType.TIMEOUT_ERROR:
            toast.show(t('f0f85a55.7da5ea'))
            break
          case ErrorType.SERVER_ERROR:
            toast.show(t('f0f85a55.8c4910'))
            break
          case ErrorType.BUSINESS_ERROR:
            toast.show(error.message || t('f0f85a55.5fa802'))
            break
          default:
            toast.show(error.message || t('f0f85a55.f50bf4'))
        }
      } catch (err) {
        console.error('[Error Message] Failed to show error message:', err)
      }
    }

    // ============ 创建 $fetch 实例 ============

    const serverApiBase = (config.apiBaseInternal as string) || ''
    const publicApiBase = (config.public.apiBase as string) || '/api'
    const apiBase =
      import.meta.server && serverApiBase ? serverApiBase : publicApiBase

    const $api = $fetch.create({
      baseURL: apiBase,
      timeout: (config.public.apiTimeout as number) || 10000,

      // ✅ 自动重试配置（ofetch 内置）
      retry: 3,
      retryDelay: 1000,
      retryStatusCodes: [408, 429, 500, 502, 503, 504],

      onRequest({ options }) {
        // 添加认证头（从 Store 中获取 token）
        if (!(options as any).skipAuth) {
          const token = userStore.token
          if (token) {
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${token}`,
            } as any
          }
        }

        // 对齐 vshop req.js intereptorReq：GET → query；非 GET → 默认 form + qs.stringify
        const reqOptions = options as any
        const methodIsGet = normalizeRequestMethod(options.method) === 'GET'
        const useJson = !!reqOptions.useJson
        const { skipCompanyId, skipCountryCode, skipDistributorId } = reqOptions

        if (options.body instanceof FormData) {
          if (!skipCompanyId && companyId && !options.body.has('company_id')) {
            options.body.append('company_id', companyId)
          }
          if (!skipCountryCode && !options.body.has('country_code')) {
            options.body.append('country_code', getCountryCode())
          }
          applyDistributorId(options.body, skipDistributorId)
        } else if (methodIsGet) {
          const query = { ...(options.query as Record<string, any>) }
          injectGlobalRequestParams(query, skipCompanyId, skipCountryCode, skipDistributorId)
          options.query = query
        } else if (options.body instanceof Blob) {
          // 二进制 body 仅补 Content-Type 策略
        } else if (useJson) {
          const bodyData = parseFormBody(options.body) as Record<string, any>
          injectGlobalRequestParams(bodyData, skipCompanyId, skipCountryCode, skipDistributorId)
          options.body = bodyData
        } else {
          const bodyData = parseFormBody(options.body) as Record<string, any>
          injectGlobalRequestParams(bodyData, skipCompanyId, skipCountryCode, skipDistributorId)
          options.body = stringifyFormBody(bodyData)
        }

        applyDefaultContentType(options as any)

        // 请求日志
        console.log(
          `[API Request] ${options.method || 'GET'} ${options.baseURL}${(options as any).url || ''}`
        )
      },

      async onResponse({ response, options }) {
        // 响应日志
        console.log(`[API Response] ${response.status} ${response.url}`)

        // 处理业务响应头
        const token = response.headers.get('X-Token')
        if (token) {
          useCookie('token').value = token
        }

        const refreshToken = response.headers.get('X-Refresh-Token')
        if (refreshToken) {
          useCookie('refresh-token').value = refreshToken
        }

        // 获取跳过错误码配置
        const skipErrorCodes = (options as any).skipErrorCodes || []

        // ✅ 业务状态码检查
        const data = response._data?.data
        if (data && typeof data === 'object') {
          // 检查是否包含业务错误状态码
          if ('status_code' in data && data.status_code !== undefined) {
            // 有 status_code 字段，检查是否为错误
            const statusCode = Number(data.status_code)
            if (statusCode >= 400) {
              // 特殊处理：业务 401 跳转登录页（仅客户端）
              if (statusCode === 401 && import.meta.client) {
                await navigateTo(localePath('/account/login'))
                return
              }

              // 业务错误：创建并抛出错误
              const error = createBusinessError({
                message: data.message || t('f0f85a55.f50bf4'),
                status_code: statusCode,
                data: data,
              } as ApiResponse)

              const shouldSkipToast = skipErrorCodes.includes(statusCode)
              if (!shouldSkipToast) {
                await showErrorMessage(error)
              }
              throw error
            }
          } else {
            // 没有 status_code，按原逻辑处理
            const apiResponse = data as ApiResponse
            if (!isBusinessSuccess(apiResponse)) {
              const error = createBusinessError(apiResponse)
              // 某些旧接口可能没有明确的状态码，这里无法精确 skip，除非 skipErrorCodes 包含特定标识
              await showErrorMessage(error)
              throw error
            }
          }
          // ✅ 业务成功：自动解包 data 字段
          response._data = data
        }
      },

      async onResponseError({ response, error, options }) {
        // 错误日志
        console.error(`[API Error] ${response?.status || 'Network'} ${response?.url || ''}`)

        // 创建标准错误对象
        let httpError: HttpError

        if (response) {
          // HTTP 响应错误（401, 403, 500 等）
          const errorType = getErrorType(response.status)
          // ✅ 优先从嵌套的 data.message 中提取，兼容多种响应格式
          const message =
            response._data?.data?.message ||
            response._data?.message ||
            response.statusText ||
            t('f0f85a55.f50bf4')

          httpError = createHttpError(message, errorType, response.status, response._data)

          // 特殊处理：401 跳转登录页（仅客户端）
          if (response.status === 401 && import.meta.client) {
            await navigateTo(localePath('/account/login'))
            return
          }
        } else if (error?.message?.includes('timeout')) {
          // 超时错误
          httpError = createHttpError(t('f0f85a55.9c3dc6'), ErrorType.TIMEOUT_ERROR)
        } else if (error?.message?.includes('fetch') || error?.message?.includes('Network')) {
          // 网络错误
          httpError = createHttpError(t('f0f85a55.7da5ea'), ErrorType.NETWORK_ERROR)
        } else {
          // 未知错误
          httpError = createHttpError(
            error?.message || t('f0f85a55.974e74'),
            ErrorType.UNKNOWN_ERROR
          )
        }

        // 检查是否需要跳过全局错误提示
        const skipErrorCodes = (options as any).skipErrorCodes || []
        const shouldSkipToast = response && skipErrorCodes.includes(response.status)

        if (!shouldSkipToast) {
          // 显示错误消息
          await showErrorMessage(httpError)
        }

        // 重新抛出标准错误对象
        throw httpError
      },
    })

    return {
      provide: {
        api: $api,
      },
    }
  },
})
