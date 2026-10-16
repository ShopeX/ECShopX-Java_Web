<template>
  <div class="flex items-center gap-2">
    <div
      class="flex size-5 shrink-0 items-center justify-center overflow-hidden bg-[#f3f4f7] text-[#191a1d]"
    >
      <img
        v-if="storeLogo"
        :src="storeLogo"
        :alt="storeName"
        class="size-full object-cover"
      />
      <UIcon v-else name="i-heroicons-building-storefront" class="size-3.5" />
    </div>
    <p class="truncate font-['Noto_Sans_SC'] text-sm font-medium leading-5 text-[#191a1d]">
      {{ storeName }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  storeName: string
  storeLogo?: string
}

defineProps<Props>()
</script>
