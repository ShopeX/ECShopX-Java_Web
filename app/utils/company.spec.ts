import { describe, expect, it } from 'vitest'
import { parseCompanyIdFromHost } from './company'

describe('parseCompanyIdFromHost', () => {
  it('extracts company_id from s-prefixed PC subdomain', () => {
    expect(parseCompanyIdFromHost('s134.shopex123.com', '999')).toBe('134')
  })

  it('extracts company_id when host includes a port', () => {
    expect(parseCompanyIdFromHost('s134.shopex123.com:443', '999')).toBe('134')
  })

  it('normalizes host casing before matching', () => {
    expect(parseCompanyIdFromHost('S134.SHOPEX123.COM', '999')).toBe('134')
  })

  it('falls back for non-s-prefixed host', () => {
    expect(parseCompanyIdFromHost('m134.shopex123.com', '999')).toBe('999')
  })

  it('falls back for custom domain host', () => {
    expect(parseCompanyIdFromHost('demo-yd.shopex123.com', '999')).toBe('999')
  })

  it('falls back for localhost', () => {
    expect(parseCompanyIdFromHost('localhost', '999')).toBe('999')
  })

  it('falls back for empty or missing host', () => {
    expect(parseCompanyIdFromHost('', '999')).toBe('999')
    expect(parseCompanyIdFromHost(undefined, '999')).toBe('999')
  })

  it('returns undefined when no host rule or fallback is available', () => {
    expect(parseCompanyIdFromHost('localhost', undefined)).toBeUndefined()
  })
})
