import { merchantSettlementApiClient } from '~/infrastructure/http/clients/MerchantSettlementApiClient'
import { formatSelectedCategoryLabels } from '~/utils/merchantMainCategory'
import {
  clearMerchantReapplyMode,
  markMerchantReapplyMode,
  readMerchantAuditMemo,
  readMerchantReapplyMode,
  resolveMerchantAuditPhase,
  shouldShowMerchantAuditView,
  type MerchantAuditPhase,
} from '~/utils/merchantSettlementAudit'
import type {
  IMerchantBaseSetting,
  IMerchantCategoryNode,
  IMerchantSettlementForm,
  MerchantAccountType,
  MerchantSettledType,
} from '~/types/api/merchant'

const defaultForm = (): IMerchantSettlementForm => ({
  settled_type: '',
  main_category_selection: [],
  merchant_name: '',
  social_credit_code_id: '',
  registered_address: '',
  legal_name: '',
  legal_cert_id: '',
  contact_name: '',
  contact_mobile: '',
  agreement_accepted: false,
  license_url: '',
  legal_certid_front_url: '',
  legal_cert_id_back_url: '',
  bank_card_front_url: '',
  bank_account_type: '',
  bank_name: '',
  bank_account: '',
  bank_mobile: '',
})

export type MerchantUiStep = 1 | 2 | 3

