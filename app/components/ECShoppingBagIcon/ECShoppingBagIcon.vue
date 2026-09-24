<template>
  <svg :class="iconClass" width="17" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true">
    <path d="M2.58582 5.02832H17.4141" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"
      stroke-linejoin="round" />
    <path
      d="M2.83333 4.55567C2.61696 4.84416 2.5 5.19505 2.5 5.55567V16.6665C2.5 17.1085 2.67559 17.5325 2.98816 17.845C3.30072 18.1576 3.72464 18.3332 4.16667 18.3332H15.8333C16.2754 18.3332 16.6993 18.1576 17.0118 17.845C17.3244 17.5325 17.5 17.1085 17.5 16.6665V5.55567C17.5 5.19505 17.383 4.84416 17.1667 4.55567L15.5 2.33317C15.3448 2.12618 15.1434 1.95817 14.912 1.84246C14.6806 1.72675 14.4254 1.6665 14.1667 1.6665H5.83333C5.57459 1.6665 5.3194 1.72675 5.08798 1.84246C4.85655 1.95817 4.65525 2.12618 4.5 2.33317L2.83333 4.55567Z"
      stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />


    <text v-if="displayCount" x="10" y="12.7" text-anchor="middle" dominant-baseline="middle" :font-size="countFontSize"
      font-weight="500" fill="currentColor" font-family="Inter, sans-serif">
      {{ displayCount }}
    </text>
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    class?: string
    count?: number
  }>(),
  {
    class: 'h-[18px] w-[17px]',
    count: 0,
  }
)

const iconClass = computed(() => props.class)

const displayCount = computed(() => {
  const total = props.count || 0
  if (total <= 0) return ''
  return total > 99 ? '99' : String(total)
})

const countFontSize = computed(() => {
  const length = displayCount.value.length
  if (length >= 3) return 8
  if (length === 2) return 9
  return 10
})
</script>
