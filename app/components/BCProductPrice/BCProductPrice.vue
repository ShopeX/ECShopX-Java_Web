<template>
  <div class="flex flex-col items-start" :class="variant === 'detail' ? 'gap-1' : 'gap-0.5'">
    <template v-if="hasMemberPrice">
      <div class="flex items-center gap-1">
        <span :class="primaryPriceClass">{{ formatMoneyFen(memberPriceCents) }}</span>
        <span
          class="shrink-0 border border-[#fd9c00] bg-[#fff5e1] px-[3px] py-[3px] font-['Noto_Sans_SC'] text-[9px] font-normal leading-[9px] text-[#fd9c00]"
        >
          {{ t('464b6330.8fdd6f') }}
        </span>
      </div>
      <span :class="memberSecondaryPriceClass">
        <template v-if="variant === 'detail'">
          {{ t('c23b194b.nonMemberPrice') }}
        </template>
        {{ formatMoneyFen(salePriceCents) }}
      </span>
    </template>
    <div
      v-else
      :class="[
        saleMarketLayout === 'inline'
          ? 'flex items-center gap-2.5 flex-wrap'
          : 'flex flex-col items-start gap-0.5',
      ]"
    >
      <span :class="primaryPriceClass">{{ formatMoneyFen(salePriceCents) }}</span>
      <span v-if="showMarketPrice" :class="marketPriceClass">
        {{ formatMoneyFen(marketPriceCents) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductPriceDisplay } from '~/composables/useProductPriceDisplay'
import { formatMoneyFen } from '~/utils/currencyFormat'

interface Props {
  salePriceCents: number
  marketPriceCents?: number
  memberPriceCents?: number
  size?: 'lg' | 'sm'
  /** inline：销售价与划线价同一行；stack：上下排列 */
  layout?: 'inline' | 'stack'
  /** detail：详情页 / SKU 抽屉样式（会员价标签在价格右侧） */
  variant?: 'default' | 'detail'
}

const props = withDefaults(defineProps<Props>(), {
  marketPriceCents: 0,
  memberPriceCents: 0,
  size: 'lg',
  layout: undefined,
  variant: 'default',
})

const { t } = useI18n()

const salePriceCents = computed(() => props.salePriceCents)
const marketPriceCents = computed(() => props.marketPriceCents)
const memberPriceCents = computed(() => props.memberPriceCents)

const { hasMemberPrice, showMarketPrice } = useProductPriceDisplay({
  salePriceCents,
  marketPriceCents,
  memberPriceCents,
})

const saleMarketLayout = computed(() => {
  if (props.layout) return props.layout
  return props.size === 'lg' ? 'inline' : 'stack'
})

const primaryPriceClass = computed(() =>
  props.size === 'lg'
    ? 'text-2xl font-medium leading-9 text-[#191a1d]'
    : 'text-base font-medium leading-5 text-[#191a1d]'
)

const secondaryPriceClass = computed(() =>
  props.size === 'lg'
    ? 'text-base font-normal text-[#4a5565] leading-6'
    : 'text-xs font-normal text-[#4a5565] leading-4'
)

const memberSecondaryPriceClass = computed(() =>
  props.variant === 'detail'
    ? "font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#8f99aa]"
    : secondaryPriceClass.value
)

const marketPriceClass = computed(() =>
  props.size === 'lg'
    ? 'text-base font-normal leading-6 text-[#99a1af] line-through decoration-solid'
    : 'text-xs font-normal leading-4 text-[#99a1af] line-through decoration-solid'
)
</script>
