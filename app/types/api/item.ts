import type { PaginationParams, PaginationResponse } from './common'

// 商品源数据接口 - 基于 ItemDetailTransformer 的字段映射
export interface IItem {
  // 基础标识信息
  item_id: string
  item_bn: string
  itemName: string
  brief: string
  intro?: string | null


  // 图片信息
  pics: string[]

  // 价格信息（后端返回的是分，需要转换）
  price: number
  activity_price: number
  market_price: number
  member_price: number
  vip_price: number
  svip_price: number
  package_price: number

  // 销售信息
  sales: number
  sales_setting: any

  // 库存和限制信息
  limit_num: number
  purchase_limit_num_by_cart: number
  purchase_limit_num_by_fastbuy: number
  start_num: number

  // 商品状态和类型
  is_gift: boolean
  is_point: boolean
  nospec: boolean
  item_type: string
  approve_status: string

  // 商品规格和参数
  item_spec_desc: string
  item_params: any[]
  item_unit: string

  // 促销活动信息
  promotion_activity: any
  activity_info: any
  activity_type: string

  // 店铺信息
  store: any
  store_setting: any
  company_id: string

  // 其他信息
  point: number
  vipgrade_guide_title: string
  kaquan_list: any[]
  groups_list: any[]
  regions: any[]
}

// 商品列表项类型别名（与 IItem 相同）
export type IProductListItem = IItem

// 商品列表请求参数接口 - 基于实际API文档
export interface IItemListParams {
  // 必需参数
  page: string
  pageSize: string
  item_type: string
  /** 管理分类 ID（link_type=category 时使用，与 sale_category 的 category_id 二选一） */
  main_category?: string
  is_tdk: string
  type: string

  // 可选参数（HTTP 插件会自动添加 company_id）
  company_id?: string
  brand_id?: string
  sort?: string
  start_price?: number
  end_price?: number
  keywords?: string
  distributor_id?: string
  /** 销售分类 ID（link_type=sale_category 时使用，不传 main_category） */
  category_id?: string | number
}

// 原始 API 响应结构
export interface IItemListApiResponse {
  data: {
    total_count: number
    list: IItem[]
    brand_list: {
      total_count: number
      list: IBrand[]
    }
    newFilter: any
    select_tags_list: any[]
    cur: {
      id: string
      currency: string
      title: string
      symbol: string
      rate: number
      is_default: boolean
    }
    tdk_data: {
      title: string
      mate_description: string
      mate_keywords: string
    }
  }
}

// 处理后的响应结构 - 用于前端使用
export interface IItemListResponse {
  list: IItem[]
  total_count: number
  brand_list: IBrand[]
}

// 商品详情请求参数接口
export interface IItemDetailParams {
  id: string | number
  /** BBC 模式下影响会员价/活动价计算 */
  distributor_id?: string | number
}

// 商品详情响应接口
export interface IItemDetailResponse {
  item: IItem
}

// 品牌信息接口 - 基于实际API响应
export interface IBrand {
  attribute_id: string
  company_id: string
  shop_id: string
  attribute_type: string
  attribute_name: string
  attribute_memo: string
  attribute_sort: string
  distributor_id: string
  is_show: string
  is_image: string
  image_url: string
  created: number
  updated: number
  attribute_code: string | null
  attribute_show: string | null
}

// 商品评价列表请求参数
export interface ItemEvaluationListParams extends PaginationParams {
  item_id: string
  rate_type?: 'good' | 'neutral' | 'bad'
  has_photo?: boolean
}

// 商品评价列表响应
export interface ItemEvaluationListResponse
  extends PaginationResponse<{
    rate_id: string
    user_id: string
    user_name: string
    rate_content: string
    rate_photos?: string[]
    rate_type: 'good' | 'neutral' | 'bad'
    created_time: string
  }> { }

// 商品推荐请求参数
export interface ItemRecommendParams extends PaginationParams {
  item_id?: string
  category_id?: string
}

// 商品推荐响应
export interface ItemRecommendResponse extends PaginationResponse<IItem> { }

export type ItemRecommendationScene = 'detail' | 'cart' | 'checkout' | 'order_detail'

export interface ItemRecommendationMatchParams {
  scene: ItemRecommendationScene
  distributor_id: number
  main_item_ids: number[]
  exclude_item_ids?: number[]
}

export interface ItemRecommendationCheckoutItem {
  item_id: number
  num: number
  activity_type?: string
}

export interface ItemRecommendationCheckoutAddParams {
  order_type: string
  distributor_id: number
  items: ItemRecommendationCheckoutItem[]
  main_item_id: number
  recommend_item_id: number
  num?: number
  client_request_id?: string
  cart_type?: string
  receipt_type?: string
  not_use_coupon?: number
  coupon_discount?: string
  point_use?: number
  receiver_name?: string
  receiver_mobile?: string
  receiver_state?: string
  receiver_city?: string
  receiver_district?: string
  receiver_address?: string
  pickup_location?: string
}

// 商品收藏相关类型
export interface ItemFavParams {
  item_id: string
}

// 获取回复评价列表请求参数
export interface ItemGetReplyRateListParams extends PaginationParams {
  item_id: string
}

// 获取回复评价列表响应
export interface ItemGetReplyRateListResponse
  extends PaginationResponse<{
    rate_id: string
    reply_content: string
    created_time: string
  }> { }

// 附近店铺请求参数
export interface ItemGetNearbyShopParams extends PaginationParams {
  latitude: number
  longitude: number
  radius?: number // 单位：米
}

// 附近店铺响应
export interface ItemGetNearbyShopResponse
  extends PaginationResponse<{
    shop_id: string
    shop_name: string
    logo?: string
    address: string
    distance: number // 单位：米
    latitude: number
    longitude: number
  }> { }
