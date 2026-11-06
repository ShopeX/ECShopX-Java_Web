import { computed, ref } from 'vue'
import { collectDistributionApiClient } from '~/infrastructure/http/clients'
import {
  CollectDistributionTransformer,
  type IFollowedStoreCard,
} from '~/infrastructure/transformers/collectDistributionTransformer'

export function useFollowedStores() {
  const stores = ref<IFollowedStoreCard[]>([])
  const loading = ref(false)
  const hasLoaded = ref(false)
  const errorMessage = ref('')

  const isEmpty = computed(
    () => hasLoaded.value && stores.value.length === 0 && !errorMessage.value
  )

  async function loadFollowedStores() {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await collectDistributionApiClient.getCollectDistributionList({
        page: 1,
        pageSize: 20,
      })
      stores.value = CollectDistributionTransformer.toFollowedStoreList(response)
    } catch (error) {
      console.error('获取关注店铺列表失败:', error)
      stores.value = []
      errorMessage.value = '1d80cba8.a6c36fLoadFailed'
    } finally {
      loading.value = false
      hasLoaded.value = true
    }
  }

  return {
    stores,
    loading,
    hasLoaded,
    errorMessage,
    isEmpty,
    loadFollowedStores,
  }
}
