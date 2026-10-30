<template>
  <div class="w-full py-4">
    <a :href="link" class="block w-full">
      <img :src="image" :alt="title" class="w-full h-auto object-cover rounded-lg" />
    </a>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  image: string
  link: string
  title?: string
}>()
</script>
