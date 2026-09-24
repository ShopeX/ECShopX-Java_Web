/**
 * 商品评价列表（GET /wxapp/order/rate/list）
 */

export interface IRateListReplyMeta {
  total_count: number
}

export interface IRateListItem {
  rate_id: number | string
  company_id?: number | string
  item_id: number | string
  goods_id?: number | string
  order_id?: string
  user_id?: number | string
  username?: string
  avatar?: string
  content?: string
  content_len?: number
  star?: number
  rate_pic?: string
  rate_pic_num?: number
  anonymous?: boolean | string | number
  disabled?: boolean | string | number
  is_reply?: boolean | string | number
  item_spec_desc?: string
  order_type?: string
  praise_num?: number
  reply?: IRateListReplyMeta
  unionid?: string
  created?: number
  updated?: number
}

export interface IRateListResponse {
  list: IRateListItem[]
  total_count: number
}

/** 评价回复（GET /wxapp/order/replyRate/list） */
export interface IReplyRateListItem {
  reply_id: number | string
  rate_id?: number | string
  company_id?: number | string
  user_id?: number | string
  operator_id?: number | string
  content?: string
  content_len?: number
  /** seller：卖家/管理员；buyer：买家 */
  role?: string
  username?: string
  created?: number
  unionid?: string
}

export interface IReplyRateListResponse {
  list: IReplyRateListItem[]
  total_count: number
}

export interface IReplyRateListParams {
  rate_id: string
  item_id?: string
  page?: string
  pageSize?: string
}
