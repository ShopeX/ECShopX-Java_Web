<template>
  <UPopover v-if="brands.length > 0" v-model:open="isOpen">
    <UButton
      variant="ghost"
      color="neutral"
      size="sm"
      class="px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-sm"
    >
      <span :class="isOpen ? 'text-red-500' : 'text-gray-500'">
        {{ t('7aa9bfcf.09307c') }}
      </span>
      <UIcon
        name="i-lucide-chevron-down"
        :class="isOpen ? 'text-red-500' : 'text-gray-500'"
        class="ml-1 h-3 w-3"
      />
    </UButton>

    <template #content>
      <div class="w-72 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
        <!-- 标题 -->
        <div class="mb-4">
          <h4 class="m-0 text-base font-semibold text-gray-900">{{ t('7aa9bfcf.41b90f') }}</h4>
        </div>

        <!-- 品牌列表 -->
        <div class="mb-4 max-h-72 overflow-y-auto">
          <div class="flex flex-col gap-2">
            <!-- TODO: 集成 UCheckbox 后取消注释
            <UCheckbox
              v-for="brand in brands"
              :key="brand.attribute_id"
              v-model="localSelectedBrands"
              :value="brand.attribute_id"
              :label="brand.attribute_name"
              class="px-3 py-2 rounded-md transition-colors duration-200 hover:bg-gray-50"
            />
            -->
            <div class="text-sm text-gray-500 text-center py-4">
              {{ t('ddcfaf00.b2c73b') }}
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-2">
          <UButton variant="outline" size="sm" @click="handleClear">
            {{ t('7aa9bfcf.288f0c') }}
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
 * 品牌筛选组件
 *
 * 提供品牌多选功能
 */

import type { IBrand } from '~/types/api/item'

interface Props {
  /** 品牌列表 */
  brands: IBrand[]
  /** 已选品牌ID列表 */
  selectedBrandIds: (string | number)[]
}

const props = defineProps<Props>()

const { t } = useI18n()

const emit = defineEmits<{
  'update:selectedBrandIds': [value: (string | number)[]]
  change: []
}>()

// 弹窗显示状态
const isOpen = ref(false)

// 本地选中的品牌
const localSelectedBrands = ref<(string | number)[]>([])

// 同步 props 到本地状态
watch(
  () => props.selectedBrandIds,
  (newValue) => {
    localSelectedBrands.value = [...newValue]
  },
  { immediate: true }
)

/**
 * 确认品牌选择
 */
function handleConfirm() {
  emit('update:selectedBrandIds', localSelectedBrands.value)
  emit('change')
  isOpen.value = false
}

/**
 * 清空品牌筛选
 */
function handleClear() {
  localSelectedBrands.value = []
  emit('update:selectedBrandIds', [])
  emit('change')
}
</script>
