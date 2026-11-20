<template>
  <div class="flex gap-3 items-center">
    <!-- 输入框 -->
    <input
      :value="modelValue"
      type="text"
      :placeholder="t('618c6b6f.d0c06a')"
      maxlength="6"
      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
      @input="handleInput"
      @keypress="handleKeypress"
    />

    <!-- 发送验证码按钮 -->
    <button
      type="button"
      :disabled="isDisabled"
      class="px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all whitespace-nowrap"
      :class="
        isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-purple-600 text-white hover:bg-purple-700'
      "
      @click="handleSend"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 验证码值 */
  modelValue?: string
  /** 是否正在发送 */
  sending?: boolean
  /** 倒计时秒数（0表示未开始倒计时） */
  countdown?: number
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  sending: false,
  countdown: 0,
  disabled: false,
})
const { t } = useI18n()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
}>()

/**
 * 按钮是否禁用
 */
const isDisabled = computed(() => {
  return props.disabled || props.sending || props.countdown > 0
})

/**
 * 按钮文本
 */
const buttonText = computed(() => {
  if (props.sending) {
    return t('618c6b6f.ba1a3a')
  }
  if (props.countdown > 0) {
    return `${props.countdown}${t('618c6b6f.2135fc')}`
  }
  return t('618c6b6f.c5c358')
})

/**
 * 处理输入
 */
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  // 只允许输入数字
  const value = target.value.replace(/\D/g, '').slice(0, 6)
  emit('update:modelValue', value)
}

/**
 * 处理按键事件（限制输入）
 */
function handleKeypress(event: KeyboardEvent) {
  const char = event.key
  // 只允许数字
  if (!/\d/.test(char)) {
    event.preventDefault()
  }
}

/**
 * 发送验证码
 */
function handleSend() {
  if (isDisabled.value) return
  emit('send')
}
</script>
