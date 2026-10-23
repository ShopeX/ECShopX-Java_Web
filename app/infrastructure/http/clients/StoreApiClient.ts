/**
 * 门店 API 客户端
 *
 * 职责：封装门店/自提点相关的 HTTP 请求
 */

export interface IStoreListParams {
  province?: string
  city?: string
  lat?: number
  lng?: number
  page?: number
  page_size?: number
}

export interface IStoreItem {
  store_id: string
  store_name: string
  address: string
  telephone: string
  province?: string
  city?: string
  district?: string
  lat?: number
  lng?: number
}

export class StoreApiClient {
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
   * 获取门店/自提点列表
   */
  async getStoreList(params?: IStoreListParams) {
    return this.http('/wxapp/store/list', {
      method: 'GET',
      params,
    })
  }

  /**
   * 获取协议内容（隐私政策、销售条款等）
   */
  async getProtocol(type: string): Promise<{ content: string; title: string }> {
    return this.http('/wxapp/shops/protocol', {
      method: 'GET',
      params: { type },
    })
  }
}

export const storeApiClient = new StoreApiClient()
