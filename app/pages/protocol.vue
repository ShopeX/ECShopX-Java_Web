<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto max-w-[800px] px-4 py-8 lg:px-8 lg:py-12">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <span class="text-[14px] text-[#4a5565]">{{ t('f3a1b2c4.loading') }}</span>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
        <p class="text-[14px] text-red-500">{{ error }}</p>
        <button
          type="button"
          class="mt-4 text-[14px] underline text-[#191a1d]"
          @click="fetchProtocol"
        >
          {{ t('f3a1b2c4.retry') }}
        </button>
      </div>

      <!-- 协议内容 -->
      <template v-else>
        <h1 class="mb-8 text-[24px] font-medium leading-8 text-[#191a1d]">
          {{ protocolTitle }}
        </h1>
        <div
          class="prose prose-sm max-w-none text-[14px] leading-6 text-[#364153]"
          v-html="protocolContent"
        ></div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeApiClient } from '~/infrastructure/http/clients'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const { t } = useI18n()

const loading = ref(true)
const error = ref('')
const protocolTitle = ref('')
const protocolContent = ref('')

async function fetchProtocol() {
  const type = (route.query.type as string) || 'privacy'
  loading.value = true
  error.value = ''

  try {
    const res = await storeApiClient.getProtocol(type)
    protocolTitle.value = res.title || ''
    protocolContent.value = res.content || ''
  } catch (err: any) {
    error.value = err.message || t('f3a1b2c4.fail')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProtocol()
})
</script>
