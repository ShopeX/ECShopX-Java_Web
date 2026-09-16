import type { MaybeRefOrGetter } from 'vue'
import { computed, ref, toValue, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { ProductRecommendation } from '~/components/BCProductRecommendations/types'
import { itemApiClient } from '~/infrastructure/http/clients/ItemApiClient'
import { RecommendationMatchTransformer } from '~/infrastructure/transformers/recommendationMatchTransformer'
import { getBusinessMode } from '~/composables/useTemplate'
import type { ItemRecommendationScene } from '~/types/api/item'
import { logger } from '~/utils/log'
import { useDistributorStore } from '~/stores/distributor'
import { normalizeRecommendationItemIds } from '~/utils/normalizeRecommendationItemIds'
import { resolveDistributorIdNumber } from '~/utils/resolveDistributorId'

export interface UseProductRecommendationsOptions {
  scene: ItemRecommendationScene
  mainItemIds: MaybeRefOrGetter<Array<string | number>>
  distributorId?: MaybeRefOrGetter<string | number>
  excludeItemIds?: MaybeRefOrGetter<Array<string | number>>
  enabled?: MaybeRefOrGetter<boolean>
}

export function useProductRecommendations(options: UseProductRecommendationsOptions) {
  const distributorStore = useDistributorStore()
  const { distributorId: defaultDistributorId, isReady: isDistributorReady } =
    storeToRefs(distributorStore)
  const products = ref<ProductRecommendation[]>([])
  const loading = ref(false)
  const visible = computed(() => products.value.length > 0)
  let loadSeq = 0

  const load = async () => {
    if (import.meta.server) {
      return
    }

    if (!toValue(options.enabled ?? true)) {
      products.value = []
      return
    }

    const mainItemIds = normalizeRecommendationItemIds(toValue(options.mainItemIds))
    if (!mainItemIds.length) {
      products.value = []
      return
    }

    const resolvedDistributorId = resolveDistributorIdNumber(toValue(options.distributorId))
    if (getBusinessMode() === 'b2c' && resolvedDistributorId <= 0) {
      products.value = []
      return
    }

    const excludeItemIds = normalizeRecommendationItemIds(toValue(options.excludeItemIds ?? []))
    const seq = ++loadSeq

    loading.value = true
    try {
      const response = await itemApiClient.matchRecommendations({
        scene: options.scene,
        distributor_id: resolvedDistributorId,
        main_item_ids: mainItemIds,
        ...(excludeItemIds.length ? { exclude_item_ids: excludeItemIds } : {}),
      })
      if (seq !== loadSeq) return
      products.value = RecommendationMatchTransformer.toRecommendationList(response)
    } catch (error) {
      if (seq !== loadSeq) return
      logger.warn(`[product-recommendations] load failed (${options.scene})`, error)
      products.value = []
    } finally {
      if (seq === loadSeq) {
        loading.value = false
      }
    }
  }

  watch(
    [
      () => options.scene,
      () => normalizeRecommendationItemIds(toValue(options.mainItemIds)).join(','),
      () => resolveDistributorIdNumber(toValue(options.distributorId)),
      defaultDistributorId,
      isDistributorReady,
      () => normalizeRecommendationItemIds(toValue(options.excludeItemIds ?? [])).join(','),
      () => toValue(options.enabled ?? true),
    ],
    () => {
      void load()
    },
    { immediate: true }
  )

  return {
    products,
    loading: readonly(loading),
    visible,
    reload: load,
  }
}
