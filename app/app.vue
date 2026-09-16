<template>
  <UApp>
    <NuxtLoadingIndicator
      color="repeating-linear-gradient(to right, #111827 0%, #1f2937 50%, #6b7280 100%)"
    />
    <NuxtLayout>
      <NuxtPage :keepalive="{ max: 10 }" />
    </NuxtLayout>
    <!-- <CartDrawer /> -->
  </UApp>
</template>

<script setup lang="ts">
import { logger } from '~/utils/log'

const router = useRouter()
const route = useRoute()

/** 装修后台 iframe（designMode=1）时隐藏 html/body 滚动条（滚动仍可用） */
function decorationPreviewScrollbarHideActive(): boolean {
  if (route.query.designMode === '1') {
    return true
  }
  if (import.meta.client) {
    try {
      return window.parent !== window
    } catch {
      return false
    }
  }
  return false
}

function applyDecorationPreviewScrollbarClass() {
  if (!import.meta.client) {
    return
  }
  const el = document.documentElement
  if (!el) {
    return
  }
  if (decorationPreviewScrollbarHideActive()) {
    el.classList.add('decoration-preview-hide-scrollbar')
  } else {
    el.classList.remove('decoration-preview-hide-scrollbar')
  }
}

watch(
  () => [route.query.designMode, route.fullPath],
  () => applyDecorationPreviewScrollbarClass(),
  { flush: 'post' }
)

onMounted(() => {
  logger.info(router)
  applyDecorationPreviewScrollbarClass()
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.documentElement.classList.remove('decoration-preview-hide-scrollbar')
  }
})
</script>

<style>
/* 防止 FOUC 的基础样式 */
html {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f9fafb; /* bg-gray-50 的颜色 */
  color: #111827; /* text-gray-900 的颜色 */
}

/* 管理后台嵌入的装修预览：iframe 固定为预览视口，子页面由 html/documentElement 滚动 */
html.decoration-preview-hide-scrollbar {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
html.decoration-preview-hide-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
html.decoration-preview-hide-scrollbar body {
  min-height: 100%;
  overflow: visible;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
html.decoration-preview-hide-scrollbar body::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

#__nuxt {
  min-height: 100vh;
}

html.decoration-preview-hide-scrollbar #__nuxt {
  min-height: 100%;
}

/* 加载时的最小样式 */
.min-h-screen {
  min-height: 100vh !important;
}

.bg-gray-50 {
  background-color: #f9fafb !important;
}

.bg-white {
  background-color: #ffffff !important;
}

/* 容器基础样式 */
.container {
  width: 100%;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
  }
}
</style>
