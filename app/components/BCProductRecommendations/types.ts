import type { IMarketingTag } from '~/utils/promotionTags'

export interface ProductRecommendation {
  id: string
  name: string
  price: number
  marketPrice?: number
  image: string
  matchedMainItemId?: string
  distributorId?: number
  marketingTags?: IMarketingTag[]
}
