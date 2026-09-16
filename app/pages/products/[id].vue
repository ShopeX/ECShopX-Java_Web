<template>
  <div class="bg-white">
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

    <!-- 加载状态 -->
    <div v-if="detailLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div
          class="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gray-600">{{ $t('464b6330.26b5bd') }}</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="detailError" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-red-600 mb-4">{{ detailError }}</p>
        <button
          class="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
          @click="$router.back()"
        >
          {{ $t('464b6330.5f4112') }}
        </button>
      </div>
    </div>

    <!-- 商品详情内容 -->
    <div
      v-else-if="rawProductData"
      class="flex flex-col lg:flex-row items-start w-full bg-white lg:px-24"
    >
      <!-- Left Column: Thumbnail Navigation (PC Only) -->
      <div class="hidden lg:flex flex-col gap-4 items-center px-8 py-0 shrink-0">
        <!-- Up Arrow -->
        <button
          class="flex items-center justify-center shrink-0 transition-opacity"
          :class="canScrollUp ? 'opacity-100' : 'opacity-30 cursor-not-allowed'"
          :disabled="!canScrollUp"
          @click="scrollThumbnails('up')"
        >
          <UIcon name="i-heroicons-chevron-up" class="w-6 h-6 text-gray-900" />
        </button>

        <!-- Thumbnail List (最多显示5个) -->
        <div class="flex flex-col gap-4 overflow-hidden">
          <button
            v-for="(image, index) in visibleThumbnails"
            :key="thumbnailStartIndex + index"
            class="w-[100px] h-[100px] flex items-center justify-center overflow-hidden transition-opacity"
            :class="
              currentImageIndex === thumbnailStartIndex + index ? 'opacity-100' : 'opacity-50'
            "
            @click="selectImage(thumbnailStartIndex + index)"
          >
            <img :src="image" alt="Thumbnail" class="w-full h-full object-cover" />
          </button>
        </div>

        <!-- Down Arrow -->
        <button
          class="flex items-center justify-center shrink-0 transition-opacity"
          :class="canScrollDown ? 'opacity-100' : 'opacity-30 cursor-not-allowed'"
          :disabled="!canScrollDown"
          @click="scrollThumbnails('down')"
        >
          <UIcon name="i-heroicons-chevron-down" class="w-6 h-6 text-gray-900" />
        </button>
      </div>

      <!-- Middle Column: Main Image Display -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <!-- 当前选中的大图（带过渡动画） -->
        <div
          class="w-full aspect-square relative overflow-hidden bg-gray-100"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <TransitionGroup :name="imageTransitionName">
            <div
              v-if="product.images[currentImageIndex]"
              :key="currentImageIndex"
              class="w-full h-full absolute inset-0"
            >
              <img
                :src="product.images[currentImageIndex]"
                :alt="`Product Image ${currentImageIndex + 1}`"
                class="w-full h-full object-cover"
              />
            </div>
          </TransitionGroup>

          <!-- 移动端图片指示点 -->
          <div
            class="lg:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10"
          >
            <div
              v-for="(image, index) in product.images"
              :key="index"
              class="w-2 h-2 rounded-full transition-colors"
              :class="currentImageIndex === index ? 'bg-[#191a1d]' : 'bg-[#99a1af]'"
            />
          </div>
        </div>

        <!-- 移动端左右滑动按钮 -->
        <div
          class="lg:hidden absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none"
        >
          <button
            v-if="canScrollUp"
            class="pointer-events-auto w-8 h-8 flex items-center justify-center bg-white/80 rounded-full shadow-md"
            @click="scrollThumbnails('up')"
          >
            <UIcon name="i-heroicons-chevron-left" class="w-5 h-5 text-gray-900" />
          </button>
          <div v-else class="w-8"></div>
          <button
            v-if="canScrollDown"
            class="pointer-events-auto w-8 h-8 flex items-center justify-center bg-white/80 rounded-full shadow-md"
            @click="scrollThumbnails('down')"
          >
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-900" />
          </button>
          <div v-else class="w-8"></div>
        </div>
      </div>

      <!-- Right Column: Product Details -->
      <div
        class="flex-1 flex items-center justify-center bg-white lg:sticky lg:top-[88px] min-w-0 w-full"
      >
        <div
          class="w-full lg:max-w-[504px] flex flex-col gap-6 lg:gap-8 px-4 lg:px-16 py-6 lg:py-12"
        >
          <!-- Title and Price -->
          <div class="flex items-start justify-between w-full gap-4">
          <div class="flex flex-col gap-2 flex-1 min-w-0">
              <BCProductMarketingTags :tags="product.marketingTags" placement="inline" />
              <h1
                class="text-xl lg:text-2xl font-normal text-[#191a1d] leading-[1.2] tracking-[-0.48px]"
              >
                {{ product.title }}
              </h1>
              <BCProductPrice
                :sale-price-cents="currentSalePriceCents"
                :market-price-cents="currentMarketPriceCents"
                :member-price-cents="currentMemberPriceCents"
                size="lg"
              />
            </div>
            <button class="w-6 h-6 shrink-0" :aria-pressed="isFavorite" @click="toggleFavorite">
              <UIcon
                :name="favoriteIconName"
                class="w-6 h-6"
                :class="isFavorite ? 'text-[#e11d48]' : 'text-gray-900'"
              />
            </button>
          </div>

          <!-- 规格与数量 -->
          <div class="flex w-full flex-col lg:max-w-[376px]">
            <div v-if="product.specs.length > 0" class="flex flex-col gap-4">
              <template v-for="(spec, specIndex) in product.specs" :key="spec.spec_name">
                <div class="flex flex-col gap-4 lg:gap-6">
                  <h3 class="text-sm font-normal leading-5 text-[#4a5565]">{{ spec.spec_name }}</h3>

                  <!-- 如果有规格图片，显示图片样式选择器 -->
                  <div
                    v-if="spec.spec_values.some((v) => v.spec_image_url)"
                    class="flex flex-wrap gap-2"
                  >
                    <button
                      v-for="specValue in spec.spec_values"
                      :key="specValue.spec_value_id"
                      class="h-20 w-20 overflow-hidden border transition-all"
                      :class="
                        isSpecValueSelected(spec.spec_name, specValue.spec_value_id)
                          ? 'border-[#191a1d]'
                          : 'border-transparent'
                      "
                      @click="selectSpecValue(spec.spec_name, specValue.spec_value_id)"
                    >
                      <img
                        v-if="specValue.spec_image_url"
                        :src="specValue.spec_image_url"
                        :alt="specValue.spec_value_name"
                        class="h-full w-full object-contain"
                      />
                    </button>
                  </div>

                  <!-- 如果没有规格图片，显示文字选择器 -->
                  <div v-else class="grid grid-cols-2 border-l border-t border-[#e5e7eb]">
                    <button
                      v-for="specValue in spec.spec_values"
                      :key="specValue.spec_value_id"
                      class="flex h-[38.4px] items-center justify-center border-b border-r border-[#e5e7eb] px-3 text-sm leading-5 tracking-[-0.1504px] text-[#191a1d] transition-all lg:px-4"
                      :class="
                        isSpecValueSelected(spec.spec_name, specValue.spec_value_id)
                          ? 'relative z-[1] bg-[#e5e7eb] ring-1 ring-inset ring-[#0f0f10]'
                          : ''
                      "
                      @click="selectSpecValue(spec.spec_name, specValue.spec_value_id)"
                    >
                      {{ specValue.spec_custom_value_name || specValue.spec_value_name }}
                    </button>
                  </div>
                </div>

                <!-- 分隔线（最后一个规格不显示） -->
                <div v-if="specIndex < product.specs.length - 1" class="h-px w-full" />
              </template>
            </div>

            <!-- 数量选择器：Figma 4003:5246；起订量逻辑对齐 mobile sp-sku-select -->
            <div class="flex w-full items-center gap-6 self-stretch py-6">
              <p
                class="min-w-0 flex-1 font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#4a5565]"
              >
                <span class="leading-5">{{ t('ee3264ed.0bf60b') }}</span>
                <span
                  v-if="showStartNum"
                  class="text-xs font-normal leading-4 text-[#8f99aa]"
                >
                  {{ t('2043bbcc.989408', { count: quantityMin }) }}
                </span>
              </p>
              <QuantityStepper
                class="shrink-0"
                full-width
                :quantity="quantity"
                :min="quantityMin"
                :max="quantityMax"
                :loading="isAddingToCart"
                @decrease="decreaseQuantity"
                @increase="increaseQuantity"
              />
            </div>
          </div>

          <!-- Action Buttons - PC端内嵌 -->
          <div class="hidden w-full flex-col gap-4 lg:flex lg:max-w-[376px]">
            <button
              class="w-full px-0 py-4 text-sm font-medium leading-5 text-white bg-[#0f0f10] hover:bg-[#2a2a2a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="isAddingToCart"
              @click="addToCart"
            >
              <UIcon
                v-if="isAddingToCart"
                name="i-heroicons-arrow-path"
                class="w-5 h-5 animate-spin"
              />
              {{ isAddingToCart ? $t('464b6330.49ac5f') : $t('464b6330.fb4e7c') }}
            </button>
            <button
              class="w-full px-0 py-4 text-sm font-medium leading-5 text-[#191a1d] bg-white border border-[#0f0f10] hover:bg-gray-50 transition-colors"
              @click="buyNow"
            >
              {{ $t('464b6330.5fd2f9') }}
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- 商品描述 / 图文详情区 (PC & H5 响应式) -->
    <div class="w-full bg-white px-4 lg:px-32 py-6 lg:py-12">
      <div class="border-t border-white w-full">
        <div class="flex flex-col">
          <!-- Product Details Accordion -->
          <div class="border-b border-[#e5e7eb]">
            <button
              class="w-full flex items-center justify-between py-4 text-sm lg:text-base font-normal lg:font-medium leading-5 lg:leading-6 text-[#364153]"
              @click="toggleAccordion('details')"
            >
              <span>{{ $t('464b6330.b4f5db') }}</span>
              <UIcon
                name="i-heroicons-chevron-down"
                class="w-4 h-4 lg:w-6 lg:h-6 transition-transform"
                :class="openAccordion === 'details' ? 'rotate-180' : ''"
              />
            </button>
            <div v-if="openAccordion === 'details'" class="pb-4 lg:pb-12">
              <div
                class="product-description text-sm lg:text-base leading-5 lg:leading-6 text-[#364153]"
                v-html="product.description"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐商品区域 -->
    <BCProductRecommendations
      v-if="recommendationsVisible"
      :recommended-products="recommendedProducts"
      :show-recent-tab="false"
      :adding-product-id="recommendationAddingId"
      show-add-to-cart
      @add-to-cart="handleRecommendationAdd"
    />

    <!-- 移动端底部操作栏 (sticky) -->
    <div
      class="lg:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-4 py-4 flex items-center gap-6 z-50 shadow-lg"
    >
      <p class="text-base font-medium leading-5 text-[#191a1d] shrink-0">
        {{ formatDisplayFromFen(currentFinalPriceCents) }}
      </p>

      <!-- 按钮组 -->
      <div class="flex-1 flex gap-4">
        <button
          class="flex-1 px-0 py-4 text-sm font-medium leading-5 text-white bg-[#0f0f10] hover:bg-[#2a2a2a] active:bg-[#000] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          :disabled="isAddingToCart"
          @click="addToCart"
        >
          <UIcon v-if="isAddingToCart" name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
          {{ isAddingToCart ? $t('464b6330.49ac5f') : $t('464b6330.fb4e7c') }}
        </button>
        <button
          class="flex-1 px-0 py-4 text-sm font-medium leading-5 text-[#191a1d] bg-white border border-[#0f0f10] hover:bg-gray-50 active:bg-gray-100 transition-colors"
          @click="buyNow"
        >
          {{ $t('464b6330.5fd2f9') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BCProductRecommendations from '~/components/BCProductRecommendations/BCProductRecommendations.vue'
import { useRecommendationAddToCart } from '~/composables/useRecommendationAddToCart'
import BCProductPrice from '~/components/BCProductPrice/BCProductPrice.vue'
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'
import BCShopHeader from '~/components/BCShopHeader/BCShopHeader.vue'
import QuantityStepper from '~/components/BCMiniCartItem/QuantityStepper.vue'
import { collectApiClient } from '~/infrastructure/http/clients/CollectApiClient'
import type { IItem } from '~/types/api/item'
import { logger } from '~/utils/log'
import { resolveItemDescription } from '~/utils/productDescription'
import { mapPromotionTags } from '~/utils/promotionTags'
import { resolveDistributorId } from '~/utils/resolveDistributorId'
import { findMatchedSpecItem } from '~/utils/productSku'
import { resolveRecommendationMainItemId } from '~/utils/normalizeRecommendationItemIds'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// BBC 店铺上下文：有 shopid query 参数时展示店铺 Header
const shopId = computed(() => route.query.shopid as string | undefined)
const localePath = useLocalePath()
const id = String((route.params as { id: string }).id || '')
const toast = useToastMessage()

// 使用 useProduct composable（符合架构规范：UI → Composable → API Client）
const { loadProductWithSSR } = useProduct()

// SSR 支持：通过 Composable 的 loadProductWithSSR 方法获取数据
const {
  data: rawProductData,
  pending: detailLoading,
  error: fetchError,
} = await loadProductWithSSR({ id })

// 错误处理
const detailError = computed(() => {
  if (fetchError.value) {
    return t('464b6330.dc2359')
  }
  if (!rawProductData.value && !detailLoading.value) {
    return t('464b6330.997875')
  }
  return null
})

// 规格值类型定义
interface ISpecValue {
  spec_value_id: number
  spec_value_name: string
  spec_custom_value_name?: string
  spec_image_url?: string
}

// 规格类型定义
interface ISpec {
  spec_name: string
  spec_values: ISpecValue[]
}

// 状态管理
const quantity = ref(1)
const openAccordion = ref<string | null>('details')
const currentImageIndex = ref(0) // 当前显示的大图索引
const thumbnailStartIndex = ref(0) // 缩略图开始显示的索引
const imageTransitionName = ref<'slide-left' | 'slide-right'>('slide-right') // 图片切换动画方向
const isAddingToCart = ref(false) // 加入购物车 loading 状态
const isFavorite = ref(false)

// 触摸滑动支持
const touchStartX = ref(0)
const touchEndX = ref(0)

// 缩略图配置
const MAX_VISIBLE_THUMBNAILS = 5

// 选中的规格：key 是规格名称，value 是规格值 ID
const selectedSpecs = ref<Record<string, number>>({})

const cartUI = useCartUIStore()
const { requireAuth, isLoggedIn } = useAuthGuard()
const { addToCart: addToCartAction } = useCart()

const favoriteIconName = computed(() => {
  return isFavorite.value ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'
})

// 计算可见的缩略图（最多5个）
const visibleThumbnails = computed(() => {
  const images = product.value.images
  return images.slice(thumbnailStartIndex.value, thumbnailStartIndex.value + MAX_VISIBLE_THUMBNAILS)
})

// 是否可以向上滚动（是否还有上一张图片）
const canScrollUp = computed(() => {
  return currentImageIndex.value > 0
})

// 是否可以向下滚动（是否还有下一张图片）
const canScrollDown = computed(() => {
  return currentImageIndex.value < product.value.images.length - 1
})

// 计算属性：适配页面展示的商品数据
const product = computed(() => {
  if (!rawProductData.value) {
    return {
      title: '',
      price: 0,
      description: '',
      images: [],
      specs: [] as ISpec[],
      marketingTags: [],
    }
  }

  const data = rawProductData.value

  // 处理规格信息
  let specs: ISpec[] = []

  // 解析规格数据（如果有）
  if (data.item_spec_desc) {
    try {
      const specDesc =
        typeof data.item_spec_desc === 'string'
          ? JSON.parse(data.item_spec_desc)
          : data.item_spec_desc

      // 将对象格式转换为数组格式
      // 从 { "颜色": { spec_name: "颜色", spec_values: [...] } }
      // 转换为 [{ spec_name: "颜色", spec_values: [...] }]
      if (specDesc && typeof specDesc === 'object') {
        specs = Object.values(specDesc).filter((spec: any) => spec && spec.spec_values) as ISpec[]
      }
    } catch (e) {
      console.error('解析规格描述失败:', e)
    }
  }

  return {
    title: data.itemName,
    price: data.price / 100, // 转换为元
    description: resolveItemDescription(data, t('464b6330.415547')),
    images: data.pics || [],
    specs,
    marketingTags: mapPromotionTags(data),
  }
})

// 初始化选中的规格（选择每个规格的第一个值）
watch(
  () => product.value.specs,
  (specs) => {
    if (specs.length > 0 && Object.keys(selectedSpecs.value).length === 0) {
      const initialSpecs: Record<string, number> = {}
      specs.forEach((spec) => {
        const firstValue = spec.spec_values?.[0]
        if (firstValue && firstValue.spec_value_id) {
          initialSpecs[spec.spec_name] = firstValue.spec_value_id
        }
      })
      selectedSpecs.value = initialSpecs
    }
  },
  { immediate: true }
)

// 检查某个规格值是否被选中
const isSpecValueSelected = (specName: string, specValueId: number) => {
  return selectedSpecs.value[specName] === specValueId
}

// 选择规格值
const selectSpecValue = (specName: string, specValueId: number) => {
  selectedSpecs.value[specName] = specValueId
}

const syncFavoriteStatus = async () => {
  if (!isLoggedIn.value) {
    isFavorite.value = false
    return
  }

  try {
    const response = await collectApiClient.getCollectItemList()
    const currentData = response?.data ?? response ?? {}
    const currentList = Array.isArray(currentData.list) ? currentData.list : []
    isFavorite.value = currentList.some((item: any) => {
      const currentItemId = String(
        item.id ?? item.item_id ?? item.goods_id ?? item.collect_id ?? ''
      )
      return currentItemId === id
    })
  } catch (error) {
    logger.warn('[product-detail] sync favorite status failed', error)
    isFavorite.value = false
  }
}

const toggleFavorite = async () => {
  // 使用 requireAuth 包装需要登录的操作
  await requireAuth(
    async () => {
      if (isFavorite.value) {
        await collectApiClient.removeCollectItems([id])
        toast.show(t('464b6330.b46077'))
      } else {
        await collectApiClient.addCollectItem(id)
        toast.show(t('464b6330.9e9a9a'))
      }
      isFavorite.value = !isFavorite.value
    },
    {
      loginMessage: t('464b6330.39bf36'),
      redirectAfterLogin: true,
    }
  )
}

const toggleAccordion = (key: string) => {
  openAccordion.value = openAccordion.value === key ? null : key
}

// 滚动缩略图列表并切换图片
const scrollThumbnails = (direction: 'up' | 'down') => {
  const totalImages = product.value.images.length

  if (direction === 'up' && currentImageIndex.value > 0) {
    // 向上：选中上一张图片，新图片从左边滑入
    imageTransitionName.value = 'slide-left'
    currentImageIndex.value--

    // 如果当前图片在可见范围之外，滚动缩略图列表
    if (currentImageIndex.value < thumbnailStartIndex.value) {
      thumbnailStartIndex.value = currentImageIndex.value
    }
  } else if (direction === 'down' && currentImageIndex.value < totalImages - 1) {
    // 向下：选中下一张图片，新图片从右边滑入
    imageTransitionName.value = 'slide-right'
    currentImageIndex.value++

    // 如果当前图片在可见范围之外，滚动缩略图列表
    if (currentImageIndex.value >= thumbnailStartIndex.value + MAX_VISIBLE_THUMBNAILS) {
      thumbnailStartIndex.value = currentImageIndex.value - MAX_VISIBLE_THUMBNAILS + 1
    }
  }
}

// 选择图片（点击缩略图）
const selectImage = (imageIndex: number) => {
  // 根据点击的位置决定动画方向
  if (imageIndex > currentImageIndex.value) {
    imageTransitionName.value = 'slide-right' // 点击下方的图，从右边滑入
  } else if (imageIndex < currentImageIndex.value) {
    imageTransitionName.value = 'slide-left' // 点击上方的图，从左边滑入
  }
  currentImageIndex.value = imageIndex
}

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  if (e.touches[0]) {
    touchStartX.value = e.touches[0].clientX
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches[0]) {
    touchEndX.value = e.touches[0].clientX
  }
}

const handleTouchEnd = () => {
  const swipeThreshold = 50 // 最小滑动距离
  const diff = touchStartX.value - touchEndX.value

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // 向左滑动，显示下一张
      scrollThumbnails('down')
    } else {
      // 向右滑动，显示上一张
      scrollThumbnails('up')
    }
  }

  // 重置触摸坐标
  touchStartX.value = 0
  touchEndX.value = 0
}

