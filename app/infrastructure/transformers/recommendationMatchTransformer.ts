import type { ProductRecommendation } from '~/components/BCProductRecommendations/types'
import { pickItemImage } from '~/utils/pickItemImage'
import { mapPromotionTags } from '~/utils/promotionTags'

export class RecommendationMatchTransformer {
  static toRecommendationList(response: any): ProductRecommendation[] {
    const items = response?.items ?? []
    const list = Array.isArray(items) ? items : []

    return list.map((item: any) => {
      const price = Number(item.price ?? 0) / 100
      const marketPrice = this.toYuan(item.market_price ?? item.marketPrice)
      const memberPrice = this.toYuan(item.member_price ?? item.memberPrice)
      const activityPrice = this.toYuan(item.activity_price ?? item.activityPrice)

      const matchedMainItemId = item.matched_main_item_id ?? item.matchedMainItemId

      return {
        id: String(item.item_id ?? item.goods_id ?? item.itemId ?? ''),
        name: String(item.item_name ?? item.itemName ?? ''),
        price,
        ...(marketPrice != null ? { marketPrice } : {}),
        ...(memberPrice != null ? { memberPrice } : {}),
        ...(activityPrice != null ? { activityPrice } : {}),
        ...(matchedMainItemId != null && matchedMainItemId !== ''
          ? { matchedMainItemId: String(matchedMainItemId) }
          : {}),
        ...(item.distributor_id != null
          ? { distributorId: Number(item.distributor_id) }
          : {}),
        image: pickItemImage(item),
        marketingTags: mapPromotionTags(item),
      }
    })
  }

  private static toYuan(value: unknown): number | undefined {
    if (value == null || value === '') return undefined

    const num = Number(value) / 100
    return Number.isFinite(num) ? num : undefined
  }
}
