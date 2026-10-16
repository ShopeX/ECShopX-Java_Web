<template>
  <NuxtLayout name="default">
    <div class="min-h-screen bg-white">
      <!-- BBC Store Header -->
      <BCShopHeader
        :distributor-id="distributorId"
        :logo="shopInfo.logo"
        :name="shopInfo.name"
        :tagline="shopInfo.tagline"
        :categories="shopInfo.categories"
        :followed="shopInfo.followed"
        @follow="onFollow"
        @contact="onContact"
      />

      <!-- 1. Hero Banner Section -->
      <WCHeroBanner v-if="heroItems.length > 0" :items="heroItems" />

      <!-- 2. Main Content -->
      <main class="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        <!-- 热门商品 -->
        <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-popular-section">
          <div class="text-center mb-[64px]">
            <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">
              {{ t('85ce459a.1f79ba') }}
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            <BCProductCard
              v-for="product in popularProducts"
              :key="product.itemId"
              :product="product"
              mode="popular"
            />
          </div>
        </section>

        <!-- 新品推荐 -->
        <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-new-arrival-section">
          <div class="text-center mb-[64px]">
            <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">
              {{ t('85ce459a.5f3ca6') }}
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            <BCProductCard
              v-for="product in newArrivals"
              :key="product.itemId"
              :product="product"
              mode="new"
            />
          </div>
        </section>

        <!-- 品牌资讯 -->
        <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-brand-news-section">
          <div class="text-center mb-[64px]">
            <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">
              {{ t('85ce459a.e67f1e') }}
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            <BCNewsCard v-for="item in brandNews" :key="item.id" :item="item" />
          </div>
        </section>
      </main>

      <!-- Loading State -->
      <div
        v-if="pending"
        data-testid="home-loading"
        class="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div
          class="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import WCHeroBanner from '~/components/WCHeroBanner/WCHeroBanner.vue'
import BCProductCard from '~/components/BCProductCard/BCProductCard.vue'
import BCNewsCard from '~/components/BCNewsCard/BCNewsCard.vue'
import BCShopHeader from '~/components/BCShopHeader/BCShopHeader.vue'
import { useHomeData } from '~/composables/useHomeData'

const route = useRoute()
const { t } = useI18n()
const distributorId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

// Read search keyword from URL query param
const keywords = computed(() => route.query.q as string | undefined)

const { products, pending, fetchHomeData } = useHomeData(distributorId, keywords.value)

definePageMeta({
  layout: false,
})

// Mock store info — replace with API data when available
const shopInfo = computed(() => ({
  logo: 'https://www.figma.com/api/mcp/asset/efb28441-c97e-49ad-b4ff-9c178ed5ac6e',
  name: t('85ce459a.7fa745'),
  tagline: t('85ce459a.ab4097'),
  categories: [
    t('85ce459a.01b6f8'),
    t('85ce459a.999fea'),
    t('85ce459a.e85597'),
    t('85ce459a.1873ea'),
  ],
  followed: false,
}))

const heroItems = computed(() => [
  {
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/07d7a49559899303b9bea14f2adabd0f3123a12e.png',
    title: t('85ce459a.e70b44'),
    subtitle: t('85ce459a.600a8b'),
    link: '#',
  },
])

const brandNews = computed(() => [
  {
    id: 1,
    title: t('85ce459a.fd991f'),
    summary: t('85ce459a.c1cd38'),
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/07d7a49559899303b9bea14f2adabd0f3123a12e.png',
  },
  {
    id: 2,
    title: t('85ce459a.fd991f'),
    summary: t('85ce459a.c1cd38'),
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/499903fe1e08c926b9231a740b55d96768d41d0f.png',
  },
  {
    id: 3,
    title: t('85ce459a.fd991f'),
    summary: t('85ce459a.c1cd38'),
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/ddb47e30da9c615963fd4aa5722a61a678e08f5e.png',
  },
  {
    id: 4,
    title: t('85ce459a.fd991f'),
    summary: t('85ce459a.c1cd38'),
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/4a239fb9fcf5109253fd99820cdc96bdb98f7229.png',
  },
])

const popularProducts = computed(() => products.value.slice(0, 4))
const newArrivals = computed(() => products.value.slice(4, 12))

// Watch for q query param changes and re-fetch
watch(
  () => route.query.q,
  async (newQ) => {
    if (newQ !== undefined) {
      await fetchHomeData()
    }
  }
)

onMounted(() => {
  fetchHomeData()
})

function onFollow(isFollowed: boolean) {
  // TODO: call follow/unfollow API with distributorId
  console.log('[shop] follow toggled:', isFollowed)
}

function onContact() {
  // TODO: open customer service chat
  console.log('[shop] contact customer service')
}
</script>
