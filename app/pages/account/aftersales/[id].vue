<template>
  <div class="min-h-screen bg-white">
    <div class="flex items-center px-4 pt-[16px] lg:px-[128px] lg:py-[16px]">
      <button
        type="button"
        class="flex items-center gap-[4px] text-[#191a1d] transition-opacity hover:opacity-70 lg:gap-[8px]"
        @click="handleBack"
      >
        <UIcon name="i-heroicons-chevron-left" class="h-5 w-5 shrink-0 lg:h-6 lg:w-6" />
        <span class="text-[16px] font-medium leading-5 lg:text-[24px] lg:leading-[48px]">
          {{ t('932460cc.bbe66f') }}
        </span>
      </button>
    </div>

    <div
      v-if="loading"
      class="flex flex-col gap-[24px] px-4 pb-[64px] pt-[16px] lg:flex-row lg:gap-[64px] lg:px-[128px] lg:pb-[32px]"
    >
      <div class="flex flex-1 flex-col gap-[24px]">
        <USkeleton class="h-5 w-20 self-end" />
        <USkeleton class="h-[100px] w-full" />
        <USkeleton class="h-[320px] w-full" />
      </div>
      <div class="hidden w-[320px] shrink-0 flex-col gap-[24px] lg:flex">
        <USkeleton class="h-[140px] w-full" />
        <USkeleton class="h-[140px] w-full" />
        <USkeleton class="h-[140px] w-full" />
      </div>
    </div>

    <div
      v-else-if="error && !detail"
      class="flex flex-col items-center justify-center px-4 py-[120px] text-[#6b7280]"
    >
      <UIcon name="i-heroicons-exclamation-circle" class="mb-4 h-12 w-12 opacity-40" />
      <p class="text-[14px] leading-5">{{ error }}</p>
    </div>

    <template v-else-if="detail">
      <div
        class="flex flex-col gap-[32px] px-4 pb-[32px] pt-[16px] lg:flex-row lg:items-start lg:gap-[64px] lg:px-[128px]"
      >
        <div class="flex min-w-0 flex-1 flex-col gap-[32px]">
          <AftersalesDetailProgress
            :status-text="detail.statusText"
            :progress-text="detail.progressText"
            :progress-steps="detail.progressSteps"
          />

          <AftersalesDetailItems
            :store-name="detail.storeName"
            :items="detail.items"
            :item-count="detail.itemCount"
            :refund-amount="detail.refundAmount"
            :action-buttons="resolvedActionButtons"
            @action="handleAction"
          />
        </div>

        <div class="hidden w-[320px] shrink-0 flex-col gap-[32px] lg:flex">
          <AftersalesDetailInfoSection :title="t('932460cc.aec344')" :rows="receiverRows" />
          <AftersalesDetailInfoSection :title="t('932460cc.160adc')" :rows="reasonRows" />
          <AftersalesDetailInfoSection :title="t('932460cc.02b157')" :rows="paymentRows" />
          <AftersalesDetailInfoSection :title="t('932460cc.a6d10d')" :rows="orderRows" />
        </div>
      </div>

      <div class="flex flex-col gap-[32px] px-4 py-[32px] lg:hidden">
        <AftersalesDetailInfoSection :title="t('932460cc.aec344')" :rows="receiverRows" />
        <AftersalesDetailInfoSection :title="t('932460cc.160adc')" :rows="reasonRows" />
        <AftersalesDetailInfoSection :title="t('932460cc.02b157')" :rows="paymentRows" />
        <AftersalesDetailInfoSection :title="t('932460cc.a6d10d')" :rows="orderRows" />
      </div>

      <div class="lg:hidden">
        <AftersalesDetailSummary :item-count="detail.itemCount" :paid-amount="detail.paidAmount" />
        <div
          v-if="resolvedActionButtons.length"
          class="flex items-center justify-end gap-[16px] px-4 pb-[32px]"
        >
          <button
            v-for="button in resolvedActionButtons"
            :key="button.type"
            type="button"
            class="h-[36px] border border-[#0f0f10] px-[24px] text-[12px] font-medium leading-4 text-[#0f0f10] transition hover:opacity-80"
            :class="button.primary ? 'bg-[#0f0f10] text-white' : 'bg-white'"
            @click="handleAction(button)"
          >
            {{ button.name }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAftersalesDetail } from '~/composables/useAftersalesDetail'
import AftersalesDetailInfoSection from '../components/AftersalesDetailInfoSection.vue'
import AftersalesDetailItems from '../components/AftersalesDetailItems.vue'
import AftersalesDetailProgress from '../components/AftersalesDetailProgress.vue'
import AftersalesDetailSummary from '../components/AftersalesDetailSummary.vue'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const localePath = useLocalePath()
const { detail, loading, error, fetchAftersalesDetail, cancelAftersales } = useAftersalesDetail()

const defaultActionButtons = computed(() => {
  if (detail.value?.status === 'pending') {
    return [{ type: 'cancel', name: t('932460cc.eaffc1'), primary: false }]
  }
  return []
})

onMounted(() => {
  fetchAftersalesDetail()
})

const resolvedActionButtons = computed(() =>
  detail.value?.actionButtons?.length ? detail.value.actionButtons : defaultActionButtons.value
)

function handleAction(action: any) {
  if (
    action?.type === 'cancel' ||
    action?.action === 'close' ||
    action?.name === t('932460cc.eaffc1')
  ) {
    cancelAftersales()
  }
}

const receiverRows = computed(() => [
  { label: t('932460cc.6aea70'), value: detail.value?.receiverName || '' },
  { label: t('932460cc.8098e2'), value: detail.value?.receiverMobile || '' },
  { label: t('932460cc.765048'), value: detail.value?.receiverAddress || '', multiline: true },
])

const reasonRows = computed(() => [
  { label: t('932460cc.160adc'), value: detail.value?.reason || '' },
  { label: t('932460cc.f1c0db'), value: detail.value?.description || '' },
])

const paymentRows = computed(() => [
  { label: t('932460cc.598fb8'), value: detail.value?.paymentMethod || '' },
  { label: t('932460cc.590c95'), value: detail.value?.payTime || '' },
])

const orderRows = computed(() => [
  { label: t('932460cc.3e8657'), value: detail.value?.orderId || '', copyable: true },
  { label: t('932460cc.2240cc'), value: detail.value?.orderTime || '' },
  { label: t('932460cc.a03deb'), value: formatAmount(detail.value?.goodsAmount) },
  { label: t('932460cc.9a935b'), value: formatAmount(detail.value?.freightAmount) },
  { label: t('932460cc.f06ebf'), value: formatAmount(detail.value?.discountAmount) },
  { label: t('932460cc.d443a9'), value: formatAmount(detail.value?.pointDeductionAmount) },
  { label: t('932460cc.94a7de'), value: formatAmount(detail.value?.paidAmount) },
])

function formatAmount(amount?: number) {
  return `¥ ${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function handleBack() {
  navigateTo(localePath('/account/aftersales'))
}
</script>
