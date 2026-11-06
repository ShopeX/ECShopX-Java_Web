<template>
  <header class="w-full h-[88px] bg-white">
    <div class="container mx-auto h-full flex items-center justify-between px-4">
      <!-- Logo -->
      <NuxtLink :to="localePath('/')" class="flex-shrink-0">
        <img :src="mallLogoDarkUrl" alt="Logo" class="h-14" />
      </NuxtLink>

      <!-- 导航菜单 -->
      <nav class="flex items-center space-x-8 ml-16">
        <NuxtLink :to="localePath('/')" class="text-dark text-base hover:text-red-500">
          {{ t('e11aa0ec.db1c89') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/category/1')" class="text-dark text-base hover:text-red-500">
          {{ t('e11aa0ec.3c1b78') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/category/2')" class="text-dark text-base hover:text-red-500">
          {{ t('e11aa0ec.c8a7c2') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/category/3')" class="text-dark text-base hover:text-red-500">
          {{ t('e11aa0ec.e7edcd') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/category/4')" class="text-dark text-base hover:text-red-500">
          {{ t('e11aa0ec.d33688') }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-4">
        <!-- 搜索框 -->
        <div class="flex items-center border border-gray-200 rounded-[18px] px-4 py-2 w-[320px]">
          <input
            type="text"
            :placeholder="t('e11aa0ec.2470ef')"
            class="flex-1 outline-none border-none bg-transparent text-sm"
          />
          <img
            src="/icons/search.svg"
            :alt="t('e11aa0ec.e5f71f')"
            class="w-[18px] h-[18px] cursor-pointer"
          />
        </div>

        <!-- 购物车图标 -->
        <button
          class="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          @click="cartUI.open()"
        >
          <UIcon name="i-heroicons-shopping-bag" class="w-6 h-6 text-gray-700" />
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full"
          >
            {{ cartStore.totalItems }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 主导航栏组件逻辑
const cartUI = useCartUIStore()
const cartStore = useCartStore()
const localePath = useLocalePath()
const { t } = useI18n()
const { mallLogoDarkUrl } = await useMallGlobalSetting()
</script>
