export interface IFollowedStorePreviewItem {
  id: string
  itemId: string
  title: string
  image: string
  priceText: string
}

export interface IFollowedStoreCard {
  id: string
  distributorId: string
  storeName: string
  slogan: string
  logo: string
  items: IFollowedStorePreviewItem[]
}

export class CollectDistributionTransformer {
  static toFollowedStoreList(payload: any): IFollowedStoreCard[] {
    const source = payload?.data ?? payload ?? {}
    const list = Array.isArray(source.list) ? source.list : []

    return list.map((record: any) => {
      const items = Array.isArray(
        record.items || record.item_infos || record.goods_list || record.list
      )
        ? record.items || record.item_infos || record.goods_list || record.list
        : []

      return {
        id: String(record.distribution_id || record.distributor_id || record.id || ''),
        distributorId: String(record.distributor_id || record.distribution_id || record.id || ''),
        storeName: String(
          record.store_name || record.shop_name || record.distributor_name || record.name || ''
        ),
        slogan: String(
          record.slogan || record.description || record.subtitle || record.intro || ''
        ),
        logo: String(
          record.logo || record.store_logo || record.logo_image || record.shop_logo || ''
        ),
        items: items.slice(0, 4).map((item: any) => ({
          id: String(item.item_id || item.goods_id || item.id || ''),
          itemId: String(item.item_id || item.goods_id || item.id || ''),
          title: String(item.item_name || item.name || item.title || ''),
          image: String(
            item.image ||
              item.pic ||
              item.image_default_id ||
              item.default_image ||
              item.image_url ||
              ''
          ),
          priceText: CollectDistributionTransformer.formatPriceText(
            item.price || item.sale_price || item.sales_price || item.amount || 0
          ),
        })),
      }
    })
  }

  private static formatPriceText(value: unknown): string {
    const amount = Number(value || 0) || 0
    return `￥${amount.toFixed(2)}`
  }
}
