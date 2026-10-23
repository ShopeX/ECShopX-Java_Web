import { computed, inject, ref, type ComputedRef, type InjectionKey, type Ref, type ShallowRef } from 'vue'
import type { DecorationHighlightedBlock } from '~/decoration-engine/types/decoration'

interface OverlayRect {
  top: number
  left: number
  width: number
  height: number
}

export interface DecorationEditContext {
  isPreview: ComputedRef<boolean>
  /** 点击选中的选区（外边框常驻，不因 hover 其它选区而消失）；可与后台 BLOCK_HIGHLIGHT 同步 */
  pinnedSectionId: Ref<string | null>
  /** 指针当前悬停的选区（决定该选区内 block 虚线提示） */
  hoverSectionId: Ref<string | null>
  hoveredBlock: Ref<{ sectionId: string; blockId: string } | null>
  /** 与 useDecorationPreview / Admin 的 BLOCK_HIGHLIGHT 一致 */
  highlightedBlock: Readonly<Ref<DecorationHighlightedBlock | null | undefined>>
  setPinnedSection: (id: string | null) => void
  setHoverSection: (id: string | null) => void
  setHoveredBlock: (sectionId: string, blockId: string) => void
  /**
   * pointer 离开某个 block 时，若移向同 section 内其他 block 则不清理（避免虚线/实线闪一下）
   */
  tryClearHoveredFromBlock: (e: PointerEvent, sectionId: string, blockId: string) => void
  sectionRects: Ref<Record<string, OverlayRect>>
  blockRects: Ref<Record<string, OverlayRect & { sectionId: string; blockId: string }>>
  setSectionRect: (sectionId: string, rect: OverlayRect) => void
  setBlockRect: (sectionId: string, blockId: string, rect: OverlayRect) => void
}

export const decorationEditKey: InjectionKey<ShallowRef<DecorationEditContext>> = Symbol('decorationEdit')

const disabledDecorationEditStub: DecorationEditContext = {
  isPreview: computed(() => false),
  pinnedSectionId: ref(null),
  hoverSectionId: ref(null),
  hoveredBlock: ref(null),
  highlightedBlock: ref(undefined),
  setPinnedSection: () => {},
  setHoverSection: () => {},
  setHoveredBlock: () => {},
  tryClearHoveredFromBlock: () => {},
  sectionRects: ref({}),
  blockRects: ref({}),
  setSectionRect: () => {},
  setBlockRect: () => {},
}

/**
 * DecorationRenderer 在 isPreview / pageType 变化时会整体替换 provide 的 ShallowRef.value。
 * 子组件若在 setup 里只读一次 injected.value，会永远持有「已废弃」的 ctx，setSectionRect/setBlockRect 写不进共享 store，
 * 表现为 iframe 无选中描边。此处用 Proxy 把属性访问始终转发到最新的 injected.value。
 */
function createLiveDecorationEditHandle(
  injected: ShallowRef<DecorationEditContext> | null
): DecorationEditContext | null {
  if (!injected) {
    return null
  }
  return new Proxy({} as DecorationEditContext, {
    get(_, prop: string | symbol) {
      const cur = injected.value
      if (!cur) {
        return undefined
      }
      const val = (cur as Record<string | symbol, unknown>)[prop]
      if (typeof val === 'function') {
        return (val as (...args: unknown[]) => unknown).bind(cur)
      }
      return val
    },
  }) as DecorationEditContext
}

/**
 * 子 block 使用；非预览或未 provide 时返回 null
 */
export function useDecorationEditOptional(): DecorationEditContext | null {
  const injected = inject(decorationEditKey, null)
  return createLiveDecorationEditHandle(injected)
}

export function useDecorationEditOrDisabled(): DecorationEditContext {
  const injected = inject(decorationEditKey, null)
  const live = createLiveDecorationEditHandle(injected)
  if (live) {
    return live
  }
  return disabledDecorationEditStub
}
