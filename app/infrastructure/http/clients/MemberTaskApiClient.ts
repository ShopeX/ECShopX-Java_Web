/**
 * 会员任务 C 端 HTTP 客户端（ECX-10435 / ECX-10434）
 *
 * 对齐 Apifox ECX-JAVA / VshopAPI「会员任务」：
 * runtimeConfig.public.apiBase 已含 `/api/v1/h5app`，此处使用 `/wxapp/promotion/member-tasks`。
 */

import type {
  IMemberTaskListData,
  IMemberTaskParticipationsData,
  IMemberTaskParticipationsQuery,
} from '~/types/memberTask'

const BASE = '/wxapp/promotion/member-tasks'

export class MemberTaskApiClient {
  private $api: any

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /** GET 会员任务列表（任务中心） */
  async getTaskList(): Promise<{ code?: number; msg?: string; data?: IMemberTaskListData } | any> {
    return this.http(BASE, { method: 'GET' })
  }

  /** GET 历史参与任务（分页） */
  async getParticipations(
    params?: IMemberTaskParticipationsQuery
  ): Promise<{ code?: number; msg?: string; data?: IMemberTaskParticipationsData } | any> {
    const query: Record<string, number> = {}
    if (params?.page_no != null) query.page_no = params.page_no
    if (params?.page_size != null) query.page_size = params.page_size
    return this.http(`${BASE}/participations`, {
      method: 'GET',
      params: Object.keys(query).length ? query : undefined,
    })
  }
}

export const memberTaskApiClient = new MemberTaskApiClient()
