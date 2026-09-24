<template>
  <div class="relative w-full h-[540px] bg-[#f7f7fa]">
    <!-- 轮播图内容 -->
    <div class="relative w-full h-full overflow-hidden">
      <div
        class="absolute inset-0 flex transition-transform duration-500"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(banner, index) in banners"
          :key="index"
          class="w-full h-full flex-shrink-0 relative"
        >
          <div
            v-show="isImageLoading[index]"
            class="absolute inset-0 bg-gray-200 animate-pulse"
          ></div>
          <img
            :src="banner.image"
            :alt="banner.title"
            class="w-full h-full object-cover"
            loading="lazy"
            @load="handleImageLoad(index)"
            @error="handleImageError(index)"
          />
        </div>
      </div>
    </div>

    <!-- 指示器 -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
      <button
        v-for="(_, index) in banners"
        :key="index"
        @click="setCurrentIndex(index)"
        class="w-2 h-2 rounded-full transition-colors duration-200"
        :class="index === currentIndex ? 'bg-red-500' : 'bg-white/50'"
        :aria-label="t('feedc46a.37de11', { index: index + 1 })"
      />
    </div>

    <!-- 左右箭头 -->
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors"
      @click="prev"
      :aria-label="t('feedc46a.7fc2d1')"
    >
      <img src="/icons/arrow-left.svg" alt="" class="w-6 h-6" />
    </button>
    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors"
      @click="next"
      :aria-label="t('feedc46a.7a139f')"
    >
      <img src="/icons/arrow-right.svg" alt="" class="w-6 h-6" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, toRefs } from 'vue'

interface Banner {
  image: string
  title: string
  link: string
}

// 模拟轮播图数据
const props = defineProps<{
  banners: Banner[]
}>()

const { t } = useI18n()
const { banners } = toRefs(props)

const currentIndex = ref(0)
const timer = ref<NodeJS.Timeout>()
const isImageLoading = ref<boolean[]>(new Array(banners.value.length).fill(true))

const handleImageLoad = (index: number) => {
  isImageLoading.value[index] = false
}

const handleImageError = (index: number) => {
  isImageLoading.value[index] = false
  console.error(`Failed to load image for banner ${index}`)
}

const setCurrentIndex = (index: number) => {
  currentIndex.value = index
}

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % banners.value.length
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length
}

const startAutoPlay = () => {
  timer.value = setInterval(() => {
    next()
  }, 5000)
}

const stopAutoPlay = () => {
  if (timer.value) {
    clearInterval(timer.value)
  }
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>
