<template>
  <div
    ref="cardRef"
    class="sp-product-card h-full block group relative"
    :class="{
      'opacity-0 translate-y-4': !disableAppearAnimation,
      'sp-product-card--visible': isVisible || disableAppearAnimation
    }"
  >
    <NuxtLink :to="productLink" class="flex flex-col h-full">
      <!-- 商品图片容器 - 正方形 1:1 -->
      <div class="sp-product-card__image relative overflow-hidden aspect-square w-full">
        <!-- 商品图片 -->
        <img
          :src="product.img || product.imgs?.[0] || '/images/placeholder-product.png'"
          :alt="product.itemName"
          class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          loading="lazy"
          @error="handleImageError"
        />
        <BCProductMarketingTags :tags="product.marketingTags" placement="overlay" />
      </div>

      <!-- 商品信息区域 - 带灰色背景 -->
      <div
        class="sp-product-card__info bg-[#f6f6f6] flex flex-col gap-3 items-center px-6 py-8 w-full text-center grow"
      >
        <!-- 商品标题 -->
        <h2 
          class="sp-product-card__title text-[#191a1d] text-sm font-medium leading-5 w-full"
          :style="{
            '-webkit-line-clamp': titleLines,
            'line-clamp': titleLines,
            'height': `calc(1.25rem * ${titleLines})`
          }"
        >
          {{ product.itemName }}
        </h2>

        <div v-if="showPrice" class="sp-product-card__price w-full flex justify-center">
          <BCProductPrice
            :sale-price-cents="props.product.price"
            :market-price-cents="props.product.marketPrice"
            :member-price-cents="props.product.memberPrice"
            size="sm"
            layout="inline"
          />
        </div>

        <!-- 店铺名称（BBC 模式下展示） -->
        <div
          v-if="isBBC && product.storeName"
          class="sp-product-card__store w-full text-sm font-medium leading-5 text-[#99a1af]"
        >
          {{ product.storeName }}
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { IProduct } from './types'
import BCProductPrice from '../BCProductPrice/BCProductPrice.vue'
import BCProductMarketingTags from '../BCProductMarketingTags/BCProductMarketingTags.vue'
import { useToastMessage } from '~/composables/useToastMessage'
import { useCart } from '~/composables/useCart'
import { useIntersectionObserver } from '@vueuse/core'
import { getBusinessMode } from '~/composables/useTemplate'

interface Props {
  product: IProduct
  /** 商品名称最大行数 */
  titleLines?: number
  showPrice?: boolean
  showAddCart?: boolean
  disableAppearAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  titleLines: 2,
  showPrice: true,
  showAddCart: true,
  disableAppearAnimation: false,
})
const localePath = useLocalePath()
const { t } = useI18n()
const productLink = computed(() => localePath(`/products/${props.product.itemId}` as any))

// BBC 模式判断（NUXT_PUBLIC_BUSINESS_MODE=bbc 时为 BBC 模式）
const isBBC = computed(() => getBusinessMode() === 'bbc')

// 懒加载动画
const cardRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

// 监听元素进入视口
onMounted(() => {
  if (props.disableAppearAnimation) {
    isVisible.value = true
    return
  }
  if (cardRef.value) {
    useIntersectionObserver(
      cardRef,
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          isVisible.value = true
        }
      },
      {
        rootMargin: '50px', // 提前50px开始动画
        threshold: 0.1,
      }
    )
  }
})

// 购物车功能
const { addToCart, isItemLoading } = useCart()

// Toast 消息
const toast = useToastMessage()

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/placeholder-product.png'
}

/**
 * 处理加入购物车
 */
async function handleAddToCart(event: Event) {
  // 阻止链接跳转
  event.preventDefault()
  event.stopPropagation()

  try {
    // 添加到购物车
    await addToCart({
      item_id: props.product.itemId,
      num: 1,
      cart_type: 'cart',
    })
  } catch (error: any) {
    toast.show(error.message || t('94614ea6.2127b3'))
  }
}
</script>

<style scoped>
/* 懒加载动画 */
.sp-product-card {
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
  will-change: opacity, transform;
}

.sp-product-card--visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

/* 组件特定样式 - 基于主题类扩展 */
.sp-product-card__title {
  /* 标题多行省略 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

/* 响应式增强 - 移动端优化 */
@media (max-width: 768px) {
  .sp-product-card {
    /* 移动端优化动画性能 */
    transition:
      opacity 0.4s ease-out,
      transform 0.4s ease-out;
  }

  .sp-product-card:hover img {
    transform: none;
  }
}

/* 加载状态样式 */
.sp-product-card[data-loading='true'] {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.sp-product-card[data-loading='true'] .sp-product-card__image {
  background-color: #e5e7eb;
}

.sp-product-card[data-loading='true'] .sp-product-card__title,
.sp-product-card[data-loading='true'] .sp-product-card__price {
  background-color: #e5e7eb;
  color: transparent;
  border-radius: 0.25rem;
}
</style>
