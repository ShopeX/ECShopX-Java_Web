/**
 * 会员任务中心（ECX-10435）+ 去完成分发（ECX-10430）
 * type_detail 对齐 Admin。去完成按 linkPage 映射：有页面则跳转，没有则复制。
 * 分享类（invite_register / share_order）改为复制完整链接：
 * 当前域名 + 落地路径 + member_task_id + member_task_sharer_user_id。
 */

import { memberTaskApiClient } from '~/infrastructure/http/clients/MemberTaskApiClient'
import type {
  IMemberTaskHistoryItem,
  IMemberTaskItem,
  IMemberTaskParticipationsData,
  MemberTaskUserStatus,
} from '~/types/memberTask'
import { buildMemberTaskShareUrl, resolveMemberTaskGoAction } from '~/utils/memberTaskJump'
import { logger } from '~/utils/log'

/** 与 Figma 历史弹层分页密度一致 */
const HISTORY_PAGE_SIZE = 5

function unwrapList(raw: any): IMemberTaskItem[] {
  const data = raw?.data ?? raw ?? {}
  return Array.isArray(data.list) ? (data.list as IMemberTaskItem[]) : []
}

function unwrapParticipations(raw: any): IMemberTaskParticipationsData {
  const data = raw?.data ?? raw ?? {}
  const list = Array.isArray(data.list) ? (data.list as IMemberTaskHistoryItem[]) : []
  const pageSize = Number(data.page_size) > 0 ? Number(data.page_size) : HISTORY_PAGE_SIZE
  const pageNo = Number(data.page_no) > 0 ? Number(data.page_no) : 1
  const totalCount = Number(data.total_count) >= 0 ? Number(data.total_count) : list.length
  return {
    list,
    page_no: pageNo,
    page_size: pageSize,
    total_count: totalCount,
  }
}

function readJumpField(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return ''
    }
  }
  return ''
}

/**
 * 路径选填且未配置时，只有系统里已有落地页的任务才给默认跳转。
 * 购买类没有默认页；浏览/分享路径必填，缺配置时不猜首页。
 */
const SHARE_TASK_TYPES = new Set(['share_order', 'invite_register'])

function isShareTask(typeDetail: string) {
  return SHARE_TASK_TYPES.has(typeDetail)
}

function emptyFallbackPath(typeDetail: string): string | null {
  switch (typeDetail) {
    case 'sign_in':
      return '/account/sign-in'
    case 'profile':
      return '/account'
    case 'favorite':
      return '/account/favorites'
    case 'first_order':
    case 'single_spend':
    case 'total_spend':
    case 'browse':
    case 'share_order':
    case 'invite_register':
      return null
    default:
      return null
  }
}

function pickConfiguredJump(task: IMemberTaskItem): string {
  if (task.type_detail === 'invite_register' || task.type_detail === 'share_order') {
    return readJumpField(task.share_jump_page) || readJumpField(task.jump_page)
  }
  return readJumpField(task.jump_page)
}

export function useMemberTasks() {
  const localePath = useLocalePath()
  const router = useRouter()
  const { t } = useI18n()
  const toast = useToastMessage()
  const { userInfo } = useAuth()

  const tasks = ref<IMemberTaskItem[]>([])
  const loading = ref(false)
  const error = ref('')

  const historyOpen = ref(false)
  const historyList = ref<IMemberTaskHistoryItem[]>([])
  const historyLoading = ref(false)
  const historyPage = ref(1)
  const historyTotalPages = ref(1)

  async function loadTasks() {
    loading.value = true
    error.value = ''
    try {
      const raw = await memberTaskApiClient.getTaskList()
      tasks.value = unwrapList(raw)
    } catch (err) {
      logger.warn('[member-tasks] load list failed', err)
      tasks.value = []
      error.value = t('m10435.empty')
    } finally {
      loading.value = false
    }
  }

  async function loadHistory(page = 1) {
    historyLoading.value = true
    historyPage.value = page
    try {
      const raw = await memberTaskApiClient.getParticipations({
        page_no: page,
        page_size: HISTORY_PAGE_SIZE,
      })
      const data = unwrapParticipations(raw)
      historyList.value = data.list
      historyPage.value = data.page_no
      historyTotalPages.value = Math.max(1, Math.ceil(data.total_count / data.page_size))
    } catch (err) {
      logger.warn('[member-tasks] load history failed', err)
      historyList.value = []
      historyTotalPages.value = 1
    } finally {
      historyLoading.value = false
    }
  }

  function openHistory() {
    historyOpen.value = true
    void loadHistory(1)
  }

  function closeHistory() {
    historyOpen.value = false
  }

  async function copyConfiguredText(text: string) {
    if (!text) {
      toast.show(t('m10435.shareFailed'))
      return
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        toast.show(t('m10435.shareCopied'))
        return
      }
    } catch (err) {
      logger.warn('[member-tasks] clipboard write failed', err)
    }
    toast.show(t('m10435.shareFailed'))
  }

  async function goComplete(task: IMemberTaskItem) {
    if (task.user_task_status !== 'todo') return

    const configured = pickConfiguredJump(task)
    if (!configured) {
      const fallback = emptyFallbackPath(task.type_detail)
      if (!fallback) {
        toast.show(t('m10435.noJumpPage'))
        return
      }
      await router.push(localePath(fallback))
      return
    }

    const action = resolveMemberTaskGoAction(configured, localePath)
    if (!action) {
      toast.show(t('m10435.noJumpPage'))
      return
    }
    if (isShareTask(task.type_detail)) {
      const path = action.type === 'navigate' ? action.href : action.text
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const url = buildMemberTaskShareUrl({
        origin,
        path,
        taskId: task.task_id,
        userId: userInfo.value?.user_id ?? '',
      })
      if (!url) {
        toast.show(t('m10435.shareFailed'))
        return
      }
      await copyConfiguredText(url)
      return
    }
    if (action.type === 'copy') {
      await copyConfiguredText(action.text)
      return
    }
    if (/^https?:\/\//i.test(action.href)) {
      window.location.href = action.href
      return
    }
    await router.push(action.href)
  }

  function statusLabel(status: MemberTaskUserStatus) {
    if (status === 'pending_reward') return t('m10435.pendingReward')
    if (status === 'rewarded') return t('m10435.rewarded')
    if (status === 'reward_failed') return t('m10435.rewardFailed')
    return t('m10435.goComplete')
  }

  return {
    tasks,
    loading,
    error,
    historyOpen,
    historyList,
    historyLoading,
    historyPage,
    historyTotalPages,
    loadTasks,
    loadHistory,
    openHistory,
    closeHistory,
    goComplete,
    statusLabel,
  }
}
