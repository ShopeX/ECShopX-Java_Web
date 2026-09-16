import { ref } from 'vue'
import { orderApiClient } from '~/infrastructure/http/clients/OrderApiClient'
import {
  buildCancelOrderPayload,
  isPaidOrder,
  type CancelOrderReasonValue,
} from '~/utils/orderCancel'

export interface OrderCancelTarget {
  orderId: string
  isPaid?: boolean
  payStatus?: string | null
}

export interface OrderCancelReasonInput {
  reason?: CancelOrderReasonValue
  otherReason?: string
}

export function useOrderCancel() {
  const toast = useToastMessage()
  const { confirm } = useModal()
  const { t } = useI18n()

  const reasonModalVisible = ref(false)
  const cancelSubmitting = ref(false)
  const pendingOrder = ref<{ orderId: string; isPaid: boolean } | null>(null)
  let afterSuccess: (() => Promise<void> | void) | null = null

  function requestCancel(
    order: OrderCancelTarget,
    onSuccess?: () => Promise<void> | void
  ): Promise<boolean> | void {
    const isPaid = isPaidOrder(order)
    pendingOrder.value = { orderId: order.orderId, isPaid }
    afterSuccess = onSuccess || null

    if (isPaid) {
      reasonModalVisible.value = true
      return
    }

    return new Promise<boolean>((resolve) => {
      confirm({
        title: t('de8076e6.b21b5e'),
        content: t('f62e8236.2baf23'),
        onConfirm: async () => {
          const success = await submitCancel()
          resolve(success)
        },
        onCancel: () => resolve(false),
      })
    })
  }

  async function submitCancel(input?: OrderCancelReasonInput) {
    if (!pendingOrder.value) return false

    cancelSubmitting.value = true
    try {
      const payload = buildCancelOrderPayload({
        orderId: pendingOrder.value.orderId,
        isPaid: pendingOrder.value.isPaid,
        reason: input?.reason,
        otherReason: input?.otherReason,
      })

      await orderApiClient.cancelOrder(payload)
      toast.show(t('f62e8236.5af500'))
      reasonModalVisible.value = false
      await afterSuccess?.()
      return true
    } catch (err: any) {
      if (err?.message !== 'other_reason_required') {
        toast.show(err?.message || t('f62e8236.c623f1'))
      }
      return false
    } finally {
      cancelSubmitting.value = false
    }
  }

  function closeReasonModal() {
    if (cancelSubmitting.value) return
    reasonModalVisible.value = false
  }

  return {
    reasonModalVisible,
    cancelSubmitting,
    requestCancel,
    submitCancel,
    closeReasonModal,
  }
}
