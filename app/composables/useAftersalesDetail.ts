import { computed, ref } from 'vue'
import { aftersalesApiClient } from '~/infrastructure/http/clients/AftersalesApiClient'
import { AftersalesTransformer } from '~/infrastructure/transformers/aftersalesTransformer'

export function useAftersalesDetail() {
  const route = useRoute()
  const toast = useToastMessage()
  const { t } = useI18n()

  const detail = ref<any | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const aftersalesId = computed(() => String(route.params.id || ''))
  const itemId = computed(() => String(route.query.itemId || ''))

  async function fetchAftersalesDetail() {
    if (!aftersalesId.value || !itemId.value) {
      error.value = t('18636536.f8106f')
      toast.show(error.value)
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await aftersalesApiClient.getAftersalesDetail({
        aftersales_bn: aftersalesId.value,
        item_id: itemId.value,
      })
      const record = response?.data || response
      detail.value = AftersalesTransformer.toAftersalesDetailModel(record)
    } catch (err: any) {
      error.value = err.message || t('18636536.f8106f')
      toast.show(error.value || t('18636536.f8106f'))
    } finally {
      loading.value = false
    }
  }

  async function cancelAftersales() {
    if (!aftersalesId.value || !itemId.value) return false

    try {
      await aftersalesApiClient.cancelAftersales(aftersalesId.value, itemId.value)
      toast.show(t('6e17c55c.8e05b0'))
      await fetchAftersalesDetail()
      return true
    } catch (err: any) {
      toast.show(err.message || t('6e17c55c.a8301a'))
      return false
    }
  }

  return {
    detail,
    loading,
    error,
    aftersalesId,
    itemId,
    fetchAftersalesDetail,
    cancelAftersales,
  }
}
