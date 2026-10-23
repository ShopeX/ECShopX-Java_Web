import { ref, computed } from 'vue'
import { couponApiClient } from '~/infrastructure/http/clients/CouponApiClient'
import {
  UserCardTransformer,
  type IUserCardModel,
} from '~/infrastructure/transformers/userCardTransformer'

/**
 * 用户优惠券 Composable
 */
export function useUserCoupons() {
  const coupons = ref<IUserCardModel[]>([])
  const loading = ref(false)
  const error = ref<any>(null)

  const availableList = computed(() => coupons.value.filter((c: IUserCardModel) => c.usable))
  const unavailableList = computed(() => coupons.value.filter((c: IUserCardModel) => !c.usable))

  const fetchCoupons = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await couponApiClient.getUserCardList()
      coupons.value = UserCardTransformer.toUserCardList(response?.data || response)
    } catch (err) {
      error.value = err
      console.error('获取优惠券列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    coupons,
    availableList,
    unavailableList,
    loading,
    error,
    fetchCoupons,
  }
}