// 计算当前选中的规格 ID（用于加购）
const currentSpecIdString = computed(() => {
  if (product.value.specs.length === 0) {
    return 'default'
  }

  // 按照规格顺序拼接规格值 ID，如 "1-2-3"
  const specValueIds = product.value.specs
    .map((spec) => selectedSpecs.value[spec.spec_name])
    .filter((id) => id !== undefined)

  return specValueIds.length > 0 ? specValueIds.join('-') : 'default'
})

// 根据选中的规格，计算真实的 item_id（如果是多规格商品，则是 SKU ID）
const realItemId = computed(() => {
  if (!rawProductData.value) return ''

  const data = rawProductData.value as any

  // 如果是无规格商品，直接返回商品 item_id
  if (data.nospec === 1 || !data.spec_items || data.spec_items.length === 0) {
    return String(data.item_id)
  }

  // 如果是有规格商品，查找匹配的 spec_item
  const matchedSpecItem = findMatchedSpecItem(
    data.spec_items,
    currentSpecIdString.value
  )

  // 返回匹配的 SKU item_id，如果没有匹配则回退到主商品 ID
  return matchedSpecItem ? String(matchedSpecItem.item_id) : String(data.item_id)
})

// 计算当前库存
const currentStock = computed(() => {
  if (!rawProductData.value) return 0

  const data = rawProductData.value as any

  if (data.nospec === 1 || !data.spec_items || data.spec_items.length === 0) {
    return data.store || 0
  }

  const matchedSpecItem = findMatchedSpecItem(
    data.spec_items,
    currentSpecIdString.value
  )

  return matchedSpecItem ? matchedSpecItem.store : data.store || 0
})

