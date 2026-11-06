import { defineStore } from 'pinia'
import { distributorApiClient } from '~/infrastructure/http/clients/DistributorApiClient'
import { DistributorTransformer } from '~/infrastructure/transformers/distributorTransformer'
import type { IDefaultDistributor } from '~/types/api/distributor'
import { logger } from '~/utils/log'

let pendingDefaultDistributor: Promise<IDefaultDistributor | null> | null = null

interface DistributorState {
  defaultDistributor: IDefaultDistributor | null
  loaded: boolean
  loading: boolean
  error: string | null
}

export const useDistributorStore = defineStore('distributor', {
  state: (): DistributorState => ({
    defaultDistributor: null,
    loaded: false,
    loading: false,
    error: null,
  }),

  getters: {
    distributorId: (state): string => state.defaultDistributor?.distributorId ?? '0',
    isReady: (state): boolean => state.loaded,
  },

  actions: {
    /**
     * 仅软填充，不标记 loaded。
     * 避免 cookie 旧值把 isReady 置 true 后短路跳过 is_valid 刷新。
     */
    hydrateFromCache(cached: IDefaultDistributor | null | undefined) {
      const id = Number(cached?.distributorId ?? 0)
      if (!cached || !Number.isFinite(id) || id <= 0) return
      if (this.defaultDistributor) return
      this.defaultDistributor = cached
    },

    async fetchDefaultDistributor(force = false) {
      if (pendingDefaultDistributor) return pendingDefaultDistributor
      if (this.loaded && !force && this.defaultDistributor) {
        return this.defaultDistributor
      }

      this.loading = true
      this.error = null

      pendingDefaultDistributor = (async () => {
        try {
          const response = await distributorApiClient.getDefaultDistributor()
          this.defaultDistributor = DistributorTransformer.toDefaultDistributor(response)
          return this.defaultDistributor
        } catch (error) {
          logger.warn('[distributor-store] fetch default distributor failed', error)
          this.error = 'fetch_failed'
          throw error
        } finally {
          this.loading = false
          this.loaded = true
          pendingDefaultDistributor = null
        }
      })()

      return pendingDefaultDistributor
    },
  },
})
