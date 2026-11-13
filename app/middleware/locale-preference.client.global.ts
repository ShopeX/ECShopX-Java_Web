import {
  getPathLocale,
  stripLocalePrefix,
  withLocalePrefix,
} from '~/utils/localeRoute'
import { getPreferredLocale } from '~/utils/localePreference'
import {
  fetchSiteLanguageSetting,
  resolveActiveLocale,
} from '~/utils/siteLanguageSetting'

/**
 * 语言偏好中间件：
 * 1. 有个人偏好且仍启用 → 纠正到偏好 locale
 * 2. 无偏好 → 使用站点默认语言（不把当前 path locale 写成偏好）
 * 3. 偏好语言已关闭 → 回落站点默认
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return

  const setting = await fetchSiteLanguageSetting()
  const preferred = getPreferredLocale()
  const activeLocale = resolveActiveLocale(setting, preferred)
  const currentPathLocale = getPathLocale(to.path)

  if (activeLocale === currentPathLocale) return

  const targetPath = withLocalePrefix(stripLocalePrefix(to.path), activeLocale)
  if (targetPath === to.path) return

  return navigateTo(
    {
      path: targetPath,
      query: to.query,
      hash: to.hash,
    },
    { replace: true }
  )
})
