<template>
  <div class="flex flex-col items-start gap-0.5">
    <template v-if="hasMemberPrice">
      <div class="flex items-baseline gap-1.5">
        <span
          class="text-xs text-[#191a1d] border border-[#191a1d] px-1 leading-4 shrink-0"
        >
          {{ t('464b6330.8fdd6f') }}
        </span>
        <span :class="primaryPriceClass">{{ formatMoneyFen(memberPriceCents) }}</span>
      </div>
      <span :class="secondaryPriceClass">{{ formatMoneyFen(salePriceCents) }}</span>
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
}

const props = withDefaults(defineProps<Props>(), {
  marketPriceCents: 0,
  memberPriceCents: 0,
  size: 'lg',
  layout: undefined,
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

const marketPriceClass = computed(() =>
  props.size === 'lg'
    ? 'text-base font-normal leading-6 text-[#99a1af] line-through decoration-solid'
    : 'text-xs font-normal leading-4 text-[#99a1af] line-through decoration-solid'
)
</script>
