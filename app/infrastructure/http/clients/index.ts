/**
 * HTTP 客户端统一导出
 *
 * HTTP 客户端职责：
 * - 封装 HTTP 请求
 * - 处理网络通信
 * - 返回原始 API 响应
 * - 不包含业务逻辑
 * - 不包含数据转换
 *
 * 使用方式：
 * ```typescript
 * import { cartApiClient, itemApiClient } from '~/infrastructure/http/clients'
 *
 * // 在 Composable 中使用
 * const response = await cartApiClient.getCartList()
 * const items = response.data.items
 *
 * // 如需增强数据，使用 Transformer
 * const enhancedItems = CartTransformer.enhanceCartList(items)
 * ```
 */

export { CartApiClient, cartApiClient } from './CartApiClient'
export { ItemApiClient, itemApiClient } from './ItemApiClient'
export { AuthApiClient, authApiClient } from './AuthApiClient'
export { TemplateApiClient, templateApiClient } from './TemplateApiClient'
export { OrderApiClient, orderApiClient } from './OrderApiClient'
export { AddressApiClient, addressApiClient } from './AddressApiClient'
export { CouponApiClient, couponApiClient } from './CouponApiClient'
export { PaymentApiClient, paymentApiClient } from './PaymentApiClient'
export { DepositApiClient, depositApiClient } from './DepositApiClient'
export { PointApiClient, pointApiClient } from './PointApiClient'
export { CollectApiClient, collectApiClient } from './CollectApiClient'
export { CollectDistributionApiClient, collectDistributionApiClient } from './CollectDistributionApiClient'
export { RateApiClient, rateApiClient } from './RateApiClient'
export { AftersalesApiClient, aftersalesApiClient } from './AftersalesApiClient'
export { InvoiceApiClient, invoiceApiClient } from './InvoiceApiClient'
export { StoreApiClient, storeApiClient } from './StoreApiClient'
export { CommonApiClient, commonApiClient } from './CommonApiClient'
export { DistributorApiClient, distributorApiClient } from './DistributorApiClient'
export { UploadApiClient, uploadApiClient } from './UploadApiClient'
export {
  RegistrationApiClient,
  registrationApiClient,
} from './RegistrationApiClient'
