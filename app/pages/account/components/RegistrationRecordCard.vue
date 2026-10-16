<template>
  <article class="w-full overflow-hidden bg-white" data-testid="registration-record-card">
    <div class="relative w-full">
      <img
        class="h-[200px] w-full object-cover"
        :src="cover"
        :alt="item.activityName"
      />
      <span
        v-if="activityStatusLabel"
        class="absolute left-3 top-3 px-2 py-1 text-xs leading-4 text-white"
        :class="activityBadgeClass"
      >
        {{ activityStatusLabel }}
      </span>
    </div>

    <div class="border border-[#e5e7eb] p-[17px]">
      <div class="flex flex-col gap-2">
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
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
          <span class="shrink-0 text-base font-medium leading-6 text-[#191a1d]">
            {{ item.statusName }}
          </span>
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
        <p v-if="item.reason" class="text-sm leading-5 text-[#4a5565]">
          {{ t('registration.reason') }}
          <span class="text-[#191a1d]">{{ item.reason }}</span>
        </p>

        <div class="mt-2 flex items-center justify-between gap-3">
          <div class="flex flex-wrap gap-2">
            <button
              v-if="item.actionEdit"
              type="button"
              class="border border-[#0f0f10] px-5 py-2 text-sm font-medium leading-5 text-[#0f0f10]"
              @click.stop="$emit('edit', item)"
            >
              {{ t('registration.refill') }}
            </button>
            <button
              v-if="item.actionApply"
              type="button"
              class="border border-[#0f0f10] px-5 py-2 text-sm font-medium leading-5 text-[#0f0f10]"
              @click.stop="$emit('apply', item)"
            >
              {{ t('registration.applyNow') }}
            </button>
            <button
              type="button"
              class="bg-[#0f0f10] px-5 py-2 text-sm font-medium leading-5 text-white"
              @click.stop="$emit('view', item)"
            >
              {{ t('registration.viewDetail') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IRegistrationRecordListItem } from '~/infrastructure/transformers'

const props = defineProps<{
  item: IRegistrationRecordListItem
}>()

defineEmits<{
  view: [item: IRegistrationRecordListItem]
  edit: [item: IRegistrationRecordListItem]
  apply: [item: IRegistrationRecordListItem]
}>()

const { t } = useI18n()

const cover = computed(
  () => props.item.pics?.[0] || 'https://via.placeholder.com/530x200?text=Activity'
)

const displayTag = computed(() => props.item.tag || t('registration.memberFree'))

const activityStatusLabel = computed(() => {
  if (props.item.activityStatus) return props.item.activityStatus
  if (props.item.activityLifecycle === 'not_started') return t('registration.tabNotStarted')
  if (props.item.activityLifecycle === 'ended') return t('registration.tabEnded')
  if (props.item.activityLifecycle === 'ongoing') return t('registration.tabOngoing')
  return ''
})

const activityBadgeClass = computed(() => {
  if (props.item.activityLifecycle === 'ongoing') return 'bg-[#0f0f10]'
  if (props.item.activityLifecycle === 'not_started') return 'bg-[#4a5565]'
  return 'bg-[#8f99aa]'
})
</script>
