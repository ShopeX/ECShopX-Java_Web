import { invoiceApiClient } from '~/infrastructure/http/clients/InvoiceApiClient'
import { useUserStore } from '~/stores/user'
import type { IInvoiceFormData } from '~/components/BCInvoiceModal/types'

interface UseInvoiceFormOptions {
  visible?: Ref<boolean>
}

export function useInvoiceForm(options: UseInvoiceFormOptions = {}) {
  const { t } = useI18n()
  const toast = useToastMessage()
  const userStore = useUserStore()

  const invoiceDialogVisible = options.visible ?? ref(false)
  const invoiceLoading = ref(false)
  const invoiceSubmitError = ref('')
  const invoiceData = ref<IInvoiceFormData | undefined>()

  function formatInvoiceSummary(data?: IInvoiceFormData | null) {
    if (!data) return ''
    const typeLabel = data.type === 'individual' ? t('ee3264ed.6a0e04') : t('ee3264ed.04c9e3')
    return `${typeLabel} | ${data.title}`
  }

  function openInvoiceDialog() {
    invoiceSubmitError.value = ''
    invoiceDialogVisible.value = true
  }

  function closeInvoiceDialog() {
    invoiceDialogVisible.value = false
    invoiceSubmitError.value = ''
  }

  function clearInvoice() {
    invoiceData.value = undefined
    invoiceSubmitError.value = ''
  }

  async function submitInvoice(data: IInvoiceFormData) {
    const telephone = data.telephone?.trim() || userStore.userInfo?.mobile?.trim() || ''
    if (!telephone) {
      invoiceSubmitError.value = t('21755ff3.837776')
      return false
    }

    invoiceLoading.value = true
    invoiceSubmitError.value = ''

    try {
      const normalizedData: IInvoiceFormData = {
        ...data,
        title: data.title.trim(),
        taxNumber: data.taxNumber.trim(),
        businessAddress: data.businessAddress.trim(),
        bank: data.bank.trim(),
        bankAccount: data.bankAccount.trim(),
        telephone,
      }

      await invoiceApiClient.createInvoice({
        invoices_type: normalizedData.type,
        name: normalizedData.title,
        telephone: normalizedData.telephone,
        tax_number: normalizedData.taxNumber || undefined,
        business_address: normalizedData.businessAddress || undefined,
        bank: normalizedData.bank || undefined,
        bank_account: normalizedData.bankAccount || undefined,
        is_def: false,
      })

      invoiceData.value = normalizedData
      invoiceDialogVisible.value = false
      toast.show(t('21755ff3.2eac36'))
      return true
    } catch (error: any) {
      invoiceSubmitError.value = error?.message || t('21755ff3.ca2e80')
      return false
    } finally {
      invoiceLoading.value = false
    }
  }

  return {
    invoiceDialogVisible,
    invoiceLoading,
    invoiceSubmitError,
    invoiceData,
    openInvoiceDialog,
    closeInvoiceDialog,
    clearInvoice,
    submitInvoice,
    formatInvoiceSummary,
  }
}
