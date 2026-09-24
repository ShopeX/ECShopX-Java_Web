<template>
  <div class="flex flex-col items-start overflow-hidden">
    <NuxtLink :to="`/products/${product.id}`" class="w-full">
      <div class="relative aspect-square w-full bg-[#f6f6f6]">
        <img
          :src="product.image"
          :alt="product.name"
          class="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
        />
        <BCProductMarketingTags :tags="product.marketingTags" placement="overlay" />
      </div>
    </NuxtLink>

    <div
      class="flex w-full flex-col items-center bg-white text-center"
      :class="compact ? 'gap-2 px-2 py-4' : 'gap-3 py-6'"
    >
      <NuxtLink :to="`/products/${product.id}`" class="w-full">
        <h3
          class="line-clamp-1 w-full text-sm font-medium leading-5 text-[#191a1d]"
          :class="compact ? 'px-1' : ''"
        >
          {{ product.name }}
        </h3>
      </NuxtLink>

      <div class="flex items-center justify-center gap-2 whitespace-nowrap">
        <p class="text-base font-medium leading-5 text-[#191a1d]">
          ￥{{ formatPrice(displayPrice) }}
        </p>
        <p v-if="showOriginalPrice" class="text-sm leading-5 text-[#8f99aa] line-through">
          ￥{{ formatPrice(originalPrice!) }}
        </p>
      </div>

      <button
        v-if="showAddToCart"
        type="button"
        class="relative z-10 flex h-[38px] w-[106px] touch-manipulation items-center justify-center border border-[#e5e5e5] bg-white text-sm leading-5 text-[#191a1d] transition-colors hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
        @mousedown.stop
        @touchstart.stop
        @click.stop.prevent="emit('add-to-cart', product)"
      >
        <UIcon v-if="loading" name="i-heroicons-arrow-path" class="h-4 w-4 animate-spin" />
        <span v-else>{{ t('c23b194b.addToCart') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductRecommendation } from './types'
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'
import { resolveRecommendationPriceDisplay } from '~/utils/recommendationPrice'

const { t } = useI18n()

interface Props {
  product: ProductRecommendation
  showAddToCart?: boolean
  compact?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAddToCart: false,
  compact: false,
  loading: false,
})

const emit = defineEmits<{
  'add-to-cart': [product: ProductRecommendation]
}>()

const priceDisplay = computed(() => resolveRecommendationPriceDisplay(props.product))

const displayPrice = computed(() => priceDisplay.value.displayPrice)
const originalPrice = computed(() => priceDisplay.value.originalPrice)
const showOriginalPrice = computed(() => priceDisplay.value.showOriginalPrice)

const formatPrice = (price: number) => {
  return price.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
