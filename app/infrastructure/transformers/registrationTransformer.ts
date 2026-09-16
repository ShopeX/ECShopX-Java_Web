/**
 * 活动报名数据转换
 * 字段映射对齐 vshop `src/doc/activity.js`
 */

export interface IRegistrationOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

export interface IRegistrationField {
  id: string
  fieldTitle: string
  fieldName: string
  formElement: string
  sourceFormElement: string
  isRequired: boolean
  options: IRegistrationOption[]
  imageUrl: string
  sort: number
  status: string
  answer?: unknown
}

export interface IRegistrationSection {
  title: string
  sort: number
  formdata: IRegistrationField[]
}

export interface IRegistrationFormTemplate {
  id: string
  temName: string
  status: string
  formStyle: string
  headerBgPic: string
  headerHeight: number
  content: IRegistrationSection[]
}

export type ActivityLifecycleStatus = 'not_started' | 'ongoing' | 'ended' | ''

export interface IRegistrationActivityListItem {
  activityId: string
  recordId: string
  activityName: string
  status: string
  statusName: string
  lifecycle: ActivityLifecycleStatus
  intro: string
  activityStartTime: string
  endDate: string
  areaName: string
  pics: string[]
  hasTemp: boolean
  showPlace: boolean
  showAddress: boolean
  showCity: boolean
  showTime: boolean
  joinLimit: number
  totalJoinNum: number
  isAllowDuplicate: boolean
  recordStatus: string
  tag: string
  canApply: boolean
}

export interface IRegistrationRecordListItem {
  activityId: string
  recordId: string
  activityName: string
  status: string
  statusName: string
  activityStatus: string
  activityLifecycle: ActivityLifecycleStatus
  startDate: string
  createDate: string
  endDate: string
  reason: string
  pics: string[]
  hasTemp: boolean
  areaName: string
  showPlace: boolean
  showAddress: boolean
  showCity: boolean
  showTime: boolean
  actionCancel: boolean
  actionEdit: boolean
  actionApply: boolean
  activityStartTime: string
  tag: string
}

export interface IRegistrationRecordDetail {
  activityId: string
  recordId: string
  activityName: string
  status: string
  statusName: string
  startDate: string
  endDate: string
  createDate: string
  reason: string
  pics: string[]
  activityPlace: string
  activityAddress: string
  showPlace: boolean
  showAddress: boolean
  showTime: boolean
  formData: IRegistrationField[]
  recordNo: string
  mobile: string
  hasTemp: boolean
  actionCancel: boolean
  actionEdit: boolean
  actionApply: boolean
  getPoints: number | string
  verifyCode: string
  isOfflineVerify: boolean
}

export interface IRegistrationActivityDetail {
  activityId: string
  activityName: string
  content: string
  place: string
  address: string
  startDate: string
  endDate: string
  joinLimit: number
  status: string
  statusName: string
  lifecycle: ActivityLifecycleStatus
  pics: string[]
  recordId: string
  recordStatus: string
  isAllowDuplicate: boolean
  hasTemp: boolean
  showPlace: boolean
  showAddress: boolean
  showTime: boolean
  formdata: IRegistrationFormTemplate | null
  getPoints: number | string
}

function toStr(value: unknown, fallback = ''): string {
  if (value == null) return fallback
  return String(value)
}

function toNum(value: unknown): number {
  const next = Number(value ?? 0)
  return Number.isFinite(next) ? next : 0
}

function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  const text = String(value ?? '').toLowerCase()
  return text === 'true' || text === '1' || text === 'yes'
}

/** 对齐 vshop：action?.edit == 1 */
function toActionFlag(value: unknown): boolean {
  return value == 1 || value === true || value === 'true'
}

function parseAction(raw: unknown): Record<string, unknown> {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }
  if (typeof raw === 'object') return raw as Record<string, unknown>
  return {}
}

/** $api 已解包一层；若仍套 data 且本体无 record 字段，再取一层 */
function resolveRecordPayload(response: any): any {
  if (!response || typeof response !== 'object') return response
  if (
    response.record_id != null ||
    response.status != null ||
    response.action != null ||
    response.activity_id != null
  ) {
    return response
  }
  if (response.data && typeof response.data === 'object') return response.data
  return response
}

function normalizeRecordStatus(status: string, statusName = ''): string {
  const s = status.trim().toLowerCase()
  if (s === 'cancelled') return 'canceled'
  if (['pending', 'passed', 'rejected', 'canceled', 'verified'].includes(s)) return s
  if (/待审核/.test(statusName)) return 'pending'
  if (/已拒绝/.test(statusName)) return 'rejected'
  if (/已取消/.test(statusName)) return 'canceled'
  if (/已核销/.test(statusName)) return 'verified'
  if (/已报名|已通过/.test(statusName)) return 'passed'
  return s
}

