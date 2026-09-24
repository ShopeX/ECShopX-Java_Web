import { defineStore } from 'pinia'
import { authApiClient } from '~/infrastructure/http/clients'
import { AuthTransformer, type ILoginModel } from '~/infrastructure/transformers'
import type { IUserInfo, ILoginRequest, IPhoneLoginRequest } from '~/types/api/auth'
import { useCartStore } from '~/stores/cart'

/**
 * 用户信息接口（扩展 API 类型）
 */
export type UserInfo = IUserInfo & {
  isPlusVip?: boolean
}

type FetchUserInfoResult =
  | { success: true; data: UserInfo }
  | { success: false; error: string }

let fetchUserInfoTask: Promise<FetchUserInfoResult> | null = null

/**
 * 用户状态接口
 */
interface UserState {
  isLoggedIn: boolean
  userInfo: UserInfo | null
  token: string | null
  refreshToken: string | null
}

/**
 * 用户状态管理 Store
 */
export const useUserStore = defineStore('user', {
  state: (): UserState => {
    const token = useCookie('token')
    const refreshToken = useCookie('refreshToken')

    return {
      isLoggedIn: !!token.value,
      userInfo: null,
      token: (token.value as string) || null,
      refreshToken: (refreshToken.value as string) || null,
    }
  },

  getters: {
    /**
     * 获取用户名
     */
    username: (state): string => {
      return state.userInfo?.username || ''
    },

    /**
     * 是否为 PLUS 会员
     */
    isPlusVip: (state): boolean => {
      return state.userInfo?.isPlusVip || false
    },
  },

  actions: {
    /**
     * 设置用户登录状态
     */
    setLoginState(isLoggedIn: boolean) {
      this.isLoggedIn = isLoggedIn
    },

    /**
     * 设置用户信息
     */
    setUserInfo(userInfo: UserInfo | null) {
      this.userInfo = userInfo
    },

    /**
     * 设置令牌
     */
    setToken(token: string | null, refreshToken: string | null = null) {
      const cookieToken = useCookie('token', { maxAge: 60 * 60 * 24 * 7 }) // 7天过期
      const cookieRefreshToken = useCookie('refreshToken', { maxAge: 60 * 60 * 24 * 30 }) // 30天过期

      if (token !== this.token) {
        this.userInfo = null
      }

      this.token = token
      this.refreshToken = refreshToken
      this.isLoggedIn = !!token

      // 更新 Cookie
      cookieToken.value = token
      cookieRefreshToken.value = refreshToken
    },

    /**
     * 登录成功后写入 token 并拉取最新会员资料
     */
    async completeLogin(loginData: ILoginModel) {
      this.isLoggedIn = true
      this.setToken(loginData.token, loginData.refreshToken)

      const profileResult = await this.fetchUserInfo()
      if (!profileResult.success) {
        return profileResult
      }

      // 登录后重新同步购物车，确保已挂载的头部立即显示最新商品数量
      const cartStore = useCartStore()
      await cartStore.loadCart({ silent: true })

      return { success: true as const, data: loginData }
    },

    /**
     * 账号密码登录
     */
    async login(params: ILoginRequest) {
      try {
        this.userInfo = null

        // 调用登录 API
        const response = await authApiClient.login(params)

        // 转换数据（传递 response.data）
        const loginData = AuthTransformer.toLoginModel(response)

        return await this.completeLogin(loginData)
      } catch (error: any) {
        console.error('Login error:', error)
        return {
          success: false,
          error: error.message || '6314873a.5b8c6c',
        }
      }
    },

    /**
     * 手机验证码登录
     */
    async loginWithPhone(params: IPhoneLoginRequest) {
      try {
        this.userInfo = null

        // 调用手机登录 API
        const response = await authApiClient.loginWithPhone(params)

        // 转换数据（传递 response.data）
        const loginData = AuthTransformer.toLoginModel(response)

        return await this.completeLogin(loginData)
      } catch (error: any) {
        console.error('Phone login error:', error)
        return {
          success: false,
          error: error.message || '6314873a.5b8c6c',
        }
      }
    },

    /**
     * 登出
     */
    async logout() {
      this.isLoggedIn = false
      this.userInfo = null
      this.setToken(null, null)

      const cartStore = useCartStore()
      cartStore.resetLocalCart()

      return { success: true }
    },

    /**
     * 初始化用户状态（从本地存储恢复）
     * @deprecated 现在已通过 state 中的 useCookie 自动初始化，此方法主要用于获取用户信息
     */
    async initUserState() {
      try {
        if (this.token && !this.userInfo) {
          // 获取用户信息
          await this.fetchUserInfo()
        }
      } catch (error) {
        console.error('Init user state error:', error)
        // 初始化失败，清除 Token
        this.setToken(null, null)
      }
    },

    /**
     * 获取用户信息
     */
    async fetchUserInfo(): Promise<FetchUserInfoResult> {
      if (fetchUserInfoTask) {
        return fetchUserInfoTask
      }

      fetchUserInfoTask = this.fetchUserInfoInternal()

      try {
        return await fetchUserInfoTask
      } finally {
        fetchUserInfoTask = null
      }
    },

    async fetchUserInfoInternal(): Promise<FetchUserInfoResult> {
      try {
        if (!this.token) {
          throw new Error('6314873a.63e85d')
        }

        // 调用获取用户信息 API
        const response = await authApiClient.getUserInfo()

        // 转换数据（plugin 已自动解包 data）
        const userInfo = AuthTransformer.toUserInfoModel(response)

        // 更新状态
        this.userInfo = userInfo
        this.isLoggedIn = true

        return { success: true as const, data: userInfo }
      } catch (error: any) {
        console.error('Fetch user info error:', error)

        // 获取用户信息失败，可能 Token 失效
        this.isLoggedIn = false
        this.userInfo = null
        this.setToken(null, null)

        return {
          success: false as const,
          error: error.message || '6314873a.dc486e',
        }
      }
    },

    /**
     * 刷新 Token
     */
    async refreshAuthToken() {
      try {
        if (!this.refreshToken) {
          throw new Error('6314873a.c94677')
        }

        // 调用刷新 Token API
        const response = await authApiClient.refreshToken(this.refreshToken)

        // 转换数据（传递 response.data）
        const loginData = AuthTransformer.toLoginModel(response)

        // 更新 Token
        this.setToken(loginData.token, loginData.refreshToken)

        return { success: true }
      } catch (error: any) {
        console.error('Refresh token error:', error)

        // 刷新失败，清除登录状态
        this.isLoggedIn = false
        this.userInfo = null
        this.setToken(null, null)

        return {
          success: false,
          error: error.message || '6314873a.a427f5',
        }
      }
    },
  },
})
