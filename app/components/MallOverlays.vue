<template>
  <div v-if="!isDesignMode" class="contents">
    <USlideover v-model:open="showSearchDrawer" side="left">
      <template #content>
        <BCSearchDrawer
          v-model="showSearchDrawer"
          :hot-keywords="hotKeywords"
          @close="showSearchDrawer = false"
          @search="handleSearch"
        />
      </template>
    </USlideover>

    <USlideover
      v-model:open="showCategoryNav"
      side="left"
      :content="{ style: { width: 'min(100vw, 720px)', maxWidth: '720px' } }"
      :ui="{
        content:
          'left-0 inset-y-0 !w-screen md:!w-[720px] !max-w-[720px] bg-default divide-y divide-default sm:ring ring-default sm:shadow-lg flex flex-col focus:outline-none',
      }"
    >
      <template #content>
        <BCCategoryNav
          v-model="showCategoryNav"
          :menu-id="headerMenuId"
          @close="showCategoryNav = false"
          @search="handleCategorySearch"
          @change-region="handleChangeRegion"
        />
      </template>
    </USlideover>

    <USlideover
      v-model:open="showMiniCart"
      side="right"
      :content="{ style: { width: 'min(100vw, 560px)', maxWidth: '560px' } }"
      :ui="{
        content:
          'right-0 inset-y-0 !w-screen lg:!w-[560px] !max-w-[560px] bg-default divide-y divide-default sm:ring ring-default sm:shadow-lg flex flex-col focus:outline-none',
      }"
    >
      <template #content>
        <div class="flex h-full min-h-0 flex-col">
          <BCMiniCart v-model="showMiniCart" @close="showMiniCart = false" />
        </div>
      </template>
    </USlideover>

    <USlideover
      v-if="isAiAssistantFeatureEnabled"
      v-model:open="showAiAssistantDrawer"
      :title="aiAssistantTitle"
      :description="aiAssistantDescription"
      side="right"
      :content="{ style: { width: 'min(100vw, 560px)', maxWidth: '560px' } }"
      :ui="{
        content:
          'right-0 inset-y-0 !w-screen md:!w-[560px] !max-w-[560px] bg-default sm:ring ring-default sm:shadow-lg flex flex-col focus:outline-none',
      }"
    >
      <template #content>
        <BCAiAssistantDrawer v-model="showAiAssistantDrawer" />
      </template>
    </USlideover>

    <BCProductSkuDrawer
      v-model="recommendationSkuDrawerOpen"
      :product-data="recommendationSkuProductData"
      :fallback-marketing-tags="recommendationSkuMarketingTags"
      :confirm-loading="recommendationSkuConfirmLoading"
      @confirm="handleRecommendationSkuConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import BCAiAssistantDrawer from '~/components/BCAiAssistantDrawer/BCAiAssistantDrawer.vue'
import BCCategoryNav from '~/components/BCCategoryNav/BCCategoryNav.vue'
import BCMiniCart from '~/components/BCMiniCart/BCMiniCart.vue'
import BCProductSkuDrawer from '~/components/BCProductSkuDrawer/BCProductSkuDrawer.vue'
import BCSearchDrawer from '~/components/BCSearchDrawer/BCSearchDrawer.vue'
import { useMallOverlays } from '~/composables/useMallOverlays'
import { useRecommendationSkuDrawer } from '~/composables/useRecommendationAddToCart'
import { isDecorationPreviewActiveOnRoute } from '~/decoration-engine/composables/useDecorationRouteContext'
import { isAiAssistantEnabled, type AiAssistantPublicConfig } from '~/utils/aiAssistantEmbed'

const {
  showSearchDrawer,
  showCategoryNav,
  showMiniCart,
  showAiAssistantDrawer,
  headerMenuId,
} = useMallOverlays()

const {
  skuDrawerOpen: recommendationSkuDrawerOpen,
  skuProductData: recommendationSkuProductData,
  skuMarketingTags: recommendationSkuMarketingTags,
  skuConfirmLoading: recommendationSkuConfirmLoading,
  handleSkuConfirm: handleRecommendationSkuConfirm,
} = useRecommendationSkuDrawer()

watch(recommendationSkuDrawerOpen, (open) => {
  if (open) {
    showMiniCart.value = false
  }
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()

const isDesignMode = computed(() => isDecorationPreviewActiveOnRoute(route))
const isAiAssistantFeatureEnabled = computed(() =>
  isAiAssistantEnabled((runtimeConfig.public as AiAssistantPublicConfig).aiAssistant)
)
const hotKeywords = computed(() => [
  t('de7d1d34.6e4493'),
  t('de7d1d34.9f351b'),
  t('de7d1d34.5f3ca6'),
  t('de7d1d34.abc55f'),
  t('de7d1d34.3fdf19'),
  t('de7d1d34.247d42'),
  t('de7d1d34.89d075'),
])
const aiAssistantTitle = computed(() => t('b4039f35.354274'))
const aiAssistantDescription = computed(() => t('b4039f35.4aaf06'))

function handleSearch(keyword: string) {
  if (keyword.trim()) {
    showSearchDrawer.value = false
    router.push({
      path: '/collections/all',
      query: { keyword },
    })
  }
}

function handleCategorySearch(keyword: string) {
  if (keyword.trim()) {
    showCategoryNav.value = false
    router.push({
      path: '/search',
      query: { q: keyword },
    })
  }
}

function handleChangeRegion() {}
</script>
