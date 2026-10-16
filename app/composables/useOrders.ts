/**
 * 订单列表 Composable
 *
 * 职责:
 * - 管理订单列表状态
 * - 处理订单操作(取消、确认收货、删除)
 * - 提供分页和筛选功能
 */

import { ref, computed } from 'vue'
import { orderApiClient } from '~/infrastructure/http/clients/OrderApiClient'
import { OrderTransformer } from '~/infrastructure/transformers/orderTransformer'
import { OrderStatus, type ILogisticsTrace } from '~/types/api/order'
import type { OrderCancelTarget } from '~/composables/useOrderCancel'

export function useOrders() {
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

  // 状态
  const orders = ref<any[]>([])
  const loading = ref(false)
  const hasLoaded = ref(false)
  const error = ref<string | null>(null)
  const currentStatus = ref<OrderStatus>(OrderStatus.ALL)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const logisticsDialogVisible = ref(false)
  const logisticsLoading = ref(false)
  const logisticsError = ref<string | null>(null)
  const logisticsOrderId = ref('')
  const logisticsTrackingNo = ref('')
  const logisticsCompany = ref('')
  const logisticsTraces = ref<ILogisticsTrace[]>([])

  // 计算属性
  const hasMore = computed(() => {
    return currentPage.value * pageSize.value < total.value
  })

  const isEmpty = computed(() => {
    return hasLoaded.value && !loading.value && orders.value.length === 0
  })

  function getOrderStatusText(status: string) {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return t('de8076e6.9246fe')
      case OrderStatus.PENDING_SHIPMENT:
        return t('de8076e6.d8476e')
      case OrderStatus.SHIPPED:
        return t('de8076e6.4933ca')
      case OrderStatus.COMPLETED:
        return t('de8076e6.fad522')
      case OrderStatus.CANCELLED:
        return t('de8076e6.2111cc')
      case OrderStatus.PENDING_PICKUP:
        return t('de8076e6.25d532')
      case OrderStatus.AFTER_SALES:
        return t('f62e8236.a19124')
      case OrderStatus.PENDING_REVIEW:
        return t('de8076e6.a48b28')
      default:
        return t('de8076e6.a8b0c2')
    }
  }

  /** 对齐 vshop：线下凭证待审显示「待商家确认」 */
  function resolveOrderListStatusText(order: any) {
    if (order?.isOfflinePendingReview || String(order?.offlinePayCheckStatus) === '0') {
      return t('eab46cc2.awaitingMerchantConfirm')
    }
    return getOrderStatusText(order.status)
  }

  /**
   * 加载订单列表
   */
  async function loadOrders(status: OrderStatus = OrderStatus.ALL, page: number = 1) {
    loading.value = true
    error.value = null

    // 将前端状态映射为后端接口参数
    // 0：全部，5：待付款，1：待收货，4：待自提，3：待评价
    let apiStatus: string | number = 0

    switch (status) {
      case OrderStatus.ALL:
        apiStatus = 0
        break
      case OrderStatus.PENDING_PAYMENT:
        apiStatus = 5
        break
      case OrderStatus.SHIPPED:
        apiStatus = 1
        break
      case OrderStatus.PENDING_PICKUP:
        apiStatus = 4
        break
      case OrderStatus.PENDING_REVIEW:
        apiStatus = 3
        break
      case OrderStatus.AFTER_SALES:
        apiStatus = 'AFTER_SALES' // 假设售后有单独的标记或单独接口
        break
      default:
        apiStatus = 0
    }

    try {
      const response = await orderApiClient.getOrderList({
        status: apiStatus,
        page,
        pageSize: pageSize.value,
      })

      const result = OrderTransformer.toOrderListModel(response)

      const localizedOrders = result.orders.map((order) => ({
        ...order,
        statusText: resolveOrderListStatusText(order),
      }))

      if (page === 1) {
        orders.value = localizedOrders
      } else {
        orders.value = [...orders.value, ...localizedOrders]
      }

      total.value = result.total
      currentPage.value = page
      currentStatus.value = status
    } catch (err: any) {
      error.value = err.message || t('f62e8236.a1f439')
      toast.show(error.value || t('f62e8236.a1f439'))
    } finally {
      hasLoaded.value = true
      loading.value = false
    }
  }

  /**
   * 切换订单状态
   */
  async function changeStatus(status: OrderStatus) {
    if (status === currentStatus.value) return
    await loadOrders(status, 1)
  }

  /**
   * 加载更多
   */
  async function loadMore() {
    if (!hasMore.value || loading.value) return
    await loadOrders(currentStatus.value, currentPage.value + 1)
  }

  /**
   * 刷新当前列表
   */
  async function refresh() {
    await loadOrders(currentStatus.value, 1)
  }

  /**
   * 取消订单
   */
  async function cancelOrder(order: OrderCancelTarget) {
    return requestCancel(order, refresh)
  }

  /**
   * 确认收货
   */
  async function confirmReceipt(orderId: string) {
    return new Promise<boolean>((resolve) => {
      confirm({
        title: t('de8076e6.775b01'),
        content: t('f62e8236.98a7e2'),
        onConfirm: async () => {
          try {
            await orderApiClient.confirmReceipt(orderId)
            toast.show(t('f62e8236.867b41'))
            await refresh()
            resolve(true)
          } catch (err: any) {
            toast.show(err.message || t('f62e8236.637833'))
            resolve(false)
          }
        },
        onCancel: () => {
          resolve(false)
        },
      })
    })
  }

  /**
   * 删除订单
   */
  async function deleteOrder(orderId: string) {
    return new Promise<boolean>((resolve) => {
      confirm({
        title: t('de8076e6.09936f'),
        content: t('f62e8236.33a363'),
        onConfirm: async () => {
          try {
            await orderApiClient.deleteOrder(orderId)
            toast.show(t('f62e8236.a579ae'))
            await refresh()
            resolve(true)
          } catch (err: any) {
            toast.show(err.message || t('f62e8236.3acb3f'))
            resolve(false)
          }
        },
        onCancel: () => {
          resolve(false)
        },
      })
    })
  }

  /**
   * 立即支付
   */
  function payNow(orderId: string) {
    navigateTo(`/payment?orderId=${orderId}`)
  }

  /** 对齐 vshop CHANGE_OFFLINE：拒绝后修改凭证，带 has_check=true */
  function changeOfflineVoucher(orderId: string) {
    navigateTo(`/payment?orderId=${orderId}&has_check=true`)
  }

  /**
   * 再次购买
   */
  function buyAgain(orderId: string) {
    // TODO: 实现再次购买逻辑
    toast.show(t('f62e8236.4c9a4a'))
  }

  function applyLogisticsDetail(raw: any) {
    const detailModel = OrderTransformer.toOrderDetailModel(raw?.orderInfo || raw)
    logisticsTrackingNo.value = detailModel.logisticsNo || ''
    logisticsCompany.value = detailModel.logisticsCompany || ''
    return detailModel
  }

  /**
   * 查看物流
   */
  async function viewLogistics(orderId: string) {
    logisticsOrderId.value = orderId
    logisticsDialogVisible.value = true
    logisticsLoading.value = true
    logisticsError.value = null
    logisticsTrackingNo.value = ''
    logisticsCompany.value = ''
    logisticsTraces.value = []

    try {
      const [detailResult, logisticsResult] = await Promise.allSettled([
        orderApiClient.getOrderDetail(orderId),
        orderApiClient.getOrderLogistics(
          { orderId, orderType: 'normal' },
          { skipErrorCodes: [400, 401, 403, 404, 422, 500, 502, 503, 504] }
        ),
      ])

      let fallbackTraces: ILogisticsTrace[] = []

      if (detailResult.status === 'fulfilled') {
        const detailModel = applyLogisticsDetail(detailResult.value)
        fallbackTraces = detailModel.logisticsTraces || []
      }

      if (logisticsResult.status === 'fulfilled') {
        const traces = OrderTransformer.toTrackerPullTraces(logisticsResult.value)
        logisticsTraces.value = traces.length > 0 ? traces : fallbackTraces
      } else {
        logisticsTraces.value = fallbackTraces
        if (fallbackTraces.length === 0) {
          throw logisticsResult.reason
        }
      }
    } catch (err: any) {
      logisticsError.value = err?.message || t('de8076e6.3c2a32')
    } finally {
      logisticsLoading.value = false
    }
  }

  function closeLogisticsDialog() {
    logisticsDialogVisible.value = false
  }

  async function retryLogistics() {
    if (!logisticsOrderId.value) return
    await viewLogistics(logisticsOrderId.value)
  }

  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value)
  })

  return {
    // 状态
    orders,
    loading,
    hasLoaded,
    error,
    currentStatus,
    currentPage,
    pageSize,
    total,
    totalPages,
    hasMore,
    isEmpty,
    logisticsDialogVisible,
    logisticsLoading,
    logisticsError,
    logisticsTrackingNo,
    logisticsCompany,
    logisticsTraces,
    reasonModalVisible,
    cancelSubmitting,

    // 方法
    loadOrders,
    changeStatus,
    loadMore,
    refresh,
    cancelOrder,
    submitCancel,
    closeReasonModal,
    confirmReceipt,
    deleteOrder,
    payNow,
    changeOfflineVoucher,
    buyAgain,
    viewLogistics,
    closeLogisticsDialog,
    retryLogistics,
  }
}
