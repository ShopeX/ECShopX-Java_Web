<template>
  <div class="bg-white rounded-lg shadow">
    <!-- 表头 -->
    <div
      class="flex items-center gap-4 px-4 py-3 bg-gray-100 border-b border-gray-200 text-sm text-gray-600 font-medium"
    >
      <div class="flex-shrink-0 w-5">
        <input
          type="checkbox"
          :checked="isAllSelected && items.length > 0"
          :disabled="items.length === 0"
          class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          @change="handleToggleAll"
        />
      </div>
      <div class="flex-shrink-0 w-20"></div>
      <div class="flex-1">{{ t('24083f1c.b433e6') }}</div>
      <div class="flex-shrink-0 w-24 text-center">{{ t('24083f1c.da4abd') }}</div>
      <div class="flex-shrink-0 w-32 text-center">{{ t('ee3264ed.0bf60b') }}</div>
      <div class="flex-shrink-0 w-24 text-center">{{ t('24083f1c.450efd') }}</div>
      <div class="flex-shrink-0 w-20 text-center">{{ t('24083f1c.2b6bc0') }}</div>
    </div>

    <!-- 商品列表 -->
    <div v-if="items.length > 0" class="divide-y divide-gray-200">
      <BCCartItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :loading="loading"
        @toggle-selection="handleToggleSelection"
        @quantity-change="handleQuantityChange"
        @remove="handleRemove"
        @favorite="handleFavorite"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg class="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        ></path>
      </svg>
      <p class="text-lg">{{ t('24083f1c.0769c6') }}</p>
      <p class="text-sm mt-2">{{ t('24083f1c.5eaa50') }}</p>
      <NuxtLink
        :to="localePath('/item/list')"
        class="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        {{ t('24083f1c.678df9') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 购物车列表组件
 *
 * 显示购物车商品列表和表头
 */

import BCCartItem from '~/components/BCCartItem/BCCartItem.vue'
import type { ICartUI } from '~/composables/useCart'

interface Props {
  /** 购物车商品列表 */
  items: ICartUI['items']
  /** 是否全选 */
  isAllSelected: boolean
  /** 加载状态 */
  loading?: boolean
}

interface Emits {
  /** 全选/取消全选 */
  (e: 'toggle-all'): void
  /** 切换单个商品选中状态 */
  (e: 'toggle-selection', itemId: string): void
  /** 更新商品数量 */
  (e: 'quantity-change', itemId: string, quantity: number): void
  /** 删除商品 */
  (e: 'remove', itemId: string): void
  /** 收藏商品 */
  (e: 'favorite', itemId: string): void
}

defineProps<Props>()

const emit = defineEmits<Emits>()
const localePath = useLocalePath()
const { t } = useI18n()

/**
 * 处理全选/取消全选
 */
function handleToggleAll() {
  emit('toggle-all')
}

/**
 * 处理商品选中状态切换
 */
function handleToggleSelection(itemId: string) {
  emit('toggle-selection', itemId)
}

/**
 * 处理商品数量变化
 */
function handleQuantityChange(itemId: string, quantity: number) {
  emit('quantity-change', itemId, quantity)
}

/**
 * 处理删除商品
 */
function handleRemove(itemId: string) {
  emit('remove', itemId)
}

/**
 * 处理收藏商品
 */
function handleFavorite(itemId: string) {
  emit('favorite', itemId)
}
</script>
