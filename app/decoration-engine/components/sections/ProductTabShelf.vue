<template>
  <section
    :class="sectionOuterClasses"
    :style="sectionThemeStyle"
    data-section-type="product-tab-shelf"
  >
    <div :class="sectionInnerClasses">
      <div v-if="settings.title || settings.intro" :class="headingClasses">
        <h2 v-if="settings.title" :class="titleClasses">
          {{ settings.title }}
        </h2>
        <div v-if="settings.intro" :class="introClasses" v-html="settings.intro" />
      </div>

      <DecorationBlockHost
        v-if="activeTab"
        :section-id="sectionId"
        :block-id="activeTab.id"
        root-class="decoration-product-tab-block min-h-[120px]"
      >
        <div class="mb-6 flex flex-wrap justify-center gap-2 md:mb-[32px] md:gap-[12px]">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :class="[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors md:px-5',
              activeTabId === tab.id
                ? 'bg-[var(--section-active-background)] text-[var(--section-active-foreground)]'
                : 'bg-[var(--section-soft-background)] text-[var(--section-muted-foreground)] hover:opacity-85',
            ]"
            @click="handleTabClick($event, tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div
          v-if="showPlaceholder"
          class="grid grid-cols-2 md:grid-cols-[repeat(var(--product-tab-columns),minmax(0,1fr))]"
          :style="gridStyle"
        >
          <BCProductCard
            v-for="product in placeholderProducts"
            :key="product.itemId"
            :product="product"
            mode="popular"
            :show-price="settings.showPrice"
            :show-add-cart="settings.showAddCart"
            disable-appear-animation
          />
        </div>

        <div v-else-if="displayedProducts.length" class="relative">
          <div
            class="grid grid-cols-2 transition-opacity duration-200 md:grid-cols-[repeat(var(--product-tab-columns),minmax(0,1fr))]"
            :class="pending ? 'opacity-70' : 'opacity-100'"
            :style="gridStyle"
          >
            <BCProductCard
              v-for="product in displayedProducts"
              :key="product.itemId"
              :product="product"
              mode="popular"
              :show-price="settings.showPrice"
              :show-add-cart="settings.showAddCart"
              disable-appear-animation
            />
          </div>
        </div>

        <div v-else-if="pending" class="min-h-[200px]" :style="gridStyle" />

        <div v-else class="min-h-[200px]" />
      </DecorationBlockHost>
    </div>
  </section>
</template>

<script setup lang="ts">
import BCProductCard from '~/components/BCProductCard/BCProductCard.vue'
import type { IProduct } from '~/components/BCProductCard/types'
import type { DecorationSection } from '~/decoration-engine/types/decoration'
import { useDecorationEditOptional } from '~/decoration-engine/composables/useDecorationEditContext'
import { useDecorationPreview } from '~/decoration-engine/composables/useDecorationPreview'
import { itemApiClient } from '~/infrastructure/http/clients/ItemApiClient'
import { ProductTransformer } from '~/infrastructure/transformers/productTransformer'
import { getApiCountryCodeByLocale } from '~/shared/localeConfig'
import {
  resolveSectionColorScheme,
  resolveSectionPaddingClass,
} from '~/decoration-engine/utils/sectionAppearance'
import {
  resolveBlockSettings,
  resolveSectionSettings,
} from '~/decoration-engine/utils/resolveSettings'

interface ProductTabShelfSettings {
  title: string
  intro: string
  size: ProductTabShelfSize
  alignment: 'left' | 'center' | 'right'
  columns: 1 | 2 | 3 | 4 | 5 | 6
  spacing: 'none' | 'small' | 'medium' | 'large'
  fullWidth: boolean
  showPrice: boolean
  showAddCart: boolean
  paddingTop: 'none' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl'
  paddingBottom: 'none' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl'
}

interface ProductTabItem {
  id: string
  label: string
  productIds: string[]
  size: ProductTabShelfSize
  columns: 1 | 2 | 3 | 4 | 5 | 6
  limit: number
}

type ProductTabShelfSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'

const PRODUCT_TAB_SHELF_SIZES: ProductTabShelfSize[] = [
  'xsmall',
  'small',
  'medium',
  'large',
  'xlarge',
]

const props = defineProps<{
  section: DecorationSection
  sectionId: string
  isPreview?: boolean
}>()

const { focusBlock } = useDecorationPreview()
const editCtx = useDecorationEditOptional()
const { locale, t } = useI18n()
const countryCode = computed(() => getApiCountryCodeByLocale(locale.value))
const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

function translateIfGeneratedKey(value: string) {
  return generatedKeyPattern.test(value) ? t(value) : value
}
const isDecorationPreview = computed(() => Boolean(props.isPreview))