/** 商品级起订量（>0 才展示与启用下限，对齐 mobile info.startNum） */
const productStartNum = computed(() => {
  const data = rawProductData.value as any
  return Number(data?.start_num) || 0
})

const showStartNum = computed(() => productStartNum.value > 0)

/**
 * 当前可购最小数量：
 * - 无起订量 → 1
 * - 多规格 → 当前 SKU 的 start_num
 * - 单规格 / 未匹配 → 商品 start_num
 */
const quantityMin = computed(() => {
  if (!showStartNum.value || !rawProductData.value) return 1

  const data = rawProductData.value as any

  if (data.nospec !== 1 && data.spec_items?.length > 0) {
    const matchedSpecItem = findMatchedSpecItem(
      data.spec_items,
      currentSpecIdString.value
    )
    if (matchedSpecItem) {
      const skuStart = Number(matchedSpecItem.start_num)
      return skuStart > 0 ? skuStart : productStartNum.value
    }
  }

  return productStartNum.value
})

const quantityMax = computed(() => {
  const stock = currentStock.value
  const max = stock > 0 ? stock : quantityMin.value
  return Math.max(max, quantityMin.value)
})

function decreaseQuantity() {
  if (quantity.value > quantityMin.value) {
    quantity.value -= 1
  }
}

