<template>
  <div class="w-full h-10 bg-black text-white">
    <div class="container mx-auto h-full flex items-center justify-between px-4">
      <!-- 左侧导航 -->
      <div class="flex items-center space-x-4">
        <NuxtLink :to="localePath('/')" class="text-sm">{{ t('367cb4ca.db1c89') }}</NuxtLink>
        <div class="flex items-center space-x-2">
          <img src="/icons/qrcode.svg" :alt="t('367cb4ca.22b03c')" class="w-4 h-4" />
          <span class="text-sm text-secondary">{{ t('367cb4ca.d03699') }}</span>
        </div>
      </div>

      <!-- 右侧导航 -->
      <div class="flex items-center space-x-6">
        <NuxtLink :to="localePath('/login')" class="text-sm">{{ t('367cb4ca.68e6e3') }}</NuxtLink>
        <NuxtLink :to="localePath('/coupons')" class="text-sm">{{ t('367cb4ca.9c356b') }}</NuxtLink>
        <NuxtLink :to="localePath('/member')" class="text-sm">{{ t('367cb4ca.12688a') }}</NuxtLink>
        <NuxtLink :to="localePath('/merchant')" class="text-sm">{{
          t('367cb4ca.1107a8')
        }}</NuxtLink>
        <div class="flex items-center bg-red-500 px-4 h-full">
          <img src="/icons/cart.svg" :alt="t('367cb4ca.c017be')" class="w-5 h-5 mr-2" />
          <span class="text-sm">{{ t('367cb4ca.335c2a') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 顶部导航栏组件逻辑
const localePath = useLocalePath()
const { t } = useI18n()
</script>