function parseShowFields(raw: unknown): Record<string, unknown> {
  if (!raw) return {}
  if (typeof raw === 'object') return raw as Record<string, unknown>
  try {
    return JSON.parse(String(raw))
  } catch {
    return {}
  }
}

function parsePics(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
  if (typeof raw === 'string' && raw) return raw.split(',').filter(Boolean)
  return []
}

function parseOptions(value: unknown): IRegistrationOption[] {
  let list: unknown[] = []
  if (!value) return []
  if (Array.isArray(value)) {
    list = value
  } else if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      list = Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  } else {
    return []
  }

  // 对齐 vshop：接口 options 多为 { value, image_url }，无 label，展示时 label = value
  return list.map((item) => {
    if (item == null || typeof item !== 'object') {
      const text = item == null ? '' : String(item)
      return { label: text, value: text }
    }
    const raw = item as Record<string, unknown>
    const val = raw.value ?? raw.label ?? ''
    const label = String(raw.label ?? raw.value ?? '')
    return {
      label,
      value: val as string | number | boolean,
      disabled: Boolean(raw.disabled),
    }
  })
}

/**
 * 对齐 vshop：组件类型只看 form_element，不做 field_name / field_title 猜测。
 * （后台可能出现 field_name="Attachment upload" 但 form_element="text" 的模板数据）
 */
function normalizeFormElement(field: any): string {
  const raw = String(field?.form_element || '')
  const text = raw.trim().toLowerCase().replace(/[-\s]+/g, '_')

  if (!text) return ''

  // 别名归一到 vshop 使用的 form_element 枚举
  if (['input', 'string', 'varchar', 'single_line', 'single_line_text'].includes(text)) return 'text'
  if (['multi_text', 'multiline', 'multi_line', 'multi_line_text'].includes(text)) return 'textarea'
  if (['dropdown', 'picker'].includes(text)) return 'select'
  if (['check_box', 'multi_select', 'multiple_select'].includes(text)) return 'checkbox'
  if (['province_city_area', 'region', 'district'].includes(text)) return 'area'
  if (['other_file'].includes(text)) return 'otherfile'
  if (['id_card'].includes(text)) return 'idcard'
  if (
    [
      'image_upload',
      'img',
      'photo',
      'picture',
      'upload_image',
      'file',
      'upload',
      'attachment',
    ].includes(text)
  ) {
    // 非 vshop 主枚举的图片类别名 → 按 otherfile 上传块处理
    return 'otherfile'
  }

  // text / number / textarea / radio / select / date / area / checkbox / idcard / otherfile / tel ...
  return text
}

function normalizeSections(content: any[] = []): IRegistrationSection[] {
  return (Array.isArray(content) ? content : []).map((section) => ({
    title: toStr(section?.title),
    sort: toNum(section?.sort),
    formdata: Array.isArray(section?.formdata)
      ? section.formdata.map((field: any) => {
          const sourceFormElement = toStr(field?.form_element)
          return {
            id: toStr(field?.id),
            fieldTitle: toStr(field?.field_title),
            fieldName: toStr(field?.field_name),
            formElement: normalizeFormElement(field),
            sourceFormElement,
            isRequired: toBool(field?.is_required),
            options: parseOptions(field?.options),
            imageUrl: toStr(field?.image_url),
            sort: toNum(field?.sort),
            status: toStr(field?.status),
            answer: field?.answer,
          }
        })
      : [],
  }))
}

function normalizeLifecycle(status: unknown, statusName: unknown): ActivityLifecycleStatus {
  const name = toStr(statusName)
  const raw = toStr(status).toLowerCase()
  if (name.includes('结束') || raw === 'end' || raw === 'ended' || raw === '2') return 'ended'
  if (name.includes('未开始') || raw === 'not_started' || raw === '0' || raw === 'wait') {
    return 'not_started'
  }
  if (
    name.includes('进行') ||
    raw === 'activeing' ||
    raw === 'ongoing' ||
    raw === '1' ||
    raw === 'active'
  ) {
    return 'ongoing'
  }
  if (!raw && !name) return ''
  return 'ongoing'
}

function toFormTemplate(raw: any): IRegistrationFormTemplate | null {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: toStr(raw.id),
    temName: toStr(raw.tem_name || raw.temName),
    status: toStr(raw.status),
    formStyle: toStr(raw.form_style || raw.formStyle || 'single'),
    headerBgPic: toStr(raw.header_bg_pic || raw.headerBgPic),
    headerHeight: toNum(raw.header_height || raw.headerHeight),
    content: normalizeSections(raw.content),
  }
}