function increaseQuantity() {
  if (quantity.value < quantityMax.value) {
    quantity.value += 1
  }
}

watch(
  quantityMin,
  (min) => {
    if (quantity.value < min) {
      quantity.value = min
    }
  },
  { immediate: true }
)

watch(currentSpecIdString, () => {
  quantity.value = quantityMin.value
})

watch(currentStock, (stock) => {
  if (stock > 0 && quantity.value > stock) {
    quantity.value = Math.max(stock, quantityMin.value)
  }
})

const resolveItemPriceCents = (field: 'price' | 'market_price' | 'member_price') => {
  if (!rawProductData.value) return 0

  const data = rawProductData.value as any

  if (data.nospec === 1 || !data.spec_items || data.spec_items.length === 0) {
    return data[field] || 0
  }

  const matchedSpecItem = findMatchedSpecItem(
    data.spec_items,
    currentSpecIdString.value
  )

  return matchedSpecItem ? matchedSpecItem[field] || 0 : data[field] || 0
}

const currentSalePriceCents = computed(() => resolveItemPriceCents('price'))
const currentMarketPriceCents = computed(() => resolveItemPriceCents('market_price'))
const currentMemberPriceCents = computed(() => resolveItemPriceCents('member_price'))

const { finalPriceCents: currentFinalPriceCents, formatDisplayFromFen } = useProductPriceDisplay({
  salePriceCents: currentSalePriceCents,
  marketPriceCents: currentMarketPriceCents,
  memberPriceCents: currentMemberPriceCents,
})

