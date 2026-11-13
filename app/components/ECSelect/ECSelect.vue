<template>
  <div ref="selectRef" :class="wrapperClasses">
    <!-- 选择器按钮：仅按钮切换开合，避免选项点击冒泡再次 toggle -->
    <button
      type="button"
      :disabled="disabled"
      :class="selectClasses"
      @click="handleToggle"
      @blur="handleBlur"
      @focus="handleFocus"
      @keydown="handleKeydown"
    >
      <!-- 显示文本 -->
      <span :class="textClasses">
        {{ displayText }}
      </span>

      <!-- 下拉箭头 -->
      <span :class="arrowClasses">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>

    <!-- 下拉选项面板 -->
    <Transition name="dropdown">
      <div v-if="isOpen" :class="dropdownClasses" @click.stop>
        <div :class="optionsClasses">
          <div
            v-for="(option, index) in displayOptions"
            :key="String(option.value)"
            :class="getOptionClasses(option, index)"
            @mousedown.prevent="handleSelect(option)"
            @mouseenter="hoveredIndex = index"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { ISelectProps, ISelectOption } from './types'

defineOptions({
  name: 'Select',
  inheritAttrs: false,
})

const { t } = useI18n()

const props = withDefaults(defineProps<ISelectProps>(), {
  modelValue: '',
  options: () => [],
  placeholder: '',
  disabled: false,
  size: 'md',
  variant: 'default',
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number, option: ISelectOption]
  select: [option: ISelectOption]
  blur: []
  focus: []
}>()

// 内部状态
const selectRef = ref<HTMLDivElement>()
const isOpen = ref(false)
const hoveredIndex = ref(-1)
const isSelecting = ref(false) // 标记是否正在选择选项

// 显示选项（来自 props.options）
const displayOptions = computed(() => props.options)

// 选中的选项
const selectedOption = computed(() => {
  return displayOptions.value.find((opt) => opt.value === props.modelValue)
})

// 显示文本
const displayText = computed(() => {
  if (selectedOption.value) {
    return selectedOption.value.label
  }
  return props.placeholder || t('c336232c.708c9d')
})

// Wrapper 样式
const wrapperClasses = computed(() => 'relative inline-block w-full')

// Select 按钮样式
const selectClasses = computed(() => {
  const baseClasses =
    'w-full px-4 border transition-colors cursor-pointer focus:outline-none flex items-center justify-between'

  // 尺寸
  const sizeClasses = {
    sm: 'h-8 text-xs leading-4',
    md: 'h-10 text-xs leading-4',
    lg: 'h-12 text-sm leading-5',
  }

  // 变体（错误状态时不应用默认边框颜色）
  const variantClasses = {
    default: props.error
      ? 'bg-[#f3f4f6] text-[#191a1d]'
      : 'bg-[#f3f4f6] border-transparent text-[#191a1d] focus:border-[#191a1d]',
    outlined: props.error
      ? 'bg-white text-[#191a1d]'
      : 'bg-white border-gray-300 text-[#191a1d] focus:border-[#191a1d] focus:ring-2 focus:ring-[#191a1d]/20',
    filled: props.error
      ? 'bg-gray-100 text-[#191a1d]'
      : 'bg-gray-100 border-transparent text-[#191a1d] focus:bg-white focus:border-[#191a1d]',
  }

  // 错误状态 - 优先级最高
  const errorClasses = props.error ? '!border-[#d0112f] focus:!border-[#d0112f]' : ''

  // 禁用状态
  const disabledClasses = props.disabled
    ? 'opacity-50 cursor-not-allowed bg-gray-100'
    : !props.error
      ? 'hover:border-[#191a1d]/50'
      : ''

  // 打开状态（错误时不覆盖错误颜色）
  const openClasses = isOpen.value && !props.error ? 'border-[#191a1d]' : ''

  return [
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    errorClasses,
    disabledClasses,
    openClasses,
  ]
})

