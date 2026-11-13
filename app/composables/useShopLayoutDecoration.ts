import { computed, ref, unref, watchEffect, type MaybeRef } from 'vue'
import type {
  DecorationDSL,
  DecorationHighlightedBlock,
  PageType,
} from '~/decoration-engine/types/decoration'
import { EMPTY_DECORATION_DSL, hasDecorationSections } from '~/decoration-engine/types/decoration'
import { isDecorationPreviewActiveOnRoute } from '~/decoration-engine/composables/useDecorationRouteContext'
import {
  createDefaultFooterDecorationDsl,
  createDefaultHeaderDecorationDsl,
} from '~/decoration-engine/defaults/defaultDecorationDsl'

/** 与 `layouts/default` 通过 NuxtLayout 传入的装修相关 props 一致 */
export interface ShopLayoutDecorationBindProps {
  headerDecorationDsl?: DecorationDSL | null
  footerDecorationDsl?: DecorationDSL | null
  decorationPreview?: boolean
  decorationPreviewSessionKey?: string | null
  highlightedBlock?: DecorationHighlightedBlock | null
}

export interface ShopLayoutDecorationFallbacks {
  headerDecorationDsl?: MaybeRef<DecorationDSL | null | undefined>
  footerDecorationDsl?: MaybeRef<DecorationDSL | null | undefined>
  defaultHeaderDecorationDsl?: MaybeRef<DecorationDSL | null | undefined>
  defaultFooterDecorationDsl?: MaybeRef<DecorationDSL | null | undefined>
}

function withDecorationDefault(
  value: DecorationDSL | null | undefined,
  fallback: DecorationDSL | null | undefined,
  defaultDsl: DecorationDSL
) {
  if (hasDecorationSections(value)) {
    return value
  }

  if (hasDecorationSections(fallback)) {
    return fallback
  }

  return defaultDsl
}

/**
 * 商城布局共用的装修预览态、头尾 DSL 解析。
 *
 * - **isDecorationRouteDesignMode**：仅地址栏 `designMode=1`（含 fullPath / location 回退）→ 后台设计器壳层（简头插槽、通栏 main、widget 选中）。
 * - **isDecorationPreview**：广义预览 = 上者 **或** `decorationPreview` prop **或** iframe 嵌入（父页未传 query 时仍要遮罩/藏默认头）。
 */
export function useShopLayoutDecoration(
  props: ShopLayoutDecorationBindProps,
  fallbacks: ShopLayoutDecorationFallbacks = {}
) {
  const route = useRoute()

  const normalizePreviewPageType = (value: unknown): PageType | null => {
    const k = Array.isArray(value) ? value[0] : value
    if (
      k === 'home' ||
      k === 'list' ||
      k === 'product_list' ||
      k === 'detail' ||
      k === 'custom' ||
      k === 'header' ||
      k === 'footer' ||
      k === 'global'
    ) {
      return k
    }
    return null
  }

  const isEmbedded = ref(false)
  if (import.meta.client) {
    try {
      isEmbedded.value = window.parent !== window
    } catch {
      isEmbedded.value = false
    }
  }

  /** 与 `isDecorationPreview` 的路由条件共用同一判断，避免两处各调一次 `isDecorationPreviewActiveOnRoute` */
  const isDecorationRouteDesignMode = computed(() => isDecorationPreviewActiveOnRoute(route))

  const isDecorationPreview = computed(
    () => Boolean(props.decorationPreview) || isDecorationRouteDesignMode.value || isEmbedded.value
  )

  const decorationPreviewSessionKey = computed(
    () => props.decorationPreviewSessionKey ?? normalizePreviewPageType(route.query.pageType)
  )

  const decorationPreviewOverlayPageType = computed<PageType>(() => {
    const k = decorationPreviewSessionKey.value
    if (
      k === 'home' ||
      k === 'list' ||
      k === 'product_list' ||
      k === 'detail' ||
      k === 'custom' ||
      k === 'header' ||
      k === 'footer' ||
      k === 'global'
    ) {
      return k
    }
    return 'home'
  })

  const headerDecorationDsl = computed(() => {
    const propValue = props.headerDecorationDsl ?? null
    return withDecorationDefault(
      propValue,
      unref(fallbacks.headerDecorationDsl),
      unref(fallbacks.defaultHeaderDecorationDsl) || createDefaultHeaderDecorationDsl()
    )
  })
  const footerDecorationDsl = computed(() => {
    const propValue = props.footerDecorationDsl ?? null
    return withDecorationDefault(
      propValue,
      unref(fallbacks.footerDecorationDsl),
      unref(fallbacks.defaultFooterDecorationDsl) || createDefaultFooterDecorationDsl()
    )
  })

  const shouldRenderHeaderDecoration = computed(() =>
    hasDecorationSections(headerDecorationDsl.value)
  )
  const shouldRenderFooterDecoration = computed(() =>
    hasDecorationSections(footerDecorationDsl.value)
  )

  const resolvedHeaderDecorationDsl = computed(
    () => headerDecorationDsl.value || EMPTY_DECORATION_DSL
  )
  const resolvedFooterDecorationDsl = computed(
    () => footerDecorationDsl.value || EMPTY_DECORATION_DSL
  )

  if (import.meta.client && import.meta.dev) {
    watchEffect(() => {
      console.info('[ecshopx-decoration-handshake] layout decoration gate', {
        isDecorationPreview: isDecorationPreview.value,
        isDecorationRouteDesignMode: isDecorationRouteDesignMode.value,
        headerOrder: headerDecorationDsl.value?.order || [],
        footerOrder: footerDecorationDsl.value?.order || [],
        shouldRenderHeaderDecoration: shouldRenderHeaderDecoration.value,
        shouldRenderFooterDecoration: shouldRenderFooterDecoration.value,
      })
    })
  }

  return {
    route,
    isEmbedded,
    isDecorationRouteDesignMode,
    isDecorationPreview,
    decorationPreviewSessionKey,
    decorationPreviewOverlayPageType,
    shouldRenderHeaderDecoration,
    shouldRenderFooterDecoration,
    resolvedHeaderDecorationDsl,
    resolvedFooterDecorationDsl,
  }
}
