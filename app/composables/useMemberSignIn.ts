/**
 * 会员签到组合式（ECX-9884）
 * 对齐 VshopAPI `/wxapp/promotion/member-signin/*`；失败时回落北京时间本周 mock。
 */
import { computed, ref } from 'vue'
import {
  memberSignInApiClient,
  type ISignInActivityProgress,
  type ISignInRewardItem,
  type ISignInSubmitResult,
  type ISignInWeekDay,
  type SignInDayStatus,
  type SignInRewardTierStatus,
} from '~/infrastructure/http/clients/MemberSignInApiClient'

/** 北京时间日历日 YYYY-MM-DD */
export function formatShanghaiDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function shanghaiWeekdayMon1(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  const short = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    weekday: 'short',
  }).format(utc)
  return ({ Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 } as Record<string, number>)[
    short
  ]
}

function addDaysToDateStr(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d + delta, 12, 0, 0))
  return formatShanghaiDate(utc)
}

function formatUnixShanghaiDate(sec?: number | null): string {
  if (sec == null || !Number(sec)) return ''
  return formatShanghaiDate(new Date(Number(sec) * 1000))
}

/** 将接口日历日映射为 UI status */
export function mapCalendarDayStatus(
  day: { date: string; signed?: boolean },
  todayStr: string,
  signedToday: boolean
): SignInDayStatus {
  if (day.date === todayStr) {
    return day.signed || signedToday ? 'today_signed' : 'today_unsigned'
  }
  if (day.date > todayStr) return 'future'
  return day.signed ? 'signed' : 'missed'
}

export function mapTierStatus(
  status?: string
): SignInRewardTierStatus {
  if (status === 'granted') return 'granted'
  if (status === 'failed') return 'failed'
  if (status === 'processing') return 'claimable'
  if (status === 'not_reached') return 'pending'
  if (status === 'claimable' || status === 'pending') return status
  return 'pending'
}

/** 北京时间周一～周日本周 mock */
export function buildMockWeekDays(todaySigned = false): ISignInWeekDay[] {
  const todayStr = formatShanghaiDate()
  const wd = shanghaiWeekdayMon1(todayStr)
  const mondayStr = addDaysToDateStr(todayStr, -(wd - 1))
  const days: ISignInWeekDay[] = []
  let signedSeq = 0
  for (let i = 0; i < 7; i++) {
    const date = addDaysToDateStr(mondayStr, i)
    const weekday = (i + 1) as ISignInWeekDay['weekday']
    let status: SignInDayStatus
    if (date === todayStr) {
      status = todaySigned ? 'today_signed' : 'today_unsigned'
    } else if (date < todayStr) {
      status = i % 2 === 0 ? 'signed' : 'missed'
    } else {
      status = 'future'
    }
    if (status === 'signed' || status === 'today_signed') signedSeq += 1
    const dailyPoint = weekday >= 6 ? 5 : 1
    const signed = status === 'signed' || status === 'today_signed'
    days.push({
      date,
      weekday,
      status,
      signed,
      daily_point: status === 'missed' ? 0 : dailyPoint,
      display: signed ? `+${dailyPoint}` : null,
      activity_seq: signed ? signedSeq : null,
    })
  }
  return days
}

function buildMockActivity(): ISignInActivityProgress {
  return {
    activity_id: 'mock-1',
    name: '累计签到活动',
    start_at: '2026-09-08',
    end_at: '2026-09-22',
    progress_count: 3,
    tiers: [
      { threshold: 3, point: 100, status: 'granted' },
      { threshold: 7, point: 200, coupon_name: '立减5元券', status: 'claimable' },
      { threshold: 15, point: 300, coupon_name: '满500减60元券', status: 'pending' },
      { threshold: 30, coupon_name: '立减50元券', status: 'pending' },
    ],
  }
}

function normalizeWeekDays(
  rawDays: any[],
  signedToday: boolean
): ISignInWeekDay[] {
  const todayStr = formatShanghaiDate()
  return rawDays.map((d) => {
    const signed = !!d.signed
    const status = mapCalendarDayStatus(d, todayStr, signedToday)
    const dailyPoint =
      d.daily_points != null
        ? d.daily_points
        : d.daily_point != null
          ? d.daily_point
          : null
    return {
      date: d.date,
      weekday: d.weekday,
      status,
      signed,
      daily_point: dailyPoint,
      display: d.display ?? null,
      activity_seq: d.activity_seq ?? null,
    } as ISignInWeekDay
  })
}

