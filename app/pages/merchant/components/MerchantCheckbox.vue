<template>
  <span
    class="inline-flex cursor-pointer items-center gap-2 text-[14px] leading-5 text-[#364153] select-none"
    role="checkbox"
    :aria-checked="checked"
    tabindex="0"
    @click="emit('toggle')"
    @keydown.enter.prevent="emit('toggle')"
    @keydown.space.prevent="emit('toggle')"
  >
    <span
      class="flex size-4 shrink-0 items-center justify-center border"
      :class="checked ? 'border-[#191a1d] bg-[#191a1d]' : 'border-[#e5e5e5] bg-white'"
    >
      <svg
        v-if="checked"
        class="size-[11px]"
        viewBox="0 0 11 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2 5.6 4.4 8 9 3.4"
          stroke="#ffffff"
          stroke-width="1.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="text-left"><slot /></span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  checked?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>
