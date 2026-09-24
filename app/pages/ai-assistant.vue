<template>
  <div class="min-h-screen bg-white">
    <iframe
      ref="iframeRef"
      :src="iframeSrc"
      class="h-screen w-full border-0"
      title="AI Assistant"
      allow="clipboard-write; microphone; camera"
      @load="syncAuthToEmbed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  buildAiAssistantAuthPayload,
  buildAiAssistantIframeSrc,
  buildAiEmbedPageUrl,
  postAiAssistantAuthToEmbed,
  resolveAiAssistantBackendUrl,
  resolveDistributorIdFromRoute,
  type AiAssistantPublicConfig,
} from '~/utils/aiAssistantEmbed'
import { getApiCountryCodeByLocale } from '~/shared/localeConfig'
import { resolveCompanyId } from '~/utils/company'

definePageMeta({
  layout: 'default',
})

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const userStore = useUserStore()
const { locale } = useI18n()
const iframeRef = ref<HTMLIFrameElement | null>(null)

const aiConfig = computed(() => config.public as AiAssistantPublicConfig)
const embedPageUrl = computed(() => buildAiEmbedPageUrl(aiConfig.value))
const backend = computed(() => resolveAiAssistantBackendUrl(aiConfig.value))
const payload = computed(() =>
  buildAiAssistantAuthPayload({
    token: userStore.token,
    companyId: resolveCompanyId(),
    tenantId: aiConfig.value.aiTenantId,
    distributorId: resolveDistributorIdFromRoute(route),
    locale: getApiCountryCodeByLocale(locale.value),
  })
)
const iframeSrc = computed(() =>
  buildAiAssistantIframeSrc({
    embedPageUrl: embedPageUrl.value,
    backend: backend.value,
    payload: payload.value,
  })
)

function resolveIframeOrigin() {
  if (!import.meta.client || !iframeSrc.value) return ''
  return new URL(iframeSrc.value, window.location.origin).origin
}

function syncAuthToEmbed() {
  const frameWindow = iframeRef.value?.contentWindow
  if (!frameWindow || !iframeSrc.value) return

  const origin = new URL(iframeSrc.value, window.location.origin).origin
  postAiAssistantAuthToEmbed(frameWindow, origin, payload.value)
}

function handleMessage(event: MessageEvent) {
  const iframeOrigin = resolveIframeOrigin()
  if (iframeOrigin && event.origin !== iframeOrigin) return

  const data = event.data
  if (!data || typeof data !== 'object') return

  if (data.type === 'ai-assistant-widget-close') {
    if (window.history.length > 1) {
      router.back()
    } else {
      void router.push(localePath('/'))
    }
    return
  }

  if (data.type === 'AI_ASSISTANT_MINIPROGRAM_NAV' && data.path) {
    const rawPath = String(data.path)
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    void router.push(localePath(path as any))
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
})

watch(
  () => [userStore.token, locale.value],
  () => {
    syncAuthToEmbed()
  }
)
</script>
