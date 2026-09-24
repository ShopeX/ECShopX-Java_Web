/**
 * 会员积分相关 HTTP 客户端
 *
 * 职责：封装获取积分信息、积分流水列表请求
 * 接口定义以 .f2e-ai/requirements/20260312-ECX-8100/api-notes.md 为准
 * runtimeConfig.public.apiBase 默认已包含 `/h5app/wxapp` 前缀，
 * 因此此处仅保留相对 baseURL 的业务路径，避免出现重复的 `/wxapp/wxapp`
 */

/** 积分信息项（与 Apifox 一致） */
export interface IPointMemberInfoItem {
  user_id: string
  company_id: string
  point: string
  [key: string]: any
}

/** 获取积分信息 - 200 响应（原始结构；HTTP 插件可能解包一层 data） */
export interface IGetPointMemberInfoResponse {
  data?: IPointMemberInfoItem
  user_id?: string
  company_id?: string
  point?: string
}

/** 积分流水单项 */
export interface IPointMemberListItem {
  company_id: string
  id: string
  user_id: string
  income: number
  outcome: number
  point: number
  journal_type: number
  outin_type: string
  point_desc: string
  order_id?: string
  created: string
  updated: string
  [key: string]: any
}

/** 积分列表 - 请求 Query（company_id、country_code 由 HTTP 插件全局注入） */
export interface IGetPointMemberListParams {
  page_no?: number
  page_size?: number
  outin_type?: 'income' | 'outcome'
}

/** 积分列表 - 200 响应（原始结构；HTTP 插件可能解包一层 data） */
export interface IGetPointMemberListResponse {
  data?: {
    total_count: number
    list: IPointMemberListItem[]
  }
  total_count?: number
  list?: IPointMemberListItem[]
}

export class PointApiClient {
  private $api: any

  constructor() {}

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 获取积分信息
   * GET /point/member/info
   */
  async getPointMemberInfo(): Promise<IGetPointMemberInfoResponse> {
    return this.http('/wxapp/point/member/info', {
      method: 'GET',
    })
  }

  /**
   * 获取积分流水列表
   * GET /point/member
   * Query: page_no, page_size, outin_type（company_id、country_code 由插件注入）
   */
  async getPointMemberList(
    params?: IGetPointMemberListParams
  ): Promise<IGetPointMemberListResponse> {
    const query: Record<string, string | number> = {}
    if (params?.page_no != null) query.page_no = params.page_no
    if (params?.page_size != null) query.page_size = params.page_size
    if (params?.outin_type) query.outin_type = params.outin_type
    return this.http('/wxapp/point/member', {
      method: 'GET',
      query,
    })
  }
}

export const pointApiClient = new PointApiClient()
