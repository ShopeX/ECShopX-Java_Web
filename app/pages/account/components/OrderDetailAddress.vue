<template>
  <div
    data-testid="order-detail-address"
    class="border-[#e5e7eb] border-b border-solid flex flex-col gap-[16px] items-start pb-[33px] w-full"
  >
    <p class="text-[16px] font-medium leading-5 text-[#191a1d]">{{ t('092c4252.aec344') }}</p>
    <div class="flex flex-col gap-[8px] text-[14px] leading-5 w-full">
      <div class="flex items-center justify-between">
        <span class="text-[#4a5565]">{{ t('092c4252.6aea70') }}</span>
        <span data-testid="receiver-name" class="font-medium text-[#191a1d]">{{ name }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-[#4a5565]">{{ t('092c4252.8098e2') }}</span>
        <span data-testid="receiver-mobile" class="font-medium text-[#191a1d]">{{ mobile }}</span>
      </div>
      <div class="flex gap-[32px] items-start">
        <span class="text-[#4a5565] shrink-0">{{ t('ee3264ed.748ea9') }}</span>
        <span
          data-testid="shipping-address"
          class="font-medium text-[#191a1d] text-right flex-1 min-w-0"
          >{{ address }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface Props {
  name: string
  mobile: string
  address: string
}

defineProps<Props>()
</script>
