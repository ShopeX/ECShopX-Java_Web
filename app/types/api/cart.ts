/**
 * 购物车 API 类型定义
 *
 * 基于 Apifox MCP 购物车 API 规范
 */

import type { IApiResponse } from './common'

/**
 * 购物车商品项接口（真实 API 结构）
 */
export interface ICartItem {
  /** 购物车项 ID */
  cart_id: string
  /** 商品 ID */
  item_id: string
  /** 商品 ID（备用） */
  goods_id: string
  /** 商品名称 */
  item_name: string
  /** 商品图片 URL */
  pics: string
  /** 商品规格描述 */
  item_spec_desc?: string
  /** 单价（字符串格式） */
  price: string | number
  /** 市场价 */
  market_price?: string | number
  /** 会员价（分） */
  member_price?: string | number
  /** 活动价（分） */
  activity_price?: string | number
  /** 组合价（分） */
  package_price?: string | number
  /** 数量 */
  num: number
  /** 库存 */
  store: number
  /** 是否选中 */
  is_checked: boolean
  /** 公司 ID */
  company_id?: string
  /** 创建时间 */
  created?: number
  /** 更新时间 */
  updated?: number
  /** 其他字段 */
  [key: string]: any
}

/**
 * 购物车列表响应接口
 */
export interface ICartListResponse {
  /** 购物车商品列表 */
  items: ICartItem[]
  /** 商品总数量 */
  total_count: number
  /** 选中商品总价 */
  selected_total: number
  /** 选中商品数量 */
  selected_count: number
}

/**
 * 添加商品到购物车请求接口
 */
export interface IAddCartRequest {
  /** 商品ID */
  item_id: string
  /** 数量 */
  num: number
  /** 分销商ID */
  distributor_id: string
  /** 购物车类型：cart-普通，fastbuy-立即购买 */
  cart_type: 'cart' | 'fastbuy'
  /** 店铺类型：distributor-分销商，drug-药品，pointsmall-积分商城 */
  shop_type: 'distributor' | 'drug' | 'pointsmall'
}

/**
 * 添加商品到购物车响应接口
 */
export interface IAddCartResponse {
  /** 购物车项 ID */
  id: string
  /** 购物车商品总数 */
  cart_count: number
}

/**
 * 更新购物车商品请求接口
 */
export interface IUpdateCartRequest {
  /** 数量 */
  quantity: number
  /** 是否选中 (可选) */
  selected?: boolean
}

/**
 * 批量删除购物车商品请求接口
 */
export interface IBatchRemoveCartRequest {
  /** 购物车项 ID 数组 */
  ids: string[]
}

/**
 * 购物车统计信息接口
 */
export interface ICartStatistics {
  /** 商品总数量 */
  total_count: number
  /** 商品总价 */
  total_price: number
  /** 选中商品数量 */
  selected_count: number
  /** 选中商品总价 */
  selected_total: number
}

/**
 * 购物车 API 响应类型
 */
export type CartListApiResponse = IApiResponse<ICartListResponse>
export type AddCartApiResponse = IApiResponse<IAddCartResponse>
export type UpdateCartApiResponse = IApiResponse<void>
export type RemoveCartApiResponse = IApiResponse<void>
export type ClearCartApiResponse = IApiResponse<void>
