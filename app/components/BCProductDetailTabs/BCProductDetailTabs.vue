<template>
  <div class="w-full border-t border-white bg-white" :class="variant === 'mobile' ? 'px-0' : 'lg:pt-12'">
    <!-- Sticky Tab Bar：独立于内容区，避免被父级 overflow 裁剪 -->
    <div
      ref="tabBarRef"
      class="sticky z-30 flex w-full gap-8 border-b border-[#e5e5e5] bg-white pt-4"
      :class="variant === 'mobile' ? 'px-0' : ''"
      :style="{ top: stickyTop }"
    >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="flex flex-col items-center gap-2 pb-0"
          @click="scrollToSection(tab.id)"
        >
          <span
            class="whitespace-nowrap text-base leading-6"
            :class="
              activeTab === tab.id
                ? 'font-medium text-[#191a1d]'
                : 'font-normal text-[#4a5565]'
            "
          >
            {{ tab.label }}
          </span>
          <span
            class="h-0.5 w-full"
            :class="activeTab === tab.id ? 'bg-[#191a1d]' : 'bg-transparent'"
          />
        </button>
    </div>

    <div class="border-b border-[#e5e5e5]">
      <!-- Reviews Section -->
      <section
        :id="sectionIds.reviews"
        class="scroll-mt-[calc(var(--layout-header-height,68px)+48px)]"
        :data-pdp-tab-instance="instanceId"
      >
        <div v-if="reviewsLoading" class="py-5 text-sm text-[#4a5565]">
          {{ $t('464b6330.26b5bd') }}
        </div>

        <div v-else-if="displayedReviews.length" class="flex flex-col">
          <BCProductReviewItem
            v-for="review in displayedReviews"
            :key="review.id"
            :review="review"
            :item-id="itemId"
          />

          <div
            v-if="showMoreReviewsButton"
            class="flex items-center justify-center py-5"
          >
            <button
              type="button"
              class="flex items-center gap-1 border border-[#e5e5e5] px-8 py-2.5 text-sm leading-5 text-[#4a5565] transition-colors hover:border-[#191a1d] hover:text-[#191a1d]"
              @click="reviewsModalOpen = true"
            >
              <span>{{ $t('464b6330.c5d8f2') }}</span>
              <UIcon name="i-heroicons-chevron-right" class="size-4" />
            </button>
          </div>
        </div>

        <div v-else class="py-5 text-sm leading-5 text-[#4a5565]">
          {{ $t('464b6330.f8e3b1') }}
        </div>
      </section>

      <!-- Details Section -->
      <section
        :id="sectionIds.details"
        class="scroll-mt-[calc(var(--layout-header-height,68px)+48px)] border-t border-[#e5e5e5]"
        :data-pdp-tab-instance="instanceId"
      >
        <div class="flex items-center justify-between py-4">
          <h2 class="text-base font-medium leading-6 text-[#364153]">
            {{ $t('464b6330.b4f5db') }}
          </h2>
        </div>

        <div
          class="product-description pb-8 text-sm leading-5 text-[#364153] lg:text-base lg:leading-6"
          v-html="description"
        />
      </section>
    </div>

    <BCProductReviewsModal
      v-model="reviewsModalOpen"
      :item-id="itemId"
    />
  </div>
</template>

<script setup lang="ts">
import BCProductReviewItem from '~/components/BCProductReviewItem/BCProductReviewItem.vue'
import BCProductReviewsModal from '~/components/BCProductReviewsModal/BCProductReviewsModal.vue'
import type { ProductReviewItem } from '~/composables/useProductReviews'
import {
  useProductDetailTabs,
  type ProductDetailTabId,
} from '~/composables/useProductDetailTabs'

interface Props {
  itemId: string
  description: string
  reviews: ProductReviewItem[]
  reviewsTotal: number
  reviewsLoading?: boolean
  variant?: 'desktop' | 'mobile'
  instanceId: 'desktop' | 'mobile'
  previewCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  reviewsLoading: false,
  variant: 'desktop',
  previewCount: 2,
})

const { t } = useI18n()

const sectionIds = computed(() => ({
  reviews: `pdp-section-reviews-${props.instanceId}`,
  details: `pdp-section-details-${props.instanceId}`,
}))

const reviewsModalOpen = ref(false)

const displayedReviews = computed(() => props.reviews.slice(0, props.previewCount))

const showMoreReviewsButton = computed(() => {
  if (props.reviewsTotal > props.previewCount) {
    return true
  }

  // 预览条数已满时也展示入口（兼容 total_count 未准确返回的场景）
  return props.reviews.length >= props.previewCount && props.reviews.length > 0
})

const stickyTop = 'calc(var(--layout-header-height, 68px))'

const defaultTab = computed<ProductDetailTabId>(() => {
  return props.reviews.length > 0 ? 'reviews' : 'details'
})

const { activeTab, tabBarRef, scrollToSection, setupObserver, setActiveTab } =
  useProductDetailTabs({
    sectionIds,
    defaultTab: 'reviews',
  })

watch(
  defaultTab,
  (tab) => {
    setActiveTab(tab)
    nextTick(() => setupObserver())
  },
  { immediate: true }
)

watch(
  () => props.reviews.length,
  () => {
    nextTick(() => setupObserver())
  }
)

watch(sectionIds, () => {
  nextTick(() => setupObserver())
})

const tabs = computed(() => [
  { id: 'reviews' as ProductDetailTabId, label: t('464b6330.e2a91c') },
  { id: 'details' as ProductDetailTabId, label: t('464b6330.b4f5db') },
])
</script>
