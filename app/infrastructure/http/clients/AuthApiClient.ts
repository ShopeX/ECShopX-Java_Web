import type {
  ILoginRequest,
  IPhoneLoginRequest,
  IMemberRegisterRequest,
  IEmailMemberRegisterRequest,
  ISmsCodeRequest,
  IForgotPasswordRequest,
  ILoginResponse,
  ISmsCodeResponseData,
  ICaptchaRequest,
  ICaptchaResponse,
  IGetUserInfoResponse,
} from '~/types/api/auth'

/**
 * 认证 HTTP 客户端
 *
 * 职责：
 * - 封装认证相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 *
 * 设计原则：
 * - 纯粹的 HTTP 调用层
 * - 不包含业务逻辑
 * - 不包含数据转换
 * - 职责单一，易于测试
 *
 * @example
 * ```typescript
 * const client = new AuthApiClient()
 * const response = await client.login({ username: 'admin', password: '123456', captcha: '1234', captchaKey: 'xxx' })
 * // response 是原始 API 响应，需要在 Transformer 层转换
 * ```
 */
export class AuthApiClient {
  private $api: any

  constructor() {
    // 不在构造函数中初始化，延迟到第一次使用时
  }

  /**
   * 获取 HTTP 实例（延迟初始化，SSR 安全）
   */
  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  private assertNewLoginSuccess(
    response: ILoginResponse & { status?: number; error_message?: string }
  ) {
    if (response?.status === 0 || !response?.token) {
      const message = response?.error_message || '833d19b4.87f936'
      throw new Error(message)
    }
  }

  /**
   * 账号密码登录
   *
   * @param params - 登录请求参数
   * @returns 登录响应数据（HTTP 插件已自动解包 data 字段）
   *
   * @example
   * ```typescript
   * const response = await client.login({
   *   username: '13917609856',
   *   password: '123456'
   *   // company_id 由 HTTP 插件自动添加
   * })
   * // response = { token: 'xxx' }，已自动解包
   * ```
   */
  async login(params: ILoginRequest): Promise<ILoginResponse> {
    const response = await this.http('/wxapp/new_login', {
      method: 'POST',
      body: {
        username: params.username,
        password: params.password,
        check_type: 'password',
        silent: 1,
        auto_register: 0,
        auth_type: 'local',
        showError: false,
        trustlogin_tag: 'weixin',
        version_tag: 'touch',
      },
    })
    this.assertNewLoginSuccess(response)
    return response
  }

  /**
   * 手机密码登录
   *
   * @param params - 手机登录请求参数
   * @returns 登录响应数据（HTTP 插件已自动解包 data 字段）
   *
   * @example
   * ```typescript
   * const response = await client.loginWithPhone({
   *   phone: '13800138000',
   *   password: 'password'
   * })
   * // response = { token: 'xxx' }，已自动解包
   * ```
   */
  async loginWithPhone(params: IPhoneLoginRequest): Promise<ILoginResponse> {
    const response = await this.http('/wxapp/new_login', {
      method: 'POST',
      body: {
        username: params.phone,
        password: params.password,
        check_type: 'password',
        silent: 1,
        auto_register: 0,
        auth_type: 'local',
        trustlogin_tag: 'weixin',
        version_tag: 'touch',
      },
    })
    this.assertNewLoginSuccess(response)
    return response
  }

  /**
   * 会员注册
   */
  async registerMember(params: IMemberRegisterRequest): Promise<any> {
    return this.http('/wxapp/member', {
      method: 'POST',
      body: {
        auth_type: 'local',
        check_type: 'sign',
        mobile: params.mobile,
        email: params.email,
        password: params.password,
        vcode: params.vcode,
        sex: 0,
        user_type: 'local',
      },
    })
  }

  /**
   * 邮箱会员注册
   */
  async registerEmailMember(params: IEmailMemberRegisterRequest): Promise<any> {
    return this.http('/wxapp/member/email/register', {
      method: 'POST',
      body: {
        email: params.email,
        password: params.password,
        password_confirmation: params.passwordConfirmation,
        token: params.token,
        yzm: params.yzm,
        sex: 0,
        user_type: 'local',
        grade_id: 17,
      },
    })
  }

  /**
   * 获取图形验证码
   *
   * @param params - 验证码请求参数
   * @returns 验证码图片和 token
   *
   * @example
   * ```typescript
   * const response = await client.getCaptcha({ type: 'login' })
   * // company_id 由 HTTP 插件自动添加
   * const { imageData, imageToken } = response.data
   * ```
   */
  async getCaptcha(params: ICaptchaRequest): Promise<{ data: ICaptchaResponse }> {
    const endpoint =
      params.scope === 'member' ? '/wxapp/member/image/code' : '/wxapp/distributor/image/code'

    return this.http(endpoint, {
      method: 'GET',
      params: {
        type: params.type,
      },
      cache: 'no-cache', // 验证码不缓存
    })
  }

  /**
   * 发送短信验证码
   *
   * @param params - 发送短信请求参数
   * @returns 发送结果
   *
   * @example
   * ```typescript
   * await client.sendSmsCode({
   *   type: 'login',
   *   mobile: '13917609856',
   *   yzm: 'yGM6',
   *   token: '7c4175f1cde1ac20703421ffd1c7cf6d'
   *   // company_id 由 HTTP 插件自动添加
   * })
   * ```
   */
  async sendSmsCode(params: ISmsCodeRequest): Promise<{ data: ISmsCodeResponseData }> {
    return this.http('/wxapp/member/sms/code', {
      method: 'GET',
      params: params,
    })
  }

  /**
   * 获取当前用户信息
   *
   * @returns 用户信息
   *
   * @example
   * ```typescript
   * const userInfo = await client.getUserInfo()
   * ```
   */
  async getUserInfo(): Promise<IGetUserInfoResponse> {
    return this.http('/wxapp/member', {
      method: 'GET',
      cache: 'no-store',
    })
  }

  /**
   * 刷新 Token
   *
   * @param refreshToken - Refresh Token
   * @returns 新的 Token 信息（HTTP 插件已自动解包 data 字段）
   *
   * @example
   * ```typescript
   * const response = await client.refreshToken('refresh-token-xxx')
   * const { token } = response  // 已自动解包
   * ```
   */
  /**
   * 忘记密码 - 重置密码
   */
  async forgotPassword(params: IForgotPasswordRequest): Promise<any> {
    return this.http('/wxapp/member/reset/password', {
      method: 'POST',
      body: {
        mobile: params.mobile,
        password: params.password,
        vcode: params.vcode,
      },
    })
  }

  async refreshToken(refreshToken: string): Promise<ILoginResponse> {
    return this.http('/wxapp/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    })
  }
}

// 导出单例实例
export const authApiClient = new AuthApiClient()
