<template>
  <div class="flex min-w-0 flex-col gap-2 text-[14px] leading-5">
    <span class="whitespace-nowrap text-[#4a5565]">{{ label }}</span>
    <span class="break-words text-black">{{ value || '—' }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string
}>()
</script>
