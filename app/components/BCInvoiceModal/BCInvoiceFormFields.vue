<template>
  <div class="flex flex-col gap-8">
    <!-- 发票类型选择 -->
    <div class="flex items-center gap-8">
      <label class="flex items-center gap-2 cursor-pointer text-[14px] leading-5 text-[#191a1d]">
        <input
          data-testid="invoice-type-individual"
          type="radio"
          :checked="formData.type === 'individual'"
          class="w-4 h-4 border border-[#191a1d] rounded-full appearance-none checked:bg-[#191a1d] checked:border-[#191a1d] relative checked:after:content-[''] checked:after:absolute checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:start-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
          @change="handleTypeChange('individual')"
        />
        <span>{{ t('64d73078.1e33b9') }}</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer text-[14px] leading-5 text-[#191a1d]">
        <input
          data-testid="invoice-type-enterprise"
          type="radio"
          :checked="formData.type === 'enterprise'"
          class="w-4 h-4 border border-[#191a1d] rounded-full appearance-none checked:bg-[#191a1d] checked:border-[#191a1d] relative checked:after:content-[''] checked:after:absolute checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:start-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
          @change="handleTypeChange('enterprise')"
        />
        <span>{{ t('64d73078.bdec26') }}</span>
      </label>
    </div>

    <!-- 表单字段 -->
    <div class="flex flex-col gap-8">
      <!-- 发票抬头 / 公司名称 -->
      <div class="flex flex-col gap-2">
        <label class="text-[14px] font-medium leading-5 text-[#101828]">
          {{ formData.type === 'individual' ? t('64d73078.e4e177') : t('64d73078.ed13a1') }}
        </label>
        <div class="flex flex-col gap-1">
          <input
            :data-testid="
              formData.type === 'individual' ? 'invoice-title-input' : 'invoice-company-name-input'
            "
            :value="formData.title"
            type="text"
            :placeholder="
              formData.type === 'individual' ? t('64d73078.b61e0c') : t('64d73078.88a5cf')
            "
            :class="[
              'h-11 w-full bg-[#f3f4f6] px-3 text-[14px] leading-5 text-[#191a1d] outline-none',
              errors.title ? 'border border-[#d0112f]' : 'border border-transparent',
            ]"
            @input="onInput('title', $event)"
          />
          <p v-if="errors.title" class="text-xs leading-4 text-[#d0112f]">{{ errors.title }}</p>
        </div>
      </div>

      <!-- 企业发票额外字段 -->
      <template v-if="formData.type === 'enterprise'">
        <!-- 公司税号 -->
        <div class="flex flex-col gap-2">
          <label class="text-[14px] font-medium leading-5 text-[#101828]">
            {{ t('64d73078.d410ad') }}
          </label>
          <div class="flex flex-col gap-1">
            <input
              data-testid="invoice-tax-number-input"
              :value="formData.taxNumber"
              type="text"
              :placeholder="t('64d73078.086937')"
              :class="[
                'h-11 w-full bg-[#f3f4f6] px-3 text-[14px] leading-5 text-[#191a1d] outline-none',
                errors.taxNumber ? 'border border-[#d0112f]' : 'border border-transparent',
              ]"
              @input="onInput('taxNumber', $event)"
            />
            <p v-if="errors.taxNumber" class="text-xs leading-4 text-[#d0112f]">
              {{ errors.taxNumber }}
            </p>
          </div>
        </div>

        <!-- 公司地址 -->
        <div class="flex flex-col gap-2">
          <label class="text-[14px] font-medium leading-5 text-[#101828]">
            {{ t('64d73078.e06494') }}
          </label>
          <input
            data-testid="invoice-company-address-input"
            :value="formData.businessAddress"
            type="text"
            :placeholder="t('64d73078.b92764')"
            class="h-11 w-full border border-transparent bg-[#f3f4f6] px-3 text-[14px] leading-5 text-[#191a1d] outline-none"
            @input="onInput('businessAddress', $event)"
          />
        </div>

        <!-- 开户银行 -->
        <div class="flex flex-col gap-2">
          <label class="text-[14px] font-medium leading-5 text-[#101828]">
            {{ t('64d73078.cc5ca0') }}
          </label>
          <input
            data-testid="invoice-bank-input"
            :value="formData.bank"
            type="text"
            :placeholder="t('64d73078.4a54b7')"
            class="h-11 w-full border border-transparent bg-[#f3f4f6] px-3 text-[14px] leading-5 text-[#191a1d] outline-none"
            @input="onInput('bank', $event)"
          />
        </div>

        <!-- 银行账号 -->
        <div class="flex flex-col gap-2">
          <label class="text-[14px] font-medium leading-5 text-[#101828]">
            {{ t('64d73078.954218') }}
          </label>
          <input
            data-testid="invoice-bank-account-input"
            :value="formData.bankAccount"
            type="text"
            :placeholder="t('64d73078.49e637')"
            class="h-11 w-full border border-transparent bg-[#f3f4f6] px-3 text-[14px] leading-5 text-[#191a1d] outline-none"
            @input="onInput('bankAccount', $event)"
          />
        </div>
      </template>

      <p
        v-if="submitError"
        data-testid="invoice-submit-error"
        class="text-sm leading-5 text-[#d0112f]"
      >
        {{ submitError }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IInvoiceFormData } from './types'

defineOptions({ name: 'BCInvoiceFormFields' })

const props = defineProps<{
  formData: IInvoiceFormData
  errors: Record<string, string>
  submitError?: string
}>()

const emit = defineEmits<{
  'update:formData': [data: IInvoiceFormData]
  'update:errors': [errors: Record<string, string>]
}>()

const { t } = useI18n()

function updateField(field: keyof IInvoiceFormData, value: string) {
  emit('update:formData', { ...props.formData, [field]: value })
}

function onInput(field: keyof IInvoiceFormData, event: Event) {
  const target = event.target as HTMLInputElement
  updateField(field, target.value)
}

function handleTypeChange(type: 'individual' | 'enterprise') {
  const updated = { ...props.formData, type }
  if (type === 'individual') {
    updated.taxNumber = ''
    updated.businessAddress = ''
    updated.bank = ''
    updated.bankAccount = ''
  }
  emit('update:formData', updated)
  emit('update:errors', {})
}
</script>
