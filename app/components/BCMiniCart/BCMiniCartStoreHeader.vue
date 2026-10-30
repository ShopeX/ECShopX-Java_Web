<template>
  <div class="flex items-center gap-[10px]">
    <img
      v-if="storeLogo"
      :src="storeLogo"
      :alt="storeName"
      class="size-5 shrink-0 object-cover"
    />
    <UIcon
      v-else
      name="i-icon-park-outline:application"
      class="size-5 shrink-0 text-[#191a1d]"
      aria-hidden="true"
    />
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
