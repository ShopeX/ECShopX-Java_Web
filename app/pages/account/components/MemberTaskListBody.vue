<template>
  <section data-testid="member-task-list-body">
    <div
      class="flex w-full items-center justify-between gap-4"
      :class="mobile ? 'mb-4' : 'mb-6'"
    >
      <h1
        v-if="!mobile"
        class="text-[20px] font-medium leading-5 text-[#191a1d]"
        data-testid="member-task-page-title"
      >
        {{ t('m10435.headline') }}
      </h1>
      <button
        type="button"
        class="ms-auto inline-flex shrink-0 items-center text-[12px] leading-5 text-[#191a1d] hover:underline"
        data-testid="member-task-history-entry"
        @click="emit('open-history')"
      >
        {{ mobile ? t('m10435.historyEntryMobile') : t('m10435.historyEntry') }}
        <span aria-hidden="true">&nbsp;&gt;</span>
      </button>
    </div>

    <div v-if="loading" class="py-16 text-center text-[14px] text-[#4a5565]">
      {{ t('m10435.loading') }}
    </div>
    <div
      v-else-if="!tasks.length"
      class="border border-[#e5e5e5] px-6 py-16 text-center text-[14px] text-[#4a5565]"
      data-testid="member-task-empty"
    >
      {{ t('m10435.empty') }}
    </div>
    <div v-else class="w-full" data-testid="member-task-list">
      <MemberTaskRow
        v-for="task in tasks"
        :key="task.task_id"
        :task="task"
        :status-label="statusLabel(task.user_task_status)"
        @go-complete="emit('go-complete', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import MemberTaskRow from './MemberTaskRow.vue'
import type { IMemberTaskItem, MemberTaskUserStatus } from '~/types/memberTask'

withDefaults(
  defineProps<{
    tasks: IMemberTaskItem[]
    loading?: boolean
    statusLabel: (status: MemberTaskUserStatus) => string
    mobile?: boolean
  }>(),
  {
    loading: false,
    mobile: false,
  }
)

const emit = defineEmits<{
  'go-complete': [task: IMemberTaskItem]
  'open-history': []
}>()

const { t } = useI18n()
</script>
