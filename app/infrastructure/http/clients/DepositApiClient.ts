/**
 * 会员储值相关 HTTP 客户端
 *
 * 职责：封装储值余额查询等 HTTP 请求
 */

/** 储值余额信息（deposit 单位：分） */
export interface IDepositInfoItem {
  company_id?: string
  user_id?: string
  deposit?: string | number
  [key: string]: any
}

/** 获取储值余额 - 200 响应（HTTP 插件可能已解包一层 data） */
export interface IGetDepositInfoResponse {
  data?: IDepositInfoItem
  company_id?: string
  user_id?: string
  deposit?: string | number
}

export class DepositApiClient {
  private $api: any

  constructor() {}

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 获取会员储值余额
   * GET /deposit/info
   */
  async getDepositInfo(): Promise<IGetDepositInfoResponse> {
    return this.http('/wxapp/deposit/info', {
      method: 'GET',
    })
  }
}

export const depositApiClient = new DepositApiClient()
