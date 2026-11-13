import {
  computed,
  ref,
  watch,
  type ComputedRef,
  type Readonly,
  type Ref,
  type WatchStopHandle,
} from 'vue'
import type { PageType, DecorationHighlightedBlock } from '~/decoration-engine/types/decoration'
import type { DecorationEditContext } from '~/decoration-engine/composables/useDecorationEditContext'

type OverlayRect = {
  top: number
  left: number
  width: number
  height: number
}

type BlockRect = OverlayRect & { sectionId: string; blockId: string }

type PreviewEditStoreBox = { ctx: DecorationEditContext }

const CLIENT_PREVIEW_STORES_KEY = '__ecxDecorationPreviewEditStores__'
const SERVER_CONTEXT_MAP_KEY = '__decorationPreviewEditStoreMap'

/** useRequestEvent 不可用时（极少）的进程内兜底，避免 SSR 崩溃 */
const serverFallbackStoreMap = new Map<string, PreviewEditStoreBox>()

function getPreviewStoreMap(): Map<string, PreviewEditStoreBox> {
  if (import.meta.server) {
    try {
      const event = useRequestEvent()
      if (event?.context) {
        if (!event.context[SERVER_CONTEXT_MAP_KEY]) {
          event.context[SERVER_CONTEXT_MAP_KEY] = new Map<string, PreviewEditStoreBox>()
        }
        return event.context[SERVER_CONTEXT_MAP_KEY] as Map<string, PreviewEditStoreBox>
      }
    } catch {
      // 非请求上下文
    }
    return serverFallbackStoreMap
  }

  const g = globalThis as Record<string, unknown>
  if (!g[CLIENT_PREVIEW_STORES_KEY]) {
    g[CLIENT_PREVIEW_STORES_KEY] = new Map<string, PreviewEditStoreBox>()
  }
  return g[CLIENT_PREVIEW_STORES_KEY] as Map<string, PreviewEditStoreBox>
}

function getPreviewStore(pageType: PageType): PreviewEditStoreBox {
  const map = getPreviewStoreMap()
  const k = String(pageType)
  if (!map.has(k)) {
    map.set(k, createPreviewEditStore())
  }
  return map.get(k)!
}

function createPreviewEditStore(): PreviewEditStoreBox {
  const isPreview = computed(() => true)
  const pinnedSectionId = ref<string | null>(null)
  const hoverSectionId = ref<string | null>(null)
  const hoveredBlock = ref<{ sectionId: string; blockId: string } | null>(null)
  const highlightedBlockSource = ref<DecorationHighlightedBlock | null | undefined>(undefined)
  const highlightedBlock = highlightedBlockSource as unknown as Readonly<
    Ref<DecorationHighlightedBlock | null | undefined>
  >

  const sectionRects = ref<Record<string, OverlayRect>>({})
  const blockRects = ref<Record<string, BlockRect>>({})

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

  const ctx: DecorationEditContext = {
    isPreview,
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

  return { ctx }
}

/** @deprecated 仅保留命名；勿把返回值放进 useState（含函数，无法 SSR 序列化） */
export function useDecorationPreviewEditStore(pageType: PageType) {
  return getPreviewStore(pageType)
}

export function getDecorationPreviewEditContext(pageType: PageType): DecorationEditContext {
  return getPreviewStore(pageType).ctx
}

/**
 * 将当前实例 props 上的 highlightedBlock 同步到共享预览编辑态。
 * 每个预览中的 DecorationRenderer 在存活期间都应持有一份 watch；首个实例卸载后若不再绑定，
 * 会出现「后台已选中但 iframe 无描边」的问题，故禁止全局只绑定一次。
 */
export function bindHighlightedBlockToPreviewStore(
  pageType: PageType,
  highlightedBlock: Readonly<Ref<DecorationHighlightedBlock | null | undefined>>
): WatchStopHandle {
  const { ctx } = getPreviewStore(pageType)
  const highlightedBlockSource = ctx.highlightedBlock as unknown as Ref<
    DecorationHighlightedBlock | null | undefined
  >
  return watch(
    highlightedBlock,
    (hb) => {
      highlightedBlockSource.value = hb
    },
    { immediate: true, deep: true }
  )
}
