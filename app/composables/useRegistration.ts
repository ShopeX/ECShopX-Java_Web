import { ref } from 'vue'
import { registrationApiClient } from '~/infrastructure/http/clients'
import {
  RegistrationTransformer,
  type IRegistrationActivityDetail,
  type IRegistrationActivityListItem,
  type IRegistrationFormTemplate,
  type IRegistrationRecordDetail,
  type IRegistrationRecordListItem,
} from '~/infrastructure/transformers'

/** 活动预约列表 Tab → API status */
export const ACTIVITY_STATUS_TABS = [
  { key: 'all', labelKey: 'registration.tabAll', value: '' },
  { key: 'not_started', labelKey: 'registration.tabNotStarted', value: '0' },
  { key: 'ongoing', labelKey: 'registration.tabOngoing', value: '1' },
  { key: 'ended', labelKey: 'registration.tabEnded', value: '2' },
] as const

/** 我的报名 Tab → API status */
export const RECORD_STATUS_TABS = [
  { key: 'all', labelKey: 'registration.tabAll', value: '' },
  { key: 'pending', labelKey: 'registration.tabPending', value: 'pending' },
  { key: 'passed', labelKey: 'registration.tabPassed', value: 'passed' },
  { key: 'rejected', labelKey: 'registration.tabRejected', value: 'rejected' },
  { key: 'canceled', labelKey: 'registration.tabCanceled', value: 'canceled' },
  { key: 'verified', labelKey: 'registration.tabVerified', value: 'verified' },
] as const

export function useRegistration() {
  const activityList = ref<IRegistrationActivityListItem[]>([])
  const activityTotal = ref(0)
  const recordList = ref<IRegistrationRecordListItem[]>([])
  const recordTotal = ref(0)
  const activity = ref<IRegistrationActivityDetail | null>(null)
  const formTemplate = ref<IRegistrationFormTemplate | null>(null)
  const recordDetail = ref<IRegistrationRecordDetail | null>(null)
  const loading = ref(false)
  const submitLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchActivityList(params: {
    page?: number
    pageSize?: number
    status?: string
    keyword?: string
    append?: boolean
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await registrationApiClient.getActivityList({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        status: params.status ?? '',
        activity_name: params.keyword,
      })
      const result = RegistrationTransformer.toActivityList(response)
      activityList.value = params.append
        ? [...activityList.value, ...result.list]
        : result.list
      activityTotal.value = result.total
      return result
    } catch (err: any) {
      error.value = err?.message || 'Failed to load activities'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRecordList(params: {
    page?: number
    pageSize?: number
    status?: string
    activityId?: string | number
    append?: boolean
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await registrationApiClient.getRecordList({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        status: params.status ?? '',
        activity_id: params.activityId,
      })
      const result = RegistrationTransformer.toRecordList(response)
      recordList.value = params.append ? [...recordList.value, ...result.list] : result.list
      recordTotal.value = result.total
      return result
    } catch (err: any) {
      error.value = err?.message || 'Failed to load records'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadActivity(activityId: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await registrationApiClient.getActivity(activityId)
      const model = RegistrationTransformer.toActivityDetail(response)
      activity.value = model
      formTemplate.value = model.formdata
      return model
    } catch (err: any) {
      error.value = err?.message || 'Failed to load activity'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadRecordDetail(recordId: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await registrationApiClient.getRecordInfo(recordId)
      // transformer 内会 resolveRecordPayload，避免误取嵌套 data 丢掉 action/status
      const model = RegistrationTransformer.toRecordDetail(response)
      recordDetail.value = model
      return model
    } catch (err: any) {
      error.value = err?.message || 'Failed to load record'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function submitRegistration(params: {
    activityId: string | number
    content: unknown
    recordId?: string | number
    distributorId?: string | number
  }) {
    submitLoading.value = true
    try {
      return await registrationApiClient.submit({
        activity_id: params.activityId,
        formdata: { content: JSON.stringify(params.content) },
        record_id: params.recordId,
        distributor_id: params.distributorId ?? 0,
      })
    } finally {
      submitLoading.value = false
    }
  }

  async function joinWithoutForm(activityId: string | number) {
    submitLoading.value = true
    try {
      return await registrationApiClient.joinActivity(activityId)
    } finally {
      submitLoading.value = false
    }
  }

  async function cancelRecord(recordId: string | number) {
    submitLoading.value = true
    try {
      return await registrationApiClient.cancelRecord(recordId)
    } finally {
      submitLoading.value = false
    }
  }

  return {
    activityList,
    activityTotal,
    recordList,
    recordTotal,
    activity,
    formTemplate,
    recordDetail,
    loading,
    submitLoading,
    error,
    fetchActivityList,
    fetchRecordList,
    loadActivity,
    loadRecordDetail,
    submitRegistration,
    joinWithoutForm,
    cancelRecord,
  }
}
