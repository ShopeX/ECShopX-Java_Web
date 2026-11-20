<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  total: number
  pageSize: number
  currentPage: number
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const pages = computed(() => {
  const current = props.currentPage
  const total = totalPages.value
  const delta = 2
  const range: (number | string)[] = []
  const rangeWithDots: (number | string)[] = []
  let l: number | undefined

  range.push(1)

  if (total <= 1) return range

  for (let i = current - delta; i <= current + delta; i++) {
    if (i < total && i > 1) {
      range.push(i)
    }
  }
  range.push(total)

  for (const i of range) {
    if (l) {
      if (typeof i === 'number' && i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (typeof i === 'number' && i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = typeof i === 'number' ? i : l
  }

  return rangeWithDots
})

const handlePageChange = (page: number | string) => {
  if (
    typeof page === 'number' &&
    page !== props.currentPage &&
    page >= 1 &&
    page <= totalPages.value
  ) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="border-t border-[#f3f4f6] flex items-center justify-center gap-1 pt-[17px] pb-[16px] w-full">
    <button
      class="flex h-8 w-8 items-center justify-center text-[#191a1d] transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="currentPage === 1"
      @click="handlePageChange(currentPage - 1)"
    >
      <UIcon name="i-heroicons-chevron-left" class="h-4 w-4" />
    </button>

    <button
      v-for="(page, index) in pages"
      :key="index"
      class="flex h-8 w-8 items-center justify-center font-['Inter'] text-[12px] leading-4 transition-colors"
      :class="[
        page === currentPage
          ? 'bg-[#141414] text-white'
          : page === '...'
            ? 'cursor-default text-[#4a5565]'
            : 'text-[#4a5565] hover:bg-gray-100',
      ]"
      @click="handlePageChange(page)"
    >
      {{ page }}
    </button>

    <button
      class="flex h-8 w-8 items-center justify-center text-[#191a1d] transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="currentPage === totalPages"
      @click="handlePageChange(currentPage + 1)"
    >
      <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
    </button>
  </div>
</template>
