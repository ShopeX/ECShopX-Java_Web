<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import type { HTMLAttributes, StyleValue } from 'vue'
import { useDecorationEditOrDisabled } from '~/decoration-engine/composables/useDecorationEditContext'
import { useDecorationPreview } from '~/decoration-engine/composables/useDecorationPreview'

const props = defineProps<{
  sectionId: string
  blockId: string
  /**
   * 如热区绝对定位的 class，预览与非预览都作用于根节点
   */
  rootClass?: HTMLAttributes['class']
  rootStyle?: StyleValue
}>()

const root = ref<HTMLDivElement | null>(null)
const ctx = useDecorationEditOrDisabled()
const { focusBlock } = useDecorationPreview()
const isEditPreview = computed(() => unref(ctx.isPreview))

function onClick(event: MouseEvent) {
  if (!isEditPreview.value) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  ctx.setHoveredBlock(props.sectionId, props.blockId)
  reportSelfRect()
  focusBlock(props.sectionId, props.blockId)
}

function onPointerEnter() {
  if (!isEditPreview.value) {
    return
  }
  ctx.setHoveredBlock(props.sectionId, props.blockId)
  reportSelfRect()
}

function onPointerLeave(e: PointerEvent) {
  if (!isEditPreview.value) {
    return
  }
  const next = e.relatedTarget
  if (next && next instanceof Element) {
    if (next.closest?.('[data-decoration-add-control]')) {
      return
    }
    const el = next.closest?.('[data-decoration-block]')
    if (el) {
      const d = el.getAttribute('data-decoration-block') || ''
      if (d.startsWith(`${props.sectionId}::`)) {
        return
      }
    }
  }
  ctx.tryClearHoveredFromBlock(e, props.sectionId, props.blockId)
}

function reportSelfRect() {
  const el = root.value
  if (!el || !isEditPreview.value) {
    return
  }
  const rect = el.getBoundingClientRect()
  const scrollX = window.scrollX || 0
  const scrollY = window.scrollY || 0
  ctx.setBlockRect(props.sectionId, props.blockId, {
    top: rect.top + scrollY,
    left: rect.left + scrollX,
    width: rect.width,
    height: rect.height,
  })
}

if (import.meta.client) {
  let rafId: number | null = null
  const scheduleReport = () => {
    if (rafId !== null) {
      return
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = null
      reportSelfRect()
    })
  }

  watch(
    [() => root.value, isEditPreview, () => props.sectionId, () => props.blockId],
    async () => {
      if (!isEditPreview.value) {
        return
      }
      await nextTick()
      scheduleReport()
    },
    { immediate: true, flush: 'post' }
  )

  const resizeSource = computed(() => (isEditPreview.value ? root.value : null))

  useResizeObserver(resizeSource, (entries) => {
    if (!isEditPreview.value) {
      return
    }
    const entry = entries[0]
    if (!entry?.contentRect) {
      return
    }
    scheduleReport()
  })

  onMounted(() => {
    window.addEventListener('resize', scheduleReport)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', scheduleReport)
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId)
      rafId = null
    }
  })
}
</script>

<template>
  <div
    v-if="isEditPreview"
    ref="root"
    :data-decoration-block="`${sectionId}::${blockId}`"
    :data-section-id="sectionId"
    :data-block-id="blockId"
    :class="[props.rootClass, 'min-w-0']"
    :style="rootStyle"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @click="onClick"
  >
    <slot />
  </div>
  <div v-else :class="[props.rootClass, 'min-w-0']" :style="rootStyle">
    <slot />
  </div>
</template>
