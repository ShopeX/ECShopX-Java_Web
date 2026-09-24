<template>
  <div
    class="flex flex-col"
    @click.capture="handlePreviewInteractiveCapture"
    @submit.capture="handlePreviewInteractiveCapture"
  >
    <template v-if="hasRenderableSections">
      <template v-for="sectionId in dsl.order" :key="sectionId">
        <DecorationSectionHost
          v-if="shouldRenderSection(sectionId)"
          :section-id="sectionId"
          @activate="onSectionActivate"
        >
          <!-- 与 TemplateEngine 一致：父级传入与 sectionId 同名的具名插槽时，替代 registry 区块组件 -->
          <slot v-if="hasNamedSlot(sectionId)" :name="sectionId" />
          <component
            v-else
            :is="resolveSectionComponent(sectionId)"
            :section="dsl.sections[sectionId]"
            :section-id="sectionId"
            :is-preview="isPreview"
            @open-category-nav="emit('open-category-nav')"
            @open-mini-cart="emit('open-mini-cart')"
            @open-search="emit('open-search')"
            @open-user="emit('open-user')"
          />
        </DecorationSectionHost>
      </template>
    </template>
    <div
      v-else-if="isPreview"
      class="flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-neutral-500"
    >
      {{ t('04638e81.15c3d8') }}
    </div>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  toRef,
  useSlots,
  watch,
  watchEffect,
  type Component,
  type Ref,
  type WatchStopHandle,
} from 'vue'
import type {
  DecorationDSL,
  DecorationHighlightedBlock,
  PageType,
} from '~/decoration-engine/types/decoration'
import {
  decorationEditKey,
  type DecorationEditContext,
} from '~/decoration-engine/composables/useDecorationEditContext'
import {
  bindHighlightedBlockToPreviewStore,
  getDecorationPreviewEditContext,
} from '~/decoration-engine/composables/useDecorationPreviewEditStore'
import { useDecorationPreview } from '~/decoration-engine/composables/useDecorationPreview'
import { useDecorationRouteContext } from '~/decoration-engine/composables/useDecorationRouteContext'

const props = defineProps<{
  dsl: DecorationDSL
  /**
   * 仅用于「路由上不是预览，但仍要打开预览行为」时显式传 `true`。
   * 路由/embed 已判定为预览（`useDecorationRouteContext().isPreview`）时 **始终为预览**，勿用 `false` 试图关闭（`false` 在部分环境下会被误当成已传 prop，覆盖路由）。
   */
  isPreview?: boolean
  /**
   * 预览会话 key：必须与 useDecorationPreview(pageType) 的 pageType 对齐。
   * 典型问题：global/header/footer 子集 DSL 的 pageType 可能是 `global`，而页面主体是 `home`，
   * 若按 dsl.pageType 拆分编辑态，会导致 rects/pinned 与 overlay 读取的不是同一份状态。
   */
  previewSessionKey?: PageType | string | null
  highlightedBlock?: DecorationHighlightedBlock | null
}>()
const { t } = useI18n()

const emit = defineEmits<{
  (e: 'section-click', sectionId: string): void
  (e: 'open-category-nav'): void
  (e: 'open-mini-cart'): void
  (e: 'open-search'): void
  (e: 'open-user'): void
}>()

const { $decorationRegistry } = useNuxtApp()
const sectionRegistry = computed<Record<string, Component>>(
  () => ($decorationRegistry || {}) as Record<string, Component>
)

/** 父级具名插槽名集合（不含 default），slot 名需与 dsl.order 中的 sectionId 一致 */
const slots = useSlots()
const namedSlotKeys = computed(() => Object.keys(slots).filter((name) => name !== 'default'))

function hasNamedSlot(sectionId: string): boolean {
  return namedSlotKeys.value.includes(sectionId)
}

const { isPreview: routeIsPreview, route } = useDecorationRouteContext()
/** 路由/embed 优先；仅 `props.isPreview === true` 可在非预览路由下强制预览 */
const isPreview = computed(() => routeIsPreview.value || props.isPreview === true)
const highlightedBlock = toRef(props, 'highlightedBlock') as Readonly<
  Ref<DecorationHighlightedBlock | null | undefined>
>

const previewEditPageType = computed<PageType>(() => {
  const key = props.previewSessionKey
  if (
    key === 'home' ||
    key === 'list' ||
    key === 'product_list' ||
    key === 'detail' ||
    key === 'custom' ||
    key === 'global'
  ) {
    return key
  }
  return props.dsl.pageType
})

