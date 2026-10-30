<template>
  <article
    class="flex w-full flex-col overflow-hidden bg-white md:h-full"
    data-testid="activity-event-card"
  >
    <div class="relative w-full shrink-0">
      <img
        class="aspect-[4/3] h-auto w-full object-cover"
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

    <div class="flex min-h-0 flex-col border border-[#e5e7eb] p-4 md:flex-1">
      <div class="flex min-h-0 flex-col gap-2 md:flex-1">
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
        <div
          v-if="item.showTime !== false && item.activityStartTime"
          class="flex items-center gap-2 md:min-h-5"
        >
          <UIcon name="i-heroicons-calendar-days" class="h-4 w-4 shrink-0 text-[#4a5565]" />
          <span class="truncate text-sm leading-5 text-[#4a5565]">{{ item.activityStartTime }}</span>
        </div>
        <div
          v-if="(item.showCity || item.showPlace) && item.areaName"
          class="flex items-center gap-2"
        >
          <UIcon name="i-heroicons-map-pin" class="h-4 w-4 shrink-0 text-[#4a5565]" />
          <span class="truncate text-sm leading-5 text-[#4a5565]">{{ item.areaName }}</span>
        </div>
        <div v-else class="hidden md:block md:min-h-5" aria-hidden="true" />
      </div>

      <div
        class="md:mt-auto md:pt-3"
        :class="showApply ? 'mt-3' : 'hidden md:block'"
      >
        <button
          v-if="showApply"
          type="button"
          class="w-full bg-[#0f0f10] px-5 py-2 text-sm font-medium leading-5 text-white"
          data-testid="activity-apply-btn"
          @click.stop="$emit('apply', item)"
        >
          {{ t('registration.applyNow') }}
        </button>
        <div v-else class="h-9" aria-hidden="true" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
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
