<template>
  <div class="relative w-full overflow-hidden">
    <img :src="image" class="w-full h-auto block" alt="Hot Zone" />
    <a
      v-for="(zone, index) in zones"
      :key="index"
      :href="zone.link"
      class="absolute block"
      :style="{
        left: zone.left + '%',
        top: zone.top + '%',
        width: zone.width + '%',
        height: zone.height + '%',
      }"
      :title="zone.title"
    ></a>
  </div>
</template>

<script setup lang="ts">
interface Zone {
  link: string
  left: number
  top: number
  width: number
  height: number
  title?: string
}

defineProps<{
  image: string
  zones: Zone[]
}>()
</script>
