/**
 * 评价 HTTP 客户端
 *
 * 职责：
 * - 封装订单评价相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 */

import type {
  IRateListResponse,
  IReplyRateListParams,
  IReplyRateListResponse,
} from '~/types/api/rate'

export interface IRateItem {
  item_id: string
  content: string
  star: string // "1" | "2" | "3" | "4" | "5"
  pics?: string[]
}

export interface ICreateRateParams {
  order_id: string
  anonymous?: string // "0" | "1"
  rates: IRateItem[]
}

export interface IRateListParams {
  item_id: string
  page?: string
  pageSize?: string
}

export class RateApiClient {
  private $api: any

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 提交订单评价
   * POST /wxapp/order/rate/create
   *
   * 将 rates 数组展开为 indexed query params 格式：
   * rates[0][item_id]=xxx&rates[0][content]=xxx&rates[0][star]=5&rates[0][pics][0]=https://...
   */
  async submitRate(params: ICreateRateParams): Promise<any> {
    const query: Record<string, string> = {
      order_id: params.order_id,
    }

    if (params.anonymous !== undefined) {
      query['anonymous'] = params.anonymous
    }

    params.rates.forEach((rate, i) => {
      query[`rates[${i}][item_id]`] = rate.item_id
      query[`rates[${i}][content]`] = rate.content
      query[`rates[${i}][star]`] = rate.star
      if (rate.pics) {
        rate.pics.forEach((pic, j) => {
          query[`rates[${i}][pics][${j}]`] = pic
        })
      }
    })

    return this.http('/wxapp/order/rate/create', {
      method: 'POST',
      query,
    })
  }

  /**
   * 获取商品评价列表
   * GET /wxapp/order/rate/list
   *
   * 与小程序 api.item.evaluationList 同源
   */
  async getRateList(params: IRateListParams): Promise<IRateListResponse> {
    const { item_id, page, pageSize } = params
    return this.http('/wxapp/order/rate/list', {
      method: 'GET',
      query: {
        page,
        pageSize,
        item_id,
      },
      cache: 'default',
    })
  }

  /**
   * 获取评价回复列表
   * GET /wxapp/order/replyRate/list
   */
  async getReplyRateList(params: IReplyRateListParams): Promise<IReplyRateListResponse> {
    const { rate_id, item_id, page, pageSize } = params
    return this.http('/wxapp/order/replyRate/list', {
      method: 'GET',
      query: {
        rate_id,
        page,
        pageSize,
        ...(item_id ? { item_id } : {}),
      },
      cache: 'default',
    })
  }
}

export const rateApiClient = new RateApiClient()
