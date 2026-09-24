/**
 * 会员签到 HTTP 客户端（ECX-9884）
 *
 * 对齐 Apifox ECX-JAVA / VshopAPI（module 8517237）：
 * runtimeConfig.public.apiBase 已含 `/api/v1/h5app`，此处使用 `/wxapp/promotion/member-signin/...`。
 */

/** 周历单日状态（由接口 signed + 今日派生，供 UI 使用） */
export type SignInDayStatus = 'signed' | 'missed' | 'today_unsigned' | 'today_signed' | 'future'

export interface ISignInWeekDay {
  /** YYYY-MM-DD（北京时间） */
  date: string
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7
  status: SignInDayStatus
  /** 日常积分；接口字段 daily_points，null/0 不展示 */
  daily_point?: number | null
  /** 展示文案，如 "+1" / "已签"；优先于积分数字时可选用 */
  display?: string | null
  /** 活动期内已签到累计序号 */
  activity_seq?: number | null
  signed?: boolean
}

export interface ISignInWeekResponse {
  data?: {
    week_start: string
    week_end: string
    signed_today: boolean
    current_activity_id?: number | null
    days: Array<{
      date: string
      weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7
      signed: boolean
      daily_points?: number | null
      display?: string | null
      activity_seq?: number | null
    }>
  }
}

/** 阶梯状态（Vshop：not_reached / processing / granted / failed） */
export type SignInRewardTierStatus =
  | 'not_reached'
  | 'processing'
  | 'granted'
  | 'failed'
  /** UI 兼容旧文案映射 */
  | 'pending'
  | 'claimable'

export interface ISignInRewardTier {
  /** 对应接口 tier_count */
  threshold: number
  point?: number | null
  coupon_name?: string | null
  status: SignInRewardTierStatus
}

export interface ISignInActivityProgress {
  activity_id?: string | number
  name?: string
  start_at?: string
  end_at?: string
  begin_time?: number
  end_time?: number
  progress_count?: number
  period_days?: number
  tiers?: ISignInRewardTier[]
}

export interface ISignInActivityProgressResponse {
  data?: {
    progress_count?: number
    activity?: {
      id: number
      name: string
      begin_time: number
      end_time: number
      progress_count: number
      period_days?: number
      tiers?: Array<{
        tier_count: number
        points_reward?: number | null
        coupon_summary?: { id: number; title: string } | null
        status: 'not_reached' | 'processing' | 'granted' | 'failed'
      }>
    } | null
  } | null
}

export interface ISignInRewardItem {
  type: 'points' | 'coupon' | 'point'
  amount?: number
  coupon_id?: number
  title?: string
  name?: string
  status?: 'granted' | 'failed'
}

export interface ISignInSubmitResult {
  daily_point?: number | null
  signed_today?: boolean
  progress_count?: number
  activity?: { id?: number; name?: string; progress_count?: number } | null
  /** 展平后的奖励（来自 new_grants[].reward_items） */
  rewards?: ISignInRewardItem[]
  new_grants?: Array<{
    tier_count: number
    title: string
    reward_items: Array<{
      type: 'points' | 'coupon'
      amount?: number
      coupon_id?: number
      title?: string
    }>
  }>
}

export interface ISignInSubmitResponse {
  data?: {
    signed_today: boolean
    daily_points?: number | null
    activity?: { id: number; name: string; progress_count: number } | null
    new_grants?: ISignInSubmitResult['new_grants']
  }
}

export interface ISignInRecordDay {
  date: string
  signed: boolean
  daily_point?: number | null
  display?: string | null
  day_status?: 'signed' | 'missed' | 'future' | 'today'
  activity_seq?: number | null
}

export interface ISignInRecordsResponse {
  data?: {
    month: string
    days: Array<{
      date: string
      signed: boolean
      daily_points?: number | null
      display?: string | null
      day_status?: 'signed' | 'missed' | 'future' | 'today'
      activity_seq?: number | null
    }>
  }
}

export interface ISignInRewardRecord {
  id: string | number
  record_type?: 'daily' | 'tier'
  activity_id?: number | null
  activity_name?: string | null
  title?: string
  tier_count?: number | null
  reward_items?: Array<{
    type: 'points' | 'coupon'
    amount?: number
    coupon_id?: number
    title?: string
  }>
  created?: number
  /** UI 兼容 */
  granted_at?: string
  type?: 'point' | 'coupon' | 'points'
  name?: string
  amount?: number
  status?: 'granted' | 'failed'
}

export interface ISignInRewardsResponse {
  data?: {
    list: ISignInRewardRecord[]
    total_count?: number
    page?: number
    page_size?: number
  }
}

export interface ISignInReminderResponse {
  data?: {
    enabled: boolean
    subscribe_accepted?: boolean
  }
}

const BASE = '/wxapp/promotion/member-signin'

export class MemberSignInApiClient {
  private $api: any

  constructor() {}

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /** GET 自然周日历与当日状态 */
  async getWeek(weekStart?: string): Promise<ISignInWeekResponse> {
    return this.http(`${BASE}/calendar`, {
      method: 'GET',
      params: weekStart ? { week_start: weekStart } : undefined,
    })
  }

  /** POST 提交签到 */
  async submitSignIn(): Promise<ISignInSubmitResponse> {
    return this.http(`${BASE}/sign`, { method: 'POST' })
  }

  /** GET 当前活动进度与阶梯 */
  async getActivityProgress(): Promise<ISignInActivityProgressResponse> {
    return this.http(`${BASE}/activity/progress`, { method: 'GET' })
  }

  /** GET 月签到记录 month=YYYY-MM */
  async getRecords(month: string): Promise<ISignInRecordsResponse> {
    return this.http(`${BASE}/records`, {
      method: 'GET',
      params: { month },
    })
  }

  /** GET 奖励记录（日常+阶梯） */
  async getRewards(params?: {
    activity_id?: number
    page?: number
    page_size?: number
  }): Promise<ISignInRewardsResponse> {
    return this.http(`${BASE}/rewards`, {
      method: 'GET',
      params: params || undefined,
    })
  }

  /** GET 漏签提醒开关 */
  async getReminder(): Promise<ISignInReminderResponse> {
    return this.http(`${BASE}/reminder`, { method: 'GET' })
  }

  /** PUT 漏签提醒开关 */
  async setReminder(enabled: boolean): Promise<ISignInReminderResponse> {
    return this.http(`${BASE}/reminder`, {
      method: 'PUT',
      body: { enabled },
      useJson: true,
    } as any)
  }
}

export const memberSignInApiClient = new MemberSignInApiClient()
