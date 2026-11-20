<template>
  <div class="border-t border-[#e5e7eb] px-[16px] py-[32px] w-full">
    <div class="flex items-center justify-between w-full">
      <span class="text-[14px] leading-5 text-[#364153]"
        >{{ t('aaa5694c.0bf60b') }}: {{ itemCount }}</span
      >
      <div class="flex items-center justify-end gap-[4px] min-w-0 flex-1">
        <span class="text-[14px] leading-5 text-[#191a1d]">{{ t('aaa5694c.de8e9a') }}:</span>
        <span class="text-[16px] font-medium leading-5 text-[#191a1d]">
          ¥ {{ formatAmount(paidAmount) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  itemCount: number
  paidAmount: number
}

const { t } = useI18n()

defineProps<Props>()

function formatAmount(amount: number) {
  return Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
