<template>
  <UPopover v-model:open="isOpen">
    <UButton
      variant="ghost"
      color="neutral"
      size="sm"
      class="px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-sm"
    >
      <span :class="isOpen ? 'text-red-500' : 'text-gray-500'">
        {{ t('c8abcbfa.8d8376') }}
      </span>
      <UIcon
        name="i-lucide-chevron-down"
        :class="isOpen ? 'text-red-500' : 'text-gray-500'"
        class="ml-1 h-3 w-3"
      />
    </UButton>

    <template #content>
      <div class="w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
        <!-- 标题和关闭按钮 -->
        <div class="flex items-center justify-between mb-4">
          <h4 class="m-0 text-base font-semibold text-gray-900">{{ t('c8abcbfa.e6930c') }}</h4>
          <button
            @click="isOpen = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <UIcon name="i-lucide-x" class="h-4 w-4" />
          </button>
        </div>

        <!-- 自定义价格输入 -->
        <div class="mb-4">
          <div class="flex items-center gap-3">
            <div
              class="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white"
            >
              <span class="px-3 py-2 bg-gray-50 text-gray-500 font-medium border-r border-gray-300"
                >¥</span
              >
              <UInput
                v-model="localStartPrice"
                type="number"
                :placeholder="t('21fa0a50.3d3297')"
                size="sm"
                class="border-none outline-none px-3 py-2 min-w-20 focus:shadow-none"
                @blur="handleInputBlur"
              />
            </div>
            <span class="text-gray-500 font-medium">-</span>
            <div
              class="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white"
            >
              <span class="px-3 py-2 bg-gray-50 text-gray-500 font-medium border-r border-gray-300"
                >¥</span
              >
              <UInput
                v-model="localEndPrice"
                type="number"
                :placeholder="t('21fa0a50.dab19a')"
                size="sm"
                class="border-none outline-none px-3 py-2 min-w-20 focus:shadow-none"
                @blur="handleInputBlur"
              />
            </div>
          </div>
        </div>

        <!-- 快捷价格区间选项 -->
        <div class="mb-4">
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="option in priceRangeOptions"
              :key="option.label"
              :class="[
                'p-3 rounded-md border text-left transition-colors duration-200',
                isPriceRangeSelected(option)
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
              ]"
              @click="selectPriceRange(option)"
            >
              <div class="font-semibold text-sm">{{ option.label }}</div>
              <div class="text-xs text-gray-500 mt-1">
                {{ option.percentage }}{{ t('c8abcbfa.5e5ba5') }}
              </div>
            </button>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-2">
          <UButton variant="outline" size="sm" @click="handleReset">
            {{ t('c8abcbfa.4b9c32') }}
          </UButton>
          <UButton color="primary" size="sm" @click="handleConfirm">
            {{ t('21fa0a50.38cf16') }}
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
/**
 * 价格区间筛选组件
 *
 * 提供自定义价格输入和快捷价格区间选择功能
 */

interface Props {
  /** 开始价格 */
  startPrice?: number
  /** 结束价格 */
  endPrice?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:startPrice': [value: number | undefined]
  'update:endPrice': [value: number | undefined]
  change: []
}>()

const { t } = useI18n()

// 弹窗显示状态
const isOpen = ref(false)

// 本地价格范围
const localStartPrice = ref('')
const localEndPrice = ref('')

// 快捷价格区间选项
const priceRangeOptions = [
  { label: '0 - 128', min: 0, max: 128, percentage: 9 },
  { label: '128 - 258', min: 128, max: 258, percentage: 32 },
  { label: '258 - 3898', min: 258, max: 3898, percentage: 40 },
  { label: '3898 - 5198', min: 3898, max: 5198, percentage: 14 },
]

// 同步 props 到本地状态
watch(
  [() => props.startPrice, () => props.endPrice],
  ([start, end]) => {
    localStartPrice.value = start ? start.toString() : ''
    localEndPrice.value = end ? end.toString() : ''
  },
  { immediate: true }
)

/**
 * 检查价格区间是否被选中
 */
function isPriceRangeSelected(option: (typeof priceRangeOptions)[number]) {
  return (
    localStartPrice.value === option.min.toString() && localEndPrice.value === option.max.toString()
  )
}

/**
 * 选择快捷价格区间
 */
function selectPriceRange(option: (typeof priceRangeOptions)[number]) {
  localStartPrice.value = option.min.toString()
  localEndPrice.value = option.max.toString()
  emitPriceChange()
}

/**
 * 处理输入失焦
 */
function handleInputBlur() {
  emitPriceChange()
}

/**
 * 确认价格区间
 */
function handleConfirm() {
  emitPriceChange()
  isOpen.value = false
}

/**
 * 重置价格区间
 */
function handleReset() {
  localStartPrice.value = ''
  localEndPrice.value = ''
  emitPriceChange()
}

/**
 * 触发价格变化事件
 */
function emitPriceChange() {
  const startPrice = localStartPrice.value ? Number(localStartPrice.value) : undefined
  const endPrice = localEndPrice.value ? Number(localEndPrice.value) : undefined

  emit('update:startPrice', startPrice)
  emit('update:endPrice', endPrice)
  emit('change')
}
</script>
