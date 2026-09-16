/**
 * 评价 HTTP 客户端
 *
 * 职责：
 * - 封装订单评价相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 */

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
}

export const rateApiClient = new RateApiClient()
