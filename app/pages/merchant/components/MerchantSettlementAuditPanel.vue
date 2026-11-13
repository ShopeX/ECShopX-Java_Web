<template>
  <section class="merchant-audit flex w-full flex-col items-center">
    <UIcon
      :name="statusIconName"
      class="merchant-audit__illus size-20 shrink-0 md:size-[80px]"
      :class="statusIconClass"
    />

    <h2
      class="merchant-audit__title mt-6 text-center text-[16px] font-bold leading-6 md:text-[18px] md:leading-7"
      :class="titleClass"
    >
      {{ title }}
    </h2>

    <p
      v-if="status === 'pending' || status === 'approved'"
      class="merchant-audit__hint mt-2 max-w-[560px] px-2 text-center text-[12px] leading-5 text-[#8f99aa] md:text-[14px] md:leading-6"
    >
      {{ hint }}
    </p>

    <div
      v-if="status === 'approved'"
      class="merchant-audit__credential mt-8 w-full max-w-[620px] bg-[#f5f5f5] px-4 py-5 md:px-8 md:py-6"
    >
      <div
        v-if="loginUrl"
        class="flex flex-col gap-1 py-3 md:flex-row md:gap-6 md:py-4"
      >
        <span class="shrink-0 text-[12px] leading-5 text-[#8f99aa] md:w-[56px] md:text-[14px]">
          {{ t('merchantSettlement.auditLoginUrl') }}
        </span>
        <span class="min-w-0 break-all text-left text-[12px] leading-5 text-[#191a1d] md:flex-1 md:text-[14px]">
          {{ loginUrl }}
        </span>
      </div>
      <div class="flex flex-col gap-1 border-t border-[#e8e8e8] py-3 md:flex-row md:gap-6 md:py-4">
        <span class="shrink-0 text-[12px] leading-5 text-[#8f99aa] md:w-[56px] md:text-[14px]">
          {{ t('merchantSettlement.auditLoginAccount') }}
        </span>
        <span class="min-w-0 break-all text-left text-[12px] leading-5 text-[#191a1d] md:flex-1 md:text-[14px]">
          {{ loginMobile || '—' }}
        </span>
      </div>
      <div class="flex flex-col gap-2 border-t border-[#e8e8e8] py-3 md:flex-row md:items-center md:gap-6 md:py-4">
        <span class="shrink-0 text-[12px] leading-5 text-[#8f99aa] md:w-[56px] md:text-[14px]">
          {{ t('merchantSettlement.auditLoginPasswordLabel') }}
        </span>
        <span class="min-w-0 flex-1 break-all text-left text-[12px] leading-5 text-[#191a1d] md:text-[14px]">
          {{ loginPassword || '—' }}
        </span>
        <button
          type="button"
          class="merchant-audit__reset shrink-0 self-start rounded-full border border-[#d5d5df] bg-white px-4 py-1.5 text-[12px] leading-5 text-[#666f83] md:self-auto"
          :disabled="resettingPassword"
          @click="emit('reset-password')"
        >
          {{ t('merchantSettlement.auditResetPassword') }}
        </button>
      </div>
      <p class="border-t border-[#e8e8e8] pt-3 text-[12px] leading-5 text-[#8f99aa]">
        {{ t('merchantSettlement.auditPasswordOnceHint') }}
      </p>
    </div>

    <button
      v-if="status === 'approved'"
      type="button"
      class="merchant-btn-primary mt-6 flex h-[50px] w-full max-w-[620px] items-center justify-center gap-2 md:mt-8"
      @click="emit('copy-login')"
    >
      <UIcon name="i-heroicons-square-2-stack" class="size-4" />
      {{ t('merchantSettlement.auditCopyLogin') }}
    </button>

    <div
      v-if="status === 'rejected'"
      class="merchant-audit__reject mt-8 w-full max-w-[620px] text-left"
    >
      <p class="text-[14px] font-medium leading-6 text-[#191a1d]">
        {{ t('merchantSettlement.auditMemoHeading') }}
      </p>
      <ul
        v-if="memoLines.length"
        class="mt-3 list-disc space-y-2 pl-5 text-[12px] leading-5 text-[#4a5565] md:text-[14px] md:leading-6"
      >
        <li v-for="(line, index) in memoLines" :key="index">{{ line }}</li>
      </ul>
    </div>

    <button
      v-if="status === 'rejected'"
      type="button"
      class="merchant-btn-primary mt-10 h-[50px] w-full max-w-[620px] md:mt-12"
      @click="emit('reapply')"
    >
      {{ t('merchantSettlement.auditReapply') }}
    </button>
  </section>
</template>

<script setup lang="ts">
import {
  formatMerchantAuditMemoLines,
  type MerchantAuditPhase,
} from '~/utils/merchantSettlementAudit'

const props = defineProps<{
  status: Exclude<MerchantAuditPhase, 'none'>
  memo?: string
  loginUrl?: string
  loginMobile?: string
  loginPassword?: string
  resettingPassword?: boolean
}>()

const emit = defineEmits<{
  reapply: []
  'copy-login': []
  'reset-password': []
}>()

const { t } = useI18n()

const statusIconName = computed(() => {
  if (props.status === 'approved') return 'i-icon-park-outline:check-one'
  if (props.status === 'rejected') return 'i-icon-park-outline:close-one'
  return 'i-icon-park-outline:hourglass-full'
})

const statusIconClass = computed(() => {
  if (props.status === 'rejected') return 'text-[#d0112f]'
  return 'text-[#191a1d]'
})

const titleClass = computed(() => {
  if (props.status === 'rejected') return 'text-[#d0112f]'
  return 'text-[#191a1d]'
})

const title = computed(() => {
  if (props.status === 'approved') return t('merchantSettlement.auditApprovedTitle')
  if (props.status === 'rejected') return t('merchantSettlement.auditRejectedTitle')
  return t('merchantSettlement.auditPendingTitle')
})

const hint = computed(() => {
  if (props.status === 'approved') return t('merchantSettlement.auditApprovedHint')
  return t('merchantSettlement.auditPendingHint')
})

const memoLines = computed(() => formatMerchantAuditMemoLines(props.memo))
</script>

<style scoped>
.merchant-audit {
  padding: 40px 0 56px;
}

@media (min-width: 768px) {
  .merchant-audit {
    padding: 56px 0 80px;
  }
}

.merchant-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #0f0f10;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.merchant-audit__reset:disabled {
  opacity: 0.5;
}
</style>
