import { getBusinessMode } from '~/composables/useTemplate'
import { useDistributorStore } from '~/stores/distributor'
import type { IDefaultDistributor } from '~/types/api/distributor'
import { logger } from '~/utils/log'

export default defineNuxtPlugin({
  name: 'distributor-init',
  dependsOn: ['http'],
  async setup() {
    // BBC 不依赖默认线上店；传店铺 ID 反而易导致数据异常
    if (getBusinessMode() !== 'b2c') {
      return
    }

    const distributorCache = useCookie<IDefaultDistributor | null>('default-distributor', {
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    })

    // 兼容旧 cookie 名，避免刷新后短暂丢失默认店
    const legacyCache = useCookie<IDefaultDistributor | null>('b2c-default-distributor', {
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    })

    const store = useDistributorStore()
    // cookie 仅作请求期间的软回退；必须以 is_valid 强制刷新，避免旧店 ID 残留
    store.hydrateFromCache(distributorCache.value || legacyCache.value)

    try {
      const distributor = await store.fetchDefaultDistributor(true)
      if (distributor) {
        distributorCache.value = distributor
        legacyCache.value = distributor
        logger.info(
          `[distributor-init] default store loaded: ${distributor.distributorId} (${distributor.storeName})`
        )
      } else {
        distributorCache.value = null
        legacyCache.value = null
      }
    } catch (error) {
      logger.warn('[distributor-init] failed to initialize default distributor', error)
    }
  },
})
