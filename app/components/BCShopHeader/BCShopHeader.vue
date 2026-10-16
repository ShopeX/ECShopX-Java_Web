<template>
  <!-- H5 store header -->
  <div class="flex lg:hidden w-full bg-[#f3f4f6] flex-col gap-4 p-4" data-testid="shop-header">
    <!-- Row 1: Store info + Follow/Contact -->
    <div class="flex items-center justify-between">
      <!-- Left: Logo + Name + Tagline -->
      <div class="flex items-center gap-4">
        <img :src="props.logo" :alt="props.name" class="w-9 h-9 object-cover shrink-0" />
        <div class="flex flex-col gap-1">
          <p class="text-[14px] font-medium text-[#191A1D] leading-5 whitespace-nowrap">
            {{ props.name }}
          </p>
          <p class="text-[12px] text-[#99A1AF] leading-4 whitespace-nowrap">
            {{ props.tagline }}
          </p>
        </div>
      </div>

      <!-- Right: Follow + Contact (icon above text) -->
      <div class="flex items-start gap-4">
        <button
          class="flex flex-col items-center gap-1 py-2"
          data-testid="shop-header-follow"
          @click="toggleFollow"
        >
          <UIcon
            :name="isFollowed ? 'i-heroicons-check' : 'i-heroicons-heart'"
            class="w-4 h-4 text-[#191A1D]"
          />
          <span class="text-[12px] font-medium text-[#191A1D] leading-4 whitespace-nowrap">
            {{ isFollowed ? t('612c1a7a.f4f380') : t('612c1a7a.a6c36f') }}
          </span>
        </button>

        <button
          class="flex flex-col items-center gap-1 py-2"
          data-testid="shop-header-contact"
          @click="emit('contact')"
        >
          <UIcon name="i-heroicons-phone" class="w-4 h-4 text-[#191A1D]" />
          <span class="text-[12px] font-medium text-[#191A1D] leading-4 whitespace-nowrap">{{
            t('612c1a7a.b66060')
          }}</span>
        </button>
      </div>
    </div>

    <!-- Row 2: Search box + Category nav -->
    <div class="flex flex-col gap-2">
      <!-- Search Box -->
      <div
        class="flex items-center justify-between w-full h-10 bg-white border border-[#E5E7EB] pl-[9px] pr-[5px] py-[5px]"
        data-testid="shop-header-search"
      >
        <div class="flex items-center gap-[10px] min-w-0">
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-[#99A1AF] shrink-0" />
          <input
            v-model="searchKeyword"
            type="text"
            :placeholder="searchPlaceholder"
            class="bg-transparent text-[14px] text-[#99A1AF] leading-5 outline-none min-w-0 flex-1"
            @keyup.enter="onSearch"
          />
        </div>
        <button
          class="flex items-center justify-center px-2 py-1 bg-[#0F0F10] h-full shrink-0"
          @click="onSearch"
        >
          <span class="text-[12px] text-white leading-4 whitespace-nowrap">{{
            t('612c1a7a.58d295')
          }}</span>
        </button>
      </div>

      <!-- Category Nav -->
      <div class="flex gap-4 items-center">
        <button
          v-for="cat in props.categories"
          :key="cat"
          class="text-[12px] text-[#4A5565] leading-4"
          @click="onCategoryClick(cat)"
        >
          {{ cat }}
        </button>
      </div>
    </div>
  </div>

  <!-- PC store header -->
  <div class="hidden lg:flex w-full bg-[#f6f6f6] items-center justify-center px-4">
    <div class="flex flex-1 items-center justify-between py-6">
      <!-- Left: Store Info -->
      <div class="flex items-center gap-4 shrink-0">
        <img :src="props.logo" :alt="props.name" class="w-9 h-9 object-cover" />
        <div class="flex flex-col gap-2">
          <p class="text-[14px] font-medium text-[#191A1D] leading-5 whitespace-nowrap">
            {{ props.name }}
          </p>
          <p class="text-[12px] text-[#99A1AF] leading-4 whitespace-nowrap">
            {{ props.tagline }}
          </p>
        </div>
      </div>

      <!-- Center: Search + Category Nav -->
      <div class="flex flex-col gap-2 items-start shrink-0">
        <!-- Search Box -->
        <div
          class="flex items-center justify-between w-[500px] h-10 bg-white border border-[#E5E7EB] pl-[9px] pr-[5px] py-[5px]"
          data-testid="shop-header-search"
        >
          <div class="flex items-center gap-[10px]">
            <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-[#99A1AF] shrink-0" />
            <input
              v-model="searchKeyword"
              type="text"
              :placeholder="searchPlaceholder"
              class="bg-transparent text-[14px] text-[#99A1AF] leading-5 outline-none w-[360px]"
              @keyup.enter="onSearch"
            />
          </div>
          <button
            class="flex items-center justify-center px-2 py-1 bg-[#E5E7EB] h-full"
            @click="onSearch"
          >
            <span class="text-[12px] text-[#4A5565] leading-4 whitespace-nowrap">{{
              t('612c1a7a.58d295')
            }}</span>
          </button>
        </div>

        <!-- Category Nav -->
        <div class="flex gap-4 items-center">
          <button
            v-for="cat in props.categories"
            :key="cat"
            class="text-[12px] text-[#4A5565] leading-4 hover:text-[#191A1D] transition-colors"
            @click="onCategoryClick(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-4 shrink-0">
        <!-- Follow Button -->
        <button
          class="flex items-center gap-1 px-[17px] py-[9px] border transition-colors"
          :class="
            isFollowed
              ? 'bg-[#0F0F10] border-[#0F0F10] text-white'
              : 'bg-transparent border-[#0F0F10] text-[#191A1D]'
          "
          data-testid="shop-header-follow"
          @click="toggleFollow"
        >
          <UIcon :name="isFollowed ? 'i-heroicons-check' : 'i-heroicons-heart'" class="w-4 h-4" />
          <span class="text-[12px] font-medium leading-4 whitespace-nowrap">
            {{ isFollowed ? t('612c1a7a.f4f380') : t('612c1a7a.a6c36f') }}
          </span>
        </button>

        <!-- Contact Button -->
        <button
          class="flex items-center gap-1 px-4 py-2 bg-[#0F0F10] text-white"
          data-testid="shop-header-contact"
          @click="emit('contact')"
        >
          <UIcon name="i-heroicons-phone" class="w-4 h-4" />
          <span class="text-[12px] font-medium leading-4 whitespace-nowrap">{{
            t('612c1a7a.b66060')
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BCShopHeaderProps, BCShopHeaderEmits } from './types'

const props = withDefaults(defineProps<BCShopHeaderProps>(), {
  followed: false,
})

const emit = defineEmits<BCShopHeaderEmits>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// Search
const searchKeyword = ref('')
const searchPlaceholder = computed(() => t('612c1a7a.7ff865'))

function onSearch() {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return

  const isOnShopPage = route.path === `/shop/${props.distributorId}`
  if (isOnShopPage) {
    router.replace({ query: { ...route.query, q: keyword } })
  } else {
    router.push({ path: `/shop/${props.distributorId}`, query: { q: keyword } })
  }
}

function onCategoryClick(category: string) {
  router.push({ path: `/shop/${props.distributorId}`, query: { category } })
}

// Follow toggle
const isFollowed = ref(props.followed)

function toggleFollow() {
  isFollowed.value = !isFollowed.value
  emit('follow', isFollowed.value)
}
</script>
