<template>
  <section
    class="relative w-full overflow-hidden bg-gray-900 group"
    data-testid="home-hero-section"
  >
    <!-- Carousel / Single Banner -->
    <div class="relative w-full h-[500px] md:h-[600px] lg:h-[720px]">
      <div
        v-for="(item, index) in items"
        :key="index"
        v-show="currentIndex === index"
        class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        :data-testid="`home-hero-item-${index}`"
      >
        <!-- Background Image -->
        <img
          :src="item.image"
          :alt="item.title"
          class="w-full h-full object-cover"
          data-testid="home-hero-image"
        />

        <!-- Content Overlay -->
        <div
          class="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-center px-6"
        >
          <h1
            class="text-white text-[32px] md:text-[48px] lg:text-[64px] font-bold mb-4 tracking-tight animate-fade-in-up"
            data-testid="home-hero-title"
          >
            {{ item.title }}
          </h1>
          <p
            class="text-white/90 text-sm md:text-base lg:text-lg max-w-2xl mb-8 leading-relaxed animate-fade-in-up [animation-delay:200ms]"
            data-testid="home-hero-subtitle"
          >
            {{ item.subtitle }}
          </p>
          <div class="animate-fade-in-up [animation-delay:400ms]">
            <ECButton
              variant="dark"
              size="lg"
              class-name="!bg-white !text-black hover:!bg-gray-100 !rounded-full"
              data-testid="home-hero-discover-btn"
              @click="handleLink(item.link)"
            >
              {{ item.buttonText || t('87d5d24b.26b2db') }}
            </ECButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls (Optional) -->
    <div v-if="items.length > 1" class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
      <button
        v-for="(_, index) in items"
        :key="index"
        :class="[
          'w-2 h-2 rounded-full transition-all',
          currentIndex === index ? 'bg-white w-8' : 'bg-white/40',
        ]"
        @click="currentIndex = index"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ECButton from '../ECButton/ECButton.vue'

const { t } = useI18n()

interface BannerItem {
  image: string
  title: string
  subtitle: string
  buttonText?: string
  link: string
}

interface Props {
  items: BannerItem[]
  autoPlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: true,
})

const currentIndex = ref(0)
let timer: any = null

function startAutoPlay() {
  if (!props.autoPlay || props.items.length <= 1) return
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % props.items.length
  }, 5000)
}

function handleLink(link: string) {
  const router = useRouter()
  router.push(link)
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
