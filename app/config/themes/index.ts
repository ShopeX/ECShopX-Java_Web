/**
 * 主题配置导出
 *
 * 统一导出所有主题配置
 */

export * from './types'
export { defaultTheme } from './default'

import { defaultTheme } from './default'
import type { IThemeConfig } from './types'

/**
 * 所有可用主题
 */
export const availableThemes: Record<string, IThemeConfig> = {
  default: defaultTheme,
  // 可以在这里添加更多主题
  // minimal: minimalTheme,
  // modern: modernTheme,
}

/**
 * 获取主题配置
 */
export function getTheme(themeId: string): IThemeConfig {
  return availableThemes[themeId] || defaultTheme
}
