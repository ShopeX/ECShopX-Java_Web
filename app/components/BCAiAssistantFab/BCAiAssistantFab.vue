<template>
  <ClientOnly>
    <button
      v-if="shouldShow"
      type="button"
      class="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 md:bottom-8 md:right-8"
      aria-label="AI Assistant"
      data-testid="ai-assistant-fab"
      @click="openAssistant"
    >
      <img
        v-if="fabIconUrl"
        :src="fabIconUrl"
        alt=""
        class="h-full w-full rounded-full object-cover"
      />
      <span v-else>{{ fabText }}</span>
    </button>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  isAiAssistantEnabled,
  resolveAiAssistantBackendUrl,
  type AiAssistantPublicConfig,
} from '~/utils/aiAssistantEmbed'
import { resolveAiAssistantFabDisplay } from '~/utils/aiAssistantWidgetConfig'

defineOptions({ name: 'BCAiAssistantFab' })

const emit = defineEmits<{ open: [] }>()

const config = useRuntimeConfig()
const route = useRoute()

const mounted = ref(false)
const fabIconUrl = ref('')
const fabText = ref('AI')

const aiConfig = computed(() => config.public as AiAssistantPublicConfig)
const backend = computed(() => resolveAiAssistantBackendUrl(aiConfig.value))
const enabled = computed(() => isAiAssistantEnabled(aiConfig.value.aiAssistant))
const isAiAssistantRoute = computed(
  () => route.path.includes('/ai-assistant') || String(route.name || '').includes('ai-assistant')
)

const shouldShow = computed(() => mounted.value && enabled.value && !isAiAssistantRoute.value)

function buildAvatarAssetUrl(avatar: string): string {
  const tenantId = String(aiConfig.value.aiTenantId || '').trim()
  const params = new URLSearchParams()
  if (tenantId) params.set('tenant_app_id', tenantId)
  params.set('avatar', avatar)
  return `${backend.value}/api/widget/avatar-asset?${params.toString()}`
}

function applyAvatarConfig(value: unknown) {
  const display = resolveAiAssistantFabDisplay(value, buildAvatarAssetUrl)
  fabIconUrl.value = display.iconUrl
  fabText.value = display.text
}

async function loadFabConfig() {
  if (!enabled.value || !backend.value) return

  try {
    const tenantId = String(aiConfig.value.aiTenantId || '').trim()
    const query = new URLSearchParams()
    if (tenantId) query.set('tenant_app_id', tenantId)
    const suffix = query.toString() ? `?${query.toString()}` : ''
    const response = await fetch(`${backend.value}/api/widget/embed-config${suffix}`)
    if (!response.ok) return
    applyAvatarConfig(await response.json())
  } catch {
    fabIconUrl.value = ''
  }
}

function openAssistant() {
  if (!import.meta.client) return
  emit('open')
}

onMounted(() => {
  mounted.value = true
  if (enabled.value) {
    void loadFabConfig()
  }
})
</script>
