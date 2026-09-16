/**
 * 会员中心积分页 Composable
 *
 * 职责：获取积分信息、积分流水列表，分页与筛选，时间格式化
 * 接口以 .f2e-ai/requirements/20260312-ECX-8100/api-notes.md 为准
 */

import { pointApiClient } from '~/infrastructure/http/clients'
import type { IPointMemberListItem } from '~/infrastructure/http/clients/PointApiClient'

const DEFAULT_PAGE_SIZE = 10

function formatPointTime(created: string | undefined): string {
  if (!created) return ''
  const ts = typeof created === 'string' ? parseInt(created, 10) : created
  if (Number.isNaN(ts)) return created
  const normalizedTs = String(ts).length > 10 ? ts : ts * 1000
  const d = new Date(normalizedTs)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const sec = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}:${sec}`
}

function isIncomeRecord(item: IPointMemberListItem): boolean {
  return item.outin_type === 'income' || item.outin_type === 'in' || Number(item.income) > 0
}

export function useMemberPoint() {
  const { t } = useI18n()
  const pointTotal = ref<number>(0)
  const list = ref<IPointMemberListItem[]>([])
  const totalCount = ref(0)
  const pageNo = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)
  const outinType = ref<'income' | 'outcome' | undefined>(undefined)
  const loadingInfo = ref(true)
  const loadingList = ref(true)
  const errorInfo = ref<string | null>(null)
  const errorList = ref<string | null>(null)

  const hasMore = computed(() => list.value.length < totalCount.value)
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

  /** 列表项展示用：时间格式化后的文案 */
  function formatItemTime(item: IPointMemberListItem): string {
    return formatPointTime(item.created)
  }

  function formatItemPoint(item: IPointMemberListItem): string {
    const rawValue =
      isIncomeRecord(item) && Number(item.income) > 0
        ? Number(item.income)
        : !isIncomeRecord(item) && Number(item.outcome) > 0
          ? Number(item.outcome)
          : Number(item.point)

    const pointValue = Number.isNaN(rawValue) ? item.point : Math.abs(rawValue)
    return `${isIncomeRecord(item) ? '+' : '-'}${pointValue}`
  }

  /** 加载积分信息 */
  async function loadPointInfo() {
    loadingInfo.value = true
    errorInfo.value = null
    try {
      const res = await pointApiClient.getPointMemberInfo()
      const data = (res as any)?.data ?? res
      const raw = data?.point ?? data?.pointTotal
      const num = raw != null && raw !== '' ? Number(raw) : 0
      pointTotal.value = Number.isNaN(num) ? 0 : num
    } catch (e: any) {
      errorInfo.value = t('9e61c248.61ac5c')
    } finally {
      loadingInfo.value = false
    }
  }

  /** 加载积分流水（替换列表，用于筛选或首次） */
  async function loadList(replace = true) {
    loadingList.value = true
    errorList.value = null
    try {
      const res = await pointApiClient.getPointMemberList({
        page_no: pageNo.value,
        page_size: pageSize.value,
        outin_type: outinType.value,
      })
      const data = (res as any)?.data ?? res
      const total = data?.total_count ?? data?.totalCount ?? 0
      const items = Array.isArray(data?.list) ? data.list : (data?.list ?? [])
      totalCount.value = total
      if (replace) {
        list.value = items
      } else {
        list.value = [...list.value, ...items]
      }
    } catch (e: any) {
      errorList.value = t('9e61c248.8a6f0f')
    } finally {
      loadingList.value = false
    }
  }

  /** 设置收入/支出筛选并重新拉取 */
  function setOutinType(type: 'income' | 'outcome' | undefined) {
    outinType.value = type
    pageNo.value = 1
    loadList(true)
  }

  /** 加载更多（下一页） */
  function loadMore() {
    if (!hasMore.value || loadingList.value) return
    pageNo.value += 1
    loadList(false)
  }

  /** 初始化：同时拉取积分信息与第一页流水 */
  async function init() {
    pageNo.value = 1
    await Promise.all([loadPointInfo(), loadList(true)])
  }

  return {
    pointTotal,
    list,
    totalCount,
    pageNo,
    pageSize,
    outinType,
    loadingInfo,
    loadingList,
    errorInfo,
    errorList,
    hasMore,
    formatItemTime,
    formatItemPoint,
    isIncomeRecord,
    loadPointInfo,
    loadList,
    setOutinType,
    loadMore,
    init,
    totalPages,
  }
}