const addToCart = async () => {
  // 防止重复点击
  if (isAddingToCart.value) return

  // 架构优化:通过 useCart composable 处理业务逻辑
  // UI层 → useCart (Composable) → cartApiClient (Infrastructure) → API
  isAddingToCart.value = true

  try {
    await requireAuth(
      async () => {
        await addToCartAction({
          item_id: realItemId.value,
          num: quantity.value,
          distributor_id: resolveDistributorId((rawProductData.value as any)?.distributor_id),
          cart_type: 'cart',
        })
        // useCart 内部已经处理了:
        // - 业务验证(数量、库存检查)
        // - API 调用
        // - 错误处理
        // - 消息提示(成功/失败)
        // - 自动重新加载购物车数据
      },
      {
        loginMessage: t('464b6330.39bf36'),
        redirectAfterLogin: true,
      }
    )
  } finally {
    isAddingToCart.value = false
  }
}

const buyNow = async () => {
  // 架构优化：通过 useCart composable 处理业务逻辑
  await requireAuth(
    async () => {
      // 手动触发加载指示器，确保用户能看到加载状态
      const loadingIndicator = useLoadingIndicator()
      loadingIndicator.start()

      try {
        const result = await addToCartAction({
          cart_type: 'fastbuy', // 立即购买,
          num: quantity.value,
          distributor_id: resolveDistributorId((rawProductData.value as any)?.distributor_id),
          item_id: realItemId.value,
          shop_type: 'distributor',
        })

        // 立即购买：加入成功后跳转到结算页面
        if (result.success) {
          // 使用 navigateTo 替代 router.push，更好地集成 Nuxt 路由系统
          // navigateTo 会自动触发加载指示器，但我们已经手动启动了，所以会继续显示
          await navigateTo(localePath({ path: '/checkout', query: { mode: 'fastbuy' } }))
        } else {
          // 如果失败，停止加载指示器
          loadingIndicator.finish()
        }
      } catch (error) {
        // 发生错误时，停止加载指示器
        loadingIndicator.finish()
        throw error
      }
    },
    {
      loginMessage: t('464b6330.b60a26'),
      redirectAfterLogin: true,
    }
  )
}

