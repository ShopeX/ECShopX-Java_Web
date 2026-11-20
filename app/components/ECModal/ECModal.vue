<template>
  <Teleport to="body" :disabled="inline">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        :class="overlayClass"
        @click.self="handleMaskClick"
      >
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/50 transition-opacity"></div>

        <!-- 弹窗内容 -->
        <Transition name="modal-scale">
          <div
            v-if="visible"
            class="relative bg-white border border-black/10 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] flex flex-col gap-8 max-h-[90vh] overflow-auto px-4 py-8 md:px-8 md:py-8 w-full max-w-[min(480px,calc(100vw-2rem))]"
            :style="modalInlineStyle"
          >
            <!-- 头部：Figma 2951:5013 标题 20px Medium #191a1d，关闭 24px -->
            <div class="flex items-center justify-between shrink-0 w-full">
              <h2
                class="font-['Noto_Sans_SC',sans-serif] font-medium text-[20px] leading-5 text-[#191a1d] whitespace-nowrap"
              >
                {{ displayTitle }}
              </h2>
              <button
                v-if="showClose"
                type="button"
                class="size-6 shrink-0 flex items-center justify-center hover:opacity-70 transition-opacity"
                :aria-label="t('3e6ed17a.b15d91')"
                @click="handleClose"
              >
                <UIcon name="i-heroicons-x-mark" class="size-6 text-[#191a1d]" />
              </button>
            </div>

            <!-- 内容：Figma 16 Regular #4a5565 leading-[24px] -->
            <div class="flex-1 shrink-0 w-full">
              <slot>
                <p
                  class="font-['Noto_Sans_SC',sans-serif] font-normal text-[16px] leading-6 text-[#4a5565]"
                >
                  {{ content }}
                </p>
              </slot>
            </div>

            <!-- 底部按钮：Figma gap-[16px] justify-end，14px Medium -->
            <div
              v-if="showFooter"
              class="flex flex-wrap items-center justify-end gap-4 shrink-0 w-full"
            >
              <button
                v-if="showCancelButton"
                type="button"
                class="bg-white border border-[#0f0f10] px-8 py-4 hover:bg-gray-50 transition-colors shrink-0"
                :disabled="cancelLoading"
                @click="handleCancel"
              >
                <span
                  class="font-['Noto_Sans_SC',sans-serif] font-medium text-[14px] text-[#191a1d] leading-5 text-center whitespace-nowrap"
                >
                  {{ cancelButtonText }}
                </span>
              </button>

              <button
                v-if="showConfirmButton"
                type="button"
                class="bg-[#0f0f10] px-8 py-4 hover:bg-[#0f0f10]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                :disabled="confirmLoading"
                @click="handleConfirm"
              >
                <span
                  class="font-['Noto_Sans_SC',sans-serif] font-medium text-[14px] text-white leading-5 text-center whitespace-nowrap"
                >
                  {{ confirmLoading ? t('3e6ed17a.2fb90b') : confirmButtonText }}
                </span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { IModalOptions } from './types'

interface Props {
  /** 是否显示 */
  modelValue?: boolean
  /** 弹窗标题 */
  title?: string
  /** 弹窗内容 */
  content?: string
  /** 宽度（不传则 H5 使用 min(480px, 100vw-2rem)，与 Figma 2951:5013 一致） */
  width?: string | number
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否可以点击遮罩关闭 */
  maskClosable?: boolean
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 是否显示确认按钮 */
  showConfirm?: boolean
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 是否显示底部 */
  showFooter?: boolean
  /** 在父容器内渲染，避免 Drawer/Slideover 的 modal 层拦截外部点击 */
  inline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: undefined,
  content: '',
  showClose: true,
  maskClosable: true,
  confirmText: undefined,
  cancelText: undefined,
  showConfirm: true,
  showCancel: true,
  showFooter: true,
  inline: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  close: []
}>()

defineOptions({
  name: 'Modal',
})
const { t } = useI18n()

// 内部可见状态
const visible = ref(props.modelValue)

// 加载状态
const confirmLoading = ref(false)
const cancelLoading = ref(false)

// 监听外部变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  }
)

// 监听内部变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 自定义宽度时覆盖 max-width（未传 width 时由 Tailwind 响应式 max-w 控制 H5/PC）
const modalInlineStyle = computed(() => {
  if (props.width === undefined || props.width === null || props.width === '') {
    return undefined
  }
  const w = typeof props.width === 'number' ? `${props.width}px` : props.width
  return { maxWidth: w, width: '100%' }
})

// 显示取消按钮
const showCancelButton = computed(() => {
  return props.showCancel && props.showFooter
})

// 显示确认按钮
const showConfirmButton = computed(() => {
  return props.showConfirm && props.showFooter
})

const displayTitle = computed(() => {
  return props.title || t('3e6ed17a.02d981')
})

const overlayClass = computed(() =>
  props.inline
    ? 'absolute inset-0 z-50 flex items-center justify-center'
    : 'fixed inset-0 z-[100] flex items-center justify-center'
)

// 取消按钮文本
const cancelButtonText = computed(() => {
  return props.cancelText || t('3e6ed17a.625fb2')
})

// 确认按钮文本
const confirmButtonText = computed(() => {
  return props.confirmText || t('3e6ed17a.38cf16')
})

/**
 * 处理确认
 */
async function handleConfirm() {
  confirmLoading.value = true
  try {
    emit('confirm')
  } finally {
    confirmLoading.value = false
  }
}

/**
 * 处理取消
 */
async function handleCancel() {
  cancelLoading.value = true
  try {
    emit('cancel')
    visible.value = false
  } finally {
    cancelLoading.value = false
  }
}

/**
 * 处理关闭
 */
function handleClose() {
  emit('close')
  visible.value = false
}

/**
 * 处理遮罩点击
 */
function handleMaskClick() {
  if (props.maskClosable) {
    handleClose()
  }
}

// 暴露方法
defineExpose({
  show: () => {
    visible.value = true
  },
  hide: () => {
    visible.value = false
  },
})
</script>

<style scoped>
/* 弹窗淡入淡出动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 弹窗缩放动画 */
.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all 0.3s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
