<template>
  <div
    class="bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    @click="navigateToDetail"
  >
    <!-- 商品图片 -->
    <div class="relative pt-[100%]">
      <img
        :src="info.pics[0]"
        :alt="info.title"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <BCProductMarketingTags :tags="marketingTags" placement="overlay" />
    </div>

    <!-- 商品信息 -->
    <div class="p-3">
      <h3 class="text-sm leading-[1.4] h-10 mb-2 overflow-hidden text-ellipsis line-clamp-2">
        {{ info.title }}
      </h3>

      <div class="flex items-baseline gap-2 mb-2">
        <div class="text-red-500">
          <span class="text-lg font-medium">{{ formatMoneyFen(info.price) }}</span>
        </div>
        <div v-if="info.market_price" class="text-xs text-gray-400 line-through">
          {{ formatMoneyFen(info.market_price) }}
        </div>
      </div>

      <div class="flex justify-between text-xs text-gray-500">
        <span>{{ t('a1d64788.44e7eb') }} {{ info.sales }}</span>
        <span v-if="info.stock <= 10" class="text-red-500">
          {{ t('a1d64788.0eac88') }} {{ info.stock }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatMoneyFen } from '~/utils/currencyFormat'
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'
import { mapPromotionTags } from '~/utils/promotionTags'

const { t, localePath } = useI18n()

const props = defineProps({
  info: {
    type: Object,
    required: true,
  },
})

const marketingTags = computed(() => mapPromotionTags(props.info))

// 跳转到详情页 - 使用 navigateTo 替代 useRouter（SSR 安全）
const navigateToDetail = () => {
  navigateTo(localePath(`/item/${props.info.id}`))
}
</script>
