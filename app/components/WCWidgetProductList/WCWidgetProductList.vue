<template>
  <div class="py-8">
    <h2 v-if="title" class="text-2xl font-bold mb-6 text-center">{{ title }}</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <SpGoodsCard v-for="product in items" :key="product.id" :info="product" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SpGoodsCard from '~/components/SpGoodsCard.vue'

interface Product {
  id: number
  title: string
  pics: string[]
  price: number
  market_price?: number
  sales: number
  stock: number
}

defineProps<{
  title?: string
  items: Product[]
}>()
</script>
