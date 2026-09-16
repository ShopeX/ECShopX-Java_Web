<template>
  <div class="sp-brand-filter">
    <div class="filter-header">
      <h3 class="title">{{ t('e12603c4.09307c') }}</h3>
      <button v-if="showMore" class="more-btn" @click="toggleExpand">
        {{ isExpanded ? t('e12603c4.def9e9') : t('e12603c4.0ec9ea') }}
        <UIcon :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" />
      </button>
    </div>

    <div class="brand-list" :class="{ expanded: isExpanded }">
      <div class="brand-item" :class="{ active: modelValue === '' }" @click="handleSelect('')">
        {{ t('e12603c4.a8b0c2') }}
      </div>
      <div
        v-for="brand in brands"
        :key="brand.attribute_id"
        class="brand-item"
        :class="{ active: modelValue === brand.attribute_id }"
        @click="handleSelect(brand.attribute_id)"
      >
        {{ brand.attribute_name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IBrand } from '@/types/api/item'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string | number
  brands: IBrand[]
  maxDisplay?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

// 是否展开
const isExpanded = ref(false)

// 是否显示更多按钮
const showMore = computed(() => {
  return props.brands.length > (props.maxDisplay || 10)
})

// 选择品牌
const handleSelect = (id: string | number) => {
  emit('update:modelValue', id)
}

// 切换展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style lang="scss" scoped>
.sp-brand-filter {
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .title {
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    }

    .more-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0;
      font-size: 12px;
      color: #666;
      background: none;
      border: none;
      cursor: pointer;

      &:hover {
        color: #dc2626;
      }
    }
  }

  .brand-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 36px;
    overflow: hidden;
    transition: max-height 0.3s;

    &.expanded {
      max-height: none;
    }

    .brand-item {
      padding: 6px 12px;
      font-size: 12px;
      color: #666;
      background: #f5f5f5;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: #dc2626;
        background: #f0f0f0;
      }

      &.active {
        color: #fff;
        background: #dc2626;
      }
    }
  }
}
</style>
