/**
 * 订单领域模型类型定义
 */

import type { OrderStatus } from '../api/order'

/**
 * 订单商品项(领域模型)
 */
export interface IOrderItem {
  itemId: string
  itemName: string
  itemImage: string
  specName: string
  quantity: number
  price: number // 单位:元
  subtotal: number // 小计:元
}

/**
 * 订单(领域模型)
 */
export interface IOrder {
  orderId: string
  orderTime: string
  status: OrderStatus
  statusText: string // 状态文本
  items: IOrderItem[]
  totalAmount: number // 单位:元
  shippingAddress?: string
  // 操作按钮
  canCancel: boolean // 可以取消
  canPay: boolean // 可以支付
  canConfirmReceipt: boolean // 可以确认收货
  canDelete: boolean // 可以删除
}
