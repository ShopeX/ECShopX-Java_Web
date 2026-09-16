/**
 * 订单相关 API 类型定义
 */

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  ALL = 'all', // 全部
  PENDING_PAYMENT = 'pending_payment', // 待付款
  PENDING_SHIPMENT = 'pending_shipment', // 待发货
  SHIPPED = 'shipped', // 待收货
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
  PENDING_PICKUP = 'pending_pickup', // 待自提
  AFTER_SALES = 'after_sales', // 售后
  PENDING_REVIEW = 'pending_review', // 待评价
}

/**
 * 订单商品项(API 响应)
 */
export interface IApiOrderItem {
  item_id: string
  item_name?: string
  title?: string
  item_image?: string
  item_pic?: string
  spec_name?: string
  quantity?: number
  num?: number
  buy_num?: number
  goods_num?: number
  item_num?: number
  product_num?: number
  price: number // 单位:分
  [key: string]: any
}

/**
 * 订单(API 响应)
 */
export interface IApiOrder {
  order_id: string
  order_time?: string
  create_time?: string | number
  status?: string
  order_status?: string
  delivery_status?: string
  cancel_status?: string
  pay_status?: string
  total_amount?: number // 单位:分
  total_fee?: string | number
  receiver_name?: string
  receiver_mobile?: string
  shipping_address?: string
  items?: IApiOrderItem[]
  item_infos?: IApiOrderItem[]
  [key: string]: any
}

/**
 * 订单列表请求参数
 */
export interface IOrderListRequest {
  status?: string | number
  page?: number
  pageSize?: number
  order_id?: string
  mobile?: string
  time_start_begin?: string
  time_start_end?: string
  is_rate?: string
}

/**
 * 订单列表响应
 */
export interface IOrderListResponse {
  list: IApiOrder[]
  total_count?: number
  page?: number
  pageSize?: number
  pager?: {
    count?: number
    page_no?: number
    page_size?: number
  }
  [key: string]: any
}

/**
 * 物流轨迹节点(前端模型)
 */
export interface ILogisticsTrace {
  time: string
  content: string
}

export interface IApiTrackerPullTrace {
  AcceptTime?: string
  AcceptStation?: string
}

export interface ITrackerPullResponse {
  data?: IApiTrackerPullTrace[]
  [key: string]: any
}

/**
 * 订单详情 API 响应
 */
export interface IApiOrderDetail extends IApiOrder {
  item_fee?: number
  freight_fee?: number
  discount_fee?: number
  point_fee?: number
  logistics_no?: string
  logistics_company?: string
  logistics_traces?: Array<{ time: string; content: string }>
  pay_time?: string | number
  receipt_type?: string
  invoice_type?: string
  invoice_info?: string
  store_name?: string
  shop_name?: string
}

/**
 * 订单详情前端展示模型
 */
export interface IOrderDetailModel {
  orderId: string
  orderTime: string
  status: string
  statusText: string
  payStatus: string
  isPaid: boolean
  items: any[]
  totalAmount: number
  receiverName: string
  receiverMobile: string
  shippingAddress: string
  itemFee: string
  freightFee: string
  discountFee: string
  pointFee: string
  totalFee: string
  logisticsNo: string
  logisticsCompany: string
  logisticsTraces: ILogisticsTrace[]
  payTime: string
  shippingMethod: string
  invoiceInfo: string
  storeName: string
  canCancel: boolean
  canPay: boolean
  canConfirmReceipt: boolean
  canInvoice: boolean
  canDelete: boolean
  canApplyAftersales: boolean
  canViewLogistics: boolean
}