function flattenFormFields(sections: IRegistrationSection[]): IRegistrationField[] {
  return sections.flatMap((section) => section.formdata || [])
}

export class RegistrationTransformer {
  static toActivityListItem(record: any): IRegistrationActivityListItem {
    const show = parseShowFields(record?.show_fields)
    const status = toStr(record?.status)
    const statusName = toStr(record?.status_name)
    const lifecycle = normalizeLifecycle(status, statusName)
    const joinLimit = toNum(record?.join_limit)
    const totalJoinNum = toNum(record?.total_join_num)
    const isAllowDuplicate = record?.is_allow_duplicate == 1
    const recordId = toStr(record?.record_info?.[0]?.record_id || record?.record_id)
    const recordStatus = toStr(record?.record_info?.[0]?.status || record?.record_status)
    // 对齐 vshop ACTIVITY_LIST：temp_id != '0'
    const hasTemp = record?.temp_id != '0'

    const canApply =
      lifecycle === 'ongoing' &&
      !(joinLimit > 0 && totalJoinNum >= joinLimit) &&
      !(!isAllowDuplicate && !!recordId && !['pending', 'rejected'].includes(recordStatus))

    return {
      activityId: toStr(record?.activity_id),
      recordId,
      activityName: toStr(record?.activity_name),
      status,
      statusName: statusName || lifecycleLabel(lifecycle),
      lifecycle,
      intro: toStr(record?.intro),
      activityStartTime: toStr(record?.start_date || record?.start_time),
      endDate: toStr(record?.end_date),
      areaName: toStr(record?.area_name || record?.area),
      pics: parsePics(record?.pics),
      hasTemp,
      showPlace: show.place == 1 || show.place === '1',
      showAddress: show.address == 1 || show.address === '1',
      showCity: show.city == 1 || show.city === '1',
      showTime: show.time == 1 || show.time === '1',
      joinLimit,
      totalJoinNum,
      isAllowDuplicate,
      recordStatus,
      tag: toStr(record?.tag || record?.label || ''),
      canApply,
    }
  }

  static toActivityList(response: any): {
    list: IRegistrationActivityListItem[]
    total: number
  } {
    const payload = response?.data ?? response
    const list = Array.isArray(payload?.list) ? payload.list : Array.isArray(payload) ? payload : []
    return {
      list: list.map((item: any) => this.toActivityListItem(item)),
      total: toNum(payload?.total_count ?? payload?.total ?? list.length),
    }
  }

  static toRecordListItem(record: any): IRegistrationRecordListItem {
    const raw = resolveRecordPayload(record)
    const activityInfo = raw?.activity_info || {}
    const show = parseShowFields(activityInfo?.show_fields || raw?.show_fields)
    const action = parseAction(raw?.action)
    const statusName = toStr(raw?.status_name)
    const status = normalizeRecordStatus(toStr(raw?.status), statusName)
    const activityStatus = toStr(activityInfo?.status_name || activityInfo?.status)
    const activityLifecycle = normalizeLifecycle(activityInfo?.status, activityStatus)

    return {
      activityId: toStr(raw?.activity_id),
      recordId: toStr(raw?.record_id),
      activityName: toStr(raw?.activity_name || activityInfo?.activity_name),
      status,
      statusName,
      activityStatus,
      activityLifecycle,
      startDate: toStr(raw?.start_date),
      createDate: toStr(raw?.create_date),
      endDate: toStr(raw?.end_date),
      reason: toStr(raw?.reason),
      pics: parsePics(activityInfo?.pics || raw?.pics),
      hasTemp: raw?.form_id != 0,
      areaName: toStr(activityInfo?.area_name || raw?.area_name),
      showPlace: show.place == 1 || show.place === '1',
      showAddress: show.address == 1 || show.address === '1',
      showCity: show.city == 1 || show.city === '1',
      // 对齐 vshop RECORD_LIST：仅看 show_fields.time == 1
      showTime: show.time == 1 || show.time === '1',
      // 对齐 vshop：action?.xxx == 1，不做状态兜底
      actionCancel: toActionFlag(action.cancel),
      actionEdit: toActionFlag(action.edit),
      actionApply: toActionFlag(action.apply),
      activityStartTime: toStr(activityInfo?.start_time || activityInfo?.start_date || raw?.start_date),
      tag: toStr(activityInfo?.tag || raw?.tag || ''),
    }
  }

