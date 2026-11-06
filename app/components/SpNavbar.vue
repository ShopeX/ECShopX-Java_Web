<!-- 顶部导航栏组件 -->
<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="container mx-auto px-4">
      <!-- 顶部信息栏 -->
      <div class="h-9 flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center space-x-6">
          <span>{{ t('1db81bba.6d8f4c') }}</span>
          <NuxtLink
            v-if="!isLoggedIn"
            :to="localePath('/account/login')"
            class="hover:text-primary-500"
          >
            {{ t('1db81bba.7d1eb0') }}
          </NuxtLink>
          <template v-else>
            <span>{{ userInfo.username }}</span>
            <button class="hover:text-primary-500" @click="handleLogout">
              {{ t('1db81bba.c39922') }}
            </button>
          </template>
        </div>
        <div class="flex items-center space-x-6">
          <NuxtLink
            v-for="item in topMenus"
            :key="item.key"
            :to="item.path"
            class="hover:text-primary-500"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>

      <!-- 主导航栏 -->
      <div class="h-20 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="flex items-center">
          <img :src="mallLogoDarkUrl" alt="ECshopX Logo" class="h-10" />
        </NuxtLink>

        <!-- 搜索框 -->
        <div class="flex-1 max-w-xl mx-12">
          <div class="relative">
            <input
              v-model="searchKeyword"
              type="text"
              :placeholder="t('1db81bba.2470ef')"
              class="w-full h-10 pl-4 pr-12 rounded-sm border border-primary-500 focus:outline-none"
              @keyup.enter="handleSearch"
            />
            <button
              class="absolute right-0 top-0 h-10 w-16 bg-primary-500 text-white rounded-r-sm hover:bg-primary-600"
              @click="handleSearch"
            >
              {{ t('1db81bba.e5f71f') }}
            </button>
          </div>
          <!-- 热门搜索 -->
          <div class="mt-2 text-sm text-gray-500">
            <span>{{ t('1db81bba.67a9a3') }}</span>
            <a
              v-for="(keyword, index) in hotKeywords"
              :key="keyword"
              href="#"
              class="hover:text-primary-500 ml-2"
              @click.prevent="
                searchKeyword = keyword
                handleSearch()
              "
            >
              {{ keyword }}
            </a>
          </div>
        </div>

        <!-- 用户操作区 -->
        <div class="flex items-center space-x-8">
          <NuxtLink
            v-for="item in userActions"
            :key="item.key"
            :to="item.path"
            class="flex flex-col items-center hover:text-primary-500"
          >
            <span class="text-2xl">
              <Icon :name="item.icon" />
            </span>
            <span class="text-sm mt-1">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- 分类导航 -->
      <div class="h-10 flex items-center space-x-8">
        <div class="relative group">
          <button class="flex items-center space-x-2 h-10 px-6 bg-primary-500 text-white">
            <span>{{ t('1db81bba.9772d7') }}</span>
            <UIcon name="i-heroicons-chevron-down" />
          </button>
          <!-- 分类下拉菜单 -->
          <div
            class="absolute left-0 top-full w-60 bg-white shadow-lg hidden group-hover:block z-50"
          >
            <div v-for="category in categories" :key="category.id" class="relative group/item">
              <NuxtLink
                :to="localePath(`/category/${category.id}`)"
                class="flex items-center justify-between px-4 h-10 hover:bg-gray-50"
              >
                <span>{{ category.name }}</span>
                <Icon
                  v-if="category.children?.length"
                  name="i-heroicons-chevron-right"
                  class="text-gray-400"
                />
              </NuxtLink>
              <!-- 二级分类 -->
              <div
                v-if="category.children?.length"
                class="absolute left-full top-0 w-60 bg-white shadow-lg hidden group-hover/item:block"
              >
                <NuxtLink
                  v-for="subCategory in category.children"
                  :key="subCategory.id"
                  :to="localePath(`/category/${subCategory.id}`)"
                  class="block px-4 h-10 leading-10 hover:bg-gray-50"
                >
                  {{ subCategory.name }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-8">
          <div v-for="nav in mainNavs" :key="nav.key" class="relative group">
            <NuxtLink
              :to="localePath(nav.path)"
              class="relative py-2 text-gray-700 hover:text-primary-500 transition-colors duration-300"
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
                  :to="localePath(child.path)"
                  class="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                >
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const localePath = useLocalePath()
const { t } = useI18n()
const { mallLogoDarkUrl } = await useMallGlobalSetting()

// 用户登录状态
const isLoggedIn = ref(false)
const userInfo = computed(() => ({
  username: t('1db81bba.615db5'),
}))

// 搜索相关
const searchKeyword = ref('')
const hotKeywords = ['iPhone 15', 'Huawei Mate 60', 'Xiaomi 14', 'Headphones', 'Watch']

// 顶部菜单
const topMenus = computed(() => [
  { key: 'member', label: t('1db81bba.12688a'), path: localePath('/member') },
  { key: 'order', label: t('1db81bba.a73872'), path: localePath('/member/orders') },
  { key: 'favorite', label: t('1db81bba.975ff6'), path: localePath('/member/favorites') },
  { key: 'help', label: t('1db81bba.fe4416'), path: localePath('/help') },
])

// 用户操作区
const userActions = computed(() => [
  {
    key: 'message',
    label: t('1db81bba.ff692f'),
    path: localePath('/member/messages'),
    icon: 'i-heroicons-bell',
  },
  {
    key: 'cart',
    label: t('1db81bba.c017be'),
    path: localePath('/cart'),
    icon: 'i-heroicons-shopping-cart',
  },
  {
    key: 'user',
    label: t('1db81bba.07b181'),
    path: localePath('/member'),
    icon: 'i-heroicons-user',
  },
])

// 主导航
const mainNavs = computed(() => [
  { key: 'skin-care', label: t('1db81bba.3a74c8'), path: '/category/skin-care' },
  { key: 'beauty-fragrance', label: t('1db81bba.265464'), path: '/category/beauty-fragrance' },
  {
    key: 'fashion-beauty',
    label: t('1db81bba.df1584'),
    path: '/category/fashion-beauty',
    children: [
      { key: 'skincare', label: t('1db81bba.408136'), path: '/category/fashion-beauty/skincare' },
      { key: 'makeup', label: t('1db81bba.7749b8'), path: '/category/fashion-beauty/makeup' },
      { key: 'perfume', label: t('1db81bba.0aa079'), path: '/category/fashion-beauty/perfume' },
    ],
  },
  { key: 'face-care', label: t('1db81bba.408136'), path: '/category/face-care' },
  { key: 'sun-protection', label: t('1db81bba.70f060'), path: '/category/sun-protection' },
  { key: 'perfume', label: t('1db81bba.be19dd'), path: '/category/perfume' },
  { key: 'eye-care', label: t('1db81bba.4a2112'), path: '/category/eye-care' },
  { key: 'lip-makeup', label: t('1db81bba.6bf846'), path: '/category/lip-makeup' },
  { key: 'points-mall', label: t('1db81bba.a13364'), path: '/points-mall' },
])

// 分类数据
const categories = computed(() => [
  {
    id: '1',
    name: t('1db81bba.0e4ae5'),
    children: [
      { id: '1-1', name: t('1db81bba.9f9d36') },
      { id: '1-2', name: t('1db81bba.03ee8b') },
      { id: '1-3', name: t('1db81bba.1873ea') },
    ],
  },
  {
    id: '2',
    name: t('1db81bba.1ba4e0'),
    children: [
      { id: '2-1', name: t('1db81bba.704d5c') },
      { id: '2-2', name: t('1db81bba.e87512') },
      { id: '2-3', name: t('1db81bba.7a502d') },
    ],
  },
  {
    id: '3',
    name: t('1db81bba.1bb58d'),
    children: [
      { id: '3-1', name: t('1db81bba.3a2f90') },
      { id: '3-2', name: t('1db81bba.5656ad') },
      { id: '3-3', name: t('1db81bba.640c8a') },
    ],
  },
])

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value) return
  navigateTo(localePath(`/search?keyword=${encodeURIComponent(searchKeyword.value)}`))
}

// 处理退出登录
const handleLogout = () => {
  // TODO: 实现退出登录逻辑
  isLoggedIn.value = false
}
</script>
