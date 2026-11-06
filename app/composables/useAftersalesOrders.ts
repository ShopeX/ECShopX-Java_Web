import { computed, ref } from 'vue'
import { aftersalesApiClient } from '~/infrastructure/http/clients/AftersalesApiClient'
import { AftersalesTransformer } from '~/infrastructure/transformers/aftersalesTransformer'
import type { AftersalesTabKey } from '~/types/api/aftersales'

const AFTERSALES_STATUS_QUERY_MAP: Record<AftersalesTabKey, string | undefined> = {
  all: undefined,
  pending: '0',
  processing: '1',
  processed: '2',
  rejected: '3',
  closed: '4',
}

export function useAftersalesOrders() {
  const toast = useToastMessage()
  const { t } = useI18n()

  const orders = ref<any[]>([])
  const loading = ref(false)
  const hasLoaded = ref(false)
  const error = ref<string | null>(null)
  const currentStatus = ref<AftersalesTabKey>('all')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  const isEmpty = computed(() => hasLoaded.value && !loading.value && orders.value.length === 0)
  const totalPages = computed(() =>
    pageSize.value > 0 ? Math.max(1, Math.ceil(total.value / pageSize.value)) : 1
  )

  async function loadAftersalesOrders(status: AftersalesTabKey = 'all', page: number = 1) {
    loading.value = true
    error.value = null

    try {
      const response = await aftersalesApiClient.getAftersalesList({
        page,
        pageSize: pageSize.value,
        aftersales_status: AFTERSALES_STATUS_QUERY_MAP[status],
      })

      const result = AftersalesTransformer.toAftersalesListModel(response)
      orders.value = result.orders
      total.value = result.total
      currentPage.value = page
      currentStatus.value = status
    } catch (err: any) {
      error.value = err.message || t('18636536.f8106f')
      toast.show(error.value || t('18636536.f8106f'))
    } finally {
      hasLoaded.value = true
      loading.value = false
    }
  }

  async function changeStatus(status: AftersalesTabKey) {
    if (status === currentStatus.value) return
    await loadAftersalesOrders(status, 1)
  }

  async function refresh() {
    await loadAftersalesOrders(currentStatus.value, 1)
  }

  async function cancelAftersales(aftersalesId: string, itemId: string) {
    if (!aftersalesId || !itemId) return false
    loading.value = true
    try {
      await aftersalesApiClient.cancelAftersales(aftersalesId, itemId)
      toast.show(t('18636536.8e05b0'))
      await refresh()
      return true
    } catch (err: any) {
      toast.show(err.message || t('18636536.a8301a'))
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    loading,
    hasLoaded,
    error,
    currentStatus,
    currentPage,
    pageSize,
    total,
    totalPages,
    isEmpty,
    loadAftersalesOrders,
    changeStatus,
    refresh,
    cancelAftersales,
  }
}
