<template>
  <BCCouponCard
    :coupon="coupon"
    :show-action="false"
    :mobile-display="mobileDisplay"
    :test-id="testId"
  />
</template>

<script setup lang="ts">
import BCCouponCard from '~/components/BCCouponCard/BCCouponCard.vue'
import type { ICouponModel } from '~/infrastructure/transformers'

interface Props {
  /** 优惠券数据 */
  coupon: ICouponModel
  /** H5 展示态 */
  mobileDisplay?: boolean
  /** 测试标识 */
  testId?: string
}

defineOptions({
  name: 'CouponCard',
})

withDefaults(defineProps<Props>(), {
  mobileDisplay: false,
})
</script>

<style scoped></style>
