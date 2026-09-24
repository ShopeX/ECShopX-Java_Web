<template>
  <Banner :banners="items" />
</template>

<script setup lang="ts">
import Banner from '~/components/Banner.vue'

interface CarouselItem {
  image: string
  title: string
  link: string
}

defineProps<{
  items: CarouselItem[]
}>()
</script>
