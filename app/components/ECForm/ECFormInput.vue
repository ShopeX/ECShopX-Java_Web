<template>
  <div class="relative">
    <input
      :type="computedType"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      :class="[
        'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all',
        disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300',
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'focus:ring-purple-500 focus:border-transparent',
      ]"
      @input="handleInput"
      @blur="$emit('blur')"
    />

    <!-- 密码显示/隐藏按钮 -->
    <button
      v-if="type === 'password' && showPassword"
      type="button"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
      @click="togglePasswordVisibility"
    >
      <span v-if="passwordVisible">👁️</span>
      <span v-else>👁️‍🗨️</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  placeholder?: string
  maxlength?: number
  disabled?: boolean
  error?: boolean
  showPassword?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  error: false,
  showPassword: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
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
  console.log('FormInput handleInput:', target.value)
  emit('update:modelValue', target.value)
}
</script>