// 文本样式
const textClasses = computed(() => {
  const baseClasses = 'flex-1 text-left truncate'
  const placeholderClasses = !selectedOption.value ? 'text-[#4a5565]' : 'text-[#191a1d]'
  return [baseClasses, placeholderClasses]
})

// 箭头样式
const arrowClasses = computed(() => {
  const baseClasses = 'flex-shrink-0 text-[#4a5565] transition-transform'
  const rotateClasses = isOpen.value ? 'rotate-180' : ''
  return [baseClasses, rotateClasses]
})

// 下拉面板样式
const dropdownClasses = computed(() => {
  return [
    'absolute left-0 right-0 z-50 mt-1',
    'bg-white border border-gray-200 rounded shadow-lg',
    'max-h-60 overflow-auto',
  ]
})

// 选项容器样式
const optionsClasses = computed(() => 'py-1')

// 获取单个选项样式
function getOptionClasses(option: ISelectOption, index: number) {
  const baseClasses = 'px-4 py-2 text-xs text-[#191a1d] cursor-pointer transition-colors'
  const hoverClasses = hoveredIndex.value === index ? 'bg-[#f3f4f6]' : ''
  const selectedClasses = option.value === props.modelValue ? 'bg-[#f3f4f6] font-medium' : ''
  const disabledClasses = option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f3f4f6]'

  return [baseClasses, hoverClasses, selectedClasses, disabledClasses]
}

/**
 * 切换下拉面板
 */
function handleToggle(event: Event) {
  if (props.disabled) return

  event.stopPropagation()
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    emit('focus')
  }
}

/**
 * 选择选项：立即收起，避免后续 click 再打开
 */
function handleSelect(option: ISelectOption) {
  if (props.disabled || option.disabled) return

  isSelecting.value = true
  isOpen.value = false

  emit('update:modelValue', option.value)
  emit('change', option.value, option)
  emit('select', option)
  emit('blur')

  // 短延迟后复位，避免紧随其后的 blur/click-outside 干扰
  setTimeout(() => {
    isSelecting.value = false
  }, 100)
}

/**
 * 处理失焦
 */
function handleBlur() {
  // 如果正在选择选项，不处理失焦
  if (isSelecting.value) return

  // 延迟关闭，以便点击选项能够生效
  setTimeout(() => {
    if (isOpen.value && !isSelecting.value) {
      isOpen.value = false
      emit('blur')
    }
  }, 200)
}

/**
 * 处理聚焦
 */
function handleFocus() {
  if (!isOpen.value) {
    emit('focus')
  }
}

/**
 * 处理键盘事件
 */
function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!isOpen.value) {
        isOpen.value = true
      } else if (hoveredIndex.value >= 0) {
        const option = displayOptions.value[hoveredIndex.value]
        if (option && !option.disabled) {
          handleSelect(option)
        }
      }
      break

    case 'Escape':
      event.preventDefault()
      isOpen.value = false
      break

    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        isOpen.value = true
        hoveredIndex.value = 0
      } else {
        hoveredIndex.value = Math.min(hoveredIndex.value + 1, displayOptions.value.length - 1)
      }
      break

    case 'ArrowUp':
      event.preventDefault()
      if (isOpen.value) {
        hoveredIndex.value = Math.max(hoveredIndex.value - 1, 0)
      }
      break
  }
}

/**
 * 点击外部关闭
 */
function handleClickOutside(event: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// 监听打开状态
watch(isOpen, (val) => {
  if (val) {
    // 重置悬停索引
    hoveredIndex.value = displayOptions.value.findIndex((opt) => opt.value === props.modelValue)
  }
})

// 挂载时添加点击外部监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 卸载时移除监听
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 下拉动画 */
.dropdown-enter-active {
  transition: all 0.15s ease-out;
}

.dropdown-leave-active {
  transition: all 0.12s ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}
</style>
