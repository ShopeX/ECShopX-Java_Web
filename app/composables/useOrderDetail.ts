/**
 * 订单详情 Composable
 *
 * 职责：
 * - 管理订单详情数据与物流信息
 * - 处理操作按钮逻辑（取消、确认收货、申请售后等）
 */

import { ref, computed } from 'vue'
import { orderApiClient } from '~/infrastructure/http/clients/OrderApiClient'
import { OrderTransformer } from '~/infrastructure/transformers/orderTransformer'
import type { ILogisticsTrace } from '~/types/api/order'
import type { IInvoiceFormData } from '~/components/BCInvoiceModal/types'

export function useOrderDetail() {
  const toast = useToastMessage()
  const { confirm } = useModal()
  const { t } = useI18n()
  const {
    reasonModalVisible,
    cancelSubmitting,
    requestCancel,
    submitCancel,
    closeReasonModal,
  } = useOrderCancel()
  const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

  function translateIfGeneratedKey(value: string) {
    return generatedKeyPattern.test(value) ? t(value) : value
  }

  const order = ref<any | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const logisticsDialogVisible = ref(false)
  const logisticsLoading = ref(false)
  const logisticsError = ref<string | null>(null)
  const logisticsTraces = ref<ILogisticsTrace[]>([])
  const invoiceDialogVisible = ref(false)
  const {
    invoiceData,
    invoiceLoading,
    invoiceSubmitError,
    openInvoiceDialog,
    closeInvoiceDialog,
    submitInvoice,
    formatInvoiceSummary,
  } = useInvoiceForm({ visible: invoiceDialogVisible })

  function getOrderStatusText(status: string) {
    switch (status) {
      case 'pending_payment':
        return t('de8076e6.9246fe')
      case 'pending_shipment':
        return t('de8076e6.d8476e')
      case 'shipped':
        return t('de8076e6.4933ca')
      case 'completed':
        return t('de8076e6.fad522')
      case 'cancelled':
        return t('de8076e6.2111cc')
      case 'pending_pickup':
        return t('de8076e6.25d532')
      case 'after_sales':
        return t('f62e8236.a19124')
      case 'pending_review':
        return t('de8076e6.a48b28')
      default:
        return t('de8076e6.a8b0c2')
    }
  }

  function resolveOrderDetailStatusText(detailModel: any) {
    if (detailModel?.isOfflinePendingReview || String(detailModel?.offlinePayCheckStatus) === '0') {
      return t('eab46cc2.awaitingMerchantConfirm')
    }
    return getOrderStatusText(detailModel.status)
  }

  async function fetchOrderDetail(orderId: string) {
    loading.value = true
    error.value = null
    try {
      const raw = await orderApiClient.getOrderDetail(orderId)
      const orderInfo = raw?.orderInfo || raw
      const detailModel = OrderTransformer.toOrderDetailModel(orderInfo)
      order.value = {
        ...detailModel,
        statusText: resolveOrderDetailStatusText(detailModel),
        shippingMethod: translateIfGeneratedKey(detailModel.shippingMethod || ''),
        invoiceInfo: translateIfGeneratedKey(detailModel.invoiceInfo || ''),
      }
    } catch (err: any) {
      error.value = err.message || t('433a5846.f95aed')
      toast.show(error.value || t('433a5846.f95aed'))
    } finally {
      loading.value = false
    }
  }

  const availableActions = computed<string[]>(() => {
    if (!order.value) return []
    const actions: string[] = []
    if (order.value.canChangeOfflineVoucher) actions.push('change_offline')
    if (order.value.canCancel) actions.push('cancel')
    if (order.value.canPay) actions.push('pay')
    if (order.value.canConfirmReceipt) actions.push('confirm_receipt')
    if (order.value.canViewLogistics) actions.push('logistics')
    if (order.value.canApplyAftersales) actions.push('aftersales')
    return actions
  })

  async function cancelOrder() {
    if (!order.value) return
    return requestCancel(order.value, () => fetchOrderDetail(order.value.orderId))
  }

  async function confirmReceipt() {
    if (!order.value) return
    return new Promise<boolean>((resolve) => {
      confirm({
        title: t('de8076e6.775b01'),
        content: t('f62e8236.98a7e2'),
        onConfirm: async () => {
          try {
            await orderApiClient.confirmReceipt(order.value.orderId)
            toast.show(t('f62e8236.867b41'))
            await fetchOrderDetail(order.value.orderId)
            resolve(true)
          } catch (err: any) {
            toast.show(err.message || t('f62e8236.637833'))
            resolve(false)
          }
        },
        onCancel: () => resolve(false),
      })
    })
  }

  function applyAftersales() {
    toast.show(t('de8076e6.ef0547'))
  }

  function applyInvoice() {
    openInvoiceDialog()
  }

  async function submitOrderInvoice(data: IInvoiceFormData) {
    const success = await submitInvoice(data)
    if (success && order.value) {
      order.value.invoiceInfo = formatInvoiceSummary(invoiceData.value || data)
    }
    return success
  }

  function payNow() {
    if (!order.value) return
    navigateTo(`/payment?orderId=${order.value.orderId}`)
  }

  function changeOfflineVoucher() {
    if (!order.value) return
    navigateTo(`/payment?orderId=${order.value.orderId}&has_check=true`)
  }

  async function viewLogistics() {
    if (!order.value) return

    logisticsDialogVisible.value = true
    logisticsLoading.value = true
    logisticsError.value = null
    logisticsTraces.value = []

    try {
      const response = await orderApiClient.getOrderLogistics(
        {
          orderId: order.value.orderId,
          orderType: 'normal',
        },
        { skipErrorCodes: [400, 401, 403, 404, 422, 500, 502, 503, 504] }
      )

      const traces = OrderTransformer.toTrackerPullTraces(response)
      logisticsTraces.value = traces.length > 0 ? traces : (order.value.logisticsTraces ?? [])
    } catch (err: any) {
      logisticsTraces.value = order.value.logisticsTraces ?? []

      if (logisticsTraces.value.length === 0) {
        logisticsError.value = err?.message || t('de8076e6.3c2a32')
      }
    } finally {
      logisticsLoading.value = false
    }
  }

  function closeLogisticsDialog() {
    logisticsDialogVisible.value = false
  }

  async function retryLogistics() {
    await viewLogistics()
  }

  const displayInvoiceInfo = computed(() => {
    const info = formatInvoiceSummary(invoiceData.value) || order.value?.invoiceInfo || ''
    if (!info) return ''
    if (Array.isArray(info) && info.length === 0) return ''
    if (typeof info === 'string' && (info.trim() === '[]' || info.trim() === '{}')) return ''
    if (typeof info === 'object' && Object.keys(info).length === 0) return ''

    return info
  })

  return {
    order,
    loading,
    error,
    availableActions,
    logisticsDialogVisible,
    logisticsLoading,
    logisticsError,
    logisticsTraces,
    invoiceDialogVisible,
    reasonModalVisible,
    cancelSubmitting,
    invoiceLoading,
    invoiceSubmitError,
    invoiceData,
    displayInvoiceInfo,
    fetchOrderDetail,
    cancelOrder,
    submitCancel,
    closeReasonModal,
    confirmReceipt,
    applyAftersales,
    applyInvoice,
    submitOrderInvoice,
    closeInvoiceDialog,
    payNow,
    changeOfflineVoucher,
    viewLogistics,
    closeLogisticsDialog,
    retryLogistics,
  }
}
