import { describe, expect, it, vi } from 'vitest'
import {
  buildAiAssistantAuthPayload,
  buildAiAssistantIframeSrc,
  buildAiAssistantOpenUrl,
  buildAiEmbedPageUrl,
  isAiAssistantEnabled,
  isMobileWebUserAgent,
  openAiAssistantInNewWindow,
  postAiAssistantAuthToEmbed,
  resolveAiAssistantBackendUrl,
  resolveDistributorIdFromRoute,
  trimTrailingSlash,
} from './aiAssistantEmbed'

describe('aiAssistantEmbed', () => {
  it('enables AI assistant only for explicit truthy flag values', () => {
    expect(isAiAssistantEnabled('1')).toBe(true)
    expect(isAiAssistantEnabled('true')).toBe(true)
    expect(isAiAssistantEnabled(1)).toBe(true)
    expect(isAiAssistantEnabled(true)).toBe(true)

    expect(isAiAssistantEnabled('')).toBe(false)
    expect(isAiAssistantEnabled('0')).toBe(false)
    expect(isAiAssistantEnabled(false)).toBe(false)
  })

  it('trims trailing slashes from configured URLs', () => {
    expect(trimTrailingSlash(' https://ai.example/// ')).toBe('https://ai.example')
    expect(trimTrailingSlash('')).toBe('')
  })

  it('builds embed URL from explicit page URL, AI base URL, or local fallback', () => {
    expect(buildAiEmbedPageUrl({ aiEmbedPageUrl: 'https://ai.example/embed' })).toBe(
      'https://ai.example/embed/index.html'
    )
    expect(buildAiEmbedPageUrl({ aiEmbedPageUrl: 'https://ai.example/embed/index.html?x=1' })).toBe(
      'https://ai.example/embed/index.html?x=1'
    )
    expect(buildAiEmbedPageUrl({ aiBaseUrl: 'https://ai.example/' })).toBe(
      'https://ai.example/ai-assistant-embed/index.html'
    )
    expect(buildAiEmbedPageUrl({})).toBe('/ai-assistant-embed/index.html')
  })

  it('detects mobile web user agents', () => {
    expect(
      isMobileWebUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Mobile'
      )
    ).toBe(true)
    expect(isMobileWebUserAgent('Mozilla/5.0 (Linux; Android 14) Mobile')).toBe(true)
    expect(isMobileWebUserAgent('Mozilla/5.0 MicroMessenger/8.0.0')).toBe(true)
    expect(
      isMobileWebUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit Chrome/120 Safari'
      )
    ).toBe(false)
  })

  it('resolves backend URL from backend override or AI base URL', () => {
    expect(
      resolveAiAssistantBackendUrl({
        aiAssistantBackendUrl: 'https://backend.example/',
        aiBaseUrl: 'https://ai.example/',
      })
    ).toBe('https://backend.example')
    expect(resolveAiAssistantBackendUrl({ aiBaseUrl: 'https://ai.example/' })).toBe(
      'https://ai.example'
    )
    expect(resolveAiAssistantBackendUrl({})).toBe('')
  })

  it('resolves distributor id from query before shop route params', () => {
    expect(
      resolveDistributorIdFromRoute({
        path: '/shop/123',
        params: { id: '123' },
        query: { distributor_id: '456' },
      })
    ).toBe('456')
    expect(
      resolveDistributorIdFromRoute({
        path: '/shop/123',
        params: { id: '123' },
        query: {},
      })
    ).toBe('123')
    expect(
      resolveDistributorIdFromRoute({
        path: '/shop/123',
        params: { id: ['789'] },
        query: {},
      })
    ).toBe('789')
    expect(
      resolveDistributorIdFromRoute({
        path: '/products/1',
        params: { id: '1' },
        query: { distributorId: '987' },
      })
    ).toBe('987')
  })

  it('builds auth payload using empty strings for missing context', () => {
    expect(
      buildAiAssistantAuthPayload({
        token: 'token-a',
        companyId: 'company-a',
        tenantId: 'tenant-a',
        distributorId: 'distributor-a',
        locale: 'en-CN',
      })
    ).toEqual({
      type: 'ECSHOPX_AUTH',
      token: 'token-a',
      companyId: 'company-a',
      tenantId: 'tenant-a',
      distributorId: 'distributor-a',
      locale: 'en-CN',
    })
    expect(buildAiAssistantAuthPayload({})).toEqual({
      type: 'ECSHOPX_AUTH',
      token: '',
      companyId: '',
      tenantId: '',
      distributorId: '',
      locale: '',
    })
  })

  it('builds iframe and open URLs with the AI assistant query contract', () => {
    const payload = buildAiAssistantAuthPayload({
      token: 'token-a',
      companyId: 'company-a',
      tenantId: 'tenant-a',
      distributorId: 'distributor-a',
      locale: 'en-CN',
    })
    const iframeSrc = buildAiAssistantIframeSrc({
      embedPageUrl: 'https://ai.example/embed/index.html?x=1',
      backend: 'https://backend.example',
      payload,
    })
    const url = new URL(iframeSrc)

    expect(url.searchParams.get('x')).toBe('1')
    expect(url.searchParams.get('token')).toBe('token-a')
    expect(url.searchParams.get('company_id')).toBe('company-a')
    expect(url.searchParams.get('distributor_id')).toBe('distributor-a')
    expect(url.searchParams.get('tenant_app_id')).toBe('tenant-a')
    expect(url.searchParams.get('locale')).toBe('en-CN')
    expect(url.searchParams.get('backend')).toBe('https://backend.example')
    expect(url.searchParams.get('layout')).toBe('page')
    expect(url.searchParams.get('page-soft-close')).toBe('true')
    expect(buildAiAssistantOpenUrl({ embedPageUrl: iframeSrc, backend: '', payload })).toContain(
      'layout=page'
    )
  })

  it('opens AI assistant in a new window only in browser context', () => {
    const originalWindow = globalThis.window
    const open = vi.fn(() => ({ closed: false }))
    vi.stubGlobal('window', { open })

    expect(openAiAssistantInNewWindow('https://ai.example/embed/index.html')).toBe(true)
    expect(open).toHaveBeenCalledWith(
      'https://ai.example/embed/index.html',
      '_blank',
      'noopener,noreferrer'
    )
    expect(openAiAssistantInNewWindow('')).toBe(false)

    vi.stubGlobal('window', originalWindow)
  })

  it('treats noopener popup calls as handled even when the browser returns no handle', () => {
    const originalWindow = globalThis.window
    const open = vi.fn(() => null)
    vi.stubGlobal('window', { open })

    expect(openAiAssistantInNewWindow('https://ai.example/embed/index.html')).toBe(true)

    vi.stubGlobal('window', originalWindow)
  })

  it('posts auth payload to the explicit embed origin', () => {
    const postMessage = vi.fn()
    const payload = buildAiAssistantAuthPayload({ token: 'token-a' })

    postAiAssistantAuthToEmbed({ postMessage }, 'https://ai.example', payload)

    expect(postMessage).toHaveBeenCalledWith(payload, 'https://ai.example')
  })
})
