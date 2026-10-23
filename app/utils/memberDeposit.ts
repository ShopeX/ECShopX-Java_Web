/**
 * 会员储值纯函数：开关判断、金额与字段解析
 */

export function parseDepositEnabledFlag(value: unknown): boolean | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  const normalized = String(value).trim().toLowerCase()
  if (['false', '0', 'off', 'close', 'closed', 'disabled'].includes(normalized)) return false
  if (['true', '1', 'on', 'open', 'enabled'].includes(normalized)) return true
  return null
}

export function asDepositRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' ? (value as Record<string, any>) : {}
}

export function resolveDepositEnabled(payload: Record<string, any>): boolean | null {
  const candidates = [
    payload.enabled,
    payload.is_open,
    payload.deposit_enabled,
    payload.depositEnabled,
    payload.open,
  ]
  for (const candidate of candidates) {
    const parsed = parseDepositEnabledFlag(candidate)
    if (parsed !== null) return parsed
  }
  return null
}

export function resolveDepositFen(payload: Record<string, any>): number {
  const value = Number(payload.deposit ?? 0)
  return Number.isFinite(value) ? value : 0
}

/** 本月已消费（分）；字段缺失返回 null，UI 展示 `--` */
export function resolveMonthlySpentFen(payload: Record<string, any>): number | null {
  const raw =
    payload.month_consume ??
    payload.month_spent ??
    payload.consume_amount ??
    payload.monthConsume ??
    payload.month_outcome ??
    payload.monthOutcome
  if (raw === undefined || raw === null || raw === '') return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export function formatFenToYuan(fen: number | null | undefined, fallback = '0.00'): string {
  if (fen == null || !Number.isFinite(fen)) return fallback
  return (fen / 100).toFixed(2)
}

export function maskMobile(mobile?: string | null): string {
  const digits = String(mobile ?? '').replace(/\D/g, '')
  if (digits.length < 7) return digits || '--'
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`
}

export function formatQueryTimestamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** 储值流水状态文案；成功态返回空，由调用方回退到「充值/赠送」等类型标签 */
export function resolveDepositStatusLabel(status: unknown): string {
  const normalized = String(status ?? '')
    .trim()
    .toLowerCase()
  if (!normalized) return ''
  if (['processing', 'process', 'doing'].includes(normalized)) return '处理中'
  if (['pending', 'unpaid', 'notpay', 'wait_pay', 'waitpay'].includes(normalized)) return '待支付'
  if (['failed', 'fail', 'error', 'closed'].includes(normalized)) return '失败'
  if (['success', 'successed', 'successful', 'completed', 'paid', 'done'].includes(normalized)) {
    return ''
  }
  return ''
}

/** 充值记录退款申请状态文案（F-043） */
export function resolveDepositApplyStatusLabel(applyStatus: unknown): string {
  const normalized = String(applyStatus ?? '')
    .trim()
    .toLowerCase()
  if (!normalized || normalized === 'none' || normalized === 'cancelled') return ''
  if (normalized === 'pending') return '退款审核中'
  if (normalized === 'refunding' || normalized === 'failed') return '退款处理中'
  if (normalized === 'refunded') return '已退'
  if (normalized === 'rejected') return '退款已驳回'
  return ''
}

export function fenToYuanLabel(fen: unknown, prefix = '¥'): string {
  const value = Number(fen)
  if (!Number.isFinite(value)) return `${prefix}0.00`
  return `${prefix}${formatFenToYuan(Math.abs(value))}`
}
