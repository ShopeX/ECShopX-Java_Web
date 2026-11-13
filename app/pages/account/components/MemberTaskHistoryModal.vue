<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    data-testid="member-task-history-modal"
    @click.self="emit('close')"
  >
    <div
      class="flex max-h-[85vh] w-full flex-col overflow-hidden bg-white p-5 sm:max-w-[600px] sm:p-[30px]"
      data-testid="member-task-history-panel"
    >
      <div class="flex w-full shrink-0 items-center justify-between">
        <h3 class="text-[20px] font-medium leading-5 text-[#191a1d]">
          {{ t('m10435.historyTitle') }}
        </h3>
        <button
          type="button"
          class="flex size-6 shrink-0 items-center justify-center text-[#191a1d]"
          data-testid="member-task-history-close"
          :aria-label="t('m10435.close')"
          @click="emit('close')"
        >
          <UIcon name="i-heroicons-x-mark" class="size-6" />
        </button>
      </div>

      <div v-if="loading" class="flex shrink-0 justify-center py-10">
        <USkeleton class="h-40 w-full" />
      </div>
      <p
        v-else-if="!list.length"
        class="shrink-0 py-10 text-center text-[14px] text-[#99a1af]"
        data-testid="member-task-history-empty"
      >
        {{ t('m10435.historyEmpty') }}
      </p>
      <ul
        v-else
        class="mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto"
        data-testid="member-task-history-list"
      >
        <li
          v-for="item in list"
          :key="item.completion_id"
          class="border-b border-[#f2f2f2] py-5 last:border-b-0"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="min-w-0 truncate text-[14px] font-medium text-[#191a1d]">{{ item.name }}</p>
            <p class="shrink-0 text-[12px] text-[#909399]">
              {{ item.completed_at_text || '' }}
            </p>
          </div>
          <div class="mt-2 flex items-start justify-between gap-3">
            <p class="text-[12px] text-[#909399]">{{ t('m10435.taskReward') }}</p>
            <p
              class="shrink-0 text-[14px]"
              :class="
                item.user_task_status === 'pending_reward'
                  ? 'font-medium text-[#191a1d]'
                  : 'text-[#909399]'
              "
            >
              {{
                item.grant_status_text ||
                (item.user_task_status === 'pending_reward'
                  ? t('m10435.pendingReward')
                  : item.user_task_status === 'reward_failed'
                    ? t('m10435.rewardFailed')
                    : t('m10435.rewarded'))
              }}
            </p>
          </div>
          <p v-if="item.reward_summary" class="mt-2 text-[12px] text-[#191a1d]">
            {{ item.reward_summary }}
          </p>
        </li>
      </ul>

      <div
        v-if="totalPages > 1"
        class="mt-4 flex w-full shrink-0 items-center justify-center gap-1"
        data-testid="member-task-history-pagination"
      >
        <button
          type="button"
          class="flex size-8 items-center justify-center"
          :class="page > 1 ? 'text-[#4a5565]' : 'cursor-not-allowed text-[#c0c4cc]'"
          :disabled="page <= 1"
          @click="emit('page-change', page - 1)"
        >
          <UIcon name="i-heroicons-chevron-left" class="size-4" />
        </button>
        <template v-for="(item, index) in pageItems" :key="`page-${index}-${item}`">
          <span v-if="item === '...'" class="min-w-6 px-0.5 text-center text-[14px] text-[#4a5565]">
            ...
          </span>
          <button
            v-else
            type="button"
            class="min-w-8 px-1 text-[14px]"
            :class="item === page ? 'font-medium text-[#191a1d]' : 'text-[#4a5565]'"
            @click="emit('page-change', item)"
          >
            {{ item }}
          </button>
        </template>
        <button
          type="button"
          class="flex size-8 items-center justify-center"
          :class="page < totalPages ? 'text-[#4a5565]' : 'cursor-not-allowed text-[#c0c4cc]'"
          :disabled="page >= totalPages"
          @click="emit('page-change', page + 1)"
        >
          <UIcon name="i-heroicons-chevron-right" class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IMemberTaskHistoryItem } from '~/types/memberTask'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    list: IMemberTaskHistoryItem[]
    loading?: boolean
    page?: number
    totalPages?: number
  }>(),
  {
    loading: false,
    page: 1,
    totalPages: 1,
  }
)

const emit = defineEmits<{
  close: []
  'page-change': [page: number]
}>()

const { t } = useI18n()

const pageItems = computed<(number | '...')[]>(() => {
  const total = props.totalPages
  const current = props.page
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const items: (number | '...')[] = []
  const windowStart = Math.max(1, Math.min(current - 2, total - 5))
  const windowEnd = Math.min(total, windowStart + 5)

  for (let i = windowStart; i <= windowEnd; i += 1) {
    items.push(i)
  }

  if (windowEnd < total - 1) {
    items.push('...')
  }
  if (windowEnd < total) {
    items.push(total)
  }

  return items
})
</script>
