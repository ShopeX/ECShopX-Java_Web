<template>
  <footer class="bg-[#141414] w-full">
    <div class="flex items-start justify-between px-32 lg:px-80 py-9">
      <!-- 左侧区域 - {{ t('d0b13099.e38f72') }} -->
      <div class="flex flex-col items-center justify-center gap-6 h-[119px]">
        <!-- {{ t('d0b13099.e38f72') }}链接 -->
        <NuxtLink
          to="/terms"
          class="text-[13.3px] text-[rgba(255,255,255,0.55)] text-center hover:text-white transition-colors font-normal"
        >
          {{ t('d0b13099.e38f72') }}
        </NuxtLink>

        <!-- 品牌 Logo -->
        <div class="w-[120px] h-[30px]">
          <img :src="mallLogoLightUrl" alt="Brand Logo" class="w-full h-full object-contain" />
        </div>
      </div>

      <!-- 右侧区域 - {{ t('d0b13099.0cbf83') }} -->
      <div class="flex flex-col items-center justify-center gap-6 h-[119px]">
        <!-- {{ t('d0b13099.0cbf83') }}链接 -->
        <NuxtLink
          to="/contact"
          class="text-sm text-[#f3f4f6] text-center hover:text-white transition-colors font-normal leading-5"
        >
          {{ t('d0b13099.0cbf83') }}
        </NuxtLink>

        <!-- 品牌 Logo -->
        <div class="w-[120px] h-[30px]">
          <img :src="mallLogoLightUrl" alt="Brand Logo" class="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineOptions({
  name: 'Footer',
})

const { t } = useI18n()
const { mallLogoLightUrl } = await useMallGlobalSetting()
</script>

<style scoped>
/* Noto Sans SC 字体已在全局引入，这里不需要额外设置 */
</style>
