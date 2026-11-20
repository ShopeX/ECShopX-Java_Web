import { ref, computed } from 'vue'
import { useUserStore } from '~/stores/user'
import { authApiClient } from '~/infrastructure/http/clients'
import { AuthTransformer } from '~/infrastructure/transformers'
import type { ILoginRequest, IPhoneLoginRequest, ICaptchaResponse } from '~/types/api/auth'

/**
 * 认证组合式函数
 *
 * 职责：
 * - 封装认证相关的业务逻辑
 * - 管理登录、登出状态
 * - 管理图形验证码
 * - 与 useUserStore 交互
 *
 * @example
 * ```vue
 * <script setup>
 * const { login, loginWithPhone, logout, isLoading, error } = useAuth()
 *
 * await login({ username, password, captcha, captchaKey })
 * </script>
 * ```
 */
export function useAuth() {
  const userStore = useUserStore()
  const { t } = useI18n()
  const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

  function translateIfGeneratedKey(value: string): string {
    return generatedKeyPattern.test(value) ? t(value) : value
  }

  // 状态管理
  const isLoading = ref(false)
  const error = ref<string>('')

  // 图形验证码
  const captcha = ref<ICaptchaResponse | null>(null)
  const captchaLoading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const userInfo = computed(() => userStore.userInfo)

  /**
   * 获取图形验证码
   */
  async function getCaptcha(
    type: string = 'login',
    scope: 'distributor' | 'member' = 'distributor'
  ): Promise<boolean> {
    try {
      captchaLoading.value = true
      error.value = ''

      const response = await authApiClient.getCaptcha({ type, scope })
      // company_id 由 HTTP 插件自动添加
      captcha.value = AuthTransformer.toCaptchaModel(response)

      return true
    } catch (err: any) {
      error.value = err.message || t('211553ea.cd6c78')
      console.error('Get captcha error:', err)
      return false
    } finally {
      captchaLoading.value = false
    }
  }

  /**
   * 刷新图形验证码
   */
  async function refreshCaptcha(
    type: string = 'login',
    scope: 'distributor' | 'member' = 'distributor'
  ) {
    return await getCaptcha(type, scope)
  }

  /**
   * 账号密码登录
   */
  async function login(params: ILoginRequest) {
    try {
      isLoading.value = true
      error.value = ''

      // 调用 store 登录方法
      const result = await userStore.login(params)

      if (!result.success) {
        error.value = result.error ? translateIfGeneratedKey(result.error) : t('211553ea.b6076a')
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message ? translateIfGeneratedKey(err.message) : t('211553ea.5b8c6c')
      console.error('Login error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 手机验证码登录
   */
  async function loginWithPhone(params: IPhoneLoginRequest) {
    try {
      isLoading.value = true
      error.value = ''

      // 调用 store 手机登录方法
      const result = await userStore.loginWithPhone(params)

      if (!result.success) {
        error.value = result.error ? translateIfGeneratedKey(result.error) : t('211553ea.b6076a')
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message ? translateIfGeneratedKey(err.message) : t('211553ea.5b8c6c')
      console.error('Phone login error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 登出
   */
  async function logout() {
    try {
      isLoading.value = true
      error.value = ''

      // 调用 store 登出方法
      const result = await userStore.logout()

      if (!result.success) {
        error.value = result.error || t('211553ea.3d7c93')
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message || t('211553ea.3d7c93')
      console.error('Logout error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo() {
    try {
      isLoading.value = true
      error.value = ''

      const result = await userStore.fetchUserInfo()

      if (!result.success) {
        error.value = result.error || t('211553ea.dc486e')
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message || t('211553ea.dc486e')
      console.error('Fetch user info error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 初始化用户状态
   */
  async function initUserState() {
    await userStore.initUserState()
  }

  /**
   * 清除错误信息
   */
  function clearError() {
    error.value = ''
  }

  return {
    // 状态
    isLoading,
    error,
    isLoggedIn,
    userInfo,

    // 图形验证码
    captcha,
    captchaLoading,
    getCaptcha,
    refreshCaptcha,

    // 方法
    login,
    loginWithPhone,
    logout,
    fetchUserInfo,
    initUserState,
    clearError,
  }
}
