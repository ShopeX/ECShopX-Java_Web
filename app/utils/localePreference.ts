import type { AppLocaleCode } from '../shared/localeConfig'
import { isSupportedLocale } from './localeRoute'

const STORAGE_KEY = 'ecx_web_preferred_locale'

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null
  return window.sessionStorage
}

export function getPreferredLocale(): AppLocaleCode | null {
  const storage = getSessionStorage()
  if (!storage) return null

  try {
    const value = storage.getItem(STORAGE_KEY)
    return value && isSupportedLocale(value) ? value : null
  } catch {
    return null
  }
}

export function setPreferredLocale(locale: AppLocaleCode) {
  const storage = getSessionStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEY, locale)
  } catch {
    // Ignore storage write failures so language switching can still navigate.
  }
}

export function clearPreferredLocale() {
  const storage = getSessionStorage()
  if (!storage) return

  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
