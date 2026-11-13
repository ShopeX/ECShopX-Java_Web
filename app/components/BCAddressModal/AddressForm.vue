<template>
  <div
    class="flex flex-col"
    :class="variant === 'h5' ? 'gap-[16px]' : 'gap-8'"
    data-testid="address-form"
  >
    <!-- 收货人 -->
    <div class="flex flex-col gap-2">
      <label class="text-[12px] font-normal text-[#4a5565] leading-[16px]">{{
        t('78c41987.6aea70')
      }}</label>
      <div class="flex flex-col gap-1">
        <input
          :value="formData.name"
          type="text"
          :placeholder="t('78c41987.1521d9')"
          class="px-4 bg-[#f3f4f6] border text-[12px] text-[#191a1d] leading-[16px] focus:outline-none focus:border-[#191a1d] transition-colors"
          :class="[
            errors.name ? 'border-[#d0112f]' : 'border-transparent',
            variant === 'h5' ? 'h-[48px]' : 'h-10',
          ]"
          @input="onInput('name', $event)"
        />
        <p v-if="errors.name" class="text-[12px] text-[#d0112f] leading-[16px]">
          {{ errors.name }}
        </p>
      </div>
    </div>

    <!-- 手机号码 -->
    <div class="flex flex-col gap-2">
      <label class="text-[12px] font-normal text-[#4a5565] leading-[16px]">{{
        t('78c41987.92448a')
      }}</label>
      <div class="flex gap-[16px]">
        <div
          v-if="variant === 'h5'"
          class="flex items-center gap-[8px] bg-[#f3f4f6] px-[8px] h-[40px] shrink-0"
        >
          <span class="text-[12px] font-normal text-[#191a1d] leading-[16px] whitespace-nowrap">{{
            t('95ac3bd3.8179c6')
          }}</span>
          <UIcon name="i-heroicons-chevron-down" class="size-[16px] text-[#191a1d]" />
        </div>
        <div class="flex-1 flex flex-col gap-1">
          <input
            :value="formData.phone"
            type="tel"
            :placeholder="t('78c41987.ff95a4')"
            class="h-[40px] px-4 bg-[#f3f4f6] border text-[12px] text-[#191a1d] leading-[16px] focus:outline-none focus:border-[#191a1d] transition-colors"
            :class="errors.phone ? 'border-[#d0112f]' : 'border-transparent'"
            @input="onInput('phone', $event)"
          />
          <p v-if="errors.phone" class="text-[12px] text-[#d0112f] leading-[16px]">
            {{ errors.phone }}
          </p>
        </div>
      </div>
    </div>

    <!-- 省市区 -->
    <div class="flex gap-[16px]">
      <div class="flex-1 flex flex-col gap-2">
        <label class="text-[12px] font-normal text-[#4a5565] leading-[16px]">{{
          t('78c41987.3d14d1')
        }}</label>
        <ECSelect
          :model-value="formData.province"
          :options="provinces"
          :error="!!errors.province"
          size="md"
          :placeholder="t('78c41987.769048')"
          @update:model-value="handleProvinceChange"
        />
        <p v-if="errors.province" class="text-[12px] text-[#d0112f] leading-[16px]">
          {{ errors.province }}
        </p>
      </div>
      <div class="flex-1 flex flex-col gap-2">
        <label class="text-[12px] font-normal text-[#4a5565] leading-[16px]">{{
          t('78c41987.371528')
        }}</label>
        <ECSelect
          :model-value="formData.city"
          :options="cities"
          :disabled="!formData.province"
          :error="!!errors.city"
          size="md"
          :placeholder="t('78c41987.371528')"
          @update:model-value="handleCityChange"
        />
        <p v-if="errors.city" class="text-[12px] text-[#d0112f] leading-[16px]">
          {{ errors.city }}
        </p>
      </div>
      <div class="flex-1 flex flex-col gap-2">
        <label class="text-[12px] font-normal text-[#4a5565] leading-[16px]">{{
          t('78c41987.47c762')
        }}</label>
        <ECSelect
          :model-value="formData.district"
          :options="districts"
          :disabled="!formData.city"
          :error="!!errors.district"
          size="md"
          :placeholder="t('78c41987.132326')"
          @update:model-value="updateField('district', $event)"
        />
        <p v-if="errors.district" class="text-[12px] text-[#d0112f] leading-[16px]">
          {{ errors.district }}
        </p>
      </div>
    </div>

    <!-- 详细地址 -->
    <div class="flex flex-col gap-2">
      <label class="text-[12px] font-normal text-[#4a5565] leading-[16px]">{{
        t('78c41987.61a0ec')
      }}</label>
      <div class="flex flex-col gap-1">
        <textarea
          :value="formData.detail"
          :placeholder="t('78c41987.850596')"
          class="px-[16px] py-[8px] bg-[#f3f4f6] border transition-colors text-[12px] text-[#191a1d] leading-[16px] focus:outline-none focus:border-[#191a1d] resize-none"
          :class="[
            errors.detail ? 'border-[#d0112f]' : 'border-transparent',
            variant === 'h5' ? 'h-[80px]' : 'h-[72px]',
          ]"
          @input="onInput('detail', $event)"
        ></textarea>
        <p v-if="errors.detail" class="text-[12px] text-[#d0112f] leading-[16px]">
          {{ errors.detail }}
        </p>
      </div>
    </div>

    <!-- 设置为默认地址 -->
    <ECCheckbox
      :model-value="formData.isDefault"
      variant="primary"
      :label="t('78c41987.03453f')"
      @update:model-value="updateField('isDefault', $event)"
    />

    <!-- 保存按钮 -->
    <button
      type="button"
      :disabled="loading"
      class="bg-[#191a1d] text-white py-[16px] text-[14px] font-medium leading-[20px] hover:bg-[#191a1d]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      @click="$emit('submit')"
    >
      {{ loading ? t('78c41987.2a3302') : t('78c41987.be5fbb') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ECCheckbox } from '~/components/ECCheckbox'
import { ECSelect } from '~/components/ECSelect'
import type { ISelectOption } from '~/components/ECSelect'
import type { IAddressFormData } from '~/composables/useAddress'

defineOptions({ name: 'AddressForm' })

const props = defineProps<{
  formData: IAddressFormData
  errors: Partial<Record<keyof IAddressFormData, string>>
  loading: boolean
  provinces: ISelectOption[]
  cities: ISelectOption[]
  districts: ISelectOption[]
  variant?: 'pc' | 'h5'
}>()

const emit = defineEmits<{
  'update:formData': [data: IAddressFormData]
  'province-change': []
  'city-change': []
  submit: []
}>()

const { t } = useI18n()

function updateField(field: keyof IAddressFormData, value: any) {
  emit('update:formData', { ...props.formData, [field]: value })
}

function handleProvinceChange(value: any) {
  updateField('province', value)
  emit('province-change')
}

function handleCityChange(value: any) {
  updateField('city', value)
  emit('city-change')
}

function onInput(field: keyof IAddressFormData, event: Event) {
  const target = event.target as HTMLInputElement
  updateField(field, target.value)
}
</script>
