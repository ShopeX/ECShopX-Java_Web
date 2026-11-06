import { describe, expect, it } from 'vitest'
import {
  formatMerchantAuditMemoLines,
  MERCHANT_AUDIT_APPROVED,
  MERCHANT_AUDIT_PENDING,
  MERCHANT_AUDIT_REJECTED,
  MERCHANT_SETTLEMENT_SUBMITTED_STEP,
  merchantAuditCodeToPhase,
  parseMerchantAuditStatus,
  resolveMerchantAuditPhase,
  shouldShowMerchantAuditView,
} from './merchantSettlementAudit'

describe('merchantSettlementAudit (aligned with Vshop)', () => {
  it('maps audit_status 1/2/3 to pending/approved/rejected', () => {
    expect(parseMerchantAuditStatus(1)).toBe(MERCHANT_AUDIT_PENDING)
    expect(parseMerchantAuditStatus(2)).toBe(MERCHANT_AUDIT_APPROVED)
    expect(parseMerchantAuditStatus(3)).toBe(MERCHANT_AUDIT_REJECTED)
    expect(merchantAuditCodeToPhase(1)).toBe('pending')
    expect(merchantAuditCodeToPhase(2)).toBe('approved')
    expect(merchantAuditCodeToPhase(3)).toBe('rejected')
  })

  it('shows audit view when settlement step is 4', () => {
    expect(shouldShowMerchantAuditView(MERCHANT_SETTLEMENT_SUBMITTED_STEP, false)).toBe(true)
    expect(shouldShowMerchantAuditView(MERCHANT_SETTLEMENT_SUBMITTED_STEP, true)).toBe(false)
    expect(shouldShowMerchantAuditView(3, false)).toBe(false)
  })

  it('defaults unknown audit status to pending on audit page', () => {
    expect(resolveMerchantAuditPhase({})).toBe('pending')
    expect(resolveMerchantAuditPhase({ audit_status: 2 })).toBe('approved')
  })

  it('splits audit memo into bullet lines', () => {
    expect(formatMerchantAuditMemoLines('')).toEqual([])
    expect(formatMerchantAuditMemoLines('a;b；c\nd')).toEqual(['a', 'b', 'c', 'd'])
  })
})
