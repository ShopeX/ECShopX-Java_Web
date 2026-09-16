<template>
  <div>
    <WCHeroBanner v-if="heroItems.length > 0" :items="heroItems" />

    <main class="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
      <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-popular-section">
        <div class="text-center mb-[64px]">
          <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">
            {{ t('4b13a2cf.1f79ba') }}
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

      <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-new-arrival-section">
        <div class="text-center mb-[64px]">
          <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">
            {{ t('4b13a2cf.5f3ca6') }}
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          <BCProductCard
            v-for="product in newArrivals"
            :key="product.itemId"
            :product="product"
            mode="new"
            @add-to-cart="onAddToCart"
          />
        </div>
      </section>

      <section
        class="relative w-full h-[400px] bg-gray-100 mb-20 overflow-hidden"
        data-testid="home-brand-news-section"
      >
        <img
          src="https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/6a972ef93ca7d853d4560ed4e42a0ed1adaa8806.png"
          class="w-full h-full object-cover"
          data-testid="home-brand-news-image"
        />
        <div
          class="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-center p-8"
        >
          <p
            class="text-white text-lg max-w-2xl font-light italic leading-relaxed"
            data-testid="home-brand-news-quote"
          >
            {{ t('4b13a2cf.03d9d4') }}
          </p>
          <ECButton
            variant="dark"
            class="mt-8 !bg-white !text-black hover:!bg-gray-100 !rounded-full"
            data-testid="home-brand-news-btn"
          >
            {{ t('4b13a2cf.26b2db') }}
          </ECButton>
        </div>
      </section>

      <section class="py-[96px] px-[64px] lg:px-[128px]" data-testid="home-brand-news-section">
        <div class="text-center mb-[64px]">
          <h2 class="text-[24px] font-normal text-[#191A1D] tracking-[-0.48px]">
            {{ t('4b13a2cf.e67f1e') }}
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          <BCNewsCard v-for="item in brandNews" :key="item.id" :item="item" />
        </div>
      </section>
    </main>

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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WCHeroBanner from '~/components/WCHeroBanner/WCHeroBanner.vue'
import BCProductCard from '~/components/BCProductCard/BCProductCard.vue'
import ECButton from '~/components/ECButton/ECButton.vue'
import BCNewsCard from '~/components/BCNewsCard/BCNewsCard.vue'
import type { IProduct } from '~/components/BCProductCard/types'

const props = defineProps<{
  pageConfig: any
  products: ReadonlyArray<IProduct>
  pending: boolean
}>()

const { t } = useI18n()

const heroItems = computed(() => {
  const config = props.pageConfig?.widgets?.find((w: any) => w.type === 'carousel')
  if (config?.data?.items) {
    return config.data.items.map((item: any) => ({
      image: item.image,
      title: item.title || t('4b13a2cf.e70b44'),
      subtitle: item.subtitle || t('4b13a2cf.600a8b'),
      link: item.link || '#',
    }))
  }

  return [
    {
      image:
        'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/07d7a49559899303b9bea14f2adabd0f3123a12e.png',
      title: t('4b13a2cf.e70b44'),
      subtitle: t('4b13a2cf.10a884'),
      link: '/product/1',
    },
  ]
})

const brandNews = computed(() => [
  {
    id: 1,
    title: t('4b13a2cf.fd991f'),
    summary: t('4b13a2cf.c1cd38'),
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/07d7a49559899303b9bea14f2adabd0f3123a12e.png',
  },
  {
    id: 2,
    title: t('4b13a2cf.fd991f'),
    summary: t('4b13a2cf.c1cd38'),
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/499903fe1e08c926b9231a740b55d96768d41d0f.png',
  },
  {
    id: 3,
    title: t('4b13a2cf.fd991f'),
    summary: t('4b13a2cf.c1cd38'),
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/ddb47e30da9c615963fd4aa5722a61a678e08f5e.png',
  },
  {
    id: 4,
    title: t('4b13a2cf.fd991f'),
    summary: t('4b13a2cf.c1cd38'),
    image:
      'https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/assets/4a239fb9fcf5109253fd99820cdc96bdb98f7229.png',
  },
])

const popularProducts = computed(() => props.products.slice(0, 4))
const newArrivals = computed(() => props.products.slice(4, 12))

function onAddToCart(product: IProduct) {
  console.log('Add to cart:', product)
}
</script>
