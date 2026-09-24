<template>
  <div class="flex h-dvh w-full flex-col bg-white">
    <div
      class="flex h-14 shrink-0 items-center justify-between border-b border-[#e5e7eb] px-4 lg:px-5"
    >
      <p class="text-base font-medium leading-5 text-[#191a1d]">{{ assistantTitle }}</p>
      <button
        type="button"
        class="flex size-10 items-center justify-center text-[#191a1d] transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2"
        :aria-label="t('b4039f35.38d7ea')"
        @click="handleClose"
      >
        <UIcon name="i-heroicons-x-mark" class="size-5" />
      </button>
    </div>

    <iframe
      ref="iframeRef"
      :src="iframeSrc"
      class="min-h-0 flex-1 w-full border-0"
      :title="assistantTitle"
      allow="clipboard-write; microphone; camera"
      @load="syncAuthToEmbed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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

defineOptions({ name: 'BCAiAssistantDrawer' })

const model = defineModel<boolean>({ default: false })

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const userStore = useUserStore()
const { locale, t } = useI18n()
const iframeRef = ref<HTMLIFrameElement | null>(null)

const aiConfig = computed(() => config.public as AiAssistantPublicConfig)
const assistantTitle = computed(() => t('b4039f35.354274'))
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

function handleClose() {
  model.value = false
}

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
    model.value = false
    return
  }

  if (data.type === 'AI_ASSISTANT_MINIPROGRAM_NAV' && data.path) {
    const rawPath = String(data.path)
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    model.value = false
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
  () => [model.value, userStore.token, locale.value],
  () => {
    if (model.value) syncAuthToEmbed()
  }
)
</script>
