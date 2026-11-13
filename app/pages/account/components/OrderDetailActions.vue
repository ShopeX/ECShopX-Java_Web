<template>
  <div data-testid="order-detail-actions" class="w-full lg:w-auto">
    <div class="flex min-h-[34px] w-full items-center lg:hidden">
      <UPopover v-if="mobileMoreActions.length > 0" v-model:open="mobileMoreOpen">
        <button
          data-testid="btn-order-detail-more"
          type="button"
          class="flex items-center text-[12px] font-normal leading-4 text-[#364153] whitespace-nowrap"
          @click.stop
        >
          <span class="text-center">{{ t('7aa9bfcf.0ec9ea') }}</span>
          <UIcon name="i-lucide-chevron-down" class="size-[16px] text-[#364153]" />
        </button>

        <template #content>
          <div
            class="w-[128px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            <button
              v-for="action in mobileMoreActions"
              :key="`mobile-more-${action}`"
              type="button"
              class="flex h-[34px] w-full items-center px-3 text-left text-[12px] leading-4 text-[#191a1d] hover:bg-[#f9fafb]"
              @click.stop="handleMobileMoreAction(action)"
            >
              {{ getActionLabel(action) }}
            </button>
          </div>
        </template>
      </UPopover>

      <div v-if="mobileVisibleActions.length > 0" class="ml-auto flex items-center gap-[8px]">
        <button
          v-for="action in mobileVisibleActions"
          :key="`mobile-visible-${action}`"
          :data-testid="getActionTestId(action)"
          type="button"
          :class="[
            'flex h-[34px] shrink-0 items-center justify-center text-[12px] leading-4 transition-colors',
            isMobilePrimaryAction(action)
              ? 'bg-[#0f0f10] px-[16px] font-medium text-white transition-opacity hover:opacity-90'
              : 'border border-[#0f0f10] px-[17px] font-medium text-[#191a1d] hover:bg-gray-50',
          ]"
          @click="emitAction(action)"
        >
          {{ getActionLabel(action) }}
        </button>
      </div>
    </div>

    <div class="hidden lg:flex lg:flex-row lg:flex-wrap lg:gap-[16px] lg:justify-end">
      <button
        v-if="actions.includes('cancel')"
        data-testid="btn-cancel-order"
        type="button"
        class="flex h-[50px] w-auto items-center justify-center border border-[#0f0f10] px-[33px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50"
        @click="emit('cancel')"
      >
        {{ t('de8076e6.b21b5e') }}
      </button>
      <button
        v-if="actions.includes('aftersales')"
        data-testid="btn-apply-aftersales"
        type="button"
        class="flex h-[50px] w-auto items-center justify-center border border-[#0f0f10] px-[33px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50"
        @click="emit('aftersales')"
      >
        {{ t('de8076e6.45eb0c') }}
      </button>
      <button
        v-if="actions.includes('invoice')"
        data-testid="btn-apply-invoice"
        type="button"
        class="flex h-[50px] w-auto items-center justify-center border border-[#0f0f10] px-[33px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50"
        @click="emit('invoice')"
      >
        {{ t('de8076e6.63dd82') }}
      </button>
      <button
        v-if="actions.includes('logistics')"
        data-testid="btn-view-logistics"
        type="button"
        class="flex h-[50px] w-auto items-center justify-center border border-[#0f0f10] px-[33px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50"
        @click="emit('logistics')"
      >
        {{ t('de8076e6.edf4b2') }}
      </button>
      <button
        v-if="actions.includes('confirm_receipt')"
        data-testid="btn-confirm-receipt"
        type="button"
        class="flex h-[50px] w-auto items-center justify-center bg-[#0f0f10] px-[32px] text-[12px] font-medium leading-4 text-white transition-opacity hover:opacity-90"
        @click="emit('confirmReceipt')"
      >
        {{ t('de8076e6.775b01') }}
      </button>
      <button
        v-if="actions.includes('review')"
        data-testid="btn-review"
        type="button"
        class="flex h-[50px] w-auto items-center justify-center bg-[#0f0f10] px-[32px] text-[12px] font-medium leading-4 text-white transition-opacity hover:opacity-90"
        @click="emit('review')"
      >
        {{ t('de8076e6.606120') }}
      </button>
      <button
        v-if="actions.includes('change_offline')"
        data-testid="btn-change-offline"
        type="button"
        class="flex h-[50px] w-auto items-center justify-center border border-[#0f0f10] px-[33px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50"
        @click="emit('changeOffline')"
      >
        {{ t('eab46cc2.changeOfflineVoucher') }}
      </button>
      <button
        v-if="actions.includes('pay')"
        data-testid="btn-pay-now"
        type="button"
        class="flex h-[50px] w-auto items-center justify-center bg-[#0f0f10] px-[32px] text-[12px] font-medium leading-4 text-white transition-opacity hover:opacity-90"
        @click="emit('pay')"
      >
        {{ t('de8076e6.747349') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { t } = useI18n()

type OrderDetailAction =
  | 'pay'
  | 'change_offline'
  | 'confirm_receipt'
  | 'review'
  | 'cancel'
  | 'invoice'
  | 'aftersales'
  | 'logistics'

interface Props {
  actions: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  pay: []
  changeOffline: []
  confirmReceipt: []
  invoice: []
  aftersales: []
  logistics: []
  review: []
}>()

const mobileMoreOpen = ref(false)

const normalizedActions = computed(() => props.actions as OrderDetailAction[])

const mobileVisibleActions = computed(() => {
  const primary = getMobilePrimaryAction()
  const secondary = getMobileSecondaryActions()
  if (primary) return [...secondary.slice(0, 2), primary]
  return secondary.slice(0, 3)
})

const mobileMoreActions = computed(() => {
  const primary = getMobilePrimaryAction()
  const secondary = getMobileSecondaryActions()
  return secondary.slice(primary ? 2 : 3)
})

function getMobilePrimaryAction(): OrderDetailAction | null {
  if (normalizedActions.value.includes('pay')) return 'pay'
  if (normalizedActions.value.includes('change_offline')) return 'change_offline'
  if (normalizedActions.value.includes('confirm_receipt')) return 'confirm_receipt'
  if (normalizedActions.value.includes('review')) return 'review'
  return null
}

function isMobilePrimaryAction(action: OrderDetailAction): boolean {
  return (
    action === 'pay' ||
    action === 'change_offline' ||
    action === 'confirm_receipt' ||
    action === 'review'
  )
}

function getMobileSecondaryActions(): OrderDetailAction[] {
  const primary = getMobilePrimaryAction()
  const actions: OrderDetailAction[] = []
  if (normalizedActions.value.includes('cancel')) actions.push('cancel')
  if (
    normalizedActions.value.includes('change_offline') &&
    primary !== 'change_offline'
  ) {
    actions.push('change_offline')
  }
  if (normalizedActions.value.includes('aftersales')) actions.push('aftersales')
  if (normalizedActions.value.includes('logistics')) actions.push('logistics')
  if (normalizedActions.value.includes('invoice')) actions.push('invoice')
  return actions
}

function getActionLabel(action: OrderDetailAction): string {
  switch (action) {
    case 'pay':
      return t('de8076e6.747349')
    case 'change_offline':
      return t('eab46cc2.changeOfflineVoucher')
    case 'confirm_receipt':
      return t('de8076e6.775b01')
    case 'review':
      return t('de8076e6.606120')
    case 'cancel':
      return t('de8076e6.b21b5e')
    case 'invoice':
      return t('de8076e6.63dd82')
    case 'aftersales':
      return t('de8076e6.45eb0c')
    case 'logistics':
      return t('de8076e6.edf4b2')
  }
}

function getActionTestId(action: OrderDetailAction): string {
  switch (action) {
    case 'pay':
      return 'btn-pay-now'
    case 'change_offline':
      return 'btn-change-offline'
    case 'confirm_receipt':
      return 'btn-confirm-receipt'
    case 'review':
      return 'btn-review'
    case 'cancel':
      return 'btn-cancel-order'
    case 'invoice':
      return 'btn-apply-invoice'
    case 'aftersales':
      return 'btn-apply-aftersales'
    case 'logistics':
      return 'btn-view-logistics'
  }
}

function emitAction(action: OrderDetailAction) {
  switch (action) {
    case 'pay':
      emit('pay')
      break
    case 'change_offline':
      emit('changeOffline')
      break
    case 'confirm_receipt':
      emit('confirmReceipt')
      break
    case 'review':
      emit('review')
      break
    case 'cancel':
      emit('cancel')
      break
    case 'invoice':
      emit('invoice')
      break
    case 'aftersales':
      emit('aftersales')
      break
    case 'logistics':
      emit('logistics')
      break
  }
}

function handleMobileMoreAction(action: OrderDetailAction) {
  mobileMoreOpen.value = false
  emitAction(action)
}
</script>
