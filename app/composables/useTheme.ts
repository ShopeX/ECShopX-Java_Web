/**
 * 主题管理 Composable
 *
 * 功能：
 * - 主题切换
 * - 主题配置获取
 * - 暗黑模式切换
 * - 主题 CSS 变量注入
 *
 * @example
 * ```vue
 * <script setup>
 * const { currentTheme, switchTheme, isDarkMode, toggleDarkMode } = useTheme()
 *
 * // 切换主题
 * switchTheme('minimal')
 *
 * // 切换暗黑模式
 * toggleDarkMode()
 * </script>
 * ```
 */

import { getTheme, defaultTheme } from '~/config/themes'
import type { IThemeConfig } from '~/config/themes/types'

/**
 * 主题 Store Key
 */
const THEME_STORAGE_KEY = 'ecshopx-theme'
const DARK_MODE_STORAGE_KEY = 'ecshopx-dark-mode'

/**
 * 主题管理 Composable
 */
export function useTheme() {
  // 当前主题 ID
  const themeId = useState<string>('theme-id', () => 'default')

  // 是否暗黑模式
  const isDarkMode = useState<boolean>('dark-mode', () => false)

  /**
   * 当前主题配置
   */
  const currentTheme = computed<IThemeConfig>(() => {
    return getTheme(themeId.value)
  })

  /**
   * 初始化主题
   */
  const initTheme = () => {
    if (import.meta.client) {
      // 从 localStorage 读取保存的主题
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY)
      if (savedThemeId) {
        themeId.value = savedThemeId
      }

      // 从 localStorage 读取暗黑模式设置
      const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY)
      if (savedDarkMode !== null) {
        isDarkMode.value = savedDarkMode === 'true'
      }

      // 应用主题
      applyTheme()
      applyDarkMode()
    }
  }

  /**
   * 切换主题
   */
  const switchTheme = (newThemeId: string) => {
    themeId.value = newThemeId

    if (import.meta.client) {
      localStorage.setItem(THEME_STORAGE_KEY, newThemeId)
      applyTheme()
    }
  }

  /**
   * 切换暗黑模式
   */
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value

    if (import.meta.client) {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDarkMode.value))
      applyDarkMode()
    }
  }

  /**
   * 应用主题（注入 CSS 变量）
   */
  const applyTheme = () => {
    if (!import.meta.client) return

    const theme = currentTheme.value
    const root = document.documentElement

    // 应用颜色变量
    root.style.setProperty('--color-primary', theme.colors.primary)
    root.style.setProperty('--color-secondary', theme.colors.secondary)
    root.style.setProperty('--color-success', theme.colors.success)
    root.style.setProperty('--color-warning', theme.colors.warning)
    root.style.setProperty('--color-danger', theme.colors.danger)
    root.style.setProperty('--color-info', theme.colors.info)
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary)
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--color-background', theme.colors.background)
    root.style.setProperty('--color-border', theme.colors.border)

    // 应用布局变量
    root.style.setProperty('--header-height', theme.layout.header.height)
    root.style.setProperty('--header-background', theme.layout.header.background)
    root.style.setProperty('--navigation-width', theme.layout.navigation.width)
    root.style.setProperty('--container-max-width', theme.layout.containerMaxWidth)

    // 应用间距变量
    root.style.setProperty('--spacing-xs', theme.layout.spacing.xs)
    root.style.setProperty('--spacing-sm', theme.layout.spacing.sm)
    root.style.setProperty('--spacing-md', theme.layout.spacing.md)
    root.style.setProperty('--spacing-lg', theme.layout.spacing.lg)
    root.style.setProperty('--spacing-xl', theme.layout.spacing.xl)

    // 应用组件样式变量
    root.style.setProperty('--button-border-radius', theme.components.button.borderRadius)
    root.style.setProperty('--card-border-radius', theme.components.card.borderRadius)
    root.style.setProperty('--card-shadow', theme.components.card.shadow)
    root.style.setProperty('--input-border-radius', theme.components.input.borderRadius)
    root.style.setProperty('--input-height', theme.components.input.height)
  }

  /**
   * 应用暗黑模式
   */
  const applyDarkMode = () => {
    if (!import.meta.client) return

    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 客户端初始化
  if (import.meta.client) {
    onMounted(() => {
      initTheme()
    })
  }

  return {
    // 状态
    themeId: readonly(themeId),
    currentTheme,
    isDarkMode: readonly(isDarkMode),

    // 方法
    switchTheme,
    toggleDarkMode,
    initTheme,
  }
}
