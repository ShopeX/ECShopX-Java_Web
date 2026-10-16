/**
 * 活动报名 HTTP 客户端
 *
 * 职责：封装 registration 相关请求，不做数据转换。
 * 对齐 vshop `src/api/user.js` registration* / joinActivity / cancelRecord。
 */

export interface IRegistrationActivityListParams {
  page?: number
  pageSize?: number
  /** '' 全部 | '0' 未开始 | '1' 进行中 | '2' 已结束 */
  status?: string
  activity_name?: string
}

export interface IRegistrationRecordListParams {
  page?: number
  pageSize?: number
  /** '' 全部 | pending | passed | rejected | canceled | verified */
  status?: string
  activity_id?: string | number
}

export interface IRegistrationSubmitParams {
  activity_id: string | number
  /** 已 JSON.stringify 的表单 content，或原始对象（客户端会再序列化） */
  formdata: { content: string | unknown }
  distributor_id?: string | number
  record_id?: string | number
}

export class RegistrationApiClient {
  private $api: any

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  async getActivityList(params: IRegistrationActivityListParams = {}): Promise<any> {
    return this.http('/wxapp/registrationActivityList', {
      method: 'GET',
      query: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        status: params.status ?? '',
        activity_name: params.activity_name,
      },
    })
  }

  async getActivity(activityId: string | number): Promise<any> {
    return this.http('/wxapp/registrationActivity', {
      method: 'GET',
      query: { activity_id: activityId },
    })
  }

  async getRecordList(params: IRegistrationRecordListParams = {}): Promise<any> {
    return this.http('/wxapp/registrationRecordList', {
      method: 'GET',
      query: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        status: params.status ?? '',
        activity_id: params.activity_id,
      },
    })
  }

  async getRecordInfo(recordId: string | number): Promise<any> {
    return this.http('/wxapp/registrationRecordInfo', {
      method: 'GET',
      query: { record_id: recordId },
    })
  }

  /**
   * 提交报名
   * 本仓 $api 默认 form-urlencoded，且对嵌套对象会 String() 成 [object Object]。
   * 对齐 vshop qs.stringify：展平为 formdata[content]=...
   */
  async submit(params: IRegistrationSubmitParams): Promise<any> {
    const content =
      typeof params.formdata?.content === 'string'
        ? params.formdata.content
        : JSON.stringify(params.formdata?.content ?? [])

    const body: Record<string, string | number> = {
      activity_id: params.activity_id,
      'formdata[content]': content,
      distributor_id: params.distributor_id ?? 0,
    }
    if (params.record_id != null && params.record_id !== '') {
      body.record_id = params.record_id as string | number
    }

    return this.http('/wxapp/registrationSubmit', {
      method: 'POST',
      body,
    })
  }

  async joinActivity(activityId: string | number): Promise<any> {
    return this.http('/wxapp/joinActivity', {
      method: 'POST',
      body: { activity_id: activityId },
    })
  }

  async cancelRecord(recordId: string | number): Promise<any> {
    return this.http('/wxapp/cancelRecord', {
      method: 'POST',
      body: { record_id: recordId },
    })
  }
}

export const registrationApiClient = new RegistrationApiClient()
