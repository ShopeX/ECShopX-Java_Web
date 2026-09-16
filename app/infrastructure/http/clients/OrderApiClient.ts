/**
 * 订单 HTTP 客户端
 *
 * 职责：
 * - 封装订单相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 */

import type { CancelOrderPayload } from '~/utils/orderCancel'

export interface ICalculateOrderRequest {
  distributor_id: string
  shop_id?: string
  cart_type: 'normal' | 'fastbuy'
  order_type?: string
  receipt_type: 'express' | 'ziti' | 'merchant'
  receiver_state?: string
  receiver_city?: string
  receiver_district?: string
  receiver_address?: string
  pickup_location?: string
  subdistrict_parent_id?: string
  subdistrict_id?: string
  not_use_coupon?: number
  coupon_discount?: string
  point_use?: number
  promotion?: string
  bargain_id?: string
  seckill_id?: string
  ticket?: string
  groups_activity_id?: string
  pay_type?: string
  isNostores?: number
}

/**
 * 创建订单请求体（与 Apifox 接口 ID 368677487 POST /order_new 请求参数一致）
 * 以 Apifox 请求参数列表为准：invoice_content、pack 为 string 类型。
 */
export interface ICreateOrderRequest {
  /** 分销商ID（必填） */
  distributor_id: string
  /** 店铺ID */
  shop_id?: string
  /** 购物车类型：normal-普通，fastbuy-立即购买，cxd-导购（必填） */
  cart_type: 'normal' | 'fastbuy' | 'cxd'
  /** 订单类型：normal-普通，bargain-砍价，seckill-秒杀，group-拼团 */
  order_type?: 'normal' | 'bargain' | 'seckill' | 'group' | 'normal_shopguide'
  /** 收货方式：express-快递，ziti-自提，merchant-商家配送（必填） */
  receipt_type: 'logistics' | 'express' | 'ziti' | 'merchant'
  /** 支付方式：wxpay-微信支付，alipay-支付宝，deposit-余额，point-积分（必填） */
  pay_type: 'wxpay' | 'alipay' | 'deposit' | 'point' | 'wxpayjs' | 'alipayjs'
  /** 收货人姓名（快递配送时必填） */
  receiver_name?: string
  /** 收货人手机号（快递配送时必填） */
  receiver_mobile?: string
  /** 省份（快递配送时必填） */
  receiver_state?: string
  /** 城市（快递配送时必填） */
  receiver_city?: string
  /** 区县（快递配送时必填） */
  receiver_district?: string
  /** 详细地址（快递配送时必填） */
  receiver_address?: string
  /** 邮编 */
  receiver_zip?: string
  /** 自提点ID（自提时必填） */
  pickup_location?: string
  /** 自提日期（自提时必填） */
  pickup_date?: string
  /** 自提时间段（自提时必填） */
  pickup_time?: string
  /** 配送时间（商家配送时可选） */
  self_delivery_time?: string
  /** 街道ID（可选） */
  subdistrict_parent_id?: string
  /** 社区ID（可选） */
  subdistrict_id?: string
  /** 楼栋号（可选） */
  building_number?: string
  /** 门牌号（可选） */
  house_number?: string
  /** 是否不使用优惠券：0-使用，1-不使用（Apifox: integer，default 1） */
  not_use_coupon?: number
  /** 优惠券代码（使用优惠券时必填） */
  coupon_discount?: string
  /** 使用积分数量（Apifox: number） */
  point_use?: number
  /** 订单备注 */
  remark?: string
  /** 发票类型：normal-普通发票，electronic-电子发票 */
  invoice_type?: string
  /** 发票内容（Apifox 类型为 string，传对象时需 JSON.stringify） */
  invoice_content?: string
  /** 打包信息（Apifox 类型为 string，传对象时需 JSON.stringify） */
  pack?: string
  /** 砍价活动ID */
  bargain_id?: string
  /** 秒杀活动ID */
  seckill_id?: string
  /** 秒杀凭证 */
  ticket?: string
  /** 拼团活动ID */
  groups_activity_id?: string
  /** 导购员ID */
  salesman_id?: string
  /** 工作用户ID */
  work_userid?: string
  /** 是否非门店：0-门店，1-非门店（Apifox: integer，default 0） */
  isNostores?: number
  /** 促销类型（Apifox: default "normal"） */
  promotion?: string
}

/**
 * POST /order_new 创建订单接口的 200 响应体
 * 来源：/paths/_order_new.json responses.200 schema（业务成功时 http 插件会解包 data，此处为解包后的 data 内容）
 */
export interface ICreateOrderResponse {
  /** 订单ID */
  order_id: string
  /** 订单类型 */
  order_type: string
  /** 支付方式 */
  pay_type: string
  /** 团队/店铺标识 */
  team_id: string
  /** 订单金额（单位以接口为准） */
  total_fee: number
}

export interface IGetOrderLogisticsParams {
  orderId: string
  orderType?: string
}

export class OrderApiClient {
  private $api: any

  constructor() {
    // 不在构造函数中初始化，延迟到第一次使用时
  }

  /**
   * 获取 HTTP 实例（延迟初始化，SSR 安全）
   */
  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 计算订单金额
   *
   * @param params - 计算订单金额的参数
   * @returns 原始 API 响应
   */
  async calculateOrder(params: ICalculateOrderRequest, options?: any): Promise<any> {
    return this.http('/wxapp/getFreightFee', {
      method: 'POST',
      body: params,
      ...options,
    } as any)
  }

  /**
   * 创建订单（H5/APP）POST /order_new，Apifox 接口 ID 368677487
   *
   * @param params - 创建订单的参数
   * @returns 创建订单 API 响应
   */
  async createOrder(params: ICreateOrderRequest, options?: any): Promise<ICreateOrderResponse> {
    return this.http('/wxapp/order_new', {
      method: 'POST',
      body: params,
      ...options,
    } as any)
  }

  /**
   * 获取订单列表
   */
  async getOrderList(params?: {
    status?: string | number
    page?: number
    pageSize?: number
    is_rate?: string
  }): Promise<any> {
    return this.http('/wxapp/orders', {
      method: 'GET',
      query: {
        status: params?.status !== undefined ? params?.status : 0,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        order_type: 'normal',
        ...(params?.is_rate && { is_rate: params.is_rate }),
      },
    })
  }

  /**
   * 取消订单
   */
  async cancelOrder(payload: CancelOrderPayload): Promise<any> {
    return this.http('/wxapp/order/cancel', {
      method: 'POST',
      body: payload,
    })
  }

  /**
   * 确认收货
   */
  async confirmReceipt(orderId: string): Promise<any> {
    return this.http('/wxapp/order/confirmReceipt', {
      method: 'POST',
      body: { order_id: orderId },
    })
  }

  /**
   * 删除订单
   */
  async deleteOrder(orderId: string): Promise<any> {
    return this.http('/wxapp/order/delete', {
      method: 'POST',
      body: { order_id: orderId },
    })
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(orderId: string): Promise<any> {
    return this.http(`/wxapp/order/${orderId}`, {
      method: 'GET',
    })
  }

  /**
   * 查询订单物流轨迹
   */
  async getOrderLogistics(params: IGetOrderLogisticsParams, options?: any): Promise<any> {
    return this.http('/wxapp/trackerpull', {
      method: 'POST',
      query: {
        order_type: params.orderType || 'normal',
        order_id: params.orderId,
      },
      ...options,
    })
  }
}

export const orderApiClient = new OrderApiClient()
