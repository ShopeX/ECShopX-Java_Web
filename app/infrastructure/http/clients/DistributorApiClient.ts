import type { IDistributorIsValidResponse } from '~/types/api/distributor'

/**
 * 分销商 / 线上门店 API 客户端
 */
export class DistributorApiClient {
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
   * 获取 B2C 默认线上门店（小程序 is_valid 同源接口）
   */
  async getDefaultDistributor(): Promise<IDistributorIsValidResponse> {
    return this.http('/wxapp/distributor/is_valid', {
      method: 'GET',
      cache: 'default',
    })
  }
}

export const distributorApiClient = new DistributorApiClient()
