/**
 * 会员任务 C 端类型 — 对齐 Admin constants + Apifox VshopAPI「会员任务」
 * GET /wxapp/promotion/member-tasks
 * GET /wxapp/promotion/member-tasks/participations
 */

/**
 * Admin type_detail（ecshopx-admin/.../member-task/constants.js）
 * 购买：single_spend / total_spend；浏览：browse
 */
export type MemberTaskTypeDetail =
  | 'first_order'
  | 'profile'
  | 'single_spend'
  | 'total_spend'
  | 'share_order'
  | 'invite_register'
  | 'sign_in'
  | 'browse'
  | 'favorite'
  | string

/** user_task_status（§11.1） */
export type MemberTaskUserStatus = 'todo' | 'pending_reward' | 'rewarded' | 'reward_failed'

/** 历史行不含 todo */
export type MemberTaskHistoryUserStatus = Extract<
  MemberTaskUserStatus,
  'pending_reward' | 'rewarded' | 'reward_failed'
>

/** display_status（活动维） */
export type MemberTaskDisplayStatus = 'draft' | 'pending_start' | 'in_progress' | 'expired'

/** grant_status（发奖流水） */
export type MemberTaskGrantStatus = 'pending' | 'granted' | 'failed' | 'cancelled'

export type MemberTaskFrequencyType = 'once' | 'cycle'
export type MemberTaskFrequencyPeriod = 'daily' | 'weekly' | 'monthly'

/** 列表行 — 接口字段原样，不做 camelCase 转换 */
export interface IMemberTaskItem {
  task_id: number
  name: string
  type_category: string
  type_detail: MemberTaskTypeDetail
  type_label: string
  reward_summary: string | null
  display_status: MemberTaskDisplayStatus | string
  user_task_status: MemberTaskUserStatus
  begin_time: number
  end_time: number
  begin_time_text: string | null
  end_time_text: string | null
  /** 「去完成」跳转 path（购买/行为类主表配置） */
  jump_page: string | null
  frequency_type?: MemberTaskFrequencyType | string
  frequency_period?: MemberTaskFrequencyPeriod | string | null
  frequency_text?: string | null
  /** Admin 任务规则（富文本 HTML） */
  task_rule?: string | null
  /** 裂变分享三件套（invite_register / share_order） */
  share_cover?: string | null
  share_title?: string | null
  share_jump_page?: string | null
}

export interface IMemberTaskListData {
  list: IMemberTaskItem[]
  total_count: number
}

/** 历史参与单条 — GET .../participations */
export interface IMemberTaskHistoryItem {
  completion_id: number
  task_id: number
  name: string
  type_label?: string | null
  /** 秒级时间戳 */
  completed_at: number
  completed_at_text?: string | null
  grant_status?: MemberTaskGrantStatus | string
  user_task_status: MemberTaskHistoryUserStatus
  grant_status_text?: string | null
  reward_summary?: string | null
}

export interface IMemberTaskParticipationsData {
  list: IMemberTaskHistoryItem[]
  total_count: number
  page_no: number
  page_size: number
}

export interface IMemberTaskParticipationsQuery {
  page_no?: number
  page_size?: number
}
