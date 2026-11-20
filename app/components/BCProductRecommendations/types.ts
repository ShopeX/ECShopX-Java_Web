import type { IMarketingTag } from '~/utils/promotionTags'

export interface ProductRecommendation {
  id: string
  name: string
  /** 销售价（元） */
  price: number
  marketPrice?: number
  memberPrice?: number
  activityPrice?: number
  image: string
  matchedMainItemId?: string
  distributorId?: number
  marketingTags?: IMarketingTag[]
}