  static toRecordList(response: any): {
    list: IRegistrationRecordListItem[]
    total: number
  } {
    const payload = response?.data ?? response
    const list = Array.isArray(payload?.list) ? payload.list : Array.isArray(payload) ? payload : []
    return {
      list: list.map((item: any) => this.toRecordListItem(item)),
      total: toNum(payload?.total_count ?? payload?.total ?? list.length),
    }
  }

  static toRecordDetail(record: any): IRegistrationRecordDetail {
    const raw = resolveRecordPayload(record)
    const activityInfo = raw?.activity_info || {}
    const show = parseShowFields(activityInfo?.show_fields)
    const action = parseAction(raw?.action)
    // vshop RECORD_DETAIL: content?.[0]?.formdata
    const content = Array.isArray(raw?.content) ? raw.content : []
    const firstBlock = content[0]
    let formFields: IRegistrationField[] = []
    if (Array.isArray(firstBlock?.formdata)) {
      // section 列表 or 单块 fields
      if (firstBlock.title != null || firstBlock.sort != null) {
        formFields = flattenFormFields(normalizeSections(content))
      } else {
        formFields =
          normalizeSections([{ title: '', sort: 0, formdata: firstBlock.formdata }])[0]
            ?.formdata || []
      }
    } else if (Array.isArray(content) && content[0]?.field_title) {
      formFields =
        normalizeSections([{ title: '', sort: 0, formdata: content }])[0]?.formdata || []
    }

    const statusName = toStr(raw?.status_name)
    const status = normalizeRecordStatus(toStr(raw?.status), statusName)
    // 对齐 vshop：hasTemp = form_id != 0
    const hasTemp = raw?.form_id != 0
    // 对齐 vshop RECORD_DETAIL：action?.xxx == 1
    const actionCancel = toActionFlag(action.cancel)
    const actionEdit = toActionFlag(action.edit)
    const actionApply = toActionFlag(action.apply)

    return {
      activityId: toStr(raw?.activity_id),
      recordId: toStr(raw?.record_id),
      activityName: toStr(raw?.activity_name || activityInfo?.activity_name),
      status,
      statusName,
      startDate: toStr(raw?.start_date || activityInfo?.start_date),
      endDate: toStr(raw?.end_date || activityInfo?.end_date),
      createDate: toStr(raw?.create_date),
      reason: toStr(raw?.reason),
      pics: parsePics(activityInfo?.pics || raw?.pics),
      activityPlace: toStr(activityInfo?.place),
      activityAddress: toStr(activityInfo?.address),
      showPlace: show.place == 1 || show.place === '1',
      showAddress: show.address == 1 || show.address === '1',
      showTime: show.time == 1 || show.time === '1',
      formData: formFields,
      recordNo: toStr(raw?.record_no),
      mobile: toStr(raw?.mobile),
      hasTemp,
      actionCancel,
      actionEdit,
      actionApply,
      getPoints: raw?.get_points ?? '',
      verifyCode: toStr(raw?.verify_code),
      // 对齐 vshop：is_offline_verify == 1
      isOfflineVerify: activityInfo?.is_offline_verify == 1,
    }
  }

  static toActivityDetail(response: any): IRegistrationActivityDetail {
    const payload = response?.data ?? response
    const activity = payload?.activity_info || payload
    const show = parseShowFields(activity?.show_fields)
    const status = toStr(activity?.status)
    const statusName = toStr(activity?.status_name)
    const formRaw = activity?.formdata || payload?.formdata

    return {
      activityId: toStr(activity?.activity_id),
      activityName: toStr(activity?.activity_name),
      content: toStr(activity?.content),
      place: toStr(activity?.place),
      address: toStr(activity?.address),
      startDate: toStr(activity?.start_date),
      endDate: toStr(activity?.end_date),
      joinLimit: toNum(activity?.join_limit),
      status,
      statusName,
      lifecycle: normalizeLifecycle(status, statusName),
      pics: parsePics(activity?.pics),
      recordId: toStr(activity?.record_info?.[0]?.record_id),
      recordStatus: toStr(activity?.record_info?.[0]?.status),
      isAllowDuplicate: activity?.is_allow_duplicate == 1,
      // 对齐 vshop：temp_id != '0'
      hasTemp: activity?.temp_id != '0',
      showPlace: show.place == 1 || show.place === '1',
      showAddress: show.address == 1 || show.address === '1',
      showTime: show.time == 1 || show.time === '1',
      formdata: toFormTemplate(formRaw),
      getPoints: activity?.get_points ?? '',
    }
  }
}

function lifecycleLabel(lifecycle: ActivityLifecycleStatus): string {
  if (lifecycle === 'not_started') return '未开始'
  if (lifecycle === 'ongoing') return '进行中'
  if (lifecycle === 'ended') return '已结束'
  return ''
}
