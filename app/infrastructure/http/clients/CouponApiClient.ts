/**
 * 优惠券 HTTP 客户端
 *
 * 职责：
 * - 封装优惠券相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 */

export interface IGetCouponListParams {
  distributor_id?: string
  total_fee?: number
}

export interface IGetUserCardListParams {
  status?: string
  cart_type?: string
  page?: number
  pageSize?: number
  scope_type?: string
  source_type?: string
  source_id?: number
}

export class CouponApiClient {
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

  /**
   * 获取可用优惠券列表
   *
   * @param params - 查询参数
   * @returns 原始 API 响应
   */
  async getCouponList(params?: IGetCouponListParams): Promise<any> {
    return this.http('/wxapp/user/newGetCardList', {
      method: 'GET',
      query: params,
    })
  }

  /**
   * 获取用户优惠券列表
   *
   * @param params - 查询参数
   * @returns 原始 API 响应
   */
  async getUserCardList(params?: IGetUserCardListParams): Promise<any> {
    return this.http('/wxapp/user/getUserCardList', {
      method: 'GET',
      query: params,
    })
  }
}

export const couponApiClient = new CouponApiClient()
