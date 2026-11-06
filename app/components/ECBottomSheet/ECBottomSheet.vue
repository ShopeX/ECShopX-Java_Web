<template>
  <Teleport to="body">
    <Transition name="ec-bottom-sheet-fade">
      <div
        v-if="modelValue"
        data-testid="ec-bottom-sheet-overlay"
        class="fixed inset-0 z-[80] flex items-end bg-[rgba(0,0,0,0.6)]"
        @click.self="close"
      >
        <Transition name="ec-bottom-sheet-panel">
          <div
            v-if="modelValue"
            class="w-full bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
            :class="panelClass"
            @click.stop
          >
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onUnmounted, watch } from 'vue'

defineOptions({ name: 'ECBottomSheet' })

interface Props {
  modelValue: boolean
  panelClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  panelClass: 'max-h-[calc(100vh-96px)] overflow-hidden',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

watch(
  () => props.modelValue,
  (nextVisible) => {
    if (!import.meta.client) return
    document.body.style.overflow = nextVisible ? 'hidden' : ''
  },
  { immediate: true }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.ec-bottom-sheet-fade-enter-active,
.ec-bottom-sheet-fade-leave-active {
  transition: opacity 0.2s ease;
}

.ec-bottom-sheet-fade-enter-from,
.ec-bottom-sheet-fade-leave-to {
  opacity: 0;
}

.ec-bottom-sheet-panel-enter-active,
.ec-bottom-sheet-panel-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.ec-bottom-sheet-panel-enter-from,
.ec-bottom-sheet-panel-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
