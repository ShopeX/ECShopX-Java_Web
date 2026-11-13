import type { ProductRecommendation } from '~/components/BCProductRecommendations/types'
import { pickItemImage } from '~/utils/pickItemImage'
import { mapPromotionTags } from '~/utils/promotionTags'

export class RecommendLikeTransformer {
  static toRecommendationList(response: any): ProductRecommendation[] {
    const list = response?.data?.list ?? response?.list ?? []
    const items = Array.isArray(list) ? list : []

    return items.map((item: any) => ({
      id: String(item.goods_id ?? item.itemId ?? item.item_id ?? ''),
      name: String(item.item_name ?? item.itemName ?? ''),
      price: Number(item.price ?? 0) / 100,
      image: pickItemImage(item),
      marketingTags: mapPromotionTags(item),
    }))
  }
}
