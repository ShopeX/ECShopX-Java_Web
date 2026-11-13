<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    :class="[
      'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white',
      disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300',
      error
        ? 'border-red-500 focus:ring-red-500'
        : 'focus:ring-purple-500 focus:border-transparent',
    ]"
    @change="handleSelect"
    @blur="$emit('blur')"
  >
    <option value="" disabled>{{ placeholder || t('ab0b5e27.708c9d') }}</option>
    <option
      v-for="option in options"
      :key="String(option.value)"
      :value="option.value"
      :disabled="option.disabled"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import type { IFormOption } from './types'

interface Props {
  modelValue?: string | number
  options?: IFormOption[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  disabled: false,
  error: false,
})

const { t } = useI18n()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: []
}>()

/**
 * 处理下拉选择
 */
function handleSelect(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>
