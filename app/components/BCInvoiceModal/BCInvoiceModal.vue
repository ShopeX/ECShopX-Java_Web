<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        data-testid="invoice-dialog"
        class="fixed inset-0 z-50 bg-black/60"
        @click.self="emitClose"
      >
        <!-- PC 端弹窗 -->
        <div class="hidden h-full items-center justify-center px-4 py-32 md:flex">
          <div
            data-testid="invoice-desktop-modal"
            class="w-full max-w-[600px] bg-white px-8 py-8 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
          >
            <div class="flex flex-col gap-8">
              <!-- 标题栏 -->
              <div class="flex items-center justify-between">
                <h2 class="text-[20px] font-medium leading-5 text-[#191a1d]">
                  {{ t('77dcc5ed.fe976d') }}
                </h2>
                <button
                  type="button"
                  :aria-label="t('77dcc5ed.b15d91')"
                  class="flex size-6 items-center justify-center text-[#191a1d] transition-opacity hover:opacity-70"
                  @click="emitClose"
                >
                  <UIcon name="i-heroicons-x-mark" class="size-6" />
                </button>
              </div>

              <!-- 共享表单字段 -->
              <BCInvoiceFormFields
                :form-data="formData"
                :errors="errors"
                :submit-error="submitError"
                @update:form-data="formData = $event"
                @update:errors="errors = $event"
              />

              <!-- 底部按钮 -->
              <div class="flex w-full gap-4">
                <button
                  data-testid="invoice-cancel"
                  type="button"
                  class="flex-1 border border-[#0f0f10] bg-white py-4 text-[14px] font-medium leading-5 text-[#191a1d]"
                  @click="emitCancel"
                >
                  {{ t('3e6ed17a.625fb2') }}
                </button>
                <button
                  data-testid="invoice-submit"
                  type="button"
                  :disabled="loading"
                  class="flex-1 bg-[#0f0f10] py-4 text-[14px] font-medium leading-5 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="handleSubmit"
                >
                  {{ loading ? t('ee3264ed.abe2c5') : t('77dcc5ed.939d53') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- H5 端底部弹出 -->
        <div class="flex h-full items-end md:hidden">
          <div class="w-full">
            <div
              data-testid="invoice-mobile-sheet"
              class="w-full bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
            >
              <div
                class="overflow-y-auto px-4 py-8"
                :class="
                  formData.type === 'enterprise' ? 'max-h-[500px]' : 'max-h-[calc(100vh-120px)]'
                "
              >
                <div class="flex flex-col gap-8">
                  <div class="flex items-center justify-between">
                    <h2 class="text-[20px] font-medium leading-5 text-[#191a1d]">
                      {{ t('77dcc5ed.fe976d') }}
                    </h2>
                    <button
                      type="button"
                      :aria-label="t('77dcc5ed.b15d91')"
                      class="flex size-6 items-center justify-center text-[#191a1d] transition-opacity hover:opacity-70"
                      @click="emitClose"
                    >
                      <UIcon name="i-heroicons-x-mark" class="size-6" />
                    </button>
                  </div>

                  <BCInvoiceFormFields
                    :form-data="formData"
                    :errors="errors"
                    :submit-error="submitError"
                    @update:form-data="formData = $event"
                    @update:errors="errors = $event"
                  />
                </div>
              </div>

              <div class="border-t border-[#e5e7eb] px-4 py-8">
                <div class="flex w-full gap-4">
                  <button
                    data-testid="invoice-cancel"
                    type="button"
                    class="flex-1 border border-[#0f0f10] bg-white py-4 text-[14px] font-medium leading-5 text-[#191a1d]"
                    @click="emitCancel"
                  >
                    {{ t('3e6ed17a.625fb2') }}
                  </button>
                  <button
                    data-testid="invoice-submit"
                    type="button"
                    :disabled="loading"
                    class="flex-1 bg-[#0f0f10] py-4 text-[14px] font-medium leading-5 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    @click="handleSubmit"
                  >
                    {{ loading ? t('ee3264ed.abe2c5') : t('77dcc5ed.939d53') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IInvoiceFormData } from './types'
import BCInvoiceFormFields from './BCInvoiceFormFields.vue'

export type { IInvoiceFormData }

defineOptions({ name: 'BCInvoiceModal' })

interface Props {
  modelValue?: boolean
  initialData?: IInvoiceFormData
  loading?: boolean
  submitError?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  initialData: undefined,
  loading: false,
  submitError: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: IInvoiceFormData]
  close: []
  cancel: []
}>()

const { t } = useI18n()

const createDefaultFormData = (): IInvoiceFormData => ({
  type: 'individual',
  title: '',
  taxNumber: '',
  businessAddress: '',
  bank: '',
  bankAccount: '',
  telephone: '',
})

const formData = ref<IInvoiceFormData>(createDefaultFormData())
const errors = ref<Record<string, string>>({})

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      formData.value = props.initialData ? { ...props.initialData } : createDefaultFormData()
      errors.value = {}
    }
  }
)

watch(
  () => props.initialData,
  (value) => {
    if (props.modelValue && value) {
      formData.value = { ...value }
    }
  }
)

function emitClose() {
  emit('update:modelValue', false)
  emit('close')
}

function emitCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}

function validateForm() {
  const nextErrors: Record<string, string> = {}

  if (!formData.value.title.trim()) {
    nextErrors.title =
      formData.value.type === 'individual' ? t('77dcc5ed.05274f') : t('77dcc5ed.96e6a2')
  }

  if (formData.value.type === 'enterprise' && !formData.value.taxNumber.trim()) {
    nextErrors.taxNumber = t('77dcc5ed.b0605d')
  }

  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

function handleSubmit() {
  if (!validateForm()) return

  emit('submit', {
    ...formData.value,
    title: formData.value.title.trim(),
    taxNumber: formData.value.taxNumber.trim(),
    businessAddress: formData.value.businessAddress.trim(),
    bank: formData.value.bank.trim(),
    bankAccount: formData.value.bankAccount.trim(),
  })
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
