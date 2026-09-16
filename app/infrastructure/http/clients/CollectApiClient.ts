/**
 * 收藏商品 HTTP 客户端
 *
 * 职责：
 * - 封装会员收藏商品相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 */

export interface IGetCollectItemListParams {
  page?: number
  pageSize?: number
}

export interface IAddCollectItemParams {
  itemType?: string
}

export class CollectApiClient {
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
   * 获取会员收藏商品列表
   *
   * @param params - 查询参数（分页等，以 Apifox 文档为准）
   * @returns 原始 API 响应
   */
  async getCollectItemList(params?: IGetCollectItemListParams): Promise<any> {
    return this.http('/wxapp/member/collect/item', {
      method: 'GET',
      query: params,
    })
  }

  async addCollectItem(itemId: string | number, params?: IAddCollectItemParams): Promise<any> {
    return this.http(`/wxapp/member/collect/item/${itemId}`, {
      method: 'POST',
      body: {
        item_id: String(itemId),
        item_type: params?.itemType ?? 'normal',
      },
    })
  }

  async removeCollectItems(
    itemIds: Array<string | number>,
    isEmpty: boolean = false
  ): Promise<any> {
    return this.http('/wxapp/member/collect/item', {
      method: 'DELETE',
      body: {
        item_ids: itemIds.map((itemId) => String(itemId)).join(','),
        is_empty: String(isEmpty),
      },
    })
  }
}

export const collectApiClient = new CollectApiClient()