function unwrapWeek(res: any): {
  weekStart: string
  weekEnd: string
  todaySigned: boolean
  days: ISignInWeekDay[]
} {
  const raw = res?.data ?? res ?? {}
  const signedToday = !!(raw.signed_today ?? raw.today_signed)
  const daysRaw = Array.isArray(raw.days) ? raw.days : []
  return {
    weekStart: raw.week_start || '',
    weekEnd: raw.week_end || '',
    todaySigned: signedToday,
    days: normalizeWeekDays(daysRaw, signedToday),
  }
}

function unwrapActivity(res: any): ISignInActivityProgress | null {
  if (res == null) return null
  const payload = res.data ?? res
  // Vshop: { progress_count, activity: null | {...} }
  if (payload && 'activity' in payload) {
    const act = payload.activity
    if (act == null) return null
    return {
      activity_id: act.id,
      name: act.name,
      begin_time: act.begin_time,
      end_time: act.end_time,
      start_at: formatUnixShanghaiDate(act.begin_time),
      end_at: formatUnixShanghaiDate(act.end_time),
      progress_count: act.progress_count ?? payload.progress_count ?? 0,
      period_days: act.period_days,
      tiers: (act.tiers || []).map((t: any) => ({
        threshold: t.tier_count ?? t.threshold,
        point: t.points_reward ?? t.point ?? null,
        coupon_name: t.coupon_summary?.title ?? t.coupon_name ?? null,
        status: mapTierStatus(t.status),
      })),
    }
  }
  // 兼容旧扁平结构 / mock
  if (!payload || (!payload.activity_id && !payload.name && !payload.tiers && !payload.id)) {
    return null
  }
  return {
    activity_id: payload.activity_id ?? payload.id,
    name: payload.name,
    start_at: payload.start_at || formatUnixShanghaiDate(payload.begin_time),
    end_at: payload.end_at || formatUnixShanghaiDate(payload.end_time),
    progress_count: payload.progress_count,
    tiers: (payload.tiers || []).map((t: any) => ({
      threshold: t.threshold ?? t.tier_count,
      point: t.point ?? t.points_reward ?? null,
      coupon_name: t.coupon_name ?? t.coupon_summary?.title ?? null,
      status: mapTierStatus(t.status),
    })),
  }
}

function flattenGrants(newGrants: any[] | undefined): ISignInRewardItem[] {
  if (!Array.isArray(newGrants)) return []
  const out: ISignInRewardItem[] = []
  for (const g of newGrants) {
    for (const item of g.reward_items || []) {
      out.push({
        type: item.type === 'coupon' ? 'coupon' : 'point',
        amount: item.amount,
        coupon_id: item.coupon_id,
        title: item.title,
        name: item.title || g.title,
        status: 'granted',
      })
    }
  }
  return out
}

function unwrapSubmit(res: any): ISignInSubmitResult {
  const raw = res?.data ?? res ?? {}
  const rewards =
    flattenGrants(raw.new_grants).length > 0
      ? flattenGrants(raw.new_grants)
      : (raw.rewards as ISignInRewardItem[] | undefined)
  return {
    signed_today: !!raw.signed_today,
    daily_point: raw.daily_points ?? raw.daily_point ?? null,
    progress_count: raw.activity?.progress_count ?? raw.progress_count,
    activity: raw.activity ?? null,
    new_grants: raw.new_grants,
    rewards,
  }
}

function isAlreadySignedError(e: any): boolean {
  const status = e?.statusCode || e?.status || e?.response?.status || e?.data?.status_code
  if (status === 409) return true
  const msg = String(e?.message || e?.data?.message || e?.data?.msg || '')
  return /已签到|already.?sign|signed/i.test(msg)
}

