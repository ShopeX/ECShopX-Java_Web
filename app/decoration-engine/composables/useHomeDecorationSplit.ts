import { computed, unref, watchEffect, type MaybeRef } from 'vue'
import { useDecorationRouteContext } from '~/decoration-engine/composables/useDecorationRouteContext'
import {
  EMPTY_DECORATION_DSL,
  type DecorationDSL,
} from '~/decoration-engine/types/decoration'

/**
 * 将「整页 DSL」拆成 layout 区（头/脚等）与中间 `DecorationRenderer` 区。
 * 命名含 Home 为历史原因；**任意 pageType** 的装修页只要 DSL 结构一致即可复用。
 */

/** 公告栏、标头、页脚：由 layout 渲染；中间页内容由 page 渲染 */
export const GLOBAL_DECORATION_SECTION_IDS = ['announcement-bar', 'header', 'footer'] as const

export function pickDecorationDslSubset(
  source: DecorationDSL | null | undefined,
  order: string[]
): DecorationDSL {
  const sections: Record<string, DecorationDSL['sections'][string]> = {}
  order.forEach((id) => {
    const section = source?.sections?.[id]
    if (section) {
      sections[id] = section
    }
  })
  return {
    pageType: source?.pageType || 'home',
    pageId: source?.pageId || 'home',
    sections,
    order: order.filter((id) => Boolean(sections[id])),
  }
}

export function useHomeDecorationSplit(options: {
  /** 不传则与 `DecorationRenderer` 一致，使用 `useDecorationRouteContext().isPreview`（路由 + iframe 嵌入） */
  isPreview?: MaybeRef<boolean>
  ssrDsl: MaybeRef<DecorationDSL | null | undefined>
  previewDsl: MaybeRef<DecorationDSL | null | undefined>
  previewPageDsl: MaybeRef<DecorationDSL | null | undefined>
  previewHeaderDsl?: MaybeRef<DecorationDSL | null | undefined>
  previewFooterDsl?: MaybeRef<DecorationDSL | null | undefined>
  previewGlobalDsl: MaybeRef<DecorationDSL | null | undefined>
}) {
  const { isPreview: routeIsPreview } = useDecorationRouteContext()
  const effectiveIsPreview = computed(() =>
    options.isPreview !== undefined ? unref(options.isPreview) : routeIsPreview.value
  )

  const activePageDsl = computed(() =>
    effectiveIsPreview.value
      ? unref(options.previewPageDsl) || unref(options.previewDsl)
      : unref(options.ssrDsl)
  )

  const activeGlobalDsl = computed(() =>
    effectiveIsPreview.value ? unref(options.previewGlobalDsl) : null
  )

  const activeHeaderDsl = computed(() =>
    effectiveIsPreview.value ? unref(options.previewHeaderDsl) || null : null
  )

  const activeFooterDsl = computed(() =>
    effectiveIsPreview.value ? unref(options.previewFooterDsl) || null : null
  )

  const headerIds = computed(() => {
    const order = (
      activeHeaderDsl.value?.order ||
      activeGlobalDsl.value?.order ||
      activePageDsl.value?.order ||
      []
    ).slice()
    return order.filter((id) => id !== 'footer')
  })

  const footerIds = computed(() => {
    const order = (
      activeFooterDsl.value?.order ||
      activeGlobalDsl.value?.order ||
      activePageDsl.value?.order ||
      []
    ).slice()
    return order.filter((id) => id === 'footer')
  })

  const headerRenderDsl = computed(() =>
    pickDecorationDslSubset(activeHeaderDsl.value || activeGlobalDsl.value || activePageDsl.value, headerIds.value)
  )

  const footerRenderDsl = computed(() =>
    pickDecorationDslSubset(activeFooterDsl.value || activeGlobalDsl.value || activePageDsl.value, footerIds.value)
  )

  const pageRenderDsl = computed(() => {
    const source = activePageDsl.value
    if (!source) {
      return EMPTY_DECORATION_DSL
    }
    const pageOrder = (source.order || []).filter((id) => {
      const sec = source.sections?.[id]
      const t = sec?.type
      return t !== 'header' && t !== 'footer' && t !== 'announcement-bar'
    })
    return pickDecorationDslSubset(source, pageOrder)
  })

  if (import.meta.client && import.meta.dev) {
    watchEffect(() => {
      console.info('[ecshopx-decoration-handshake] split render dsl', {
        isPreview: effectiveIsPreview.value,
        activePageOrder: activePageDsl.value?.order || [],
        activeHeaderOrder: activeHeaderDsl.value?.order || [],
        activeFooterOrder: activeFooterDsl.value?.order || [],
        headerRenderOrder: headerRenderDsl.value.order,
        footerRenderOrder: footerRenderDsl.value.order,
        pageRenderOrder: pageRenderDsl.value.order,
      })
    })
  }

  return {
    activePageDsl,
    activeGlobalDsl,
    activeHeaderDsl,
    activeFooterDsl,
    headerRenderDsl,
    footerRenderDsl,
    pageRenderDsl,
  }
}