const recommendationDistributorId = computed(() =>
  resolveDistributorId((rawProductData.value as any)?.distributor_id)
)

const recommendationMainItemIds = computed(() => {
  if (!id) return []

  const data = rawProductData.value as any
  return [
    resolveRecommendationMainItemId({
      productId: id,
      goods_id: data?.goods_id,
      default_item_id: data?.default_item_id,
    }),
  ]
})

const { products: recommendedProducts, visible: recommendationsVisible } = useProductRecommendations({
  scene: 'detail',
  mainItemIds: recommendationMainItemIds,
  distributorId: recommendationDistributorId,
  enabled: computed(() => !!id && !detailLoading.value && !!rawProductData.value),
})

const { addingProductId: recommendationAddingId, handleRecommendationAdd } =
  useRecommendationAddToCart({ mode: 'cart' })

onMounted(async () => {
  await syncFavoriteStatus()
})

// BBC 店铺信息（mock，后续对接 API）
const shopInfo = computed(() => ({
  logo: 'https://www.figma.com/api/mcp/asset/efb28441-c97e-49ad-b4ff-9c178ed5ac6e',
  name: t('464b6330.7fa745'),
  tagline: t('464b6330.ab4097'),
  categories: [
    t('464b6330.01b6f8'),
    t('464b6330.999fea'),
    t('464b6330.e85597'),
    t('464b6330.1873ea'),
  ],
  followed: false,
}))

