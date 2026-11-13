<template>
  <div
    class="bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-1"
    @click="handleClick"
  >
    <!-- 商品图片 -->
    <div class="relative aspect-square overflow-hidden bg-gray-100">
      <img
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />

      <!-- 折扣标签 -->
      <div
        v-if="item.discount"
        class="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded"
      >
        {{ item.discount }}{{ t('b672aabb.96c015') }}
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="p-4">
      <!-- 商品名称 -->
      <h3 class="text-sm font-medium text-gray-900 line-clamp-2 h-10 mb-2">
        {{ item.name }}
      </h3>

      <!-- 价格 -->
      <div class="flex items-baseline gap-2 mb-2">
        <span class="text-lg font-bold text-red-600"> ¥{{ item.price }} </span>
        <span v-if="item.originalPrice" class="text-sm text-gray-400 line-through">
          ¥{{ item.originalPrice }}
        </span>
      </div>

      <!-- 销量 -->
      <div class="text-xs text-gray-500">{{ t('b672aabb.b45fa4') }} {{ item.sales }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ItemData {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  discount?: number
  sales: number
}

interface Props {
  item: ItemData
}

const props = defineProps<Props>()

const { t } = useI18n()

const emit = defineEmits<{
  click: [item: ItemData]
}>()

function handleClick() {
  emit('click', props.item)
}
</script>
