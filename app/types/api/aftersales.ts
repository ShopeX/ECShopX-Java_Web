export type AftersalesTabKey =
  | 'all'
  | 'pending'
  | 'processing'
  | 'processed'
  | 'rejected'
  | 'closed'

export interface IAftersalesListRequest {
  page?: number
  pageSize?: number
  order_type?: string
  aftersales_type?: string
  aftersales_status?: string
  order_id?: string
}

export interface IAftersalesDetailRequest {
  aftersales_bn: string
  item_id: string
}

export interface IApiAftersalesRecord {
  aftersales_bn?: string
  aftersales_id?: string
  order_id?: string
  aftersales_status?: string
  aftersales_status_name?: string
  status?: string
  status_name?: string
  store_name?: string
  shop_name?: string
  distributor_name?: string
  refund_amount?: number | string
  refund_fee?: number | string
  refund_money?: number | string
  amount?: number | string
  detail?: any[]
  item_infos?: any[]
  items?: any[]
  order_items?: any[]
  distributor_info?: {
    store_name?: string
    name?: string
  }
  [key: string]: any
}

export interface IAftersalesListResponse {
  data?: {
    total_count?: number
    list?: IApiAftersalesRecord[]
  }
  list?: IApiAftersalesRecord[]
  total_count?: number
  [key: string]: any
}

export interface IAftersalesOrderItem {
  detailId?: string
  itemId: string
  itemName: string
  itemImage: string
  specName: string
  skuNo: string
  style: string
  size: string
  quantity: number
  price: number
}

export interface IAftersalesOrderModel {
  aftersalesId: string
  orderId: string
  status: string
  statusText: string
  storeName: string
  refundAmount: number
  items: IAftersalesOrderItem[]
  itemCount: number
}

export interface IAftersalesListModel {
  orders: IAftersalesOrderModel[]
  total: number
}

export interface IAftersalesProgressStep {
  key: string
  label: string
  active: boolean
}

export interface IAftersalesDetailModel {
  aftersalesId: string
  orderId: string
  status: string
  statusText: string
  progressText: string
  actionButtons: Array<{
    type: string
    name: string
  }>
  progressSteps: Array<{
    key: string
    label: string
    active: boolean
  }>
  storeName: string
  items: IAftersalesOrderItem[]
  itemCount: number
  refundAmount: number
  receiverName: string
  receiverMobile: string
  receiverAddress: string
  reason: string
  description: string
  evidencePics: string[]
  paymentMethod: string
  payTime: string
  orderTime: string
  goodsAmount: number
  freightAmount: number
  discountAmount: number
  pointDeductionAmount: number
  paidAmount: number
}
