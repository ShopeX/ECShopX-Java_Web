<template>
  <div class="flex flex-col gap-3">
    <label
      v-for="option in options"
      :key="String(option.value)"
      class="flex items-center"
      :class="[disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer']"
    >
      <input
        type="checkbox"
        :value="option.value"
        :checked="isChecked(option.value)"
        :disabled="disabled || option.disabled"
        @change="handleCheckbox(option.value, $event)"
        class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
      />
      <span class="ml-2 text-sm text-gray-700">{{ option.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { IFormOption } from './types'

interface Props {
  modelValue?: any[]
  options?: IFormOption[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: () => [],
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()

/**
 * 判断复选框是否选中
 */
function isChecked(value: any): boolean {
  if (!props.modelValue) return false
  return props.modelValue.includes(value)
}

/**
 * 处理复选框
 */
function handleCheckbox(value: any, event: Event) {
  const target = event.target as HTMLInputElement
  const currentValue = props.modelValue || []

  let newValue: any[]
  if (target.checked) {
    newValue = [...currentValue, value]
  } else {
    newValue = currentValue.filter((v: any) => v !== value)
  }

  emit('update:modelValue', newValue)
}
</script>
