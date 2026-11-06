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
  // B2C 购物车要按 is_valid 店铺过滤，需等默认店就绪后再拉购物车
  dependsOn: ['http', 'distributor-init'],
  async setup(nuxtApp) {
    const userStore = useUserStore()
    const cartStore = useCartStore()

    // 有 token 时在渲染前拉取会员资料。服务端 HTML 和客户端水合必须是同一份昵称，
    // 否则会出现「欢迎回来」和「欢迎回来，111111」的 text mismatch。
    if (userStore.token && !userStore.userInfo) {
      try {
        await userStore.fetchUserInfo()
      } catch (e) {
        console.error('Auth init failed:', e)
      }
    }

    if (!import.meta.client) return

    nuxtApp.hook('app:mounted', () => {
      cartStore.restoreCachedCart()
      cartStore.loadCart().catch((e) => console.error('Cart init failed:', e))
    })
  },
})
