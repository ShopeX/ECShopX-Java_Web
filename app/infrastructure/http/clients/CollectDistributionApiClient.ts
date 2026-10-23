export interface IGetCollectDistributionListParams {
  page?: number
  pageSize?: number
}

export class CollectDistributionApiClient {
  private $api: any

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  async getCollectDistributionList(params?: IGetCollectDistributionListParams): Promise<any> {
    return this.http('/wxapp/member/collect/distribution', {
      method: 'GET',
      query: params,
    })
  }

  async removeCollectDistributions(
    distributionIds: Array<string | number>,
    isEmpty: boolean = false
  ): Promise<any> {
    return this.http('/wxapp/member/collect/distribution', {
      method: 'DELETE',
      body: {
        distribution_ids: distributionIds.map((id) => String(id)).join(','),
        is_empty: String(isEmpty),
      },
    })
  }
}

export const collectDistributionApiClient = new CollectDistributionApiClient()
