<template>
  <button
    type="button"
    class="shrink-0 overflow-hidden border border-[#e5e5e5] bg-white"
    :class="thumbClass"
    :aria-label="`${t('merchantSettlement.viewImage')} ${label}`"
    @click="open = true"
  >
    <img :src="src" alt="" class="size-full object-cover" />
  </button>

  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6"
      @click.self="open = false"
    >
      <button
        type="button"
        class="absolute right-4 top-4 flex size-8 items-center justify-center text-white"
        :aria-label="t('merchantSettlement.close')"
        @click="open = false"
      >
        <UIcon name="i-heroicons-x-mark" class="size-6" />
      </button>
      <img
        :src="src"
        :alt="label"
        class="max-h-[90vh] max-w-[90vw] object-contain"
        @click.stop
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  src: string
  label: string
  thumbClass?: string
}>()

const { t } = useI18n()
const open = ref(false)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

watch(open, (value) => {
  if (value) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>
