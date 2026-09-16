import { logger } from '~/utils/log'
import { useUserStore } from '~/stores/user'
import { stripLocalePrefix } from '~/utils/localeRoute'

// 需要登录才能访问的路由路径前缀
const protectedRoutes = [
  '/member', // 个人中心
  '/cart', // 购物车（如果需要登录）
  '/order', // 订单
  '/account/profile', // 个人信息
]

// 全局中间件 - 每个路由都会执行
export default defineNuxtRouteMiddleware((to, from) => {
  const localePath = useLocalePath()
  logger.info(`[AuthMiddleware] 路由导航: ${from?.path || '/'} -> ${to.path}`)

  // 检查是否是需要登录的路由
  const normalizedPath = stripLocalePrefix(to.path)
  const requiresAuth = protectedRoutes.some((route) => normalizedPath.startsWith(route))

  if (requiresAuth) {
    // 获取用户登录状态
    const userStore = useUserStore()

    // 如果未登录，重定向到登录页并携带当前路由
    if (!userStore.isLoggedIn) {
      logger.warn(`[AuthMiddleware] 未登录访问受保护路由: ${to.path}`)

      return navigateTo({
        path: localePath('/account/login'),
        query: {
          redirect: to.fullPath,
        },
      })
    }
  }
})