const { initPreview, focusSection } = useDecorationPreview(() => previewEditPageType.value)

function onSectionActivate(sectionId: string) {
  if (isPreview.value) {
    focusSection(sectionId)
  }
  emit('section-click', sectionId)
}

function handlePreviewInteractiveCapture(event: Event) {
  if (!isPreview.value) {
    return
  }

  const target = event.target
  if (!(target instanceof Element)) {
    return
  }

  const interactiveElement = target.closest(
    'a[href], button[type="submit"], input[type="submit"], form'
  )
  if (!interactiveElement) {
    return
  }

  event.preventDefault()
}

onMounted(() => {
  if (import.meta.dev) {
    console.info('[ecshopx-decoration-handshake] DecorationRenderer mounted', {
      isPreview: isPreview.value,
      routeIsPreview: routeIsPreview.value,
      propsIsPreview: props.isPreview,
      designMode: route.query.designMode,
      fullPath: route.fullPath,
      previewSessionKey: props.previewSessionKey,
      inIframe: (() => {
        try {
          return window.parent !== window
        } catch {
          return 'unavailable'
        }
      })(),
    })
  }
  if (isPreview.value) {
    initPreview()
  } else if (import.meta.dev) {
    console.warn('[ecshopx-decoration-handshake] 未调用 initPreview：isPreview=false')
  }
})

watch(isPreview, (v) => {
  if (import.meta.client && v) {
    initPreview()
  }
})

function createLocalEditContext(): DecorationEditContext {
  const localIsPreview = computed(() => false)
  const pinnedSectionId = ref<string | null>(null)
  const hoverSectionId = ref<string | null>(null)
  const hoveredBlock = ref<{ sectionId: string; blockId: string } | null>(null)
  const sectionRects = ref<
    Record<string, { top: number; left: number; width: number; height: number }>
  >({})
  const blockRects = ref<
    Record<
      string,
      {
        sectionId: string
        blockId: string
        top: number
        left: number
        width: number
        height: number
      }
    >
  >({})

  function tryClearHoveredFromBlock(e: PointerEvent, sectionId: string, blockId: string) {
    if (hoveredBlock.value?.sectionId !== sectionId || hoveredBlock.value?.blockId !== blockId) {
      return
    }
    const next = e.relatedTarget
    if (next && next instanceof Element) {
      const el = next.closest?.('[data-decoration-block]')
      if (el) {
        const d = el.getAttribute('data-decoration-block') || ''
        if (d.startsWith(`${sectionId}::`)) {
          return
        }
      }
    }
    hoveredBlock.value = null
  }

  return {
    isPreview: localIsPreview,
    pinnedSectionId,
    hoverSectionId,
    hoveredBlock,
    highlightedBlock,
    setPinnedSection: (id) => {
      pinnedSectionId.value = id
    },
    setHoverSection: (id) => {
      hoverSectionId.value = id
    },
    setHoveredBlock: (sectionId, blockId) => {
      hoveredBlock.value = { sectionId, blockId }
    },
    tryClearHoveredFromBlock,
    sectionRects,
    blockRects,
    setSectionRect: (sectionId, rect) => {
      sectionRects.value = {
        ...sectionRects.value,
        [sectionId]: rect,
      }
    },
    setBlockRect: (sectionId, blockId, rect) => {
      blockRects.value = {
        ...blockRects.value,
        [`${sectionId}::${blockId}`]: {
          sectionId,
          blockId,
          ...rect,
        },
      }
    },
  }
}

const editContextRef = shallowRef<DecorationEditContext>(
  isPreview.value
    ? getDecorationPreviewEditContext(previewEditPageType.value)
    : createLocalEditContext()
)

watch(
  () => [isPreview.value, previewEditPageType.value] as const,
  ([nextPreview, pageType]) => {
    editContextRef.value = nextPreview
      ? getDecorationPreviewEditContext(pageType)
      : createLocalEditContext()
  }
)

let stopHighlightBind: WatchStopHandle | null = null

watch(
  () => [isPreview.value, previewEditPageType.value] as const,
  ([nextPreview, pageType]) => {
    stopHighlightBind?.()
    stopHighlightBind = null
    if (!nextPreview) {
      return
    }
    stopHighlightBind = bindHighlightedBlockToPreviewStore(pageType, highlightedBlock)
  },
  { immediate: true }
)

provide(decorationEditKey, editContextRef)

const editContext = computed(() => editContextRef.value)

