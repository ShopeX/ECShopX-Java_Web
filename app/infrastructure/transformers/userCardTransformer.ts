import { CouponDisplayTransformer, type ICouponModel } from './couponDisplayTransformer'

export type IUserCardModel = ICouponModel

export class UserCardTransformer {
  /**
   * 优惠券列表响应 -> 用户优惠券模型列表
   */
  static toUserCardList(response: any): IUserCardModel[] {
    const list = response?.list || response || []
    return (Array.isArray(list) ? list : []).map((item: any) =>
      CouponDisplayTransformer.toCouponModel(item)
    )
  }
}