function sortProductsByTabOrder(products: IProduct[], productIds: string[]) {
  const productOrderMap = new Map(products.map((product) => [String(product.itemId), product]))
  return productIds
    .map((itemId) => productOrderMap.get(String(itemId)))
    .filter((product): product is IProduct => Boolean(product))
}

const settings = computed<ProductTabShelfSettings>(() => {
  const raw = resolveSectionSettings('product-tab-shelf', props.section.settings)
  const rawColumns = Number(raw.columns ?? 4)
  const paddingTop = ['none', 'xxs', 'xs', 's', 'm', 'l', 'xl'].includes(String(raw.padding_top))
    ? String(raw.padding_top)
    : 'm'
  const paddingBottom = ['none', 'xxs', 'xs', 's', 'm', 'l', 'xl'].includes(
    String(raw.padding_bottom)
  )
    ? String(raw.padding_bottom)
    : 'm'
  const size = normalizeSize(raw.size)
  const alignment = ['left', 'center', 'right'].includes(String(raw.alignment))
    ? String(raw.alignment)
    : 'center'
  const spacing = ['none', 'small', 'medium', 'large'].includes(String(raw.spacing))
    ? String(raw.spacing)
    : 'medium'

  return {
    title: translateIfGeneratedKey(String(raw.title || '')),
    intro: translateIfGeneratedKey(String(raw.intro || '')),
    size,
    alignment: alignment as ProductTabShelfSettings['alignment'],
    columns: normalizeColumns(rawColumns),
    spacing: spacing as ProductTabShelfSettings['spacing'],
    fullWidth: raw.full_width === true,
    showPrice: raw.show_price !== false,
    showAddCart: raw.show_add_cart !== false,
    paddingTop: paddingTop as ProductTabShelfSettings['paddingTop'],
    paddingBottom: paddingBottom as ProductTabShelfSettings['paddingBottom'],
  }
})

const blockOrder = computed(() => {
  const order = Array.isArray(props.section.block_order)
    ? props.section.block_order
    : Array.isArray((props.section as any).blockOrder)
      ? (props.section as any).blockOrder
      : []

  return order.map((id: unknown) => String(id)).filter(Boolean)
})

const tabs = computed<ProductTabItem[]>(() =>
  blockOrder.value
    .map((blockId: string, index: number) => {
      const block = props.section.blocks?.[blockId]
      if (!block || block.disabled || block.type !== 'product-tab') return null

      const blockSettings = resolveBlockSettings(block.type, block.settings)
      const rawProductIds = Array.isArray(blockSettings.product_ids)
        ? blockSettings.product_ids
        : []
      const rawLimit = Number(blockSettings.limit ?? 8)
      const rawSize =
        blockSettings.size_override === true
          ? String(blockSettings.size || '')
          : settings.value.size
      const rawColumns = Number(blockSettings.columns ?? settings.value.columns)

      return {
        id: blockId,
        label: translateIfGeneratedKey(String(blockSettings.tab_label || `Tab ${index + 1}`)),
        productIds: rawProductIds.map((id) => String(id)).filter(Boolean),
        size: normalizeSize(rawSize, settings.value.size),
        columns: normalizeColumns(rawColumns),
        limit: Number.isFinite(rawLimit) ? Math.min(24, Math.max(2, rawLimit)) : 8,
      }
    })
    .filter((tab: ProductTabItem | null): tab is ProductTabItem => Boolean(tab))
)

const activeTabId = ref('')

watchEffect(() => {
  const tabIds = tabs.value.map((tab) => tab.id)
  if (!tabIds.length) return

  const highlightedBlock = editCtx ? unref(editCtx.highlightedBlock) : undefined
  if (
    highlightedBlock?.sectionId === props.sectionId &&
    highlightedBlock.blockId &&
    tabIds.includes(highlightedBlock.blockId)
  ) {
    activeTabId.value = highlightedBlock.blockId
    return
  }

  if (!tabIds.includes(activeTabId.value)) {
    activeTabId.value = tabIds[0] || ''
  }
})

const activeTab = computed(
  () => tabs.value.find((tab) => tab.id === activeTabId.value) || tabs.value[0]
)

const activeSize = computed(() => activeTab.value?.size || settings.value.size)

const activeColumns = computed(() => activeTab.value?.columns || settings.value.columns)

const displayedProducts = ref<IProduct[]>([])

const queryKey = computed(() => {
  const tab = activeTab.value
  if (!tab) return `${props.sectionId}-empty`
  return `${props.sectionId}-${tab.id}-${tab.productIds.slice(0, tab.limit).join(',')}`
})

const showPlaceholder = computed(() => !activeTab.value || activeTab.value.productIds.length === 0)

