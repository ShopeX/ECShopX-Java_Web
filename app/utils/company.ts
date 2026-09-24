import { useRequestEvent, useRuntimeConfig } from '#imports'

/**
 * 从 host 解析 company_id（纯函数，便于单测）。
 * 仅适配 PC web 端 `s` 开头子域：s<digits>.<domain> -> <digits>。
 * 未命中返回 fallback。
 */
export function parseCompanyIdFromHost(
  host: string | undefined | null,
  fallback?: string
): string | undefined {
  if (!host) return fallback
  const hostname = host.toLowerCase().split(':')[0] || ''
  const match = /^s(\d+)\./.exec(hostname)
  return match ? match[1] : fallback
}

/** 同构获取当前访问 host：SSR 取请求头，CSR 取 window。 */
function getCurrentHost(): string | undefined {
  if (import.meta.server) {
    try {
      const event = useRequestEvent()
      const headers = event?.node?.req?.headers
      return (headers?.['x-forwarded-host'] as string) || headers?.host
    } catch {
      return undefined
    }
  }
  return typeof window !== 'undefined' ? window.location.hostname : undefined
}

/** 运行期解析 company_id：域名优先，回退环境变量。 */
export function resolveCompanyId(): string | undefined {
  const config = useRuntimeConfig()
  return parseCompanyIdFromHost(getCurrentHost(), config.public.companyId as string | undefined)
}
