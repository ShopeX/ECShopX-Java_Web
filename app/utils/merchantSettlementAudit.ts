/** 与 Vshop `subpages/merchant/consts.js` 一致 */
export const MERCHANT_AUDIT_UNKNOWN = 0
export const MERCHANT_AUDIT_PENDING = 1
export const MERCHANT_AUDIT_APPROVED = 2
export const MERCHANT_AUDIT_REJECTED = 3

/** 服务端 step=4 表示已提交审核（Vshop apply.js） */
export const MERCHANT_SETTLEMENT_SUBMITTED_STEP = 4

export const MERCHANT_REAPPLY_SESSION_KEY = 'merchant-settlement-reapply'

export type MerchantAuditPhase = 'pending' | 'approved' | 'rejected' | 'none'

export type MerchantAuditCode =
  | typeof MERCHANT_AUDIT_UNKNOWN
  | typeof MERCHANT_AUDIT_PENDING
  | typeof MERCHANT_AUDIT_APPROVED
  | typeof MERCHANT_AUDIT_REJECTED

export function parseMerchantAuditStatus(value: unknown): MerchantAuditCode | null {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  if (
    num === MERCHANT_AUDIT_UNKNOWN ||
    num === MERCHANT_AUDIT_PENDING ||
    num === MERCHANT_AUDIT_APPROVED ||
    num === MERCHANT_AUDIT_REJECTED
  ) {
    return num as MerchantAuditCode
  }
  const raw = String(value).trim().toLowerCase()
  if (['auditing', 'pending', 'review', 'reviewing', 'wait'].includes(raw)) {
    return MERCHANT_AUDIT_PENDING
  }
  if (['approved', 'approve', 'pass', 'passed', 'success'].includes(raw)) {
    return MERCHANT_AUDIT_APPROVED
  }
  if (['rejected', 'reject', 'fail', 'failed', 'refuse', 'denied'].includes(raw)) {
    return MERCHANT_AUDIT_REJECTED
  }
  return null
}

export function merchantAuditCodeToPhase(code: MerchantAuditCode | null): MerchantAuditPhase {
  if (code === MERCHANT_AUDIT_PENDING) return 'pending'
  if (code === MERCHANT_AUDIT_APPROVED) return 'approved'
  if (code === MERCHANT_AUDIT_REJECTED) return 'rejected'
  return 'none'
}

export function resolveMerchantAuditPhase(
  audit: Record<string, unknown> | null | undefined
): MerchantAuditPhase {
  const code = parseMerchantAuditStatus(audit?.audit_status)
  const phase = merchantAuditCodeToPhase(code)
  return phase === 'none' ? 'pending' : phase
}

/** step=4 且未点「重新申请」时展示审核页 */
export function shouldShowMerchantAuditView(step: number, reapplyMode: boolean): boolean {
  return step === MERCHANT_SETTLEMENT_SUBMITTED_STEP && !reapplyMode
}

export function readMerchantAuditMemo(audit: Record<string, unknown> | null | undefined): string {
  const memo = audit?.audit_memo
  return memo == null ? '' : String(memo).trim()
}

/** 审核意见拆成列表（Figma 驳回页；分隔符与 Vshop 文案习惯一致） */
export function formatMerchantAuditMemoLines(memo: string | undefined | null): string[] {
  if (!memo?.trim()) return []
  return memo
    .split(/[\n;；]+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function readMerchantReapplyMode(): boolean {
  if (!import.meta.client) return false
  return sessionStorage.getItem(MERCHANT_REAPPLY_SESSION_KEY) === '1'
}

export function markMerchantReapplyMode(): void {
  if (!import.meta.client) return
  sessionStorage.setItem(MERCHANT_REAPPLY_SESSION_KEY, '1')
}

export function clearMerchantReapplyMode(): void {
  if (!import.meta.client) return
  sessionStorage.removeItem(MERCHANT_REAPPLY_SESSION_KEY)
}
