/**
 * 权限守卫组合式函数
 *
 * 职责：
 * - 检查用户登录状态
 * - 处理需要登录的操作
 * - 未登录时跳转到登录页，并保存返回路径
 * - 提供统一的权限检查接口
 *
 * @example
 * ```vue
 * <script setup>
 * const { requireAuth } = useAuthGuard()
 *
 * // 需要登录的操作
 * const addToCart = async () => {
 *   await requireAuth(async () => {
 *     // 这里是需要登录才能执行的逻辑
 *     await cartStore.addItem(...)
 *   })
 * }
 * </script>
 * ```
 */
export function useAuthGuard() {
  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()
  const toast = useToastMessage()
  const localePath = useLocalePath()
  const { t } = useI18n()

  /**
   * 检查用户是否已登录
   */
  const isLoggedIn = computed(() => userStore.isLoggedIn)

  /**
   * 需要登录才能执行的操作
   *
   * @param action - 需要登录后执行的回调函数
   * @param options - 配置选项
   * @returns 操作结果
   *
   * @example
   * ```typescript
   * await requireAuth(async () => {
   *   await cartStore.addItem(...)
   * }, {
   *   loginMessage: '请先登录后再加入购物车',
   *   redirectAfterLogin: true
   * })
   * ```
   */
  const requireAuth = async <T = void>(
    action: () => Promise<T> | T,
    options?: {
      /** 未登录时的提示信息 */
      loginMessage?: string
      /** 登录成功后是否自动返回当前页 */
      redirectAfterLogin?: boolean
      /** 登录页路径 */
      loginPath?: string
    }
  ): Promise<T | undefined> => {
    // 如果已登录，直接执行操作
    if (isLoggedIn.value) {
      try {
        return await action()
      } catch (error) {
        console.error('Action execution error:', error)
        throw error
      }
    }

    // 未登录，提示并跳转到登录页
    const {
      loginMessage = t('d97b9964.8d2433'),
      redirectAfterLogin = true,
      loginPath = '/account/login',
    } = options || {}

    // 显示提示
    toast.show(loginMessage)

    // 保存当前路径，用于登录后返回
    const redirectPath = redirectAfterLogin ? route.fullPath : undefined

    // 跳转到登录页
    await router.push({
      path: localePath(loginPath),
      query: redirectPath ? { redirect: redirectPath } : undefined,
    })

    return undefined
  }

  /**
   * 检查登录状态（不执行操作，只检查）
   *
   * @param options - 配置选项
   * @returns 是否已登录
   */
  const checkAuth = (options?: {
    loginMessage?: string
    redirectToLogin?: boolean
    loginPath?: string
  }): boolean => {
    if (isLoggedIn.value) {
      return true
    }

    const {
      loginMessage = t('d97b9964.8d2433'),
      redirectToLogin = false,
      loginPath = '/account/login',
    } = options || {}

    // 显示提示
    toast.show(loginMessage)

    // 如果需要跳转
    if (redirectToLogin) {
      const redirectPath = route.fullPath
      router.push({
        path: localePath(loginPath),
        query: { redirect: redirectPath },
      })
    }

    return false
  }

  /**
   * 需要登录才能访问的路由守卫
   *
   * @example
   * ```typescript
   * // 在页面中使用
   * const { guardRoute } = useAuthGuard()
   * guardRoute('/account/profile')
   * ```
   */
  const guardRoute = (
    targetPath: string,
    options?: {
      loginMessage?: string
      loginPath?: string
    }
  ) => {
    if (!isLoggedIn.value) {
      const { loginMessage = t('d97b9964.8d2433'), loginPath = '/account/login' } = options || {}

      toast.show(loginMessage)

      router.push({
        path: localePath(loginPath),
        query: { redirect: targetPath },
      })
      return false
    }

    router.push(localePath(targetPath))
    return true
  }

  return {
    // 状态
    isLoggedIn,

    // 方法
    requireAuth,
    checkAuth,
    guardRoute,
  }
}
