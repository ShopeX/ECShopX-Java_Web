<template>
  <div class="relative inline-flex w-full">
    <input
      :type="computedType"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      :class="[
        'w-full transition-colors',
        disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
        inputVariants[variant],
        inputSizes[size],
        className,
      ]"
      @input="handleInput"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
      v-bind="$attrs"
    />

    <!-- 密码显示/隐藏按钮 -->
    <button
      v-if="type === 'password' && showPasswordToggle"
      type="button"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
      @click="togglePasswordVisibility"
    >
      <span v-if="passwordVisible">👁️</span>
      <span v-else>👁️‍🗨️</span>
    </button>

    <!-- 清除按钮 -->
    <button
      v-if="clearable && modelValue"
      type="button"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
      @click="handleClear"
    >
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { inputVariants, inputSizes } from '../ECTheme'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  variant?: keyof typeof inputVariants
  size?: keyof typeof inputSizes
  placeholder?: string
  maxlength?: number
  disabled?: boolean
  clearable?: boolean
  showPasswordToggle?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  variant: 'default',
  size: 'md',
  disabled: false,
  clearable: false,
  showPasswordToggle: false,
  className: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  focus: []
  clear: []
}>()

// 密码显示状态
const passwordVisible = ref(false)

// 计算输入框类型
const computedType = computed(() => {
  if (props.type === 'password' && !passwordVisible.value) {
    return 'password'
  }
  return props.type
})

/**
 * 切换密码显示/隐藏
 */
function togglePasswordVisibility() {
  passwordVisible.value = !passwordVisible.value
}

/**
 * 处理输入
 */
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

/**
 * 处理清除
 */
function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>
