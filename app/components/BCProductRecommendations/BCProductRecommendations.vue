<template>
  <div class="w-full flex flex-col bg-white">
    <!-- 标题 -->
    <div class="flex justify-center px-4 py-8 lg:px-32">
      <div v-if="canShowRecentTab" class="flex gap-8 items-start justify-center">
        <button
          class="flex flex-col items-center justify-center pb-2 relative"
          @click="activeTab = 'recommended'"
        >
          <h2
            class="text-[20px] leading-5 whitespace-nowrap font-medium"
            :class="activeTab === 'recommended' ? 'text-[#191a1d]' : 'text-[#4a5565]'"
          >
            {{ t('c23b194b.e86a4d') }}
          </h2>
          <div
            v-if="activeTab === 'recommended'"
            class="absolute bottom-0 left-0 right-0 h-px bg-[#191a1d]"
          />
        </button>
        <button
          class="flex flex-col items-center justify-center pb-2 relative"
          @click="activeTab = 'recent'"
        >
          <h2
            class="text-[20px] leading-5 whitespace-nowrap"
            :class="activeTab === 'recent' ? 'text-[#191a1d] font-medium' : 'text-[#4a5565]'"
          >
            {{ t('c23b194b.3debde') }}
          </h2>
          <div
            v-if="activeTab === 'recent'"
            class="absolute bottom-0 left-0 right-0 h-px bg-[#191a1d]"
          />
        </button>
      </div>
      <h2 v-else class="text-[20px] font-medium leading-5 text-[#191a1d] text-center">
        {{ t('c23b194b.e86a4d') }}
      </h2>
    </div>

    <!-- 移动端：横向滚动 -->
    <div class="lg:hidden pb-8 w-full overflow-x-auto scrollbar-hide">
      <div class="flex gap-4 px-4" style="width: max-content">
        <article
          v-for="(product, index) in activeProducts"
          :key="product.id || index"
          class="flex w-[165px] shrink-0 flex-col overflow-hidden"
        >
          <BCProductRecommendationCard
            :product="product"
            :show-add-to-cart="showAddToCart"
            :loading="addingProductId === product.id"
            compact
            @add-to-cart="emitAddToCart"
          />
        </article>
      </div>
    </div>

    <!-- PC 端：轮播 -->
    <div class="hidden lg:flex lg:flex-col lg:items-center lg:pb-8 lg:w-full">
      <div class="flex w-full max-w-[1440px] items-center gap-4 px-8 xl:gap-6 xl:px-16">
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center text-[#191a1d] transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
          :disabled="!canGoPrev"
          :aria-label="t('c23b194b.prevBatch')"
          @click="goPrev"
        >
          <UIcon name="i-heroicons-chevron-left" class="h-6 w-6" />
        </button>

        <div
          class="grid min-w-0 flex-1 gap-4 xl:gap-6"
          :style="{ gridTemplateColumns: `repeat(${pageSize}, minmax(0, 1fr))` }"
        >
          <article
            v-for="(product, index) in pagedProducts"
            :key="product.id || index"
            class="min-w-0"
          >
            <BCProductRecommendationCard
              :product="product"
              :show-add-to-cart="showAddToCart"
              :loading="addingProductId === product.id"
              @add-to-cart="emitAddToCart"
            />
          </article>
        </div>

        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center text-[#191a1d] transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
          :disabled="!canGoNext"
          :aria-label="t('c23b194b.nextBatch')"
          @click="goNext"
        >
          <UIcon name="i-heroicons-chevron-right" class="h-6 w-6" />
        </button>
      </div>

      <div
        v-if="totalBatches > 1"
        class="mt-8 flex h-1 w-40 overflow-hidden rounded-full"
        role="tablist"
        :aria-label="t('c23b194b.batchIndicator')"
      >
        <button
          v-for="batchIndex in totalBatches"
          :key="batchIndex"
          type="button"
          class="h-full flex-1 transition-colors"
          :class="batchIndex - 1 === currentBatch ? 'bg-[#191a1d]' : 'bg-[#e5e5e5]'"
          :aria-label="t('c23b194b.batchLabel', { index: batchIndex })"
          @click="currentBatch = batchIndex - 1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductRecommendation } from './types'
import BCProductRecommendationCard from './BCProductRecommendationCard.vue'

const { t } = useI18n()

interface Props {
  recommendedProducts?: ProductRecommendation[]
  recentProducts?: ProductRecommendation[]
  showRecentTab?: boolean
  showAddToCart?: boolean
  addingProductId?: string | null
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  recommendedProducts: () => [],
  recentProducts: () => [],
  showRecentTab: false,
  showAddToCart: false,
  addingProductId: null,
  pageSize: 5,
})

const emit = defineEmits<{
  'add-to-cart': [product: ProductRecommendation]
}>()

const activeTab = ref<'recommended' | 'recent'>('recommended')
const currentBatch = ref(0)

const canShowRecentTab = computed(() => props.showRecentTab)

const activeProducts = computed(() => {
  if (!canShowRecentTab.value) {
    return props.recommendedProducts
  }

  return activeTab.value === 'recommended' ? props.recommendedProducts : props.recentProducts
})

const totalBatches = computed(() => {
  const count = activeProducts.value.length
  if (!count) return 0
  return Math.ceil(count / props.pageSize)
})

const pagedProducts = computed(() => {
  const start = currentBatch.value * props.pageSize
  return activeProducts.value.slice(start, start + props.pageSize)
})

const canGoPrev = computed(() => currentBatch.value > 0)
const canGoNext = computed(() => currentBatch.value < totalBatches.value - 1)

watch(activeProducts, () => {
  currentBatch.value = 0
})

watch(activeTab, () => {
  currentBatch.value = 0
})

function goPrev() {
  if (canGoPrev.value) {
    currentBatch.value -= 1
  }
}

function goNext() {
  if (canGoNext.value) {
    currentBatch.value += 1
  }
}

function emitAddToCart(product: ProductRecommendation) {
  emit('add-to-cart', product)
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
