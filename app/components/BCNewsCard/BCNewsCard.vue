<template>
  <div
    class="flex flex-col group cursor-pointer transition-all duration-300"
    data-testid="news-card"
    @click="$emit('click', item)"
  >
    <!-- Image -->
    <div class="h-[200px] w-full overflow-hidden relative">
      <img
        :src="item.image"
        :alt="item.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        data-testid="news-card-image"
      />
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-3 p-[24px] w-full items-start">
      <h3
        class="text-[#191a1d] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] line-clamp-2"
        data-testid="news-card-title"
      >
        {{ item.title }}
      </h3>
      <p
        class="text-[#364153] text-[14px] leading-[1.6] line-clamp-3"
        data-testid="news-card-summary"
      >
        {{ item.summary }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { INewsItem } from './types'

defineProps<{
  item: INewsItem
}>()

defineEmits<{
  click: [item: INewsItem]
}>()
</script>
