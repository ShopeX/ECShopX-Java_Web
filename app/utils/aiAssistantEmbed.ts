export interface AiAssistantPublicConfig {
  aiAssistant?: string | boolean | number
  aiBaseUrl?: string
  aiAssistantBackendUrl?: string
  aiEmbedPageUrl?: string
  aiTenantId?: string
}

export interface AiAssistantAuthPayload {
  type: 'ECSHOPX_AUTH'
  token: string
  companyId: string
  tenantId: string
  distributorId: string
  locale: string
}

interface PostMessageTarget {
  postMessage: (message: AiAssistantAuthPayload, targetOrigin: string) => void
}

interface RouteLike {
  name?: unknown
  path?: string
  params?: Record<string, unknown>
  query?: Record<string, unknown>
}

export function isAiAssistantEnabled(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true'
}

export function trimTrailingSlash(value: string): string {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '')
}

export function buildAiEmbedPageUrl(config: AiAssistantPublicConfig): string {
  const explicit = String(config.aiEmbedPageUrl || '').trim()
  if (explicit) {
    return /\.html(\?|$)/i.test(explicit) ? explicit : `${explicit.replace(/\/?$/, '/')}index.html`
  }

  const aiBase = trimTrailingSlash(String(config.aiBaseUrl || ''))
  if (aiBase) {
    return `${aiBase}/ai-assistant-embed/index.html`
  }

  return '/ai-assistant-embed/index.html'
}

export function isMobileWebUserAgent(userAgent: string | undefined | null): boolean {
  const ua = String(userAgent || '').toLowerCase()
  return /android|iphone|ipad|ipod|mobile|micromessenger/.test(ua)
}

export function resolveAiAssistantBackendUrl(config: AiAssistantPublicConfig): string {
  return (
    trimTrailingSlash(String(config.aiAssistantBackendUrl || '')) ||
    trimTrailingSlash(String(config.aiBaseUrl || ''))
  )
}

function firstRouteValue(value: unknown): string {
  const normalized = Array.isArray(value) ? value[0] : value
  return normalized == null ? '' : String(normalized).trim()
}

export function resolveDistributorIdFromRoute(route: RouteLike): string {
  const queryDistributor =
    firstRouteValue(route.query?.distributor_id) ||
    firstRouteValue(route.query?.distributorId) ||
    firstRouteValue(route.query?.dtid) ||
    firstRouteValue(route.query?.shop_id)

  if (queryDistributor) {
    return queryDistributor
  }

  if (String(route.path || '').startsWith('/shop/')) {
    return firstRouteValue(route.params?.id)
  }

  return ''
}

export function buildAiAssistantAuthPayload(input: {
  token?: string | null
  companyId?: string | null
  tenantId?: string | null
  distributorId?: string | null
  locale?: string | null
}): AiAssistantAuthPayload {
  return {
    type: 'ECSHOPX_AUTH',
    token: input.token ? String(input.token) : '',
    companyId: input.companyId ? String(input.companyId) : '',
    tenantId: input.tenantId ? String(input.tenantId) : '',
    distributorId: input.distributorId ? String(input.distributorId) : '',
    locale: input.locale ? String(input.locale) : '',
  }
}

export function buildAiAssistantIframeSrc(input: {
  embedPageUrl: string
  backend: string
  payload: AiAssistantAuthPayload
}): string {
  const base = input.embedPageUrl || '/ai-assistant-embed/index.html'
  const query = new URLSearchParams()

  if (input.payload.token) query.set('token', input.payload.token)
  if (input.payload.companyId) query.set('company_id', input.payload.companyId)
  if (input.payload.distributorId) query.set('distributor_id', input.payload.distributorId)
  if (input.payload.tenantId) query.set('tenant_app_id', input.payload.tenantId)
  if (input.payload.locale) query.set('locale', input.payload.locale)
  if (input.backend) query.set('backend', input.backend)
  query.set('layout', 'page')
  query.set('page-soft-close', 'true')

  const separator = base.includes('?') ? '&' : '?'
  return `${base}${separator}${query.toString()}`
}

export function buildAiAssistantOpenUrl(input: {
  embedPageUrl: string
  backend: string
  payload: AiAssistantAuthPayload
}): string {
  return buildAiAssistantIframeSrc(input)
}

export function openAiAssistantInNewWindow(url: string): boolean {
  if (!url || typeof window === 'undefined') return false
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}

export function postAiAssistantAuthToEmbed(
  targetWindow: PostMessageTarget | null | undefined,
  targetOrigin: string,
  payload: AiAssistantAuthPayload
) {
  if (!targetWindow || !targetOrigin) return
  targetWindow.postMessage(payload, targetOrigin)
}
