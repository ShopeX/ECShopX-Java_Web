<template>
  <div class="section-widget py-8 px-4" widget-name="featured-product">
    <div class="container mx-auto">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ displayTitle }}</h2>
      <p v-if="displayDescription" class="text-gray-600 mb-6">{{ displayDescription }}</p>

      <div
        v-if="items && items.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 min-h-[200px]"
      >
        <div
          v-for="item in displayItems"
          :key="item.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-300"
        >
          <div class="aspect-square bg-gray-100 flex items-center justify-center">
            <!-- <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" /> -->
            <span class="text-gray-400 text-sm">{{ t('6fbd04b2.9b94b1') }}</span>
          </div>
          <div class="p-4">
            <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-2 h-10">
              {{ item.displayName }}
            </h3>
            <div class="text-lg font-bold text-red-600">¥{{ item.price }}</div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
        {{ t('6fbd04b2.0d87ab') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FeaturedProductItem {
  id: number
  name: string
  price: number
  quantity?: number
}

interface Props {
  title?: string
  description?: string
  items?: FeaturedProductItem[]
}

const { t } = useI18n()
const props = defineProps<Props>()
const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

function translateIfGeneratedKey(value?: string) {
  const text = value || ''
  return generatedKeyPattern.test(text) ? t(text) : text
}

const displayTitle = computed(() => translateIfGeneratedKey(props.title))
const displayDescription = computed(() => translateIfGeneratedKey(props.description))
const displayItems = computed(() =>
  (props.items || []).map((item) => ({
    ...item,
    displayName: translateIfGeneratedKey(item.name),
  }))
)
</script>
