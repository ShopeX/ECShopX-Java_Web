<template>
  <div class="flex items-center gap-2">
    <!-- 基础排序选项 -->
    <UButton
      v-for="sort in sortOptions"
      :key="sort.value"
      variant="ghost"
      color="neutral"
      size="sm"
      class="px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-sm"
      @click="handleSortChange(sort.value)"
    >
      <span :class="currentSort === sort.value ? 'text-red-500' : 'text-gray-500'">
        {{ sort.label }}
      </span>
      <UIcon
        name="i-lucide-arrow-down"
        :class="currentSort === sort.value ? 'text-red-500' : 'text-gray-500'"
        class="ml-1"
      />
    </UButton>

    <!-- 价格排序（切换选项） -->
    <UButton
      variant="ghost"
      color="neutral"
      size="sm"
      class="px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-sm"
      @click="handlePriceSort"
    >
      <span :class="isPriceSortActive ? 'text-red-500' : 'text-gray-500'">
        {{ t('21fa0a50.0e9fd9') }}
      </span>
      <div class="ml-1 flex flex-col">
        <UIcon
          name="i-heroicons-chevron-up"
          :class="
            isPriceSortActive && priceSortDirection === 'asc' ? 'text-red-500' : 'text-gray-500'
          "
          class="h-2 w-2 -mb-1"
        />
        <UIcon
          name="i-heroicons-chevron-down"
          :class="
            isPriceSortActive && priceSortDirection === 'desc' ? 'text-red-500' : 'text-gray-500'
          "
          class="h-2 w-2"
        />
      </div>
    </UButton>
  </div>
</template>

<script setup lang="ts">
/**
 * 排序区域组件
 *
 * 提供综合、销量、评论数、价格排序功能
 */

interface Props {
  /** 当前排序值 */
  currentSort: string
}

const props = defineProps<Props>()

const { t } = useI18n()

const emit = defineEmits<{
  'update:sort': [value: string]
}>()

// 排序选项
const sortOptions = computed(() => [
  { label: t('21fa0a50.88e7de'), value: 'default' },
  { label: t('21fa0a50.44e7eb'), value: 'sales_desc' },
  { label: t('c5c4da86.26bad5'), value: 'rating_desc' },
])

// 价格排序方向
const priceSortDirection = ref<'asc' | 'desc'>('asc')

// 价格排序是否激活
const isPriceSortActive = computed(() => {
  return props.currentSort === 'price_asc' || props.currentSort === 'price_desc'
})

// 监听 currentSort 变化，同步 priceSortDirection
watch(
  () => props.currentSort,
  (newSort) => {
    if (newSort === 'price_asc') {
      priceSortDirection.value = 'asc'
    } else if (newSort === 'price_desc') {
      priceSortDirection.value = 'desc'
    }
  },
  { immediate: true }
)

/**
 * 处理基础排序变化
 */
function handleSortChange(value: string) {
  emit('update:sort', value)
}

/**
 * 处理价格排序
 */
function handlePriceSort() {
  if (isPriceSortActive.value) {
    // 如果当前是价格排序，切换方向
    priceSortDirection.value = priceSortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // 如果当前不是价格排序，设置为升序
    priceSortDirection.value = 'asc'
  }

  const sortValue = priceSortDirection.value === 'asc' ? 'price_asc' : 'price_desc'
  emit('update:sort', sortValue)
}
</script>
