<template>
  <article
    class="flex w-full items-start gap-4 border-b border-[#f2f2f2] py-5 last:border-b-0"
    :data-testid="`member-task-row-${task.task_id}`"
  >
    <div
      class="flex size-14 shrink-0 items-center justify-center bg-[#dadada] text-white"
      aria-hidden="true"
    >
      <UIcon :name="iconName" class="size-6 text-white" />
    </div>

    <div class="min-w-0 flex-1">
      <h3 class="truncate text-[15px] font-medium leading-5 text-[#191a1d]">
        {{ task.name }}
      </h3>
      <div
        v-if="rewardChips.length"
        class="mt-1.5 flex h-5 flex-wrap items-center gap-x-[15px] gap-y-1"
        data-testid="member-task-rewards"
      >
        <span
          v-for="(chip, index) in rewardChips"
          :key="`${chip.kind}-${index}`"
          class="inline-flex items-center gap-[5px] text-[12px] font-medium leading-none text-[#606266]"
        >
          <SignInIcon
            :name="chip.kind === 'coupon' ? 'coupon' : 'boxes'"
            class="size-[15px] shrink-0 text-[#dadada]"
          />
          {{ chip.label }}
        </span>
      </div>
      <!-- 任务说明：task_rule；不展示 type_label / frequency_text -->
      <p
        v-if="taskRuleText"
        class="mt-1.5 line-clamp-2 text-[12px] font-normal leading-4 text-[#909399]"
      >
        {{ taskRuleText }}
      </p>
    </div>

    <div class="flex w-[100px] shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        class="flex h-[33px] min-w-[100px] items-center justify-center px-3 text-[14px] leading-[17px] transition-colors"
        :class="ctaClass"
        :disabled="task.user_task_status !== 'todo'"
        :data-testid="`member-task-cta-${task.task_id}`"
        @click="emit('go-complete', task)"
      >
        {{ statusLabel }}
      </button>
      <span v-if="validRangeText" class="text-[12px] leading-4 text-[#a8abb2]">
        {{ validRangeText }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import SignInIcon from './SignInIcon.vue'
import type { IMemberTaskItem } from '~/types/memberTask'
import { parseMemberTaskRewards } from '~/utils/parseMemberTaskRewards'

const props = defineProps<{
  task: IMemberTaskItem
  statusLabel: string
}>()

const emit = defineEmits<{
  'go-complete': [task: IMemberTaskItem]
}>()

const rewardChips = computed(() => parseMemberTaskRewards(props.task.reward_summary))

const iconName = computed(() => {
  switch (props.task.type_detail) {
    case 'invite_register':
    case 'share_order':
      return 'i-heroicons-link'
    case 'sign_in':
    case 'favorite':
    case 'browse':
      return 'i-heroicons-sparkles'
    case 'first_order':
    case 'single_spend':
    case 'total_spend':
      return 'i-heroicons-shopping-bag'
    default:
      return 'i-heroicons-clipboard-document-list'
  }
})

/** Admin task_rule 为富文本，卡片上展示纯文本摘要 */
const taskRuleText = computed(() => {
  const raw = props.task.task_rule?.trim()
  if (!raw) return ''
  return raw
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
})

const validRangeText = computed(() => {
  const begin = props.task.begin_time_text?.trim()
  const end = props.task.end_time_text?.trim()
  if (begin && end) return `${begin} - ${end}`
  return begin || end || ''
})

const ctaClass = computed(() => {
  if (props.task.user_task_status === 'todo') {
    return 'bg-[#0f0f10] text-white hover:bg-[#191a1d]'
  }
  return 'border border-[#e5e5e5] bg-white text-[#909399] cursor-default'
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
