<template>
  <div class="border-b border-[#e5e7eb] pb-[33px] w-full flex flex-col gap-[16px]">
    <p class="text-[16px] font-medium leading-5 text-[#191a1d]">{{ title }}</p>
    <div class="flex flex-col gap-[8px] w-full">
      <div
        v-for="row in rows"
        :key="row.label"
        class="flex items-start justify-between gap-[32px] text-[14px] leading-5 w-full"
      >
        <span class="shrink-0 text-[#4a5565]">{{ row.label }}</span>
        <div class="flex min-w-0 flex-1 items-center justify-end gap-[8px]">
          <div v-if="row.images?.length" class="flex flex-wrap justify-end gap-[8px]">
            <img
              v-for="image in row.images"
              :key="image"
              :src="image"
              :alt="row.label"
              class="h-[56px] w-[56px] rounded-[4px] object-cover"
            />
          </div>
          <span
            v-else
            class="text-right font-medium text-[#191a1d]"
            :class="row.multiline ? 'break-all' : 'whitespace-nowrap'"
          >
            {{ row.value }}
          </span>
          <button
            v-if="row.copyable && row.value"
            type="button"
            v-copy="String(row.value)"
            class="shrink-0 text-[#6b7280] hover:text-[#191a1d] transition-colors"
          >
            <UIcon name="i-heroicons-document-duplicate" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DetailInfoRow {
  label: string
  value?: string
  images?: string[]
  copyable?: boolean
  multiline?: boolean
}

interface Props {
  title: string
  rows: DetailInfoRow[]
}

defineProps<Props>()

</script>
