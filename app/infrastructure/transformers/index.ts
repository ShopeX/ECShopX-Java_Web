/**
 * 数据转换器统一导出
 *
 * 转换器职责：
 * - 在不同层之间转换数据格式
 * - API 响应 ↔ 领域模型 ↔ UI 数据
 * - 纯函数，无副作用，易于测试
 *
 * 优势：
 * - 集中管理数据转换逻辑
 * - 解耦层与层之间的数据格式
 * - 类型安全
 * - 易于单元测试
 */

export { CartTransformer } from './cartTransformer'
export { ProductTransformer } from './productTransformer'
export { AuthTransformer, type ILoginModel } from './authTransformer'
export { OrderTransformer } from './orderTransformer'
export { UserCardTransformer, type IUserCardModel } from './userCardTransformer'
export { CollectItemTransformer, type IFavoriteProduct } from './collectItemTransformer'
export {
  CollectDistributionTransformer,
  type IFollowedStoreCard,
  type IFollowedStorePreviewItem,
} from './collectDistributionTransformer'
export {
  CouponDisplayTransformer,
  type ICouponModel,
  type CouponCardType,
} from './couponDisplayTransformer'
export type { IOrderCalculateModel, IAddressModel } from './orderTransformer'
export {
  RegistrationTransformer,
  type IRegistrationActivityListItem,
  type IRegistrationRecordListItem,
  type IRegistrationRecordDetail,
  type IRegistrationActivityDetail,
  type IRegistrationFormTemplate,
  type IRegistrationField,
  type IRegistrationSection,
  type ActivityLifecycleStatus,
} from './registrationTransformer'
