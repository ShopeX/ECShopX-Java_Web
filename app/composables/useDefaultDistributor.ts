import { storeToRefs } from 'pinia'
import { useDistributorStore } from '~/stores/distributor'

export function useDefaultDistributor() {
  const store = useDistributorStore()
  const { defaultDistributor, distributorId, isReady, loading, error } = storeToRefs(store)

  return {
    defaultDistributor,
    distributorId,
    isReady,
    loading,
    error,
    refreshDefaultDistributor: () => store.fetchDefaultDistributor(true),
  }
}
