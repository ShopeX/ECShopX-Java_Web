<template>
  <header class="section-widget sp-header-bar-simple w-full border-b border-gray-200">
    <div class="sp-main-nav bg-white">
      <div class="container mx-auto h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6">
        <!-- Logo -->
        <NuxtLink to="/" class="flex-shrink-0">
          <img :src="mallLogoDarkUrl" alt="ECSHOPX Logo" class="h-8 lg:h-10" />
        </NuxtLink>

        <!-- 中间导航菜单 -->
        <!-- 中间导航菜单 -->
        <nav class="hidden lg:flex items-center space-x-8 text-sm font-medium">
          <div v-for="nav in mainNavs" :key="nav.key" class="relative group">
            <NuxtLink
              :to="nav.path"
              class="relative py-2 text-gray-700 hover:text-primary-500 transition-colors duration-300 block"
            >
              <span class="flex items-center gap-1">
                {{ nav.label }}
                <Icon
                  v-if="nav.children?.length"
                  name="i-heroicons-chevron-down"
                  class="w-3 h-3 transition-transform duration-300 group-hover:rotate-180"
                />
              </span>
              <!-- Hover Line Animation -->
              <span
                class="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"
              ></span>
            </NuxtLink>

            <!-- Dropdown Menu -->
            <div
              v-if="nav.children?.length"
              class="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-40 hidden group-hover:block z-50"
            >
              <div
                class="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden py-2 animate-slide-up"
              >
                <NuxtLink
                  v-for="child in nav.children"
                  :key="child.key"
                  :to="child.path"
                  class="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                >
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </nav>

        <!-- 右侧图标 -->
        <div class="flex items-center space-x-4 lg:space-x-6">
          <button class="hover:text-gray-600 transition-colors" aria-label="Search">
            <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5" />
          </button>
          <button
            class="hover:text-gray-600 transition-colors"
            aria-label="Shopping Cart"
            @click="handleCartClick"
          >
            <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5" />
          </button>
          <HeaderUserEntry
            guest-aria-label="User Account"
            variant="simple"
            @click="handleUserClick"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * Simple Header Bar 组件
 * 用于登录、注册等简单页面的头部
 * 包含 Logo、导航菜单和功能图标
 */
import HeaderUserEntry from '~/components/BCHeaderBar/HeaderUserEntry.vue'

const router = useRouter()
const { mallLogoDarkUrl } = await useMallGlobalSetting()
const { t } = useI18n()
const { openUserCenter } = useHeaderUser('/member')

// 主导航
const mainNavs = [
  { key: 'skin-care', label: t('3bfd871a.3a74c8'), path: '/collections/skin-care' },
  { key: 'beauty-fragrance', label: t('3bfd871a.265464'), path: '/collections/beauty-fragrance' },
  {
    key: 'fashion-beauty',
    label: t('3bfd871a.df1584'),
    path: '/collections/fashion-beauty',
    children: [
      {
        key: 'skincare',
        label: t('3bfd871a.408136'),
        path: '/collections/fashion-beauty/skincare',
      },
      { key: 'makeup', label: t('3bfd871a.7749b8'), path: '/collections/fashion-beauty/makeup' },
      { key: 'perfume', label: t('3bfd871a.0aa079'), path: '/collections/fashion-beauty/perfume' },
    ],
  },
  { key: 'face-care', label: t('3bfd871a.408136'), path: '/collections/face-care' },
  { key: 'sun-protection', label: t('3bfd871a.70f060'), path: '/collections/sun-protection' },
  { key: 'perfume', label: t('3bfd871a.be19dd'), path: '/collections/perfume' },
  { key: 'eye-care', label: t('3bfd871a.4a2112'), path: '/collections/eye-care' },
  { key: 'lip-makeup', label: t('3bfd871a.6bf846'), path: '/collections/lip-makeup' },
  { key: 'points-mall', label: t('3bfd871a.a13364'), path: '/points-mall' },
]

const handleCartClick = () => {
  router.push('/cart')
}

const handleUserClick = () => {
  void openUserCenter()
}
</script>
