<template>
  <Teleport to="body">
    <Transition name="cancel-order-modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-end justify-center bg-[#282828] lg:items-center lg:bg-[rgba(0,0,0,0.6)] lg:px-0 lg:py-[128px]"
        data-testid="cancel-order-reason-modal"
        @click.self="handleClose"
      >
        <div
          class="flex h-[calc(100dvh-120px)] w-full max-w-[375px] flex-col overflow-hidden rounded-none bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] lg:h-auto lg:max-h-[calc(100dvh-256px)] lg:w-[600px] lg:max-w-[600px] lg:gap-[32px] lg:overflow-y-auto lg:p-[32px]"
          @click.stop
        >
          <div
            class="flex min-h-0 flex-1 flex-col gap-[32px] overflow-y-auto px-[16px] py-[32px] lg:gap-0 lg:overflow-visible lg:p-0"
          >
            <div class="flex w-full shrink-0 items-center justify-between">
              <h2 class="text-[20px] font-medium leading-[20px] text-[#191a1d]">
                <span class="hidden lg:inline">{{ t('a208bce0.1fece8') }}</span>
                <span class="lg:hidden">{{ t('a208bce0.b21b5e') }}</span>
              </h2>
              <button
                type="button"
                class="flex size-[24px] shrink-0 items-center justify-center text-[#191a1d] transition-colors hover:bg-[#f3f4f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#191a1d]"
                :aria-label="t('a208bce0.595db5')"
                @click="handleClose"
              >
                <UIcon name="i-heroicons-x-mark" class="size-[24px]" />
              </button>
            </div>

            <div class="flex w-full flex-col gap-[16px]">
              <p class="w-full text-[14px] font-normal leading-[20px] text-[#4a5565] lg:w-[392px]">
                {{ t('a208bce0.3bd30a') }}
              </p>

              <button
                v-for="reason in reasonOptions"
                :key="reason.value"
                type="button"
                class="flex min-h-[52px] w-full items-center justify-between gap-[8px] rounded-[8px] bg-white py-[16px] text-left transition-colors hover:bg-[#f9fafb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#191a1d]"
                :aria-pressed="selectedReason === reason.value"
                @click="selectReason(reason.value)"
              >
                <span class="min-w-0 text-[14px] font-medium leading-[20px] text-[#191a1d]">
                  {{ reason.label }}
                </span>
                <span
                  class="flex size-[16px] shrink-0 items-center justify-center rounded-full border"
                  :class="
                    selectedReason === reason.value
                      ? 'border-[#0f0f10] bg-[#0f0f10]'
                      : 'border-[#4a5565] bg-white'
                  "
                  aria-hidden="true"
                >
                  <UIcon
                    v-if="selectedReason === reason.value"
                    name="i-heroicons-check"
                    class="size-[12px] text-white"
                  />
                </span>
              </button>

              <div v-if="selectedReason === 'other'" class="flex flex-col gap-[8px]">
                <textarea
                  v-model="otherReason"
                  class="h-[80px] w-full resize-none border-0 bg-[#f3f4f7] px-[12px] py-[8px] text-[14px] leading-[20px] text-[#191a1d] placeholder-[#99a1af] outline-none focus-visible:ring-2 focus-visible:ring-[#191a1d]"
                  :placeholder="t('a208bce0.122878')"
                  :aria-invalid="Boolean(errorMessage)"
                  :disabled="loading"
                  maxlength="100"
                  @input="errorMessage = ''"
                />
                <p v-if="errorMessage" class="min-h-[16px] text-[12px] leading-4 text-[#d92d20]">
                  {{ errorMessage }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="flex w-full shrink-0 items-center justify-between gap-[16px] border-t border-[#e5e7eb] px-[16px] py-[32px] lg:border-t-0 lg:px-0 lg:py-0"
          >
            <button
              type="button"
              class="flex h-[52px] min-w-0 flex-1 items-center justify-center border border-[#0f0f10] bg-white px-[24px] text-[14px] font-medium leading-[20px] text-[#191a1d] transition-colors hover:bg-[#f3f4f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#191a1d] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading"
              @click="handleClose"
            >
              {{ t('a208bce0.4085e5') }}
            </button>
            <button
              type="button"
              class="flex h-[52px] min-w-0 flex-1 items-center justify-center bg-[#0f0f10] px-[24px] text-[14px] font-medium leading-[20px] text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#191a1d] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading"
              @click="handleSubmit"
            >
              {{ t('a208bce0.98cb95') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CANCEL_ORDER_REASONS, type CancelOrderReasonValue } from '~/utils/orderCancel'

interface Props {
  visible: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  close: []
  submit: [{ reason: CancelOrderReasonValue; otherReason?: string }]
}>()

const { t } = useI18n()
const selectedReason = ref<CancelOrderReasonValue>(CANCEL_ORDER_REASONS[0].value)
const otherReason = ref('')
const errorMessage = ref('')

const reasonLabelKeys: Record<CancelOrderReasonValue, string> = {
  '多买/错买': 'a208bce0.d5505c',
  不想要了: 'a208bce0.78d83c',
  买多了: 'a208bce0.bea53b',
  other: 'a208bce0.5a0afc',
}

const reasonOptions = computed(() =>
  CANCEL_ORDER_REASONS.map((reason) => ({
    ...reason,
    label: t(reasonLabelKeys[reason.value]),
  }))
)

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      selectedReason.value = CANCEL_ORDER_REASONS[0].value
      otherReason.value = ''
      errorMessage.value = ''
    }
  }
)

function selectReason(reason: CancelOrderReasonValue) {
  selectedReason.value = reason
  errorMessage.value = ''
}

function handleClose() {
  if (props.loading) return
  emit('close')
}

function handleSubmit() {
  if (selectedReason.value === 'other' && !otherReason.value.trim()) {
    errorMessage.value = t('a208bce0.6f2f64')
    return
  }

  emit('submit', {
    reason: selectedReason.value,
    otherReason: selectedReason.value === 'other' ? otherReason.value.trim() : undefined,
  })
}
</script>

<style scoped>
.cancel-order-modal-fade-enter-active,
.cancel-order-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.cancel-order-modal-fade-enter-from,
.cancel-order-modal-fade-leave-to {
  opacity: 0;
}
</style>
