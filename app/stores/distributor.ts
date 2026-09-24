import { defineStore } from 'pinia'
import { distributorApiClient } from '~/infrastructure/http/clients/DistributorApiClient'
import { DistributorTransformer } from '~/infrastructure/transformers/distributorTransformer'
import { getBusinessMode } from '~/composables/useTemplate'
import type { IDefaultDistributor } from '~/types/api/distributor'
import { logger } from '~/utils/log'

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
    hydrateFromCache(cached: IDefaultDistributor | null | undefined) {
      if (!cached?.distributorId) return
      this.defaultDistributor = cached
      this.loaded = true
    },

    async fetchDefaultDistributor(force = false) {
      if (getBusinessMode() !== 'b2c') {
        this.loaded = true
        return this.defaultDistributor
      }

      if (this.loading) return this.defaultDistributor
      if (this.loaded && !force && this.defaultDistributor) {
        return this.defaultDistributor
      }

      this.loading = true
      this.error = null

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
      }
    },
  },
})
