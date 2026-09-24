import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getPreferredLocale,
  setPreferredLocale,
} from './localePreference'

const STORAGE_KEY = 'ecx_web_preferred_locale'

function createSessionStorage() {
  const values = new Map<string, string>()

  return {
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

describe('localePreference', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      sessionStorage: createSessionStorage(),
    })
    window.sessionStorage.clear()
  })

  afterEach(() => {
    window.sessionStorage.clear()
    vi.unstubAllGlobals()
  })

  it('stores and reads supported locale preference from session storage', () => {
    setPreferredLocale('en')

    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe('en')
    expect(getPreferredLocale()).toBe('en')
  })

  it('ignores unsupported stored locale values', () => {
    window.sessionStorage.setItem(STORAGE_KEY, 'fr')

    expect(getPreferredLocale()).toBeNull()
  })
})
