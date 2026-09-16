<template>
  <article class="w-full overflow-hidden bg-white" data-testid="activity-event-card">
    <div class="relative w-full">
      <img
        class="h-[200px] w-full object-cover"
        :src="cover"
        :alt="item.activityName"
      />
      <span
        class="absolute left-3 top-3 px-2 py-1 text-xs leading-4 text-white"
        :class="badgeClass"
      >
        {{ statusLabel }}
      </span>
    </div>

    <div class="flex items-start gap-4 border border-[#e5e7eb] p-[17px]">
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-if="displayTag"
            class="border border-[#8f99aa] px-2 py-1 text-xs leading-4 text-[#4a5565]"
          >
            {{ displayTag }}
          </span>
          <h3 class="truncate text-base font-medium leading-6 text-[#191a1d]">
            {{ item.activityName }}
          </h3>
        </div>
        <div v-if="item.showTime !== false && item.activityStartTime" class="flex items-center gap-2">
          <UIcon name="i-heroicons-calendar-days" class="h-4 w-4 shrink-0 text-[#4a5565]" />
          <span class="text-sm leading-5 text-[#4a5565]">{{ item.activityStartTime }}</span>
        </div>
        <div
          v-if="(item.showCity || item.showPlace) && item.areaName"
          class="flex items-center gap-2"
        >
          <UIcon name="i-heroicons-map-pin" class="h-4 w-4 shrink-0 text-[#4a5565]" />
          <span class="text-sm leading-5 text-[#4a5565]">{{ item.areaName }}</span>
        </div>
      </div>

      <div v-if="showApply" class="shrink-0 self-start md:self-start">
        <button
          type="button"
          class="bg-[#0f0f10] px-5 py-2 text-sm font-medium leading-5 text-white"
          data-testid="activity-apply-btn"
          @click.stop="$emit('apply', item)"
        >
          {{ t('registration.applyNow') }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IRegistrationActivityListItem } from '~/infrastructure/transformers'

const props = defineProps<{
  item: IRegistrationActivityListItem
}>()

defineEmits<{
  apply: [item: IRegistrationActivityListItem]
  click: [item: IRegistrationActivityListItem]
}>()

const { t } = useI18n()

const cover = computed(
  () => props.item.pics?.[0] || 'https://via.placeholder.com/530x200?text=Activity'
)

const statusLabel = computed(() => {
  if (props.item.statusName) return props.item.statusName
  if (props.item.lifecycle === 'not_started') return t('registration.tabNotStarted')
  if (props.item.lifecycle === 'ended') return t('registration.tabEnded')
  if (props.item.lifecycle === 'ongoing') return t('registration.tabOngoing')
  return ''
})

const badgeClass = computed(() => {
  if (props.item.lifecycle === 'ongoing') return 'bg-[#0f0f10]'
  if (props.item.lifecycle === 'not_started') return 'bg-[#4a5565]'
  return 'bg-[#8f99aa]'
})

const displayTag = computed(() => props.item.tag || t('registration.memberFree'))

const showApply = computed(() => props.item.lifecycle === 'ongoing')
</script>
