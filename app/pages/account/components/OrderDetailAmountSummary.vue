<template>
  <div
    data-testid="order-detail-amount"
    class="flex flex-col gap-[8px] border-t border-[#e5e7eb] py-[24px] px-4 lg:px-0"
  >
    <p class="text-[14px] font-medium leading-5 text-[#191a1d]">{{ t('5549463b.db39f3') }}</p>
    <div class="flex flex-col gap-[8px]">
      <div class="flex items-center justify-between">
        <span class="text-[14px] leading-5 text-[#6b7280]">{{ t('5549463b.312a70') }}</span>
        <span class="text-[14px] leading-5 text-[#191a1d]">{{ formatAmount(itemFee) }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-[14px] leading-5 text-[#6b7280]">{{ t('ee3264ed.9a935b') }}</span>
        <span class="text-[14px] leading-5 text-[#191a1d]">{{ formatAmount(freightFee) }}</span>
      </div>
      <div v-if="hasDiscount" class="flex items-center justify-between">
        <span class="text-[14px] leading-5 text-[#6b7280]">{{ t('ee3264ed.f06ebf') }}</span>
        <span class="text-[14px] leading-5 text-[#ef4444]">-{{ formatAmount(discountFee) }}</span>
      </div>
      <div class="flex items-center justify-between border-t border-[#e5e7eb] pt-[8px] mt-[4px]">
        <span class="text-[14px] font-medium leading-5 text-[#191a1d]">{{
          t('1cc0f760.94a7de')
        }}</span>
        <span data-testid="total-fee" class="text-[16px] font-medium leading-6 text-[#191a1d]"
          >{{ formatAmount(totalFee) }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatOrderAmountDisplay, parseOrderAmount } from '~/utils/currencyFormat'

interface Props {
  itemFee: string
  freightFee: string
  discountFee: string
  totalFee: string
}

const props = defineProps<Props>()
const { t } = useI18n()

const hasDiscount = computed(() => parseOrderAmount(props.discountFee) > 0)

function formatAmount(value: string) {
  return formatOrderAmountDisplay(value)
}
</script>
