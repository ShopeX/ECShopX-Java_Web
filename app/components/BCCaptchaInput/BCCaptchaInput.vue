<template>
  <div class="flex gap-3 items-center">
    <!-- 输入框 -->
    <input
      :value="modelValue"
      type="text"
      :placeholder="t('6ca28f37.d0c06a')"
      maxlength="4"
      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
      @input="handleInput"
      @keypress="handleKeypress"
    />

    <!-- 验证码图片 -->
    <div
      class="relative w-32 h-10 border border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-purple-500 transition-all group"
      @click="handleRefresh"
    >
      <img
        v-if="image"
        :src="image"
        :alt="t('6ca28f37.983f59')"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-50"
      >
        {{ t('6ca28f37.a41d43') }}
      </div>

      <!-- 刷新提示 -->
      <div
        class="absolute inset-0 bg-black bg-opacity-50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {{ t('6ca28f37.68bf43') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** 验证码值 */
  modelValue?: string
  /** 验证码图片（base64 或 URL） */
  image?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  image: '',
})
const { t } = useI18n()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  refresh: []
}>()

/**
 * 处理输入
 */
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  // 只允许输入数字和字母
  const value = target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)
  emit('update:modelValue', value)
}

/**
 * 处理按键事件（限制输入）
 */
function handleKeypress(event: KeyboardEvent) {
  const char = event.key
  // 只允许数字和字母
  if (!/[a-zA-Z0-9]/.test(char)) {
    event.preventDefault()
  }
}

/**
 * 刷新验证码
 */
function handleRefresh() {
  emit('refresh')
  // 清空输入
  emit('update:modelValue', '')
}
</script>
