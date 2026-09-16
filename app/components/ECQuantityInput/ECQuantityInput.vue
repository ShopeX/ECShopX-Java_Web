<template>
  <div class="flex items-center gap-2">
    <!-- 减号按钮 -->
    <button
      type="button"
      :disabled="quantity <= min || disabled || loading"
      class="flex items-center justify-center w-8 h-8 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      @click="handleDecrease"
    >
      <span class="text-gray-600">−</span>
    </button>

    <!-- 数量输入框 -->
    <input
      v-model="inputValue"
      type="text"
      inputmode="numeric"
      :disabled="disabled || loading"
      class="w-16 h-8 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
      @input="handleInput"
      @blur="handleBlur"
      @keydown.enter="handleEnter"
    />

    <!-- 加号按钮 -->
    <button
      type="button"
      :disabled="(max && quantity >= max) || disabled || loading"
      class="flex items-center justify-center w-8 h-8 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      @click="handleIncrease"
    >
      <span class="text-gray-600">+</span>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * 数量调整器组件
 *
 * 提供商品数量的增加、减少和直接输入功能
 *
 * @example
 * ```vue
 * <ECQuantityInput
 *   v-model="quantity"
 *   :min="1"
 *   :max="99"
 *   @change="handleQuantityChange"
 * />
 * ```
 */

interface Props {
  /** 当前数量 */
  modelValue: number
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 加载状态 */
  loading?: boolean
  /** 防抖延迟（毫秒） */
  debounce?: number
}

interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  min: 1,
  max: undefined,
  disabled: false,
  loading: false,
  debounce: 500,
})

const emit = defineEmits<Emits>()

// 当前数量
const quantity = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 输入框显示值
const inputValue = ref(String(props.modelValue))

// 监听 modelValue 变化，更新输入框显示
watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = String(newValue)
  }
)

// 防抖定时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 清除防抖定时器
 */
function clearDebounceTimer() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

/**
 * 验证并规范化数量值
 *
 * @param value - 输入值
 * @returns 规范化后的数量
 */
function normalizeQuantity(value: string | number): number {
  // 转换为数字
  let num = typeof value === 'string' ? parseInt(value, 10) : value

  // 处理非法值
  if (isNaN(num) || num < props.min) {
    num = props.min
  }

  // 处理最大值限制
  if (props.max && num > props.max) {
    num = props.max
  }

  return num
}

/**
 * 更新数量（带防抖）
 *
 * @param value - 新数量
 */
function updateQuantity(value: number) {
  clearDebounceTimer()

  if (props.debounce > 0) {
    debounceTimer = setTimeout(() => {
      quantity.value = value
      emit('change', value)
    }, props.debounce)
  } else {
    quantity.value = value
    emit('change', value)
  }
}

/**
 * 处理输入框输入
 *
 * 只允许输入数字
 */
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  // 过滤非数字字符
  target.value = target.value.replace(/[^\d]/g, '')
  inputValue.value = target.value
}

/**
 * 处理输入框失焦
 *
 * 验证并更新数量
 */
function handleBlur() {
  const value = normalizeQuantity(inputValue.value)
  inputValue.value = String(value)

  if (value !== quantity.value) {
    updateQuantity(value)
  }
}

/**
 * 处理回车键
 *
 * 触发失焦逻辑
 */
function handleEnter(event: KeyboardEvent) {
  ;(event.target as HTMLInputElement).blur()
}

/**
 * 减少数量
 */
function handleDecrease() {
  if (quantity.value <= props.min) return

  const newValue = quantity.value - 1
  inputValue.value = String(newValue)
  updateQuantity(newValue)
}

/**
 * 增加数量
 */
function handleIncrease() {
  if (props.max && quantity.value >= props.max) return

  const newValue = quantity.value + 1
  inputValue.value = String(newValue)
  updateQuantity(newValue)
}

// 组件卸载时清除定时器
onBeforeUnmount(() => {
  clearDebounceTimer()
})
</script>
