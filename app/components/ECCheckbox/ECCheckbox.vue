<template>
  <label :class="wrapperClasses" class="inline-flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      class="rounded-none"
      :checked="checked"
      :disabled="disabled"
      :class="checkboxClasses"
      v-bind="$attrs"
      @change="handleChange"
    />
    <span v-if="label || $slots.default" :class="labelClasses">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ICheckboxProps } from './types'

defineOptions({
  name: 'Checkbox',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ICheckboxProps>(), {
  modelValue: false,
  checked: undefined,
  disabled: false,
  size: 'md',
  variant: 'default',
  label: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

// 是否选中
const checked = computed(() => {
  return props.checked !== undefined ? props.checked : props.modelValue
})

// Wrapper 样式
const wrapperClasses = computed(() => [
  {
    'opacity-50 cursor-not-allowed': props.disabled,
  },
])

// Checkbox 样式
const checkboxClasses = computed(() => {
  const baseClasses =
    'border rounded cursor-pointer transition-colors appearance-none relative flex-shrink-0'

  // 尺寸
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  // 变体
  const variantClasses = {
    default:
      'border-[#191a1d] checked:bg-[#191a1d] checked:border-[#191a1d] focus:ring-2 focus:ring-[#191a1d]/20 focus:outline-none',
    primary:
      'border-[#030213] checked:bg-[#030213] checked:border-[#030213] focus:ring-2 focus:ring-[#030213]/20 focus:outline-none',
    secondary:
      'border-gray-300 checked:bg-gray-600 checked:border-gray-600 focus:ring-2 focus:ring-gray-600/20 focus:outline-none',
  }

  // 禁用状态
  const disabledClasses = props.disabled
    ? 'cursor-not-allowed opacity-50'
    : 'hover:border-[#191a1d]/70'

  // 选中状态的勾选标记（使用伪元素）
  const checkedMarkClasses =
    'checked:after:content-[""] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2'

  // 根据尺寸调整勾选标记大小
  const checkedMarkSizeClasses = {
    sm: 'checked:after:w-2 checked:after:h-2',
    md: 'checked:after:w-2.5 checked:after:h-2.5',
    lg: 'checked:after:w-3 checked:after:h-3',
  }

  // 勾选标记样式（白色勾号）
  const checkedMarkStyleClasses =
    'checked:after:bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg%20width%3D%2712%27%20height%3D%2710%27%20viewBox%3D%270%200%2012%2010%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3e%3cpath%20d%3D%27M1%205L4.5%208.5L11%201%27%20stroke%3D%27white%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3e%3c%2Fsvg%3e")] checked:after:bg-no-repeat checked:after:bg-center checked:after:bg-contain'

  return [
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    disabledClasses,
    checkedMarkClasses,
    checkedMarkSizeClasses[props.size],
    checkedMarkStyleClasses,
  ]
})

// Label 样式
const labelClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-xs leading-4',
    md: 'text-sm leading-5',
    lg: 'text-base leading-6',
  }

  return [
    'text-[#4a5565]',
    sizeClasses[props.size],
    {
      'opacity-50': props.disabled,
    },
  ]
})

/**
 * 处理变化
 */
function handleChange(event: Event) {
  if (props.disabled) return

  const target = event.target as HTMLInputElement
  const newValue = target.checked

  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>
