<template>
  <section class="flex flex-col gap-5 py-4 md:flex-row md:gap-[30px] md:py-6">
    <h2 class="shrink-0 text-[14px] font-bold leading-5 text-[#191a1d] md:w-[120px]">
      {{ label }}
    </h2>
    <div class="flex min-w-0 flex-1 flex-col gap-5 md:gap-[30px]">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>