function onShopFollow(isFollowed: boolean) {
  console.log('[product-detail] shop follow toggled:', isFollowed)
}

function onShopContact() {
  console.log('[product-detail] contact customer service')
}
</script>

<style scoped>
/* 向左滑动动画（新图片从左边推入，旧图片被推向右边） */
.slide-left-enter-active {
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 2;
}

.slide-left-leave-active {
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1;
}

.slide-left-enter-from {
  transform: translateX(-100%);
}

.slide-left-enter-to {
  transform: translateX(0);
}

.slide-left-leave-from {
  transform: translateX(0);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

/* 向右滑动动画（新图片从右边推入，旧图片被推向左边） */
.slide-right-enter-active {
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 2;
}

.slide-right-leave-active {
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1;
}

.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-enter-to {
  transform: translateX(0);
}

.slide-right-leave-from {
  transform: translateX(0);
}

.slide-right-leave-to {
  transform: translateX(-100%);
}

/* 商品描述富文本样式 */
.product-description {
  word-wrap: break-word;
}

.product-description :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.product-description :deep(p:last-child) {
  margin-bottom: 0;
}

.product-description :deep(img) {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 0;
  margin: 1.5rem auto;
}

.product-description :deep(ul),
.product-description :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.product-description :deep(li) {
  margin-bottom: 0.5rem;
}

.product-description :deep(h1),
.product-description :deep(h2),
.product-description :deep(h3),
.product-description :deep(h4),
.product-description :deep(h5),
.product-description :deep(h6) {
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.product-description :deep(strong) {
  font-weight: 600;
}

.product-description :deep(a) {
  color: #8253e6;
  text-decoration: underline;
}

.product-description :deep(a:hover) {
  color: #754bcf;
}
</style>
