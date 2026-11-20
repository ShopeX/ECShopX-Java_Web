<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        data-testid="order-logistics-overlay"
        class="fixed inset-0 z-[70] flex items-end bg-[rgba(0,0,0,0.6)] lg:items-stretch lg:justify-end"
        @click.self="close"
      >
        <Transition name="logistics-panel">
          <div
            v-if="visible"
            :data-testid="panelTestId"
            class="w-full bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
            :class="
              isDesktop
                ? 'h-full max-w-[560px] px-[32px] py-[32px]'
                : 'max-h-[calc(100vh-96px)] overflow-hidden px-[16px] py-[32px]'
            "
          >
            <OrderLogisticsPanel
              :tracking-no="trackingNo"
              :company="company"
              :traces="traces"
              :loading="loading"
              :error="error"
              :footer-bordered="!isDesktop"
              @close="close"
              @retry="emit('retry')"
            />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ILogisticsTrace } from '~/types/api/order'
import OrderLogisticsPanel from './OrderLogisticsPanel.vue'

interface Props {
  modelValue: boolean
  trackingNo?: string
  company?: string
  traces?: ILogisticsTrace[]
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  trackingNo: '',
  company: '',
  traces: () => [],
  loading: false,
  error: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  retry: []
}>()

const visible = computed(() => props.modelValue)
const isDesktop = ref(false)
let mediaQuery: MediaQueryList | null = null

const panelTestId = computed(() =>
  isDesktop.value ? 'order-logistics-desktop-drawer' : 'order-logistics-mobile-sheet'
)

const syncViewport = () => {
  isDesktop.value = mediaQuery?.matches ?? false
}

const close = () => {
  emit('update:modelValue', false)
}

watch(
  visible,
  (nextVisible) => {
    if (!import.meta.client) return
    document.body.style.overflow = nextVisible ? 'hidden' : ''
  },
  { immediate: true }
)

onMounted(() => {
  if (!import.meta.client) return

  mediaQuery = window.matchMedia('(min-width: 1024px)')
  syncViewport()
  mediaQuery.addEventListener('change', syncViewport)
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }

  mediaQuery?.removeEventListener('change', syncViewport)
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.logistics-panel-enter-active,
.logistics-panel-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.logistics-panel-enter-from,
.logistics-panel-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

@media (min-width: 1024px) {
  .logistics-panel-enter-from,
  .logistics-panel-leave-to {
    transform: translateX(24px);
  }
}
</style>