export function useMemberSignIn() {
  const loading = ref(false)
  const signing = ref(false)
  const weekDays = ref<ISignInWeekDay[]>([])
  const todaySigned = ref(false)
  const activity = ref<ISignInActivityProgress | null>(null)
  const lastResult = ref<ISignInSubmitResult | null>(null)
  const errorMessage = ref('')
  const usingMock = ref(false)

  const canSign = computed(() => !loading.value && !signing.value && !todaySigned.value)

  function applyMockWeek(signed = false) {
    usingMock.value = true
    weekDays.value = buildMockWeekDays(signed)
    todaySigned.value = signed
  }

  function applyMockActivity() {
    activity.value = buildMockActivity()
  }

  async function loadWeek() {
    try {
      const res = await memberSignInApiClient.getWeek()
      const week = unwrapWeek(res)
      if (!week.days.length) {
        applyMockWeek(false)
        return
      }
      usingMock.value = false
      weekDays.value = week.days
      todaySigned.value = week.todaySigned
    } catch {
      applyMockWeek(false)
    }
  }

  async function loadActivity() {
    try {
      const res = await memberSignInApiClient.getActivityProgress()
      const next = unwrapActivity(res)
      if (usingMock.value && !next) {
        applyMockActivity()
        return
      }
      activity.value = next
    } catch {
      if (usingMock.value) applyMockActivity()
      else activity.value = null
    }
  }

  const reminderEnabled = ref(false)
  const reminderUnavailable = ref(false)
  const reminderSaving = ref(false)

  function detectNotificationSupport(): 'unsupported' | NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
    return Notification.permission
  }

  async function loadReminder() {
    try {
      const res = await memberSignInApiClient.getReminder()
      reminderEnabled.value = !!res?.data?.enabled
      const perm = detectNotificationSupport()
      reminderUnavailable.value = perm === 'unsupported' || perm === 'denied'
      if (perm === 'denied') reminderEnabled.value = false
    } catch {
      reminderEnabled.value = false
    }
  }

  async function setReminderEnabled(next: boolean) {
    if (reminderSaving.value) return reminderEnabled.value
    reminderSaving.value = true
    try {
      if (!next) {
        if (!usingMock.value) {
          await memberSignInApiClient.setReminder(false)
        }
        reminderEnabled.value = false
        return false
      }

      const perm = detectNotificationSupport()
      if (perm === 'unsupported') {
        reminderUnavailable.value = true
        reminderEnabled.value = false
        const err = Object.assign(new Error('reminder unavailable'), {
          reminderUnavailable: true,
        })
        throw err
      }
      let granted = perm === 'granted'
      if (perm === 'default') {
        const result = await Notification.requestPermission()
        granted = result === 'granted'
      }
      if (!granted) {
        reminderUnavailable.value = Notification.permission === 'denied'
        reminderEnabled.value = false
        if (!usingMock.value) {
          try {
            await memberSignInApiClient.setReminder(false)
          } catch {
            /* ignore */
          }
        }
        const err = Object.assign(new Error('reminder denied'), { reminderDenied: true })
        throw err
      }

      if (!usingMock.value) {
        await memberSignInApiClient.setReminder(true)
      }
      reminderUnavailable.value = false
      reminderEnabled.value = true
      return true
    } finally {
      reminderSaving.value = false
    }
  }

  async function init() {
    loading.value = true
    errorMessage.value = ''
    try {
      await Promise.all([loadWeek(), loadActivity(), loadReminder()])
    } catch (e: any) {
      errorMessage.value = e?.message || 'load failed'
      applyMockWeek(false)
      applyMockActivity()
    } finally {
      loading.value = false
    }
  }

  async function submitSignIn() {
    if (!canSign.value) return null
    signing.value = true
    errorMessage.value = ''
    try {
      if (usingMock.value) {
        const result: ISignInSubmitResult = {
          daily_point: 1,
          signed_today: true,
          progress_count: (activity.value?.progress_count || 0) + 1,
          rewards: [{ type: 'point', amount: 1, name: '日常签到', status: 'granted' }],
        }
        lastResult.value = result
        todaySigned.value = true
        applyMockWeek(true)
        if (activity.value) {
          activity.value = {
            ...activity.value,
            progress_count: result.progress_count,
          }
        }
        return result
      }

      const res = await memberSignInApiClient.submitSignIn()
      const result = unwrapSubmit(res)
      lastResult.value = result
      todaySigned.value = true
      await Promise.all([loadWeek(), loadActivity()])
      return result
    } catch (e: any) {
      if (isAlreadySignedError(e)) {
        todaySigned.value = true
        await loadWeek()
        errorMessage.value = e?.data?.message || e?.message || 'already signed'
        const err = Object.assign(new Error(errorMessage.value), { alreadySigned: true, cause: e })
        throw err
      }
      errorMessage.value = e?.message || 'sign failed'
      throw e
    } finally {
      signing.value = false
    }
  }

  return {
    loading,
    signing,
    weekDays,
    todaySigned,
    activity,
    lastResult,
    errorMessage,
    usingMock,
    canSign,
    reminderEnabled,
    reminderUnavailable,
    reminderSaving,
    init,
    loadWeek,
    loadActivity,
    loadReminder,
    setReminderEnabled,
    submitSignIn,
    applyMockWeek,
    buildMockWeekDays,
  }
}
