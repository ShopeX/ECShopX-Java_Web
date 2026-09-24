<template>
  <div class="flex gap-3" :class="layout === 'horizontal' ? 'flex-row' : 'flex-col'">
    <label
      v-for="option in options"
      :key="String(option.value)"
      class="flex items-center"
      :class="[disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer']"
    >
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        :disabled="disabled || option.disabled"
        @change="handleRadio(option.value)"
        class="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
      />
      <span class="ml-2 text-sm text-gray-700">{{ option.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { IFormOption } from './types'

interface Props {
  modelValue?: string | number | boolean
  name: string
  options?: IFormOption[]
  layout?: 'horizontal' | 'vertical'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  layout: 'horizontal',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
}>()

/**
 * 处理单选按钮
 */
function handleRadio(value: string | number | boolean) {
  emit('update:modelValue', value)
}
</script>
