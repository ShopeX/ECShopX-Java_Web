<template>
  <div
    class="bg-white content-stretch flex flex-col items-start relative shrink-0 w-full lg:w-[320px]"
  >
    <div class="relative shrink-0 w-full lg:w-[320px]">
      <div
        class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex flex-col gap-[24px] items-start relative w-full"
      >
        <div
          class="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full lg:w-[320px]"
        >
          <!-- 商品数量 -->
          <div class="relative shrink-0 w-full lg:w-[320px]">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex gap-[8px] items-center relative w-full"
            >
              <UIcon name="i-heroicons-shopping-bag" class="size-4 text-[#4a5565]" />
              <div class="relative shrink-0">
                <div
                  class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center relative"
                >
                  <p
                    class="font-['Noto_Sans_SC'] font-normal leading-[20px] relative shrink-0 text-[14px] text-[#4a5565] text-nowrap"
                  >
                    {{ t('a3060bb4.26b6eb', { count: selectedCount }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 商品总计 (不含优惠) -->
          <div class="relative shrink-0 w-full lg:w-[320px]">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-between relative w-full"
            >
              <div class="h-[20px] relative shrink-0">
                <p
                  class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#4a5565] text-nowrap"
                >
                  {{ t('a3060bb4.de8e9a') }}
                </p>
              </div>
              <div class="relative shrink-0">
                <p
                  class="font-['Inter'] font-normal leading-[20px] text-[14px] text-[#191a1d] text-nowrap"
                >
                  {{ subtotalDisplay }}
                </p>
              </div>
            </div>
          </div>

          <!-- 运费 -->
          <div class="relative shrink-0 w-full lg:w-[320px]">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-between relative w-full"
            >
              <div class="h-[20px] relative shrink-0">
                <p
                  class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#4a5565] text-nowrap"
                >
                  {{ t('a3060bb4.9a935b') }}
                </p>
              </div>
              <div class="relative shrink-0">
                <p
                  class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#191a1d] text-nowrap"
                >
                  {{ shippingFee === 0 ? t('ab027ee5.aa2c91') : shippingDisplay }}
                </p>
              </div>
            </div>
          </div>

          <!-- 优惠 -->
          <div v-if="discountAmount > 0" class="relative shrink-0 w-full lg:w-[320px]">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-between relative w-full"
            >
              <div class="h-[20px] relative shrink-0">
                <p
                  class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#4a5565] text-nowrap"
                >
                  {{ t('a3060bb4.f06ebf') }}
                </p>
              </div>
              <div class="relative shrink-0">
                <p
                  class="font-['Inter'] font-normal leading-[20px] text-[14px] text-[#191a1d] text-nowrap"
                >
                  - {{ discountDisplay }}
                </p>
              </div>
            </div>
          </div>

          <!-- 分割线 -->
          <div class="bg-[rgba(0,0,0,0.1)] h-px shrink-0 w-full lg:w-[320px]" />

          <!-- 总计 -->
          <div class="relative shrink-0 w-full">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-between py-0 relative w-full"
            >
              <div class="relative shrink-0">
                <div
                  v-if="discountAmount > 0"
                  class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex font-['Noto_Sans_SC'] font-normal items-center leading-[20px] relative text-[14px] text-[#d0112f] text-nowrap"
                >
                  <p class="relative shrink-0">{{ t('a3060bb4.dd2fd1') }}</p>
                  <p class="relative shrink-0">{{ discountDisplay }}</p>
                </div>
              </div>
              <div class="basis-0 grow relative shrink-0">
                <div
                  class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-end relative w-full"
                >
                  <div class="content-stretch flex items-center justify-center relative shrink-0">
                    <p
                      class="font-['Noto_Sans_SC'] font-normal leading-[20px] relative shrink-0 text-[14px] text-[#191a1d] text-nowrap"
                    >
                      {{ t('a3060bb4.e2c2bc') }}
                    </p>
                  </div>
                  <div class="content-stretch flex items-center relative shrink-0">
                    <p
                      class="font-['Inter'] font-medium leading-[36px] relative shrink-0 text-[24px] text-[#191a1d] text-nowrap"
                    >
                      {{ totalDisplay }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 结算按钮 -->
        <div class="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
          <button
            class="bg-[#0f0f10] relative shrink-0 w-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-black transition-colors"
            :disabled="disabled || loading"
            @click="$emit('checkout')"
          >
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center px-0 py-[16px] relative w-full"
            >
              <p
                class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[14px] text-center text-nowrap text-white"
              >
                {{ loading ? t('a3060bb4.2fb90b') : t('a3060bb4.01e5a3') }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 购物车订单汇总组件 (Order Summary)
 *
 * 按照 Figma 设计实现，用于 PC 端购物车页面侧边栏
 */

const { t } = useI18n()

interface Props {
  /** 选中商品数量 */
  selectedCount: number
  /** 商品小计显示字符串 */
  subtotalDisplay: string
  /** 优惠金额显示字符串 */
  discountDisplay: string
  /** 优惠金额数值 */
  discountAmount: number
  /** 运费金额 */
  shippingFee?: number
  /** 运费显示字符串 */
  shippingDisplay?: string
  /** 总计显示字符串 */
  totalDisplay: string
  /** 是否禁用结算 */
  disabled?: boolean
  /** 是否正在处理 */
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  shippingFee: 0,
  shippingDisplay: '',
  disabled: false,
  loading: false,
  discountAmount: 0,
})

defineEmits<{
  (e: 'checkout'): void
}>()
</script>