export function useMerchantSettlement() {
  const { t } = useI18n()
  const toast = useToastMessage()

  const loading = ref(false)
  const submitting = ref(false)
  const uiStep = ref<MerchantUiStep>(1)
  const baseSetting = ref<IMerchantBaseSetting | null>(null)
  const categoryTree = ref<IMerchantCategoryNode[]>([])
  const categoryNameFallback = ref<string[]>([])
  const form = ref<IMerchantSettlementForm>(defaultForm())
  const settlementDetail = ref<Record<string, unknown> | null>(null)
  const auditResult = ref<Record<string, unknown> | null>(null)
  const settlementStep = ref(1)
  const reapplyMode = ref(false)
  const auditPhase = ref<MerchantAuditPhase | null>(null)
  const confirmVisible = ref(false)
  const agreementVisible = ref(false)
  const resettingAuditPassword = ref(false)
  const runtimeConfig = useRuntimeConfig()

  const selectedCategoryLabel = computed(() =>
    formatSelectedCategoryLabels(
      form.value.main_category_selection,
      categoryTree.value,
      categoryNameFallback.value
    )
  )

  const settledTypeOptions = computed(() => {
    const allowed = baseSetting.value?.settled_type ?? ['enterprise', 'soletrader']
    const labels: Record<MerchantSettledType, string> = {
      enterprise: t('merchantSettlement.settledEnterprise'),
      soletrader: t('merchantSettlement.settledSoletrader'),
    }
    return allowed.map((value) => ({
      value: value as MerchantSettledType,
      label: labels[value as MerchantSettledType] ?? value,
    }))
  })

  const auditPanelVisible = computed(() =>
    shouldShowMerchantAuditView(settlementStep.value, reapplyMode.value) &&
    auditPhase.value !== null &&
    auditPhase.value !== 'none'
  )

  const auditPanelStatus = computed(() => {
    const phase = auditPhase.value
    if (phase === 'approved' || phase === 'rejected' || phase === 'pending') return phase
    return 'pending' as const
  })

  const auditMemo = computed(() => readMerchantAuditMemo(auditResult.value))

  const auditLoginMobile = computed(() => {
    const mobile = auditResult.value?.mobile
    return mobile == null ? '' : String(mobile)
  })

  const auditLoginPassword = computed(() => {
    const password = auditResult.value?.password
    return password == null ? '' : String(password)
  })

  const auditMerchantLoginUrl = computed(() => {
    const fromEnv = runtimeConfig.public.merchantAdminLoginUrl
    if (fromEnv) return String(fromEnv).trim()
    if (import.meta.client) return `${window.location.origin}/merchant/login`
    return ''
  })

  const accountTypeOptions = computed(() => [
    { value: 'public' as MerchantAccountType, label: t('merchantSettlement.accountTypePublic') },
    { value: 'private' as MerchantAccountType, label: t('merchantSettlement.accountTypePrivate') },
  ])

  /** 结算银行下拉选项：后端提供银行列表接口后可替换为接口数据 */
  const bankOptions = [
    '招商银行',
    '中国工商银行',
    '中国建设银行',
    '中国农业银行',
    '中国银行',
    '交通银行',
    '上海浦东发展银行',
    '中信银行',
    '中国民生银行',
    '兴业银行',
    '中国光大银行',
    '平安银行',
    '华夏银行',
    '广发银行',
    '中国邮政储蓄银行',
  ]

  function applyDetailToForm(detail: Record<string, unknown>) {
    const text = (value: unknown) => (value == null ? '' : String(value))
    if (detail.settled_type)
      form.value.settled_type = text(detail.settled_type) as MerchantSettledType
    const selection = detail.main_category_selection
    if (Array.isArray(selection)) {
      form.value.main_category_selection = selection
        .map((item) => {
          if (!item || typeof item !== 'object') return null
          const row = item as Record<string, unknown>
          const categoryId = Number(row.category_id)
          const level = Number(row.level)
          if (!Number.isFinite(categoryId) || categoryId <= 0) return null
          if (level !== 2 && level !== 3) return null
          return {
            category_id: categoryId,
            level: level as 2 | 3,
            name: row.name != null ? String(row.name) : undefined,
          }
        })
        .filter(Boolean) as IMerchantSettlementForm['main_category_selection']
    }
    if (Array.isArray(detail.main_category_names)) {
      categoryNameFallback.value = detail.main_category_names.map((name) => String(name || ''))
    }
    form.value.merchant_name = text(detail.merchant_name) || form.value.merchant_name
    form.value.social_credit_code_id =
      text(detail.social_credit_code_id) || form.value.social_credit_code_id
    form.value.registered_address =
      text(detail.license_registered_address) ||
      text(detail.address) ||
      form.value.registered_address
    form.value.legal_name =
      text(detail.license_legal_representative) ||
      text(detail.legal_name) ||
      form.value.legal_name
    form.value.legal_cert_id = text(detail.legal_cert_id) || form.value.legal_cert_id
    form.value.contact_name = text(detail.contact_name) || form.value.contact_name
    form.value.contact_mobile = text(detail.contact_mobile) || form.value.contact_mobile
    form.value.license_url = text(detail.license_url) || form.value.license_url
    form.value.legal_certid_front_url =
      text(detail.legal_certid_front_url) || form.value.legal_certid_front_url
    form.value.legal_cert_id_back_url =
      text(detail.legal_cert_id_back_url) || form.value.legal_cert_id_back_url
    form.value.bank_card_front_url =
      text(detail.bank_card_front_url) || form.value.bank_card_front_url
    const accountType = text(detail.bank_acct_type || detail.bank_account_type)
    if (accountType === '1' || accountType === 'public') form.value.bank_account_type = 'public'
    if (accountType === '2' || accountType === 'private') form.value.bank_account_type = 'private'
    form.value.bank_name = text(detail.bank_name) || form.value.bank_name
    form.value.bank_account =
      text(detail.bank_account) || text(detail.card_id_mask) || form.value.bank_account
    form.value.bank_mobile = text(detail.bank_mobile) || form.value.bank_mobile
  }

  function setMainCategorySelection(selection: IMerchantSettlementForm['main_category_selection']) {
    form.value.main_category_selection = selection
  }

  async function loadCategories() {
    try {
      categoryTree.value = await merchantSettlementApiClient.getMerchantCategoryTree()
    } catch {
      categoryTree.value = []
    }
  }

  async function loadAuditSnapshot() {
    try {
      auditResult.value = await merchantSettlementApiClient.getAuditStatus()
    } catch {
      auditResult.value = null
    }
  }

  async function loadSettlementDetailIfNeeded(step: number) {
    if (step <= 1) return
    const detail = await merchantSettlementApiClient.getSettlementDetail()
    const detailRecord = detail ? (detail as Record<string, unknown>) : null
    settlementDetail.value = detailRecord
    if (detailRecord) applyDetailToForm(detailRecord)
  }

  async function copyAuditLoginInfo() {
    const url = auditMerchantLoginUrl.value
    const mobile = auditLoginMobile.value
    const password = auditLoginPassword.value
    const text = `${t('merchantSettlement.auditLoginUrl')}${url}\n${t('merchantSettlement.auditLoginAccount')}${mobile}\n${t('merchantSettlement.auditLoginPasswordLabel')}${password}`
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const area = document.createElement('textarea')
        area.value = text
        area.style.position = 'fixed'
        area.style.left = '-9999px'
        document.body.appendChild(area)
        area.select()
        document.execCommand('copy')
        area.remove()
      }
      toast.show(t('merchantSettlement.auditCopySuccess'))
    } catch {
      toast.show(t('merchantSettlement.auditCopyFailed'))
    }
  }

  async function resetAuditLoginPassword() {
    resettingAuditPassword.value = true
    try {
      const res = await merchantSettlementApiClient.resetMerchantPassword()
      const password = res?.password
      if (password != null && auditResult.value) {
        auditResult.value = { ...auditResult.value, password }
      }
      toast.show(t('merchantSettlement.auditResetPasswordSuccess'))
    } catch (e: any) {
      toast.show(e?.message || t('merchantSettlement.auditResetPasswordFailed'))
    } finally {
      resettingAuditPassword.value = false
    }
  }

  async function startReapply() {
    markMerchantReapplyMode()
    reapplyMode.value = true
    auditPhase.value = null
    uiStep.value = 1
    try {
      await loadSettlementDetailIfNeeded(2)
    } catch {
      // 回显失败不阻断重新填写
    }
  }

  async function bootstrap() {
    loading.value = true
    uiStep.value = 1
    auditPhase.value = null
    settlementDetail.value = null
    reapplyMode.value = readMerchantReapplyMode()
    try {
      baseSetting.value = await merchantSettlementApiClient.getBaseSetting()
      await loadCategories()

      const step = await merchantSettlementApiClient.getSettlementStep()
      settlementStep.value = Number.isFinite(step) ? step : 1

      if (shouldShowMerchantAuditView(settlementStep.value, reapplyMode.value)) {
        await loadAuditSnapshot()
        auditPhase.value = resolveMerchantAuditPhase(auditResult.value)
        await loadSettlementDetailIfNeeded(2)
        return
      }

      if (settlementStep.value === 1) {
        clearMerchantReapplyMode()
        reapplyMode.value = false
      }

      await loadSettlementDetailIfNeeded(settlementStep.value)
      if (settlementStep.value >= 1 && settlementStep.value <= 3) {
        uiStep.value = settlementStep.value as MerchantUiStep
      }
    } catch (e: any) {
      toast.show(e?.message || t('merchantSettlement.loadFailed'))
    } finally {
      loading.value = false
    }
  }

  function validateStep1(): boolean {
    if (!form.value.main_category_selection.length) {
      toast.show(t('merchantSettlement.categoryRequired'))
      return false
    }
    if (!form.value.settled_type) {
      toast.show(t('merchantSettlement.settledTypeRequired'))
      return false
    }
    if (!form.value.agreement_accepted) {
      toast.show(t('merchantSettlement.agreementRequired'))
      return false
    }
    return true
  }

  function validateStep2(): boolean {
    const f = form.value
    if (!f.merchant_name.trim()) {
      toast.show(t('merchantSettlement.companyNameRequired'))
      return false
    }
    if (f.social_credit_code_id.trim().length !== 18) {
      toast.show(t('merchantSettlement.socialCreditInvalid'))
      return false
    }
    if (!f.registered_address.trim()) {
      toast.show(t('merchantSettlement.addressRequired'))
      return false
    }
    if (!f.legal_name.trim() || f.legal_cert_id.trim().length !== 18) {
      toast.show(t('merchantSettlement.legalRequired'))
      return false
    }
    if (!f.contact_name.trim() || !f.contact_mobile.trim()) {
      toast.show(t('merchantSettlement.contactRequired'))
      return false
    }
    if (!f.license_url) {
      toast.show(t('merchantSettlement.licenseRequired'))
      return false
    }
    if (!f.legal_certid_front_url || !f.legal_cert_id_back_url) {
      toast.show(t('merchantSettlement.idCardRequired'))
      return false
    }
    const bankIdentityMissing =
      f.bank_account_type === 'private' ? !f.bank_mobile.trim() : !f.bank_name.trim()
    if (
      !f.bank_card_front_url ||
      !f.bank_account_type ||
      !f.bank_account.trim() ||
      bankIdentityMissing
    ) {
      toast.show(t('merchantSettlement.bankRequired'))
      return false
    }
    return true
  }

  async function goNext() {
    if (submitting.value) return
    if (uiStep.value === 1) {
      if (!validateStep1()) return
      submitting.value = true
      try {
        const settled = form.value.settled_type as MerchantSettledType
        await merchantSettlementApiClient.saveSettlementStep(
          1,
          merchantSettlementApiClient.buildStep1Body(settled, form.value.main_category_selection)
        )
        uiStep.value = 2
      } catch (e: any) {
        toast.show(e?.message || t('merchantSettlement.saveFailed'))
      } finally {
        submitting.value = false
      }
      return
    }
    if (uiStep.value === 2) {
      if (!validateStep2()) return
      submitting.value = true
      try {
        await merchantSettlementApiClient.saveSettlementStep(
          2,
          merchantSettlementApiClient.buildStep2Body(form.value)
        )
        uiStep.value = 3
      } catch (e: any) {
        toast.show(e?.message || t('merchantSettlement.saveFailed'))
      } finally {
        submitting.value = false
      }
    }
  }

  function goBack() {
    if (uiStep.value > 1) uiStep.value = (uiStep.value - 1) as MerchantUiStep
  }

  /** 预览页点击「提交审核」：先校验，再弹二次确认 */
  function requestSubmit() {
    if (!validateStep1()) {
      uiStep.value = 1
      return
    }
    if (!validateStep2()) {
      uiStep.value = 2
      return
    }
    confirmVisible.value = true
  }

  async function submitApplication() {
    if (!validateStep1() || !validateStep2()) {
      uiStep.value = validateStep1() ? 2 : 1
      confirmVisible.value = false
      return
    }
    submitting.value = true
    try {
      await merchantSettlementApiClient.saveSettlementStep(
        3,
        merchantSettlementApiClient.buildStep3Body()
      )
      clearMerchantReapplyMode()
      reapplyMode.value = false
      settlementStep.value = 4
      await loadAuditSnapshot()
      auditPhase.value = resolveMerchantAuditPhase(auditResult.value)
      toast.show(t('merchantSettlement.submitSuccess'))
    } catch (e: any) {
      toast.show(e?.message || t('merchantSettlement.submitFailed'))
    } finally {
      submitting.value = false
      confirmVisible.value = false
    }
  }

  return {
    loading,
    submitting,
    uiStep,
    baseSetting,
    categoryTree,
    selectedCategoryLabel,
    form,
    auditResult,
    auditPanelVisible,
    auditPanelStatus,
    auditMemo,
    auditLoginMobile,
    auditLoginPassword,
    auditMerchantLoginUrl,
    resettingAuditPassword,
    copyAuditLoginInfo,
    resetAuditLoginPassword,
    startReapply,
    confirmVisible,
    agreementVisible,
    settledTypeOptions,
    accountTypeOptions,
    bankOptions,
    bootstrap,
    setMainCategorySelection,
    goNext,
    goBack,
    requestSubmit,
    submitApplication,
  }
}