const placeholderProducts = computed<IProduct[]>(() => {
  if (!isDecorationPreview.value) return []
  const limit = activeTab.value?.limit || 8
  return Array.from({ length: Math.min(8, Math.max(2, limit)) }, (_, index) => ({
    itemId: `decoration-placeholder-${index + 1}`,
    itemName: t('1e2ff869.d40a0d'),
    img: placeholderProductImage,
    imgs: [placeholderProductImage],
    price: 2000,
    activityPrice: 0,
    marketPrice: 0,
    memberPrice: 0,
    sales: 0,
  }))
})

const placeholderProductImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="#F0F0F0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#D3D3D3" font-family="Arial, sans-serif" font-size="64" font-weight="600">ECX</text></svg>'
  )

async function loadProductsForTab(tab: ProductTabItem): Promise<IProduct[]> {
  const productIds = tab.productIds.slice(0, tab.limit)
  if (!productIds.length) return []

  const batchItems = await itemApiClient.getItemsBatch(productIds)
  const normalizedBatchItems = Array.isArray(batchItems)
    ? batchItems
    : Array.isArray(batchItems?.data)
      ? batchItems.data
      : []
  const validBatchItems = ProductTransformer.validateProductList(normalizedBatchItems)

  return sortProductsByTabOrder(ProductTransformer.toModelList(validBatchItems), productIds)
}

const { data: productsData, pending } = await useAsyncData(
  () => `product-tab-shelf-${countryCode.value}-${queryKey.value}`,
  async (): Promise<IProduct[]> => {
    const tab = activeTab.value
    if (!tab || !tab.productIds.length) return []

    try {
      return await loadProductsForTab(tab)
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

watch(
  products,
  (nextProducts) => {
    displayedProducts.value = nextProducts
  },
  { immediate: true }
)

const sectionOuterClasses = computed(() => [
  'w-full',
  resolveSectionPaddingClass(settings.value.paddingTop, 'top'),
  resolveSectionPaddingClass(settings.value.paddingBottom, 'bottom'),
  'bg-[var(--section-background)] text-[var(--section-foreground)]',
])
const sectionInnerClasses = computed(() => [
  settings.value.fullWidth
    ? 'w-full max-w-none px-4 md:px-[48px] lg:px-[64px]'
    : 'mx-auto max-w-[1440px] px-4 md:px-[64px] lg:px-[128px]',
])
const sectionThemeStyle = computed(() => {
  const raw = resolveSectionSettings('product-tab-shelf', props.section.settings)
  const scheme = resolveSectionColorScheme(raw.color_scheme)
  return {
    '--section-background': scheme.background,
    '--section-foreground': scheme.foreground,
    '--section-muted-foreground': scheme.mutedForeground,
    '--section-soft-background': scheme.softBackground,
    '--section-active-background': scheme.activeBackground,
    '--section-active-foreground': scheme.activeForeground,
  }
})

const headingClasses = computed(() => [
  'mb-8 md:mb-[64px]',
  settings.value.alignment === 'center' && 'text-center',
  settings.value.alignment === 'right' && 'text-right',
  settings.value.alignment === 'left' && 'text-left',
])

const titleClasses = computed(() => [
  'font-normal tracking-[-0.48px] text-[var(--section-foreground)]',
  sizeTextClass.value,
])

const introClasses = computed(() => [
  'mt-4 text-[var(--section-muted-foreground)]',
  sizeTextClass.value,
])

const sizeTextClass = computed(() => {
  if (activeSize.value === 'xsmall') return 'text-sm'
  if (activeSize.value === 'small') return 'text-base'
  if (activeSize.value === 'medium') return 'text-xl'
  if (activeSize.value === 'large') return 'text-2xl'
  return 'text-3xl'
})

const gridGap = computed(() => {
  if (settings.value.spacing === 'none') return '0px'
  if (settings.value.spacing === 'small') return '12px'
  if (settings.value.spacing === 'large') return '20px'
  return '16px'
})

const gridStyle = computed(() => ({
  '--product-tab-columns': activeColumns.value,
  gap: gridGap.value,
}))

function normalizeColumns(value: number): ProductTabShelfSettings['columns'] {
  if ([1, 2, 3, 4, 5, 6].includes(value)) return value as ProductTabShelfSettings['columns']
  return 4
}

function normalizeSize(
  value: unknown,
  fallback: ProductTabShelfSize = 'medium'
): ProductTabShelfSize {
  const nextValue = String(value || '')
  return PRODUCT_TAB_SHELF_SIZES.includes(nextValue as ProductTabShelfSize)
    ? (nextValue as ProductTabShelfSize)
    : fallback
}

function handleTabClick(event: MouseEvent, tabId: string) {
  activeTabId.value = tabId
  if (!isDecorationPreview.value) return

  event.preventDefault()
  event.stopPropagation()
  focusBlock(props.sectionId, tabId)
}
</script>