function reportCurrentDecorationRects() {
  if (!import.meta.client || !isPreview.value) {
    return
  }
  const ctx = editContext.value
  const scrollX = window.scrollX || 0
  const scrollY = window.scrollY || 0

  document.querySelectorAll<HTMLElement>('[data-decoration-section]').forEach((el) => {
    const sectionId = el.dataset.sectionId || el.dataset.decorationSection || ''
    if (!sectionId) {
      return
    }
    const rect = el.getBoundingClientRect()
    ctx.setSectionRect(sectionId, {
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      height: rect.height,
    })
  })

  document.querySelectorAll<HTMLElement>('[data-decoration-block]').forEach((el) => {
    const sectionId = el.dataset.sectionId || ''
    const blockId = el.dataset.blockId || ''
    if (!sectionId || !blockId) {
      return
    }
    const rect = el.getBoundingClientRect()
    ctx.setBlockRect(sectionId, blockId, {
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      height: rect.height,
    })
  })
}

let layoutRefreshRafId: number | null = null
function scheduleDecorationRectRefresh() {
  if (!import.meta.client || layoutRefreshRafId !== null) {
    return
  }
  layoutRefreshRafId = window.requestAnimationFrame(() => {
    layoutRefreshRafId = null
    reportCurrentDecorationRects()
  })
}

function escapeDomSelectorValue(value: string): string {
  if (import.meta.client && typeof window.CSS?.escape === 'function') {
    return window.CSS.escape(value)
  }
  return value.replace(/["\\]/g, '\\$&')
}

function findDecorationElement(sectionId: string, blockId?: string) {
  if (!import.meta.client || !sectionId) {
    return null
  }
  if (blockId) {
    return document.querySelector<HTMLElement>(
      `[data-decoration-block="${escapeDomSelectorValue(`${sectionId}::${blockId}`)}"]`
    )
  }
  return document.querySelector<HTMLElement>(
    `[data-decoration-section="${escapeDomSelectorValue(sectionId)}"]`
  )
}

function scrollDecorationElementIntoView(sectionId: string, blockId?: string) {
  if (!import.meta.client || !isPreview.value) {
    return
  }
  const target = findDecorationElement(sectionId, blockId)
  if (!target) {
    return
  }
  target.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
  scheduleDecorationRectRefresh()
}

onBeforeUnmount(() => {
  stopHighlightBind?.()
  stopHighlightBind = null
  if (layoutRefreshRafId !== null && import.meta.client) {
    window.cancelAnimationFrame(layoutRefreshRafId)
    layoutRefreshRafId = null
  }
})

/** 后台选中时同步「点击态」选区边框（pinned），与指针 hover 独立 */
watch(
  () => props.highlightedBlock,
  (hb) => {
    editContext.value.setPinnedSection(hb?.sectionId ?? null)
    if (hb?.sectionId) {
      nextTick(() => scrollDecorationElementIntoView(hb.sectionId, hb.blockId || undefined))
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => [props.dsl?.order, props.dsl?.sections],
  async () => {
    if (!isPreview.value) {
      return
    }
    await nextTick()
    scheduleDecorationRectRefresh()
  },
  { immediate: true, deep: true, flush: 'post' }
)

const shouldRenderSection = (sectionId: string) => {
  const section = props.dsl.sections[sectionId]
  if (!section || section.disabled) {
    return false
  }

  if (hasNamedSlot(sectionId)) {
    return true
  }

  return Boolean(sectionRegistry.value[section.type])
}

const resolveSectionComponent = (sectionId: string): Component | null => {
  const section = props.dsl.sections[sectionId]
  if (!section) {
    return null
  }

  return sectionRegistry.value[section.type] || null
}

const hasRenderableSections = computed(() => {
  if (!props.dsl?.order?.length) {
    return false
  }
  return props.dsl.order.some((sectionId) => shouldRenderSection(sectionId))
})

if (import.meta.client && import.meta.dev) {
  watchEffect(() => {
    const skipped = (props.dsl?.order || []).map((sectionId) => {
      const section = props.dsl.sections?.[sectionId]
      return {
        sectionId,
        type: section?.type,
        disabled: section?.disabled,
        hasSection: Boolean(section),
        hasNamedSlot: hasNamedSlot(sectionId),
        hasRegistry: Boolean(section?.type && sectionRegistry.value[section.type]),
        shouldRender: shouldRenderSection(sectionId),
      }
    })
    console.info('[ecshopx-decoration-handshake] renderer gate', {
      previewSessionKey: props.previewSessionKey,
      isPreview: isPreview.value,
      order: props.dsl?.order || [],
      hasRenderableSections: hasRenderableSections.value,
      sections: skipped,
    })
  })
}
</script>
