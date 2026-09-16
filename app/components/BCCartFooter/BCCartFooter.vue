<template>
  <div class="bg-white border-t border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- 左侧：全选和批量操作 -->
      <div class="flex items-center gap-6">
        <!-- 全选 -->
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            :checked="isAllSelected && totalCount > 0"
            :disabled="totalCount === 0"
            class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            @change="$emit('toggle-all')"
          />
          <span class="text-sm text-gray-700">{{ t('79fdede9.66eeac') }}</span>
        </label>

        <!-- 批量操作 -->
        <div class="flex items-center gap-4">
          <button
            type="button"
            :disabled="!hasSelectedItems || batchRemoving"
            class="text-sm text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="$emit('batch-remove')"
          >
            {{ batchRemoving ? t('79fdede9.09f2fb') : t('79fdede9.2f4aad') }}
          </button>
          <button
            type="button"
            :disabled="!hasSelectedItems"
            class="text-sm text-gray-600 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="$emit('batch-favorite')"
          >
            {{ t('79fdede9.ae336c') }}
          </button>
        </div>
      </div>

      <!-- 右侧：统计和结算 -->
      <div class="flex items-center gap-8">
        <!-- 已选商品统计 -->
        <div class="text-sm text-gray-600">
          {{ t('79fdede9.c0b8b1') }}
          <span class="text-primary font-semibold">{{ selectedCount }}</span>
          {{ t('79fdede9.f7edf5') }}
        </div>

        <!-- 合计 -->
        <div class="flex items-baseline gap-2">
          <span class="text-sm text-gray-600">{{ t('79fdede9.0304c1') }}</span>
          <span class="text-2xl font-semibold text-red-600">
            {{ formatMoneyYuan(selectedTotal / 100) }}
          </span>
        </div>

        <!-- 结算按钮 -->
        <button
          type="button"
          :disabled="!hasSelectedItems || checking"
          class="px-8 py-3 bg-red-600 text-white text-base font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          @click="$emit('checkout')"
        >
          {{ checking ? t('79fdede9.2fb90b') : t('79fdede9.89159f') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatMoneyYuan } from '~/utils/currencyFormat'

/**
 * 购物车底部操作栏组件
 *
 * 提供全选、批量操作、统计信息和结算功能
 */

interface Props {
  /** 是否全选 */
  isAllSelected: boolean
  /** 商品总数 */
  totalCount: number
  /** 已选商品数量 */
  selectedCount: number
  /** 已选商品总价 */
  selectedTotal: number
  /** 是否有选中的商品 */
  hasSelectedItems: boolean
  /** 是否正在批量删除 */
  batchRemoving?: boolean
  /** 是否正在结算 */
  checking?: boolean
}

interface Emits {
  /** 全选/取消全选 */
  (e: 'toggle-all'): void
  /** 批量删除 */
  (e: 'batch-remove'): void
  /** 批量收藏 */
  (e: 'batch-favorite'): void
  /** 结算 */
  (e: 'checkout'): void
}

withDefaults(defineProps<Props>(), {
  batchRemoving: false,
  checking: false,
})

defineEmits<Emits>()
const { t } = useI18n()
</script>
