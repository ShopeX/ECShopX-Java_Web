<template>
  <div class="bg-white border-t border-b border-gray-200 py-2">
    <!-- 主筛选区域 - 分类、品牌 -->
    <div>
      <!-- 分类筛选 -->
      <FilterCategorySection
        v-if="categories.length > 0"
        :categories="categories"
        :selected-category-id="modelValue.categoryId"
        @update:selected-category-id="handleCategoryIdUpdate"
        @change="handleFilterChange"
      />

      <!-- 品牌筛选 -->
      <FilterBrandSection
        v-if="brands.length > 0"
        :brands="brands"
        :selected-brand-ids="selectedBrandIds"
        @update:selected-brand-ids="handleBrandIdsUpdate"
        @change="handleFilterChange"
      />
    </div>

    <!-- 次筛选区域 - 销量、价格 -->
    <div class="flex items-center gap-4 px-5 py-1">
      <!-- 排序选项 -->
      <FilterSortSection :current-sort="modelValue.sort" @update:sort="handleSortUpdate" />

      <!-- 价格区间 -->
      <FilterPriceRange
        :start-price="modelValue.startPrice"
        :end-price="modelValue.endPrice"
        @update:start-price="handleStartPriceUpdate"
        @update:end-price="handleEndPriceUpdate"
        @change="handleFilterChange"
      />

      <!-- 品牌筛选 -->
      <FilterBrandSelect
        :brands="brands"
        :selected-brand-ids="selectedBrandIds"
        @update:selected-brand-ids="handleBrandIdsUpdate"
        @change="handleFilterChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 商品筛选主容器组件
 *
 * 整合排序、价格区间、品牌筛选等功能
 */

import type { IBrand } from '~/types/api/item'

export interface ICategory {
  id: string | number
  name: string
}

// Props
interface IFilterValue {
  categoryId?: string | number
  brandId: string | number | (string | number)[]
  sort: string
  startPrice?: number
  endPrice?: number
}

const props = defineProps<{
  modelValue: IFilterValue
  categories?: ICategory[]
  brands: IBrand[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: IFilterValue]
  change: []
}>()

// 默认值
const categories = computed(() => props.categories || [])

// 计算属性：已选品牌ID列表
const selectedBrandIds = computed<(string | number)[]>(() => {
  if (Array.isArray(props.modelValue.brandId)) {
    return props.modelValue.brandId
  } else if (props.modelValue.brandId) {
    return [props.modelValue.brandId]
  }
  return []
})

/**
 * 处理分类ID更新
 */
function handleCategoryIdUpdate(categoryId: string | number | undefined) {
  const newValue = {
    ...props.modelValue,
    categoryId,
  }
  emit('update:modelValue', newValue)
  emit('change')
}

/**
 * 处理排序更新
 */
function handleSortUpdate(sort: string) {
  const newValue = {
    ...props.modelValue,
    sort,
  }
  emit('update:modelValue', newValue)
  emit('change')
}

/**
 * 处理开始价格更新
 */
function handleStartPriceUpdate(startPrice: number | undefined) {
  const newValue = {
    ...props.modelValue,
    startPrice,
  }
  emit('update:modelValue', newValue)
}

/**
 * 处理结束价格更新
 */
function handleEndPriceUpdate(endPrice: number | undefined) {
  const newValue = {
    ...props.modelValue,
    endPrice,
  }
  emit('update:modelValue', newValue)
}

/**
 * 处理品牌ID列表更新
 */
function handleBrandIdsUpdate(brandIds: (string | number)[]) {
  const newValue = {
    ...props.modelValue,
    brandId: brandIds,
  }
  emit('update:modelValue', newValue)
}

/**
 * 处理筛选变化
 */
function handleFilterChange() {
  emit('change')
}
</script>

<style scoped>
/* 确保组件样式立即生效，防止 FOUC */
.bg-white {
  background-color: #ffffff !important;
}

.border-gray-200 {
  border-color: #e5e7eb !important;
}

/* 确保按钮过渡效果 */
button {
  transition: all 0.2s ease-in-out;
}
</style>
