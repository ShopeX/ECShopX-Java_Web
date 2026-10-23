import { useUserStore } from '~/stores/user'
import { useCartStore } from '~/stores/cart'

/**
 * 认证与数据初始化插件
 *
 * 职责：
 * 1. 应用启动时，从 Cookie 恢复用户状态
 * 2. 如果已登录，自动获取用户信息
 * 3. 初始化购物车数据
 */
export default defineNuxtPlugin({
  name: 'auth-init',
  dependsOn: ['http'],
  async setup(nuxtApp) {
    const userStore = useUserStore()
    const cartStore = useCartStore()

    // 1. 会员资料仅在客户端拉取，避免 SSR 灌入不完整 profile 导致「先邮箱后手机号」闪烁
    if (userStore.token && import.meta.client) {
      try {
        await userStore.fetchUserInfo()
      } catch (e) {
        console.error('Auth init failed:', e)
      }
    }

    // 2. 初始化购物车 (仅客户端；币种由 currency-init 插件在 SSR/客户端统一初始化)
    if (import.meta.client) {
      cartStore.loadCart().catch((e) => console.error('Cart init failed:', e))
    }
  },
})
