<template>
  <Teleport to="body">
    <Transition name="ec-drawer-fade">
      <div
        v-if="modelValue"
        data-testid="ec-drawer-overlay"
        class="fixed inset-0 z-[9999] flex items-stretch justify-end bg-[rgba(0,0,0,0.6)]"
        @click.self="close"
      >
        <Transition name="ec-drawer-panel">
          <div
            v-if="modelValue"
            class="h-full w-full bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
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

defineOptions({ name: 'ECDrawer' })

interface Props {
  modelValue: boolean
  panelClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  panelClass: 'max-w-[560px]',
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
.ec-drawer-fade-enter-active,
.ec-drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}

.ec-drawer-fade-enter-from,
.ec-drawer-fade-leave-to {
  opacity: 0;
}

.ec-drawer-panel-enter-active,
.ec-drawer-panel-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.ec-drawer-panel-enter-from,
.ec-drawer-panel-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
