<template>
  <div class="flex flex-col overflow-hidden">
    <!-- 商品图片 -->
    <button
      type="button"
      class="relative aspect-square w-full"
      :aria-label="t('c771fc84.aa2f89', { name: product.name })"
      @click="handleSelect"
    >
      <img
        :src="product.image"
        :alt="product.name"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <BCProductMarketingTags :tags="product.marketingTags" placement="overlay" />
    </button>

    <!-- 商品信息 -->
    <div class="flex flex-col items-center gap-3 bg-[#f6f6f6] px-6 py-8">
      <!-- 商品名称 -->
      <h2
        class="w-full text-center font-['Noto_Sans_SC',sans-serif] text-sm font-medium leading-5 text-[#191a1d]"
      >
        {{ product.name }}
      </h2>

      <!-- 价格 -->
      <p
        class="flex h-6 items-center justify-center text-center font-['Inter',sans-serif] text-sm leading-[14px] text-[#191a1d]"
      >
        ￥{{ formatPrice(product.price) }}
      </p>

      <!-- 移出收藏按钮：可仅保留视觉，不接删除逻辑 -->
      <button
        v-if="showRemoveButton"
        type="button"
        class="border border-[#0f0f10] px-8 py-2 text-[#0f0f10] transition-colors"
        @click.stop.prevent="handleRemove"
      >
        <span class="font-['Noto_Sans_SC',sans-serif] text-xs font-medium leading-4 text-current">
          {{ t('c771fc84.c92447') }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'
import type { IMarketingTag } from '~/utils/promotionTags'

interface Product {
  id: string | number
  name: string
  price: number
  image: string
  marketingTags?: IMarketingTag[]
}

interface Props {
  product: Product
  /** 是否展示「移出收藏」按钮 */
  showRemoveButton?: boolean
  /** 是否启用按钮行为，默认 true；仅做 UI 还原时可关闭 */
  enableRemoveAction?: boolean
}

defineOptions({
  name: 'FavoriteProductCard',
})

const props = withDefaults(defineProps<Props>(), {
  showRemoveButton: true,
  enableRemoveAction: true,
})
const { t } = useI18n()

const emit = defineEmits<{
  remove: [productId: string | number]
  select: []
}>()

/**
 * 格式化价格
 */
function formatPrice(price: number): string {
  return price.toFixed(2)
}

function handleSelect() {
  emit('select')
}

/**
 * 处理移出收藏
 */
function handleRemove() {
  if (!props.enableRemoveAction) {
    return
  }
  emit('remove', props.product.id)
}
</script>
