/**
 * 分享好友下单归因。
 * 落地页同时带 member_task_id 与 member_task_sharer_user_id 时写入本地缓存，
 * 创建订单时提交。缓存保留到退出登录。
 */

const STORAGE_KEY = 'member_task_share'

export interface MemberTaskShareParams {
  member_task_id: number
  member_task_sharer_user_id: number
}

type QueryValue = string | number | null | undefined | Array<string | number | null | undefined>

export type MemberTaskShareQuery = Record<string, QueryValue>

function readQueryValue(value: QueryValue): string {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw == null) return ''
  return String(raw).trim()
}

function toPositiveInt(value: string): number | null {
  if (!/^\d+$/.test(value)) return null
  const num = Number(value)
  if (!Number.isSafeInteger(num) || num <= 0) return null
  return num
}

function readStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** 两个参数同时存在才覆盖缓存；缺任何一个则保持原缓存。 */
export function captureMemberTaskShareFromQuery(query: MemberTaskShareQuery = {}): void {
  const taskId = toPositiveInt(readQueryValue(query.member_task_id))
  const userId = toPositiveInt(readQueryValue(query.member_task_sharer_user_id))
  if (taskId == null || userId == null) return

  const storage = readStorage()
  if (!storage) return
  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        member_task_id: taskId,
        member_task_sharer_user_id: userId,
      })
    )
  } catch {
    // 隐私模式等无法写入时，下单不带归因
  }
}

export function getMemberTaskShareParams(): MemberTaskShareParams | null {
  const storage = readStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<MemberTaskShareParams>
    const taskId = toPositiveInt(String(data.member_task_id ?? ''))
    const userId = toPositiveInt(String(data.member_task_sharer_user_id ?? ''))
    if (taskId == null || userId == null) return null
    return {
      member_task_id: taskId,
      member_task_sharer_user_id: userId,
    }
  } catch {
    return null
  }
}

export function clearMemberTaskShareParams(): void {
  const storage = readStorage()
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
