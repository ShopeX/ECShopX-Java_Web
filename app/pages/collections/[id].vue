<template>
  <DefaultLayout
    :header-decoration-dsl="layoutHeaderDecorationDsl"
    :footer-decoration-dsl="layoutFooterDecorationDsl"
    :decoration-preview-session-key="DECORATION_PAGE_TYPE"
    :highlighted-block="highlightedBlock"
  >
    <div class="min-h-screen bg-white" data-testid="collections-page">
      <DecorationRenderer
        :dsl="productListRenderDsl"
        :preview-session-key="DECORATION_PAGE_TYPE"
        :highlighted-block="highlightedBlock"
        data-testid="collections-decoration-renderer-page"
      >
        <template #product_list>
          <div data-testid="collections-native-product-list">
            <!-- BBC 店铺 Header（仅在携带 shopid 参数时展示） -->
            <BCShopHeader
              v-if="shopId"
              :distributor-id="shopId"
              :logo="shopInfo.logo"
              :name="shopInfo.name"
              :tagline="shopInfo.tagline"
              :categories="shopInfo.categories"
              :followed="shopInfo.followed"
              @follow="onShopFollow"
              @contact="onShopContact"
            />

            <!-- 页面标题 - 移动端优化 -->
            <!-- <div class="bg-white">
              <div class="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <h1 class="text-xl sm:text-2xl font-bold text-gray-900">全部商品</h1>
                <p class="mt-1 text-sm text-gray-600">发现您喜欢的商品</p>
              </div>
            </div> -->

            <!-- 筛选器 -->
            <BCProductFilter
              v-model="productFilterValue"
              :filter-groups="filterGroups"
              :show-filter-panel="showFilterPanel"
              data-testid="collections-filter"
              @update:show-filter-panel="showFilterPanel = $event"
              @change="handleFilterChange"
            />

            <!-- 主内容区域 - 响应式容器 -->
            <!-- 商品展示区域 -->
            <div class="bg-white pb-8 flex justify-center">
              <div class="w-full">
                <!-- 加载状态 -->
                <div
                  v-if="(!hasInitialLoadCompleted || pending) && !products.length"
                  class="grid grid-cols-2 xl:grid xl:grid-cols-4 2xl:grid-cols-5"
                  data-testid="collections-loading"
                >
                  <div
                    v-for="index in productSkeletonCount"
                    :key="`collections-skeleton-${index}`"
                    class="group"
                  >
                    <USkeleton class="aspect-square w-full" />
                    <div class="flex flex-col items-center gap-3 bg-[#f6f6f6] px-6 py-8">
                      <USkeleton class="h-4 w-4/5" />
                      <USkeleton class="h-4 w-3/5" />
                      <USkeleton class="h-4 w-16" />
                    </div>
                  </div>
                </div>

                <!-- 错误状态 -->
                <div v-else-if="error" class="text-center py-12" data-testid="collections-error">
                  <div class="text-gray-500 mb-4">
                    <svg
                      class="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">
                    {{ t('c52ec334.866b79') }}
                  </h3>
                  <p class="text-gray-600 mb-4">{{ error.message || t('c52ec334.f70894') }}</p>
                  <UButton @click="refresh()">{{ t('c52ec334.64ca9b') }}</UButton>
                </div>

                <!-- 空状态 -->
                <div
                  v-else-if="hasInitialLoadCompleted && !products.length && !pending"
                  class="text-center py-12"
                  data-testid="collections-empty"
                >
                  <div class="text-gray-400 mb-4">
                    <svg
                      class="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">
                    {{ t('c52ec334.e3a720') }}
                  </h3>
                  <p class="text-gray-600">{{ t('c52ec334.cbcf4f') }}</p>
                </div>

                <!-- 商品展示 -->
                <div v-else>
                  <!-- 商品网格布局 - 固定宽度居中布局 -->
                  <div
                    class="grid grid-cols-2 xl:grid xl:grid-cols-4 2xl:grid-cols-5"
                    data-testid="collections-product-grid"
                  >
                    <BCProductCard
                      v-for="product in products"
                      :key="product.itemId"
                      :product="product"
                      :data-testid="`collections-product-card-${product.itemId}`"
                      loading="lazy"
                    />
                  </div>

                  <!-- 加载更多触发器（滚动到此处自动加载） -->
                  <div
                    v-if="hasMore"
                    ref="loadMoreTrigger"
                    class="text-center pt-8 pb-4"
                    data-testid="collections-load-more-trigger"
                  >
                    <div
                      v-if="loadingMore"
                      class="flex items-center justify-center gap-2"
                      data-testid="collections-loading-more"
                    >
                      <div
                        class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"
                      ></div>
                      <span class="text-gray-500 text-sm">{{ t('c52ec334.26b5bd') }}</span>
                    </div>
                  </div>

                  <!-- 到底了提示 -->
                  <div
                    v-else-if="products.length > 0"
                    class="text-center pt-8 pb-4"
                    data-testid="collections-end-message"
                  >
                    <p class="text-gray-400 text-sm">{{ t('c52ec334.942d1f') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </DecorationRenderer>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted } from 'vue'
import BCProductFilter from '~/components/BCProductFilter/BCProductFilter.vue'
import BCProductCard from '~/components/BCProductCard/BCProductCard.vue'
import BCShopHeader from '~/components/BCShopHeader/BCShopHeader.vue'
import DecorationRenderer from '~/decoration-engine/components/DecorationRenderer.vue'
import DefaultLayout from '~/layouts/default.vue'
import type { IProduct } from '~/components/BCProductCard/types'
import type { IBrand, IItemListParams } from '~/types/api/item'
import type { ICategory } from '~/components/BCItemFilter/BCItemFilter.vue'
import type { IProductFilterValue, IFilterGroup } from '~/components/BCProductFilter/types'
import { ESortOption } from '~/components/BCProductFilter/types'
import { itemApiClient } from '~/infrastructure/http/clients/ItemApiClient'
import { ProductTransformer } from '~/infrastructure/transformers/productTransformer'
import { resolveItemListCategoryParams } from '~/utils/resolveItemListCategoryParams'
import { useDebounceFn, useIntersectionObserver } from '@vueuse/core'
import { useDecorationPreview } from '~/decoration-engine/composables/useDecorationPreview'
import { useDecorationPageDslFetch } from '~/decoration-engine/composables/useDecorationPageDslFetch'
import { useDecorationRouteContext } from '~/decoration-engine/composables/useDecorationRouteContext'
import { useHomeDecorationSplit } from '~/decoration-engine/composables/useHomeDecorationSplit'
import type { DecorationDSL } from '~/decoration-engine/types/decoration'

const DECORATION_PAGE_TYPE = 'product_list' as const satisfies DecorationDSL['pageType']
const PRODUCT_LIST_NATIVE_SECTION_ID = 'product_list'
const PRODUCT_LIST_NATIVE_SECTION_TYPE = 'native-product-list'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { isPreview } = useDecorationRouteContext()
const {
  dsl: previewDsl,
  pageDsl: previewPageDsl,
  headerDsl: previewHeaderDsl,
  footerDsl: previewFooterDsl,
  globalDsl: previewGlobalDsl,
  highlightedBlock,
} = useDecorationPreview(DECORATION_PAGE_TYPE)

const { ssrDsl } = await useDecorationPageDslFetch({
  pageType: DECORATION_PAGE_TYPE,
})

const { headerRenderDsl, footerRenderDsl, pageRenderDsl } = useHomeDecorationSplit({
  ssrDsl,
  previewDsl,
  previewPageDsl,
  previewHeaderDsl,
  previewFooterDsl,
  previewGlobalDsl,
})

function createProductListNativeSection(): DecorationDSL['sections'][string] {
  return {
    type: PRODUCT_LIST_NATIVE_SECTION_TYPE,
    title: t('c52ec334.437974'),
    disabled: false,
    settings: {
      locked: true,
    },
    blocks: {},
    block_order: [],
  }
}

function ensureProductListNativeSection(source: DecorationDSL | null | undefined): DecorationDSL {
  const fallback: DecorationDSL = {
    pageType: DECORATION_PAGE_TYPE,
    pageId: DECORATION_PAGE_TYPE,
    sections: {
      [PRODUCT_LIST_NATIVE_SECTION_ID]: createProductListNativeSection(),
    },
    order: [PRODUCT_LIST_NATIVE_SECTION_ID],
  }
  if (!source?.sections || !Array.isArray(source.order)) {
    return fallback
  }

  const sections = {
    ...source.sections,
    [PRODUCT_LIST_NATIVE_SECTION_ID]:
      source.sections[PRODUCT_LIST_NATIVE_SECTION_ID] || createProductListNativeSection(),
  }
  const order = source.order.includes(PRODUCT_LIST_NATIVE_SECTION_ID)
    ? source.order.slice()
    : [...source.order, PRODUCT_LIST_NATIVE_SECTION_ID]

  return {
    ...source,
    pageType: DECORATION_PAGE_TYPE,
    pageId: source.pageId || DECORATION_PAGE_TYPE,
    sections,
    order,
  }
}

const productListRenderDsl = computed(() => ensureProductListNativeSection(pageRenderDsl.value))
const layoutHeaderDecorationDsl = computed(() => (isPreview.value ? headerRenderDsl.value : null))
const layoutFooterDecorationDsl = computed(() => (isPreview.value ? footerRenderDsl.value : null))

const mainCategory = computed(() => {
  const routeId = route.params.id
  return Array.isArray(routeId) ? String(routeId[0] || '') : String(routeId || '')
})

function resolveRouteCategoryId() {
  const slug = mainCategory.value
  const legacyCategory = route.query.category ? String(route.query.category) : ''
  if (slug && slug !== 'all') return slug
  return legacyCategory
}

// query.link_type 来自导航菜单：category=管理分类，sale_category=销售分类
function resolveRouteLinkType() {
  if (route.query.link_type) return String(route.query.link_type)
  if (route.query.category) return 'category'
  return 'sale_category'
}

// 启用页面缓存
definePageMeta({
  keepalive: true,
  layout: false,
})

// SEO 元数据配置
useSeoMeta({
  title: () => t('c52ec334.833a3d'),
  description: () => t('c52ec334.bb6714'),
  keywords: () => 'ECSHOPX,products,e-commerce,shopping,brand filter,price filter',
  author: 'ECSHOPX',
  robots: 'index,follow',
  ogTitle: () => t('c52ec334.833a3d'),
  ogDescription: () => t('c52ec334.bb6714'),
  ogType: 'website',
  ogUrl: 'https://ecshopx.com/item/list',
  ogImage: '/images/og-product-list.jpg',
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('c52ec334.833a3d'),
  twitterDescription: () => t('c52ec334.bdeb79'),
  twitterImage: '/images/twitter-product-list.jpg',
})

// 分类列表状态
const categories = computed<ICategory[]>(() => [
  { id: '1', name: t('c52ec334.1873ea') },
  { id: '2', name: t('c52ec334.2565d0') },
  { id: '3', name: t('c52ec334.909250') },
  { id: '4', name: t('c52ec334.760805') },
  { id: '5', name: t('c52ec334.c566ca') },
  { id: '6', name: t('c52ec334.464add') },
  { id: '7', name: t('c52ec334.e7e7de') },
  { id: '8', name: t('c52ec334.97aabd') },
  { id: '9', name: t('c52ec334.0c34e3') },
  { id: '10', name: t('c52ec334.b5134f') },
])

// 品牌列表状态
const brands = ref<IBrand[]>([])

// 原筛选参数状态 (保留用于 API 调用)
const filterParams = ref({
  linkType: undefined as string | undefined,
  categoryId: undefined as string | number | undefined,
  brandId: '',
  sort: 'default',
  startPrice: undefined as number | undefined,
  endPrice: undefined as number | undefined,
  keyword: '', // 搜索关键词
})

// ProductFilter 组件筛选值
const productFilterValue = ref<IProductFilterValue>({
  category: undefined,
  series: [],
  colors: [],
  materials: [],
  sizes: [],
  priceRange: undefined,
  sort: ESortOption.DEFAULT,
})

// 控制筛选面板显示
const showFilterPanel = ref(false)

// 首屏客户端加载完成标记
const hasInitialLoadCompleted = ref(false)

// 滚动加载触发器
const loadMoreTrigger = ref<HTMLElement | null>(null)

const productSkeletonCount = 10

// ProductFilter 筛选组配置
const filterGroups = computed<IFilterGroup[]>(() => [
  {
    key: 'category',
    label: t('c52ec334.d0771a'),
    multiple: false,
    options: categories.value.map((cat) => ({
      id: cat.id,
      label: cat.name,
      value: cat.id,
    })),
  },
  {
    key: 'series',
    label: t('c52ec334.966e7c'),
    multiple: true,
    options: [
      { id: '1', label: t('c52ec334.a6f127'), value: '1' },
      { id: '2', label: t('c52ec334.0f8115'), value: '2' },
      { id: '3', label: t('c52ec334.2e1317'), value: '3' },
    ],
  },
  {
    key: 'colors',
    label: t('c52ec334.6b36c6'),
    multiple: true,
    options: [
      { id: '1', label: t('c52ec334.9d2d1f'), value: 'black' },
      { id: '2', label: t('c52ec334.2fc96b'), value: 'white' },
      { id: '3', label: t('c52ec334.fca97e'), value: 'gray' },
      { id: '4', label: t('c52ec334.3ef2c0'), value: 'brown' },
    ],
  },
  {
    key: 'materials',
    label: t('c52ec334.e36233'),
    multiple: true,
    options: [
      { id: '1', label: t('c52ec334.f7a056'), value: 'leather' },
      { id: '2', label: t('c52ec334.0a3866'), value: 'canvas' },
      { id: '3', label: t('c52ec334.7c79fb'), value: 'nylon' },
    ],
  },
  {
    key: 'sizes',
    label: t('c52ec334.c8339f'),
    multiple: true,
    options: [
      { id: '1', label: t('c52ec334.85533e'), value: 'S' },
      { id: '2', label: t('c52ec334.b36ce9'), value: 'M' },
      { id: '3', label: t('c52ec334.996841'), value: 'L' },
    ],
  },
  {
    key: 'priceRange',
    label: t('c52ec334.8d8376'),
    multiple: false,
    options: [
      { id: '1', label: t('c52ec334.99e15d'), value: '0-500' },
      { id: '2', label: t('c52ec334.3eaff3'), value: '500-1000' },
      { id: '3', label: t('c52ec334.12b5b6'), value: '1000-3000' },
      { id: '4', label: t('c52ec334.db4ffd'), value: '3000-5000' },
      { id: '5', label: t('c52ec334.811623'), value: '5000-10000' },
      { id: '6', label: t('c52ec334.3c3d08'), value: '10000-' },
    ],
  },
])

// 监听 ProductFilter 变化，同步到 filterParams
watch(
  productFilterValue,
  (newValue) => {
    filterParams.value.categoryId = newValue.category
    filterParams.value.sort = newValue.sort || 'default'

    // 处理价格区间
    if (newValue.priceRange) {
      const priceRange = newValue.priceRange.toString()
      const [start, end] = priceRange.split('-')
      filterParams.value.startPrice = start ? Number(start) : undefined
      filterParams.value.endPrice = end ? Number(end) : undefined
    } else {
      filterParams.value.startPrice = undefined
      filterParams.value.endPrice = undefined
    }
  },
  { deep: true }
)

// 按 link_type 映射列表接口参数：管理分类 main_category / 销售分类 category_id
const buildApiParams = (
  page: number,
  pageSize: number,
  sourceFilters: typeof filterParams.value = filterParams.value
): IItemListParams => {
  const categoryParams = resolveItemListCategoryParams(
    resolveRouteCategoryId(),
    sourceFilters.linkType || resolveRouteLinkType()
  )

  return {
    page: page.toString(),
    pageSize: pageSize.toString(),
    item_type: 'normal',
    is_tdk: '1',
    type: '0',
    company_id: '1',
    ...categoryParams,
    ...(sourceFilters.brandId && { brand_id: sourceFilters.brandId }),
    ...(sourceFilters.sort !== 'default' && { sort: sourceFilters.sort }),
    ...(sourceFilters.startPrice && { start_price: sourceFilters.startPrice }),
    ...(sourceFilters.endPrice && { end_price: sourceFilters.endPrice }),
    ...(sourceFilters.keyword && { keywords: sourceFilters.keyword }),
  }
}

// 使用分页 Composable
const {
  items: products,
  pagination,
  pending,
  error,
  loadingMore,
  hasMore,
  loadMore,
  refresh,
  loadPage,
} = usePagination<IProduct>({
  pageSize: 20,
  fetchFn: async (page, pageSize) => {
    const params = buildApiParams(page, pageSize)
    const data = await itemApiClient.getItemList(params)

    // 更新品牌列表（如果有）
    if (data?.brand_list?.list) {
      brands.value = data.brand_list.list
    }

    if (data?.list) {
      const productList = ProductTransformer.toModelList(data.list)
      return {
        items: productList,
        total: data.total_count || 0,
      }
    }

    return {
      items: [],
      total: 0,
    }
  },
})

// 动态更新页面标题（基于筛选条件）
const dynamicTitle = computed(() => {
  let title = t('c52ec334.437974')

  if (filterParams.value.categoryId) {
    const category = categories.value.find((c) => c.id === filterParams.value.categoryId)
    if (category) {
      title = category.name
    }
  }

  if (filterParams.value.brandId) {
    const brand = brands.value.find((b) => b.attribute_id === filterParams.value.brandId)
    if (brand) {
      title += ` - ${brand.attribute_name}`
    }
  }

  if (filterParams.value.startPrice || filterParams.value.endPrice) {
    const priceRange = []
    if (filterParams.value.startPrice) {
      priceRange.push(`${filterParams.value.startPrice}${t('c52ec334.317763')}`)
    }
    if (filterParams.value.endPrice) {
      priceRange.push(`${filterParams.value.endPrice}${t('c52ec334.c19ea9')}`)
    }
    if (priceRange.length > 0) {
      title += ` - ${priceRange.join('')}`
    }
  }

  return `${title} - ECSHOPX`
})

// 监听筛选条件变化，更新SEO标题
watch(
  () => [
    filterParams.value.categoryId,
    filterParams.value.brandId,
    filterParams.value.startPrice,
    filterParams.value.endPrice,
  ],
  () => {
    useSeoMeta({
      title: dynamicTitle.value,
    })
  },
  { deep: true }
)

// BBC 店铺上下文：有 shopid query 参数时展示店铺 Header
const shopId = computed(() => route.query.shopid as string | undefined)

// 避免重复请求的标志
const isInternalUrlUpdate = ref(false)

// 处理筛选变化（防抖函数）
const debouncedFilterChange = useDebounceFn(() => {
  isInternalUrlUpdate.value = true
  updateUrlParams()
  refresh()
}, 300)

// 处理筛选变化
const handleFilterChange = () => {
  // 使用防抖处理筛选变化，避免频繁请求
  debouncedFilterChange()
}

// 更新 URL 参数
const updateUrlParams = () => {
  const query: Record<string, string> = {}

  if (filterParams.value.linkType) {
    query.link_type = filterParams.value.linkType
  }

  if (filterParams.value.categoryId) {
    query.category = filterParams.value.categoryId.toString()
  }

  if (filterParams.value.brandId) {
    query.brand = filterParams.value.brandId.toString()
  }

  if (filterParams.value.sort !== 'default') {
    query.sort = filterParams.value.sort
  }

  if (filterParams.value.startPrice) {
    query.min_price = filterParams.value.startPrice.toString()
  }

  if (filterParams.value.endPrice) {
    query.max_price = filterParams.value.endPrice.toString()
  }

  if (filterParams.value.keyword) {
    query.keyword = filterParams.value.keyword
  }

  router.replace({ query })
}

// 从 URL 恢复筛选状态
const restoreFromUrl = () => {
  const query = route.query

  filterParams.value.linkType = query.link_type ? String(query.link_type) : undefined
  filterParams.value.categoryId = query.category ? String(query.category) : undefined

  if (query.brand) {
    filterParams.value.brandId = query.brand as string
  } else {
    filterParams.value.brandId = ''
  }

  if (query.sort) {
    filterParams.value.sort = query.sort as string
  } else {
    filterParams.value.sort = 'default'
  }

  if (query.min_price) {
    filterParams.value.startPrice = Number(query.min_price)
  } else {
    filterParams.value.startPrice = undefined
  }

  if (query.max_price) {
    filterParams.value.endPrice = Number(query.max_price)
  } else {
    filterParams.value.endPrice = undefined
  }

  if (query.keyword) {
    filterParams.value.keyword = query.keyword as string
  } else {
    filterParams.value.keyword = ''
  }
}

restoreFromUrl()

// 初始化数据和无限滚动
onMounted(async () => {
  // 设置无限滚动
  if (loadMoreTrigger.value) {
    useIntersectionObserver(
      loadMoreTrigger,
      (entries) => {
        const entry = entries[0]
        // 当触发器进入视口且还有更多数据且未在加载中时，自动加载
        if (entry?.isIntersecting && hasMore.value && !loadingMore.value && !pending.value) {
          loadMore()
        }
      },
      {
        rootMargin: '100px', // 提前100px开始加载
      }
    )
  }

  try {
    restoreFromUrl()
    await loadPage(1)
  } finally {
    hasInitialLoadCompleted.value = true
  }

  // 模拟品牌数据（实际应该从 API 获取）
  if (brands.value.length === 0) {
    brands.value = [
      {
        attribute_id: '1',
        attribute_name: 'Apple',
        company_id: '1',
        shop_id: '1',
        attribute_type: 'brand',
        attribute_memo: '',
        attribute_sort: '1',
        distributor_id: '1',
        is_show: '1',
        is_image: '0',
        image_url: '',
        created: Date.now(),
        updated: Date.now(),
        attribute_code: null,
        attribute_show: null,
      },
      {
        attribute_id: '2',
        attribute_name: 'Samsung',
        company_id: '1',
        shop_id: '1',
        attribute_type: 'brand',
        attribute_memo: '',
        attribute_sort: '2',
        distributor_id: '1',
        is_show: '1',
        is_image: '0',
        image_url: '',
        created: Date.now(),
        updated: Date.now(),
        attribute_code: null,
        attribute_show: null,
      },
      {
        attribute_id: '3',
        attribute_name: 'Huawei',
        company_id: '1',
        shop_id: '1',
        attribute_type: 'brand',
        attribute_memo: '',
        attribute_sort: '3',
        distributor_id: '1',
        is_show: '1',
        is_image: '0',
        image_url: '',
        created: Date.now(),
        updated: Date.now(),
        attribute_code: null,
        attribute_show: null,
      },
      {
        attribute_id: '4',
        attribute_name: 'Xiaomi',
        company_id: '1',
        shop_id: '1',
        attribute_type: 'brand',
        attribute_memo: '',
        attribute_sort: '4',
        distributor_id: '1',
        is_show: '1',
        is_image: '0',
        image_url: '',
        created: Date.now(),
        updated: Date.now(),
        attribute_code: null,
        attribute_show: null,
      },
    ]
  }
})

// keepalive 下从其他分类页切回时重新拉取
onActivated(async () => {
  if (!hasInitialLoadCompleted.value) return

  restoreFromUrl()
  await refresh()
})

// 监听路由变化（销售分类 id 与管理分类 query 均需响应）
watch(
  () => [route.params.id, route.query] as const,
  async (_, oldRoute) => {
    if (!oldRoute) return

    // 如果是内部更新URL，跳过处理避免重复请求
    if (isInternalUrlUpdate.value) {
      isInternalUrlUpdate.value = false
      return
    }

    restoreFromUrl()
    await refresh()
  },
  { deep: true }
)

// 语言切换时，主动刷新商品数据（country_code 由 HTTP 插件按 locale 自动注入）
watch(
  () => locale.value,
  (newLocale, oldLocale) => {
    if (!oldLocale || newLocale === oldLocale) return
    refresh()
  }
)

// BBC 店铺信息（mock，后续对接 API）
const shopInfo = computed(() => ({
  logo: 'https://www.figma.com/api/mcp/asset/efb28441-c97e-49ad-b4ff-9c178ed5ac6e',
  name: t('c52ec334.7fa745'),
  tagline: t('c52ec334.ab4097'),
  categories: [
    t('c52ec334.01b6f8'),
    t('c52ec334.999fea'),
    t('c52ec334.e85597'),
    t('c52ec334.1873ea'),
  ],
  followed: false,
}))

function onShopFollow(isFollowed: boolean) {
  console.log('[collections] shop follow toggled:', isFollowed)
}

function onShopContact() {
  console.log('[collections] contact customer service')
}
</script>
