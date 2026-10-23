<template>
  <div class="flex items-center gap-4 px-8 py-1">
    <!-- 标签 -->
    <div class="flex-shrink-0">
      <span class="text-sm font-medium text-gray-700">{{ t('df709ba2.d0771a') }}</span>
    </div>

    <!-- 分类列表 -->
    <div class="flex-1 flex items-center gap-2 flex-wrap">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="[
          'px-3 py-1.5 text-sm rounded transition-colors',
          selectedCategoryId === category.id
            ? 'bg-red-50 text-red-600 font-medium'
            : 'text-gray-600 hover:bg-gray-50',
        ]"
        @click="handleCategoryClick(category.id)"
      >
        {{ category.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 分类筛选组件（横向布局）
 *
 * 提供分类单选功能
 */

import type { ICategory } from '../BCItemFilter.vue'

interface Props {
  /** 分类列表 */
  categories: ICategory[]
  /** 已选分类ID */
  selectedCategoryId?: string | number
}

const props = defineProps<Props>()

const { t } = useI18n()

const emit = defineEmits<{
  'update:selectedCategoryId': [value: string | number | undefined]
  change: []
}>()

/**
 * 处理分类点击
 */
function handleCategoryClick(categoryId: string | number) {
  // 如果点击已选中的分类，则取消选择
  if (props.selectedCategoryId === categoryId) {
    emit('update:selectedCategoryId', undefined)
  } else {
    emit('update:selectedCategoryId', categoryId)
  }
  emit('change')
}
</script>
