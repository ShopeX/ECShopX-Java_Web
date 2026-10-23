<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900 mb-4">
        {{ error?.statusCode || '500' }}
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        {{ error?.message || t('064c23ca.c7f445') }}
      </p>
      <button
        class="px-4 py-2 bg-[#b22420] text-white rounded hover:opacity-90 transition-opacity"
        @click="handleError"
      >
        {{ t('064c23ca.5a1367') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps({
  error: Object,
})

const handleError = () => {
  clearError()
  navigateTo('/')
}
</script>
