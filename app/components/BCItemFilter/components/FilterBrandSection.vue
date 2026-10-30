<template>
  <div class="flex items-center gap-4 px-8 py-1">
    <!-- 标签 -->
    <div class="flex-shrink-0">
      <span class="text-sm font-medium text-gray-700">{{ t('7aa9bfcf.09307c') }}</span>
    </div>

    <!-- 品牌列表 -->
    <div class="flex-1 flex items-center gap-2 flex-wrap">
      <button
        v-for="brand in displayedBrands"
        :key="brand.attribute_id"
        :class="[
          'px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1',
          isSelected(brand.attribute_id)
            ? 'bg-red-50 text-red-600 font-medium'
            : 'text-gray-600 hover:bg-gray-50',
        ]"
        @click="handleBrandClick(brand.attribute_id)"
      >
        <UIcon v-if="isSelected(brand.attribute_id)" name="i-lucide-check" class="h-3.5 w-3.5" />
        {{ brand.attribute_name }}
      </button>

      <!-- 更多按钮 -->
      <UPopover v-if="brands.length > maxDisplay" v-model:open="isMoreOpen">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          {{ t('7aa9bfcf.0ec9ea') }}
          <UIcon
            name="i-lucide-chevron-down"
            :class="['ml-1 h-3 w-3 transition-transform', isMoreOpen && 'rotate-180']"
          />
        </UButton>

        <template #content>
          <div class="w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
            <!-- 标题 -->
            <div class="mb-4 flex items-center justify-between">
              <h4 class="m-0 text-base font-semibold text-gray-900">
                {{ t('7aa9bfcf.41b90f') }}
              </h4>
              <button
                v-if="selectedBrandIds.length > 0"
                class="text-sm text-red-600 hover:text-red-700"
                @click="handleClearAll"
              >
                {{ t('7aa9bfcf.288f0c') }}
              </button>
            </div>

            <!-- 品牌网格 -->
            <div class="mb-4 max-h-96 overflow-y-auto">
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="brand in brands"
                  :key="brand.attribute_id"
                  :class="[
                    'px-3 py-2 text-sm rounded transition-colors text-left flex items-center gap-2',
                    isSelected(brand.attribute_id)
                      ? 'bg-red-50 text-red-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50',
                  ]"
                  @click="handleBrandClick(brand.attribute_id)"
                >
                  <UIcon
                    v-if="isSelected(brand.attribute_id)"
                    name="i-lucide-check"
                    class="h-4 w-4"
                  />
                  <span :class="!isSelected(brand.attribute_id) && 'ml-6'">
                    {{ brand.attribute_name }}
                  </span>
                </button>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-end gap-2">
              <UButton variant="outline" size="sm" @click="isMoreOpen = false">
                {{ t('7aa9bfcf.769d88') }}
              </UButton>
            </div>
          </div>
        </template>
      </UPopover>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 品牌筛选组件（横向布局）
 *
 * 提供品牌多选功能，支持显示更多品牌
 */

import type { IBrand } from '~/types/api/item'

interface Props {
  /** 品牌列表 */
  brands: IBrand[]
  /** 已选品牌ID列表 */
  selectedBrandIds: (string | number)[]
  /** 最大显示数量 */
  maxDisplay?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplay: 8,
})

const { t } = useI18n()

const emit = defineEmits<{
  'update:selectedBrandIds': [value: (string | number)[]]
  change: []
}>()

// 更多弹窗状态
const isMoreOpen = ref(false)

// 显示的品牌列表（前N个）
const displayedBrands = computed(() => {
  return props.brands.slice(0, props.maxDisplay)
})

/**
 * 判断品牌是否被选中
 */
function isSelected(brandId: string | number): boolean {
  return props.selectedBrandIds.includes(brandId)
}

/**
 * 处理品牌点击
 */
function handleBrandClick(brandId: string | number) {
  const newSelectedIds = [...props.selectedBrandIds]
  const index = newSelectedIds.indexOf(brandId)

  if (index > -1) {
    // 取消选择
    newSelectedIds.splice(index, 1)
  } else {
    // 添加选择
    newSelectedIds.push(brandId)
  }

  emit('update:selectedBrandIds', newSelectedIds)
  emit('change')
}

/**
 * 清空所有选择
 */
function handleClearAll() {
  emit('update:selectedBrandIds', [])
  emit('change')
}
</script>
