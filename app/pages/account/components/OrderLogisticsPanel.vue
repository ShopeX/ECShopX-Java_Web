<template>
  <div data-testid="order-logistics-panel" class="flex h-full flex-col">
    <div class="flex items-center justify-between py-[16px]">
      <h2
        data-testid="order-logistics-title"
        class="font-['Noto_Sans_SC',sans-serif] text-[20px] font-medium leading-5 text-[#191a1d]"
      >
        {{ t('de8076e6.de0319') }}
      </h2>
      <button
        data-testid="order-logistics-close-icon"
        type="button"
        class="flex size-6 items-center justify-center text-[#191a1d] transition-opacity hover:opacity-70"
        :aria-label="t('f304470c.b15d91')"
        @click="emit('close')"
      >
        <UIcon name="i-heroicons-x-mark" class="size-6" />
      </button>
    </div>

    <div class="flex min-h-0 flex-1 flex-col gap-[32px] pt-[32px]">
      <div class="flex flex-col gap-[16px]">
        <div class="flex items-center gap-[8px]">
          <p class="text-[16px] font-medium leading-5 text-[#191a1d]">
            {{ t('d1c47e84.7a1beb') }}
          </p>
          <button
            data-testid="order-logistics-copy"
            type="button"
            class="flex size-4 items-center justify-center text-[#191a1d] transition-opacity hover:opacity-70"
            :aria-label="t('de8076e6.8ace65')"
            @click="handleCopyTrackingNo"
          >
            <UIcon name="i-heroicons-document-duplicate" class="size-4" />
          </button>
        </div>
        <p
          data-testid="order-logistics-tracking-no"
          class="break-all text-[14px] leading-5 text-[#4a5565]"
        >
          {{ trackingNo || '--' }}
        </p>
      </div>

      <div class="flex flex-col gap-[16px]">
        <p class="text-[16px] font-medium leading-5 text-[#191a1d]">
          {{ t('d1c47e84.eb6d92') }}
        </p>
        <p data-testid="order-logistics-company" class="text-[14px] leading-5 text-[#4a5565]">
          {{ company || '--' }}
        </p>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto bg-[#f3f4f6] px-[16px] py-[32px]">
        <div v-if="loading" class="flex h-full min-h-[240px] items-center justify-center">
          <UIcon name="i-heroicons-arrow-path" class="size-6 animate-spin text-[#6b7280]" />
        </div>

        <div
          v-else-if="error"
          data-testid="order-logistics-error"
          class="flex min-h-[240px] flex-col items-center justify-center gap-[16px] text-center"
        >
          <p class="text-[14px] leading-5 text-[#4a5565]">{{ error }}</p>
          <button
            type="button"
            class="border border-[#0f0f10] px-[24px] py-[12px] text-[14px] font-medium leading-5 text-[#191a1d] transition-colors hover:bg-gray-50"
            @click="emit('retry')"
          >
            {{ t('de8076e6.132c5c') }}
          </button>
        </div>

        <p
          v-else-if="traces.length === 0"
          data-testid="order-logistics-empty"
          class="flex min-h-[240px] items-center justify-center text-[14px] leading-5 text-[#4a5565]"
        >
          {{ t('d1c47e84.9ef69f') }}
        </p>

        <div v-else class="flex gap-[16px]">
          <div class="flex w-[8px] flex-col items-center">
            <div
              v-for="(_, index) in traces"
              :key="`dot-${index}`"
              class="flex min-h-[92px] w-full flex-1 flex-col items-center"
              :class="index === traces.length - 1 ? 'min-h-0' : ''"
            >
              <div
                class="size-[8px] rounded-full"
                :class="index === 0 ? 'bg-[#191a1d]' : 'bg-[#98a2b3]'"
              />
              <div v-if="index < traces.length - 1" class="mt-[4px] w-px flex-1 bg-[#d2d6db]" />
            </div>
          </div>

          <div class="flex min-w-0 flex-1 flex-col gap-[32px] pr-0 lg:pr-[32px]">
            <div
              v-for="(trace, index) in traces"
              :key="`${trace.time}-${index}`"
              data-testid="order-logistics-trace-item"
              class="flex flex-col gap-[8px]"
            >
              <p
                data-testid="order-logistics-trace-content"
                class="text-[16px] font-medium leading-5 text-[#191a1d]"
              >
                {{ trace.content }}
              </p>
              <p
                data-testid="order-logistics-trace-time"
                class="text-[14px] leading-5 text-[#4a5565]"
              >
                {{ trace.time }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="pt-[32px]"
      :class="footerBordered ? 'mt-[32px] border-t border-[#e5e7eb]' : 'mt-[32px]'"
    >
      <button
        data-testid="order-logistics-close-button"
        type="button"
        class="w-full bg-[#0f0f10] py-[16px] text-[14px] font-medium leading-5 text-white transition-opacity hover:opacity-90"
        @click="emit('close')"
      >
        {{ t('f304470c.b15d91') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ILogisticsTrace } from '~/types/api/order'

interface Props {
  trackingNo?: string
  company?: string
  traces?: ILogisticsTrace[]
  loading?: boolean
  error?: string | null
  footerBordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  trackingNo: '',
  company: '',
  traces: () => [],
  loading: false,
  error: null,
  footerBordered: false,
})

const emit = defineEmits<{
  close: []
  retry: []
}>()

const { t } = useI18n()
const toast = useToastMessage()

async function handleCopyTrackingNo() {
  if (!props.trackingNo || !navigator?.clipboard?.writeText) return

  try {
    await navigator.clipboard.writeText(props.trackingNo)
    toast.show(t('de8076e6.73107a'))
  } catch {
    toast.show(t('de8076e6.8ace65'))
  }
}
</script>
