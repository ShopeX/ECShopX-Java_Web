/**
 * 国际化（i18n）Composable
 *
 * 功能：
 * - 多语言切换
 * - 翻译消息获取
 * - RTL 布局支持
 * - 货币和日期格式化
 *
 * @example
 * ```vue
 * <script setup>
 * const { locale, t, switchLocale, formatCurrency, isRTL } = useI18n()
 *
 * // 获取翻译
 * const title = t('cart.title') // "购物车"
 *
 * // 切换语言
 * switchLocale('en-US')
 *
 * // 格式化货币
 * const price = formatCurrency(99.99) // "¥99.99"
 * </script>
 * ```
 */

import { getLocale, getMessages, defaultLocale } from '~/config/locales'
import type { ILocaleConfig, IMessages } from '~/config/locales/types'

/**
 * 语言存储 Key
 */
const LOCALE_STORAGE_KEY = 'ecshopx-locale'

/**
 * 国际化 Composable
 */
export function useCustomI18n() {
  // 当前语言代码
  const localeCode = useState<string>('locale-code', () => defaultLocale.code)

  /**
   * 当前语言配置
   */
  const locale = computed<ILocaleConfig>(() => {
    return getLocale(localeCode.value)
  })

  /**
   * 当前语言的翻译消息
   */
  const messages = computed<IMessages>(() => {
    return getMessages(localeCode.value)
  })

  /**
   * 是否 RTL 布局
   */
  const isRTL = computed(() => {
    return locale.value.direction === 'rtl'
  })

  /**
   * 初始化语言
   */
  const initLocale = () => {
    if (import.meta.client) {
      // 从 localStorage 读取保存的语言
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY)
      if (savedLocale) {
        localeCode.value = savedLocale
      }

      // 应用语言设置
      applyLocale()
    }
  }

  /**
   * 切换语言
   */
  const switchLocale = (newLocaleCode: string) => {
    localeCode.value = newLocaleCode

    if (import.meta.client) {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocaleCode)
      applyLocale()
    }
  }

  /**
   * 应用语言设置
   */
  const applyLocale = () => {
    if (!import.meta.client) return

    const currentLocale = locale.value

    // 设置 HTML lang 属性
    document.documentElement.lang = currentLocale.code

    // 设置文本方向
    document.documentElement.dir = currentLocale.direction

    // 如果是 RTL，添加 rtl class
    if (currentLocale.direction === 'rtl') {
      document.documentElement.classList.add('rtl')
    } else {
      document.documentElement.classList.remove('rtl')
    }
  }

  /**
   * 获取翻译
   *
   * @param key - 翻译 key，格式：'section.key'
   * @param fallback - 备用文本
   * @returns 翻译后的文本
   */
  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.')
    let result: any = messages.value

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        return fallback || key
      }
    }

    return typeof result === 'string' ? result : fallback || key
  }

  /**
   * 格式化货币
   *
   * @param amount - 金额
   * @param showSymbol - 是否显示货币符号
   * @returns 格式化后的货币字符串
   */
  const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
    const currentLocale = locale.value
    const formatted = amount.toLocaleString(currentLocale.code, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    if (showSymbol) {
      // RTL 语言：符号在右边
      if (currentLocale.direction === 'rtl') {
        return `${formatted} ${currentLocale.currencySymbol}`
      }
      // LTR 语言：符号在左边
      return `${currentLocale.currencySymbol}${formatted}`
    }

    return formatted
  }

  /**
   * 格式化日期
   *
   * @param date - 日期对象或时间戳
   * @returns 格式化后的日期字符串
   */
  const formatDate = (date: Date | number): string => {
    const currentLocale = locale.value
    const dateObj = typeof date === 'number' ? new Date(date) : date

    return dateObj.toLocaleDateString(currentLocale.code, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  /**
   * 格式化时间
   *
   * @param date - 日期对象或时间戳
   * @returns 格式化后的时间字符串
   */
  const formatTime = (date: Date | number): string => {
    const currentLocale = locale.value
    const dateObj = typeof date === 'number' ? new Date(date) : date

    return dateObj.toLocaleTimeString(currentLocale.code, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  /**
   * 格式化日期时间
   *
   * @param date - 日期对象或时间戳
   * @returns 格式化后的日期时间字符串
   */
  const formatDateTime = (date: Date | number): string => {
    return `${formatDate(date)} ${formatTime(date)}`
  }

  // 客户端初始化
  if (import.meta.client) {
    onMounted(() => {
      initLocale()
    })
  }

  return {
    // 状态
    localeCode: readonly(localeCode),
    locale,
    messages,
    isRTL,

    // 方法
    switchLocale,
    t,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    initLocale,
  }
}
