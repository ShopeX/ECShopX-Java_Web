<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none"
      >
        <div
          class="bg-gray-800 bg-opacity-90 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-md mx-4 pointer-events-auto"
          :class="sizeClass"
        >
          <p class="text-center text-sm leading-relaxed whitespace-pre-line">
            {{ currentMessage }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ToastOptions } from './types'

// Props
interface Props {
  message?: string
  duration?: number
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  duration: 2000,
  size: 'md',
})

// State
const visible = ref(false)
const currentMessage = ref('')
let timer: NodeJS.Timeout | null = null

// 尺寸样式
const sizeClass = computed(() => {
  const sizes = {
    sm: 'min-w-[200px]',
    md: 'min-w-[280px]',
    lg: 'min-w-[360px]',
  }
  return sizes[props.size]
})

// 显示 Toast
const show = (options: string | ToastOptions) => {
  // 清除之前的定时器
  if (timer) {
    clearTimeout(timer)
    timer = null
  }

  // 处理参数
  if (typeof options === 'string') {
    currentMessage.value = options
  } else {
    currentMessage.value = options.message
  }

  visible.value = true

  // 设置自动关闭
  const duration =
    typeof options === 'object' ? (options.duration ?? props.duration) : props.duration
  if (duration > 0) {
    timer = setTimeout(() => {
      hide()
    }, duration)
  }
}

// 隐藏 Toast
const hide = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// 监听 message prop 变化
watch(
  () => props.message,
  (newMessage) => {
    if (newMessage) {
      show(newMessage)
    }
  }
)

// 暴露方法
defineExpose({
  show,
  hide,
})
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.toast-fade-enter-to,
.toast-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
