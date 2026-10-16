/**
 * 认证相关 API 类型定义
 * 基于 RESTful API 规范和常见认证模式
 */

/**
 * 账号密码登录请求
 */
export interface ILoginRequest {
  /** 用户名/账号 */
  username: string
  /** 密码 */
  password: string
}

/**
 * 手机密码登录请求
 */
export interface IPhoneLoginRequest {
  /** 手机号 */
  phone: string
  /** 密码 */
  password: string
}

/**
 * 会员注册请求
 */
export interface IMemberRegisterRequest {
  /** 手机号 */
  mobile?: string
  /** 邮箱 */
  email?: string
  /** 密码 */
  password: string
  /** 验证码 */
  vcode: string
}

/**
 * 邮箱会员注册请求
 */
export interface IEmailMemberRegisterRequest {
  /** 邮箱 */
  email: string
  /** 密码 */
  password: string
  /** 确认密码 */
  passwordConfirmation: string
  /** 图形验证码 token */
  token: string
  /** 图形验证码 */
  yzm: string
}

/**
 * 短信验证码发送请求
 */
export interface ISmsCodeRequest {
  /** 类型 */
  type: string
  /** 手机号 */
  mobile: string
  /** 图形验证码 */
  yzm: string
  /** 图形验证码 token */
  token: string
  /** 公司ID（可选，HTTP 插件会自动添加） */
  company_id?: string
}

/**
 * 短信验证码发送响应（API 原始格式）
 */
export interface ISmsCodeResponseData {
  /** 提示信息 */
  message: string
  /** 状态码 */
  status_code: number
}

/**
 * 短信验证码发送响应（转换后）
 */
export interface ISmsCodeResponse {
  /** 是否成功 */
  success: boolean
  /** 提示信息 */
  message: string
  /** 验证码有效期（秒） */
  expiresIn?: number
}

/**
 * 图形验证码请求
 */
export interface ICaptchaRequest {
  /** 类型 */
  type: string
  /** 验证码业务域 */
  scope?: 'distributor' | 'member'
  /** 公司ID（可选，HTTP 插件会自动添加） */
  company_id?: string
}

/**
 * 图形验证码响应
 */
export interface ICaptchaResponse {
  /** 验证码图片数据（base64） */
  imageData: string
  /** 验证码 token（用于验证时提交） */
  imageToken: string
  /** 验证码有效期（秒） */
  expiresIn?: number
}

/**
 * 用户信息
 */
export interface IUserInfo {
  /** 用户 ID */
  user_id: string | number
  /** 用户名 */
  username?: string
  /** 手机号 */
  mobile: string
  /** 邮箱 */
  email?: string
  /** 头像 */
  avatar?: string
}

/**
 * 登录响应
 */
export interface ILoginResponse {
  /** JWT Token */
  token: string | null
  /** 新登录接口业务状态，0 表示失败 */
  status?: number
  /** 新登录接口失败提示 */
  error_message?: string
}

/**
 * 忘记密码请求
 */
export interface IForgotPasswordRequest {
  /** 手机号 */
  mobile: string
  /** 新密码 */
  password: string
  /** 短信验证码 */
  vcode: string
}

/**
 * 登出请求
 */
export interface ILogoutRequest {
  /** Token（可选，可从header获取） */
  token?: string
}

/**
 * 登出响应
 */
export interface ILogoutResponse {
  /** 是否成功 */
  success: boolean
  /** 提示信息 */
  message?: string
}

/**
 * 获取用户信息响应
 */
export interface IGetUserInfoResponse {
  /** 用户信息 */
  memberInfo: IUserInfo
}
