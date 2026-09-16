<template>
  <div class="bg-white content-stretch flex h-full flex-col items-start p-4 lg:p-8 relative size-full">
    <!-- 顶部标题栏 -->
    <div class="relative shrink-0 w-full">
      <div
        class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-between px-0 py-4 relative w-full"
      >
        <div class="relative shrink-0">
          <div
            class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center relative"
          >
            <p
              class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-xl text-[#191a1d] text-nowrap"
            >
              {{ t('ee3264ed.45bcee') }}
            </p>
          </div>
        </div>
        <!-- 关闭按钮 -->
        <button
          class="relative shrink-0 size-[24px] hover:opacity-70 transition-opacity"
          @click="handleClose"
        >
          <UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-[#191a1d]" />
        </button>
      </div>
    </div>

    <!-- 优惠券列表容器 -->
    <div class="content-stretch flex min-h-0 flex-1 flex-col items-start pt-8 relative w-full">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex flex-1 justify-center py-10 w-full">
        <ECLoading />
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="!loading && coupons.length === 0"
        class="flex flex-1 flex-col items-center justify-center py-10 w-full"
      >
        <svg
          class="w-16 h-16 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
        <p class="text-base text-gray-600 mb-2">{{ t('af283a3e.241241') }}</p>
        <p class="text-sm text-gray-400">{{ t('af283a3e.7ab36d') }}</p>
      </div>

      <!-- 优惠券列表 -->
      <div v-else class="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-auto pr-1" data-testid="coupon-list">
        <BCCouponCard
          v-for="coupon in coupons"
          :key="coupon.id"
          data-testid="coupon-item"
          :coupon="coupon"
          :is-selected="pendingCoupon?.id === coupon.id"
          :variant="'checkout'"
          :show-action="false"
          :loading="loading"
          @claim="handleClaim"
          @select="handleSelect"
          @unselect="handleUnselect"
        />
      </div>
    </div>

    <div class="mt-6 w-full shrink-0 border-t border-[#f3f4f6] pt-4 lg:pt-6">
      <button
        data-testid="checkout-coupon-confirm"
        type="button"
        class="flex w-full items-center justify-center bg-[#0f0f10] px-4 py-4 text-sm font-medium leading-5 text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="loading"
        @click="handleConfirm"
      >
        {{ t('ee3264ed.45bcee') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 优惠券选择组件
 *
 * 从右往左弹出的优惠券选择抽屉，用于选择和使用优惠券
 * 参照 MiniCart 的实现方式
 */

import { ECLoading } from '~/components/ECLoading'
import { ref, watch } from 'vue'
import BCCouponCard from '~/components/BCCouponCard/BCCouponCard.vue'
import type { ICouponModel } from '~/infrastructure/transformers'

defineOptions({
  name: 'CouponSelector',
})

// Props
interface Props {
  /** 是否显示 */
  modelValue?: boolean
  /** 优惠券列表 */
  coupons?: ICouponModel[]
  /** 已选中的优惠券 */
  selectedCoupon?: ICouponModel | null
  /** 加载状态 */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  coupons: () => [],
  selectedCoupon: null,
  loading: false,
})

const { t } = useI18n()
const pendingCoupon = ref<ICouponModel | null>(props.selectedCoupon)

watch(
  () => props.selectedCoupon,
  value => {
    pendingCoupon.value = value
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      pendingCoupon.value = props.selectedCoupon
    }
  },
  { immediate: true }
)

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  claim: [coupon: ICouponModel]
  select: [coupon: ICouponModel]
  unselect: []
}>()

/**
 * 处理关闭
 */
function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

/**
 * 处理领取优惠券
 */
function handleClaim(coupon: ICouponModel) {
  emit('claim', coupon)
}

/**
 * 处理选择优惠券
 */
function handleSelect(coupon: ICouponModel) {
  pendingCoupon.value = coupon
}

/**
 * 处理取消选择
 */
function handleUnselect() {
  pendingCoupon.value = null
}

function handleConfirm() {
  if (pendingCoupon.value) {
    emit('select', pendingCoupon.value)
  } else {
    emit('unselect')
  }

  handleClose()
}
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
