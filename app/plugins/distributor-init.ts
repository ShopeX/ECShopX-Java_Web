import { getBusinessMode } from '~/composables/useTemplate'
import { useDistributorStore } from '~/stores/distributor'
import type { IDefaultDistributor } from '~/types/api/distributor'
import { logger } from '~/utils/log'

export default defineNuxtPlugin({
  name: 'distributor-init',
  dependsOn: ['http'],
  async setup() {
    if (getBusinessMode() !== 'b2c') {
      return
    }

    const distributorCache = useCookie<IDefaultDistributor | null>('b2c-default-distributor', {
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    })

    const store = useDistributorStore()
    store.hydrateFromCache(distributorCache.value)

    try {
      const distributor = await store.fetchDefaultDistributor()
      if (distributor) {
        distributorCache.value = distributor
        logger.info(
          `[distributor-init] B2C default store loaded: ${distributor.distributorId} (${distributor.storeName})`
        )
      }
    } catch (error) {
      logger.warn('[distributor-init] failed to initialize default distributor', error)
    }
  },
})
