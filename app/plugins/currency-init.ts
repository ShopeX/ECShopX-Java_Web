import type { IFrontendCommonSetting } from '~/types/api/common'
import { applyCurrencyFromSetting, resetCurrencySymbol } from '~/utils/currencyFormat'

/**
 * 币种初始化插件（SSR + 客户端）
 *
 * 在页面渲染前拉取/恢复前端通用配置中的币种，避免 SSR 默认 ¥ 与客户端 HK$ 等不一致导致 hydration mismatch。
 */
export default defineNuxtPlugin({
  name: 'currency-init',
  dependsOn: ['http'],
  async setup() {
    if (import.meta.server) {
      resetCurrencySymbol()
    }

    const currencyCache = useCookie<IFrontendCommonSetting>('frontend-currency-cache', {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    })
    if (currencyCache.value && Object.keys(currencyCache.value).length > 0) {
      applyCurrencyFromSetting(currencyCache.value)
    }

    try {
      await useCurrency()
    } catch (e) {
      console.error('Currency init failed:', e)
    }
  },
})
