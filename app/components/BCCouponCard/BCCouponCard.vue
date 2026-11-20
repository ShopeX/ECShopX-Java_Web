<template>
  <div
    class="border border-solid bg-white content-stretch flex flex-col items-start relative shrink-0 w-full transition-colors"
    :class="cardClass"
    :data-testid="testId"
    :role="isCheckoutVariant ? 'button' : undefined"
    :tabindex="isCheckoutVariant ? 0 : undefined"
    @click="handleCardClick"
    @keydown.enter.prevent="handleCardClick"
    @keydown.space.prevent="handleCardClick"
  >
    <template v-if="showAction">
      <div class="flex grow min-h-[136px] w-full items-stretch">
        <div
          class="flex w-[140px] shrink-0 flex-col items-center justify-center gap-2 px-4 py-6"
          :class="leftPanelClass"
        >
          <div
            class="flex items-end justify-center gap-1 font-['Inter'] font-medium text-[#191a1d]"
            :class="coupon.cardType === 'gift' ? 'text-[24px] leading-[30px]' : ''"
          >
            <span v-if="coupon.displayPrefix" class="text-base leading-5">{{
              coupon.displayPrefix
            }}</span>
            <span :class="valueClass">{{ displayValueText }}</span>
            <span v-if="displaySuffixText" class="text-base leading-5">
              {{ displaySuffixText }}
            </span>
          </div>
          <p class="text-xs leading-4 text-[#4a5565]">{{ typeLabelText }}</p>
        </div>

        <div class="flex min-w-0 flex-1 flex-col justify-center gap-2 px-4 py-4">
          <p class="truncate text-sm font-medium leading-5 text-[#191a1d]">{{ titleText }}</p>
          <div class="flex items-start gap-2 text-xs leading-4 text-[#4a5565]">
            <span class="shrink-0 text-[#99a1af]">{{ t('29b38e7b.011009') }}</span>
            <span class="min-w-0 flex-1 break-words">{{ usageTimeText }}</span>
          </div>
          <div class="flex items-start gap-2 text-xs leading-4 text-[#4a5565]">
            <span class="shrink-0 text-[#99a1af]">{{ t('29b38e7b.602ab6') }}</span>
            <span class="min-w-0 flex-1 break-words">{{ ruleText }}</span>
          </div>
        </div>
      </div>

      <!-- 底部：领取/使用按钮 -->
      <div class="relative shrink-0 w-full">
        <div
          class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex flex-col items-start relative w-full"
        >
          <button
            v-if="!isSelected"
            class="bg-[#0f0f10] relative shrink-0 w-full hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
            @click="handleClaim"
          >
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center px-0 py-[16px] relative w-full"
            >
              <p
                class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[14px] text-center text-nowrap text-white"
              >
                {{ t('29b38e7b.d09c38') }}
              </p>
            </div>
          </button>
          <button
            v-else
            class="bg-gray-100 relative shrink-0 w-full hover:bg-gray-200 transition-colors"
            @click="handleUnselect"
          >
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center px-0 py-[16px] relative w-full"
            >
              <p
                class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[14px] text-center text-nowrap text-[#191a1d]"
              >
                {{ t('29b38e7b.f08afd') }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex grow min-h-[107px] w-full items-stretch">
        <div
          class="flex w-[140px] shrink-0 flex-col items-center justify-center gap-1 bg-[#f3f4f6] px-8 py-6"
        >
          <div
            class="flex items-center justify-center gap-1 font-['Inter'] font-medium text-[#191a1d]"
            :class="coupon.cardType === 'gift' ? 'text-[24px] leading-[30px]' : ''"
          >
            <span v-if="coupon.displayPrefix" class="text-base leading-5">{{
              coupon.displayPrefix
            }}</span>
            <span :class="valueClass">{{ displayValueText }}</span>
            <span v-if="displaySuffixText" class="text-base leading-5">
              {{ displaySuffixText }}
            </span>
          </div>
          <p class="text-xs leading-4 text-[#99a1af]">{{ displayAmountHint }}</p>
        </div>

        <div class="flex min-w-0 flex-1 items-center">
          <div class="flex min-w-0 flex-1 flex-col justify-center gap-2 px-4">
            <p class="truncate text-sm font-medium leading-5" :class="displayTitleClass">
              {{ titleText }}
            </p>
            <p class="text-xs leading-4 text-[#4a5565]">{{ ruleText }}</p>
            <div class="flex items-center gap-1 text-xs leading-4 text-[#99a1af]">
              <svg
                class="size-3 shrink-0 text-[#99a1af]"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="6" cy="6" r="5.25" stroke="currentColor" stroke-width="1.5" />
                <path
                  d="M6 5.25V8.25"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                />
                <circle cx="6" cy="3.5" r="0.75" fill="currentColor" />
              </svg>
              <span class="min-w-0 flex-1 break-words">{{ displayValidityText }}</span>
            </div>
          </div>

          <div v-if="isCheckoutVariant" class="flex shrink-0 items-center pr-4">
            <span
              class="flex size-6 items-center justify-center rounded-full border border-solid transition-colors"
              :class="selectionIndicatorClass"
              aria-hidden="true"
            >
              <svg
                v-if="isSelected"
                class="size-3 text-white"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 6.25L4.75 8.5L9.5 3.75"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ICouponModel } from '~/infrastructure/transformers'

defineOptions({
  name: 'CouponCard',
})

interface Props {
  /** 优惠券数据 */
  coupon: ICouponModel
  /** 是否已选中 */
  isSelected?: boolean
  /** 卡片展示变体 */
  variant?: 'default' | 'checkout'
  /** 加载状态 */
  loading?: boolean
  /** 是否显示操作区 */
  showAction?: boolean
  /** H5 展示态 */
  mobileDisplay?: boolean
  /** 测试标识 */
  testId?: string
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  variant: 'default',
  loading: false,
  showAction: true,
  mobileDisplay: false,
  testId: undefined,
})

const emit = defineEmits<{
  (e: 'claim', coupon: ICouponModel): void
  (e: 'select', coupon: ICouponModel): void
  (e: 'unselect'): void
}>()
const { t } = useI18n()

const isCheckoutVariant = computed(() => props.variant === 'checkout' && !props.showAction)

const cardClass = computed(() => {
  if (!isCheckoutVariant.value) {
    return 'border-[#e5e7eb]'
  }

  return props.isSelected
    ? 'cursor-pointer border-[#0f0f10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f0f10]/20'
    : 'cursor-pointer border-[#e5e7eb] hover:border-[#191a1d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f0f10]/20'
})

const leftPanelClass = computed(() => {
  const classMap: Record<string, string> = {
    discount: 'bg-[#f4f6ff]',
    cash: 'bg-[#fff4eb]',
    gift: 'bg-[#eefbf3]',
  }

  return classMap[props.coupon.cardType] || 'bg-[#f3f4f6]'
})

const valueClass = computed(() => {
  if (props.coupon.cardType === 'gift') {
    return 'text-[24px] leading-[30px]'
  }

  return 'text-[36px] leading-[36px]'
})

function translateCouponText(
  fallback: string | undefined,
  i18nText: ICouponModel['titleI18n']
): string {
  if (!i18nText?.key) return fallback || ''
  return t(i18nText.key, i18nText.params || {})
}

const displayValueText = computed(() =>
  translateCouponText(props.coupon.displayValue, props.coupon.displayValueI18n)
)

const displaySuffixText = computed(() =>
  translateCouponText(props.coupon.displaySuffix, props.coupon.displaySuffixI18n)
)

const typeLabelText = computed(() =>
  translateCouponText(props.coupon.typeLabel, props.coupon.typeLabelI18n)
)

const titleText = computed(() => translateCouponText(props.coupon.title, props.coupon.titleI18n))

const usageTimeText = computed(() =>
  translateCouponText(props.coupon.usageTimeText, props.coupon.usageTimeI18n)
)

const ruleText = computed(() =>
  translateCouponText(props.coupon.ruleText, props.coupon.ruleTextI18n)
)

const displayAmountHint = computed(() => {
  if (props.coupon.cardType === 'gift') {
    return props.coupon.minFee > 0
      ? t('29b38e7b.72206b', { amount: formatDisplayNumber(props.coupon.minFee) })
      : typeLabelText.value
  }

  if (props.coupon.minFee > 0) {
    return t('29b38e7b.2f0fb2', { amount: formatDisplayNumber(props.coupon.minFee) })
  }

  return t('29b38e7b.cb9ba4')
})

const displayTitleClass = computed(() =>
  props.mobileDisplay ? 'text-[#4a5565]' : 'text-[#191a1d]'
)

const selectionIndicatorClass = computed(() =>
  props.isSelected ? 'border-[#0f0f10] bg-[#0f0f10]' : 'border-[#d2d6db] bg-white'
)

const displayValidityText = computed(() => {
  const usageText = usageTimeText.value.trim()
  if (!usageText) return t('29b38e7b.ba47c8')

  if (!props.mobileDisplay) {
    return t('29b38e7b.17e8e9', { value: usageText.replace(/\s*-\s*/g, '-') })
  }

  if (props.coupon.usageTimeKind === 'range') {
    const parts = props.coupon.usageTimeText.split(' - ')
    return t('29b38e7b.1aabae', { value: parts[parts.length - 1] || usageText })
  }

  if (props.coupon.usageTimeKind === 'until') {
    const date = props.coupon.usageTimeI18n?.params?.date || usageText
    return t('29b38e7b.1aabae', { value: date })
  }

  if (props.coupon.usageTimeKind === 'longTerm') {
    return t('29b38e7b.ba47c8')
  }

  return t('29b38e7b.33f8b1', { value: usageText })
})

function formatDisplayNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return value
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')
}

/**
 * 处理领取优惠券
 */
function handleClaim() {
  if (props.loading) return
  emit('claim', props.coupon)
  emit('select', props.coupon)
}

/**
 * 处理取消选择
 */
function handleUnselect() {
  emit('unselect')
}

function handleCardClick() {
  if (!isCheckoutVariant.value) return

  if (props.isSelected) {
    emit('unselect')
    return
  }

  emit('select', props.coupon)
}
</script>
