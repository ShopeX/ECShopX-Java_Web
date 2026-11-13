<template>
  <header class="sp-header-bar bg-white w-full">
    <div class="relative flex items-center justify-between px-4 py-6 lg:px-8">
      <!-- 左侧容器 -->
      <div class="flex items-center gap-3 lg:gap-6 h-5">
        <!-- 搜索按钮 -->
        <button
          class="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
          :aria-label="t('7812ddcf.e5f71f')"
          data-testid="search-trigger"
          @click="handleSearch"
        >
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-[#191a1d]" />
        </button>

        <!-- 菜单按钮 -->
        <button
          class="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
          :aria-label="t('7812ddcf.4ccbdc')"
          @click="handleMenu"
        >
          <UIcon name="i-heroicons-bars-3" class="w-5 h-5 text-[#191a1d]" />
        </button>
      </div>

      <!-- 中间 LOGO - 绝对定位居中，H5和PC都显示 -->
      <NuxtLink
        to="/"
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
      >
        <img :src="mallLogoDarkUrl" alt="ECSHOPX Logo" class="h-8 lg:h-10" />
      </NuxtLink>

      <!-- 右侧容器 -->
      <div class="flex items-center justify-end gap-3 lg:gap-6 h-5">
        <!-- 购物车按钮 -->
        <button
          class="relative flex h-5 w-5 items-center justify-center self-stretch hover:opacity-70 transition-opacity"
          :aria-label="cartAriaLabel"
          @click="handleCart"
        >
          <ECShoppingBagIcon class="h-[18px] w-[17px] text-[#191a1d]" :count="cartItemCount" />
        </button>

        <HeaderUserEntry
          :guest-aria-label="t('7812ddcf.1fd02a')"
          variant="bar"
          @click="handleUser"
        />

        <!-- 语言按钮 -->
        <div class="relative" ref="languageMenuRef">
          <button
            class="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
            :aria-label="t('7812ddcf.295bb7')"
            @click="toggleLanguageMenu"
          >
            <UIcon name="i-heroicons-globe-alt" class="w-5 h-5 text-[#191a1d]" />
          </button>

          <!-- 语言下拉菜单 -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showLanguageMenu"
              class="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-[#e5e7eb] py-2 z-50"
            >
              <button
                v-for="lang in availableLocales"
                :key="lang.code"
                class="w-full px-4 py-2 text-left text-[14px] hover:bg-[#f5f5f5] transition-colors flex items-center justify-between"
                :class="{
                  'text-[#191a1d] font-medium': currentLocale === lang.code,
                  'text-[#4a5565]': currentLocale !== lang.code,
                }"
                @click="switchLanguage(lang.code)"
              >
                <span>{{ lang.name }}</span>
                <Icon
                  v-if="currentLocale === lang.code"
                  name="i-heroicons-check"
                  class="w-4 h-4 text-[#191a1d]"
                />
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 底部阴影分割线 -->
    <div class="shadow-[0px_-1px_0px_0px_inset_rgba(255,255,255,0.1)] pointer-events-none"></div>
  </header>
</template>

<script setup lang="ts">
/**
 * HeaderBar 组件
 */

import HeaderUserEntry from '~/components/BCHeaderBar/HeaderUserEntry.vue'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import type { AppLocaleCode } from '~/shared/localeConfig'
import { markUserPreferredLocale } from '~/utils/siteLanguageSetting'
import {
  fetchSiteLanguageSetting,
  getEnabledLocales,
  clearSiteLanguageSettingCache,
} from '~/utils/siteLanguageSetting'

const cartStore = useCartStore()
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { t } = useI18n()
const { mallLogoDarkUrl } = await useMallGlobalSetting()
const { openUserCenter } = useHeaderUser()

// 定义 emits
const emit = defineEmits<{
  openCategoryNav: []
  openMiniCart: []
  openSearch: []
}>()

// 语言菜单相关
const showLanguageMenu = ref(false)
const languageMenuRef = ref<HTMLElement | null>(null)

// 当前语言
const currentLocale = computed(() => locale.value)

// 购物车商品数量
const cartItemCount = computed(() => cartStore.totalItems || 0)
const cartAriaLabel = computed(() => {
  const label = t('7812ddcf.53754b')
  return cartItemCount.value > 0 ? `${label} (${cartItemCount.value})` : label
})

// 可用语言列表（站点已启用）
const availableLocales = ref<{ code: AppLocaleCode; name: string }[]>([
  { code: 'zh', name: '简体中文' },
])

async function refreshAvailableLocales(force = false) {
  if (force) clearSiteLanguageSettingCache()
  const setting = await fetchSiteLanguageSetting({ force })
  availableLocales.value = getEnabledLocales(setting) as {
    code: AppLocaleCode
    name: string
  }[]
}

/**
 * 切换语言菜单显示状态
 */
const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

/**
 * 切换语言
 */
const switchLanguage = (localeCode: AppLocaleCode) => {
  showLanguageMenu.value = false
  markUserPreferredLocale(localeCode)

  // 使用 switchLocalePath 切换到新语言
  const path = switchLocalePath(localeCode)
  navigateTo(path, { replace: true })
}

/**
 * 点击外部关闭菜单
 */
const handleClickOutside = (event: MouseEvent) => {
  if (languageMenuRef.value && !languageMenuRef.value.contains(event.target as Node)) {
    showLanguageMenu.value = false
  }
}

const handleWindowFocus = () => {
  refreshAvailableLocales(true)
}

// 监听点击外部事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('focus', handleWindowFocus)
  refreshAvailableLocales()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('focus', handleWindowFocus)
})

/**
 * 处理搜索点击 - 打开全局搜索抽屉
 */
const handleSearch = () => {
  emit('openSearch')
}

/**
 * 处理菜单点击
 */
const handleMenu = () => {
  emit('openCategoryNav')
}

/**
 * 处理购物车点击
 * 移动端：跳转到购物车页面
 * 桌面端：打开 Mini 购物车侧边栏
 */
const handleCart = () => {
  // 检测是否为移动端（小于 lg 断点 1024px）
  const isMobile = window.innerWidth < 1024

  if (isMobile) {
    // 移动端：直接跳转到购物车页面
    router.push('/cart')
  } else {
    // 桌面端：打开 Mini 购物车侧边栏
    emit('openMiniCart')
  }
}

/**
 * 处理网格视图点击
 */
const handleGrid = () => {
  // TODO: 实现网格视图功能
  console.log('网格视图')
}

/**
 * 处理用户点击
 */
const handleUser = () => {
  void openUserCenter()
}
</script>
