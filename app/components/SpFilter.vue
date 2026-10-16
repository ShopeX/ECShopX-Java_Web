<!-- SpFilter.vue -->
<template>
  <div class="flex items-center justify-between px-4 py-3 bg-white">
    <!-- 左侧排序选项 -->
    <div class="flex items-center gap-6">
      <span class="text-base text-[#333333]">{{ t('21fa0a50.899c0c') }}</span>

      <!-- 排序选项列表 -->
      <div class="flex items-center gap-5">
        <!-- 综合 -->
        <ECButton
          variant="ghost"
          size="sm"
          :class="sortClass(EFilterSort.COMPREHENSIVE)"
          @click="handleSortChange(EFilterSort.COMPREHENSIVE)"
        >
          {{ t('21fa0a50.88e7de') }}
        </ECButton>

        <!-- 销量 -->
        <ECButton
          variant="ghost"
          size="sm"
          :class="sortClass(EFilterSort.SALES)"
          @click="handleSortChange(EFilterSort.SALES)"
        >
          {{ t('21fa0a50.44e7eb') }}
        </ECButton>

        <!-- 上新 -->
        <ECButton
          variant="ghost"
          size="sm"
          :class="sortClass(EFilterSort.NEW)"
          @click="handleSortChange(EFilterSort.NEW)"
        >
          {{ t('21fa0a50.314ef5') }}
        </ECButton>

        <!-- 价格排序 -->
        <ECButton
          variant="ghost"
          size="sm"
          :class="[sortClass(EFilterSort.PRICE), 'flex items-center gap-1']"
          @click="handlePriceSortChange"
        >
          {{ t('21fa0a50.0e9fd9') }}
          <div class="flex flex-col gap-[2px]">
            <div
              class="w-0 h-0 border-4 border-transparent border-b-current transition-colors"
              :class="priceArrowClass('up')"
            />
            <div
              class="w-0 h-0 border-4 border-transparent border-t-current transition-colors"
              :class="priceArrowClass('down')"
            />
          </div>
        </ECButton>
      </div>

      <!-- 价格区间 -->
      <div class="flex items-center gap-2">
        <div class="relative">
          <ECInput
            v-model="minPrice"
            type="number"
            size="sm"
            :placeholder="t('21fa0a50.3d3297')"
            class="w-[80px] pl-6 pr-2"
            @input="handlePriceInput"
          />
          <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[#999]">¥</span>
        </div>
        <span class="text-xs">-</span>
        <div class="relative">
          <ECInput
            v-model="maxPrice"
            type="number"
            size="sm"
            :placeholder="t('21fa0a50.dab19a')"
            class="w-[80px] pl-6 pr-2"
            @input="handlePriceInput"
          />
          <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[#999]">¥</span>
        </div>
        <ECButton variant="solid" size="sm" class="px-4" @click="handlePriceConfirm">
          {{ t('21fa0a50.38cf16') }}
        </ECButton>
      </div>
    </div>

    <!-- 右侧商品总数 -->
    <div class="text-sm text-[#666]">
      {{ t('21fa0a50.fbd2b1') }} <span class="text-[#b22420]">{{ total }}</span>
      {{ t('21fa0a50.777ba9') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { IFilterParams, IFilterProps } from '~/types/filter'
import { EFilterSort, EFilterOrder } from '~/types/filter'

// Button 和 Input 组件由 Nuxt 自动导入，无需手动 import

const props = defineProps<IFilterProps>()
const emit = defineEmits<{
  (e: 'update:params', params: IFilterParams): void
  (e: 'change', params: IFilterParams): void
}>()

const { t } = useI18n()

// 价格输入框的值
const minPrice = ref<string>('')
const maxPrice = ref<string>('')

// 排序按钮样式
const sortClass = (sort: EFilterSort) => ({
  'text-[#b22420]': props.params.sort === sort,
  'text-[#333333] hover:text-[#b22420]': props.params.sort !== sort,
})

// 价格排序箭头样式
const priceArrowClass = (direction: 'up' | 'down') => {
  if (props.params.sort !== EFilterSort.PRICE) {
    return 'border-[#333333] opacity-50'
  }
  if (direction === 'up') {
    return props.params.order === EFilterOrder.ASC
      ? 'border-[#b22420]'
      : 'border-[#333333] opacity-50'
  }
  return props.params.order === EFilterOrder.DESC
    ? 'border-[#b22420]'
    : 'border-[#333333] opacity-50'
}

// 处理排序变化
const handleSortChange = (sort: EFilterSort) => {
  if (sort === props.params.sort) return
  const newParams = {
    ...props.params,
    sort,
    order: undefined,
  }
  emit('update:params', newParams)
  emit('change', newParams)
}

// 处理价格排序变化
const handlePriceSortChange = () => {
  const sort = EFilterSort.PRICE
  let order: EFilterOrder | undefined

  if (props.params.sort !== sort) {
    order = EFilterOrder.ASC
  } else if (props.params.order === EFilterOrder.ASC) {
    order = EFilterOrder.DESC
  } else if (props.params.order === EFilterOrder.DESC) {
    order = undefined
  } else {
    order = EFilterOrder.ASC
  }

  const newParams = {
    ...props.params,
    sort: order ? sort : EFilterSort.COMPREHENSIVE,
    order,
  }
  emit('update:params', newParams)
  emit('change', newParams)
}

// 处理价格输入
const handlePriceInput = () => {
  // 可以在这里添加输入验证逻辑
}

// 处理价格确认
const handlePriceConfirm = () => {
  const min = Number(minPrice.value)
  const max = Number(maxPrice.value)

  // 验证价格区间
  if (min && max && min > max) {
    // 这里可以添加错误提示
    return
  }

  const newParams = {
    ...props.params,
    minPrice: min || undefined,
    maxPrice: max || undefined,
  }
  emit('update:params', newParams)
  emit('change', newParams)
}
</script>
