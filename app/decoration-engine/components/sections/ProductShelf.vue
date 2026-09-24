<template>
  <section
    class="mx-auto w-full max-w-[1440px] px-6 py-14 md:px-12"
    data-section-type="product-shelf"
    @click.capture="handlePreviewCapture"
  >
    <h2 v-if="settings.title" class="mb-4 text-center text-lg font-semibold text-[#191A1D]">
      {{ settings.title }}
    </h2>

    <div
      v-if="showPlaceholder"
      class="flex min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center text-sm text-neutral-500"
    >
      {{ placeholderText }}
    </div>

    <div v-else-if="products.length" class="grid gap-6" :class="gridClass">
      <BCProductCard
        v-for="product in products"
        :key="product.itemId"
        :product="product"
        :show-price="settings.showPrice"
        :show-add-cart="settings.showAddCart"
      />
    </div>

    <div
      v-else-if="pending"
      class="flex min-h-[200px] items-center justify-center text-sm text-neutral-500"
    >
      Loading...
    </div>
  </section>
</template>

<script setup lang="ts">
import BCProductCard from '~/components/BCProductCard/BCProductCard.vue'
import type { IProduct } from '~/components/BCProductCard/types'
import type {
  DecorationHighlightedBlock,
  DecorationSection,
} from '~/decoration-engine/types/decoration'
import { itemApiClient } from '~/infrastructure/http/clients/ItemApiClient'
import { ProductTransformer } from '~/infrastructure/transformers/productTransformer'
import { getApiCountryCodeByLocale } from '~/shared/localeConfig'
import { resolveSectionSettings } from '~/decoration-engine/utils/resolveSettings'

interface ProductShelfSettings {
  title: string
  displayMode: 'category' | 'manual'
  categoryId: string
  itemIds: string[]
  columns: 2 | 3 | 4
  limit: number
  showPrice: boolean
  showAddCart: boolean
}

const props = defineProps<{
  section: DecorationSection
  sectionId: string
  isPreview?: boolean
  highlightedBlock?: DecorationHighlightedBlock | null
}>()
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const { locale, t } = useI18n()
const countryCode = computed(() => getApiCountryCodeByLocale(locale.value))

const settings = computed<ProductShelfSettings>(() => {
  const raw = resolveSectionSettings('product-shelf', props.section.settings)
  const rawColumns = Number(raw.columns ?? 4)
  const rawLimit = Number(raw.limit ?? 8)
  const rawItemIds = Array.isArray(raw.itemIds) ? raw.itemIds : []

  return {
    title: String(raw.title || ''),
    displayMode: raw.displayMode === 'manual' ? 'manual' : 'category',
    categoryId: String(raw.categoryId || ''),
    itemIds: rawItemIds.map((itemId) => String(itemId)).filter(Boolean),
    columns: rawColumns === 2 || rawColumns === 3 ? rawColumns : 4,
    limit: Number.isFinite(rawLimit) ? Math.min(20, Math.max(1, rawLimit)) : 8,
    showPrice: raw.showPrice !== false,
    showAddCart: raw.showAddCart !== false,
  }
})

const queryKey = computed(() =>
  settings.value.displayMode === 'category'
    ? `category-${settings.value.categoryId}-${settings.value.limit}`
    : `manual-${settings.value.itemIds.slice(0, settings.value.limit).join(',')}`
)

const showPlaceholder = computed(() => {
  if (settings.value.displayMode === 'category') {
    return !settings.value.categoryId
  }

  return settings.value.itemIds.length === 0
})

const placeholderText = computed(() =>
  settings.value.displayMode === 'category' ? t('c40a02ee.8bb820') : t('c40a02ee.c5c5f2')
)

const gridClass = computed(() => {
  if (settings.value.columns === 2) {
    return 'grid-cols-1 md:grid-cols-2'
  }

  if (settings.value.columns === 3) {
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
})

const { data: productsData, pending } = await useAsyncData(
  () => `decoration-product-shelf-${countryCode.value}-${queryKey.value}`,
  async (): Promise<IProduct[]> => {
    if (showPlaceholder.value) {
      return []
    }

    try {
      if (settings.value.displayMode === 'category') {
        const response = await itemApiClient.getItemList({
          page: '1',
          pageSize: String(settings.value.limit),
          item_type: 'normal',
          main_category: settings.value.categoryId,
          is_tdk: '0',
          type: 'all',
        })

        return ProductTransformer.toModelList(response?.list || []).slice(0, settings.value.limit)
      }

      const detailItems = await Promise.all(
        settings.value.itemIds.slice(0, settings.value.limit).map((itemId) =>
          itemApiClient
            .getItemDetail({ id: itemId })
            .then((item) => (ProductTransformer.validateProduct(item) ? item : null))
            .catch(() => null)
        )
      )

      return detailItems
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((item) => ProductTransformer.toModel(item))
    } catch {
      return []
    }
  },
  {
    default: () => [],
    watch: [queryKey, countryCode],
    server: !props.isPreview,
  }
)

const products = computed(() => productsData.value || [])

const handlePreviewCapture = (event: MouseEvent) => {
  if (!props.isPreview) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  emit('click', event)
}
</script>
