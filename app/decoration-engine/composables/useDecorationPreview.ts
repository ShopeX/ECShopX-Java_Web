/**
 * 调试说明：`initPreview` / `postMessage(PREVIEW_READY)` 仅在浏览器、且由 DecorationRenderer 的 onMounted 触发。
 * Chrome 断点须切到 **iframe 的 JS 上下文**（Sources 面板左上角选 127.0.0.1:3000 等商城源），在后台顶层窗口打断点不会命中子帧脚本。
 * 勿在 composable 顶层打断点指望只在浏览器停：Nuxt 可能在 Node 端 SSR 先执行一遍 setup。
 */
import { toValue, type MaybeRefOrGetter } from 'vue'
import type {
  DecorationBlockRect,
  DecorationDSL,
  DecorationHighlightedBlock,
  DecorationMessage,
  PageType,
} from '~/decoration-engine/types/decoration'
import { normalizeDecorationDSL } from '~/decoration-engine/types/decoration'

type DecorationPreviewArea = 'header' | 'template' | 'footer'

function normalizeAllowedOrigins(origins: string | undefined): string[] {
  if (!origins) {
    return []
  }

  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

/** 兼容旧版 PreviewCanvas 发送的 { pageType, pageId, dsl }，新协议使用 pageDsl/headerDsl/footerDsl */
function extractDslPayload(payload: Record<string, unknown>): unknown {
  if (payload && typeof payload.dsl === 'object' && payload.dsl !== null) {
    return payload.dsl
  }
  return payload
}

function extractSplitDslPayload(payload: Record<string, unknown>): {
  pageDsl: unknown
  headerDsl: unknown
  footerDsl: unknown
  globalDsl: unknown
} | null {
  const hasPage =
    typeof payload.pageDsl === 'object' && payload.pageDsl !== null ||
    typeof payload.dsl === 'object' && payload.dsl !== null
  const hasHeader = typeof payload.headerDsl === 'object' && payload.headerDsl !== null
  const hasFooter = typeof payload.footerDsl === 'object' && payload.footerDsl !== null
  const hasGlobal = typeof payload.globalDsl === 'object' && payload.globalDsl !== null
  if (!hasPage && !hasHeader && !hasFooter && !hasGlobal) {
    return null
  }
  return {
    pageDsl: payload.pageDsl ?? payload.dsl ?? null,
    headerDsl: payload.headerDsl ?? null,
    footerDsl: payload.footerDsl ?? null,
    globalDsl: payload.globalDsl ?? null,
  }
}

function pickPreviewDslSubset(
  source: DecorationDSL | null | undefined,
  predicate: (sectionId: string) => boolean
): DecorationDSL | null {
  if (!source) {
    return null
  }
  const order = (source.order || []).filter((sectionId) => predicate(sectionId))
  const sections: DecorationDSL['sections'] = {}
  order.forEach((sectionId) => {
    const section = source.sections?.[sectionId]
    if (section) {
      sections[sectionId] = section
    }
  })
  if (!order.length) {
    return null
  }
  return {
    pageType: source.pageType || 'home',
    pageId: source.pageId || 'home',
    sections,
    order,
  }
}

function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '[::1]'
  )
}

function isLocalDevOrigin(origin: string): boolean {
  try {
    const { protocol, hostname } = new URL(origin)
    if (protocol !== 'http:' && protocol !== 'https:') {
      return false
    }
    return isLoopbackHostname(hostname)
  } catch {
    return false
  }
}

/** 开发环境：配置的 NUXT_PUBLIC_DECORATION_ADMIN_ORIGINS 与后台实际 origin（localhost ↔ 127.0.0.1）不一致时仍接收 DECORATION_INIT */
function isAllowedAdminMessageOrigin(eventOrigin: string, allowed: string[]): boolean {
  if (allowed.includes(eventOrigin)) {
    return true
  }
  if (!import.meta.dev || allowed.length === 0) {
    return false
  }
  return allowed.some((configured) => {
    try {
      const a = new URL(eventOrigin)
      const b = new URL(configured)
      if (a.protocol !== b.protocol) {
        return false
      }
      if (a.port !== b.port) {
        return false
      }
      return isLoopbackHostname(a.hostname) && isLoopbackHostname(b.hostname)
    } catch {
      return false
    }
  })
}

function extractHighlightedBlock(payload: Record<string, unknown>): DecorationHighlightedBlock | null {
  const nested =
    typeof payload.data === 'object' && payload.data !== null
      ? (payload.data as Record<string, unknown>)
      : undefined
  const sectionId = String(
    payload.sectionId ??
    payload.section_id ??
    nested?.sectionId ??
    nested?.section_id ??
    ''
  ).trim()
  const blockId = String(
    payload.blockId ?? payload.block_id ?? nested?.blockId ?? nested?.block_id ?? ''
  ).trim()

  if (!sectionId) {
    return null
  }

  return { sectionId, blockId }
}

function extractSelectionFromDslPayload(payload: Record<string, unknown>): DecorationHighlightedBlock | null {
  const selection =
    typeof payload.selection === 'object' && payload.selection !== null
      ? (payload.selection as Record<string, unknown>)
      : typeof payload.sections === 'object' && payload.sections !== null
        ? (payload.sections as Record<string, unknown>)
      : null
  if (!selection) {
    return null
  }
  const sectionId = String(selection.sectionId ?? '').trim()
  const blockId = String(selection.blockId ?? '').trim()
  if (!sectionId) {
    return null
  }
  return { sectionId, blockId }
}

/** 开发环境：在 iframe 内打开 DevTools 可确认是否发出 PREVIEW_READY */
function devLogHandshake(phase: string, detail?: Record<string, unknown>) {
  if (!import.meta.dev) return
  console.info(`[ecshopx-decoration-handshake] ${phase}`, detail ?? {})
}

function devWarnHandshake(phase: string, detail?: Record<string, unknown>) {
  if (!import.meta.dev) return
  console.warn(`[ecshopx-decoration-handshake] ${phase}`, detail ?? {})
}

export function useDecorationPreview(pageTypeSource: MaybeRefOrGetter<PageType> = 'home') {
  const config = useRuntimeConfig()
  const route = useRoute()
  const resolvePageType = (): PageType => toValue(pageTypeSource)
  const pageTypeKey = resolvePageType()
  /** 单页共享，避免多处调用 useDecorationPreview 时出现多份 dsl/highlight（监听只更新其中一份） */
  const dsl = useState<DecorationDSL | null>(`decoration-preview-dsl-${pageTypeKey}`, () => null)
  const pageDsl = useState<DecorationDSL | null>(`decoration-preview-page-dsl-${pageTypeKey}`, () => null)
  const headerDsl = useState<DecorationDSL | null>(
    `decoration-preview-header-dsl-${pageTypeKey}`,
    () => null
  )
  const footerDsl = useState<DecorationDSL | null>(
    `decoration-preview-footer-dsl-${pageTypeKey}`,
    () => null
  )
  const globalDsl = useState<DecorationDSL | null>(
    `decoration-preview-global-dsl-${pageTypeKey}`,
    () => null
  )
  const highlightedBlock = useState<DecorationHighlightedBlock | null>(
    `decoration-preview-hl-${pageTypeKey}`,
    () => null
  )
  const isInitialized = ref(false)
  const previewReadyAcked = ref(false)
  let previewReadyRetryTimer: ReturnType<typeof setInterval> | null = null
  let previewReadyRetryAttempts = 0
  let removeScrollListeners: (() => void) | null = null
  const PREVIEW_READY_RETRY_DELAY = 250
  const PREVIEW_READY_RETRY_LIMIT = 20

  const allowedOrigins = computed(() =>
    normalizeAllowedOrigins(config.public.decorationAdminOrigins as string | undefined)
  )

  const targetOrigin = computed(() => {
    // 优先从嵌入后台的 referrer 推断父窗口 origin。
    // NUXT_PUBLIC_DECORATION_ADMIN_ORIGINS 支持多个后台域名时，不能固定取第一个，
    // 否则本地后台嵌入线上 web 时会把 PREVIEW_READY 发到线上后台 origin，浏览器直接丢弃。
    const origins = allowedOrigins.value
    if (import.meta.client && typeof document !== 'undefined' && document.referrer) {
      try {
        const referrerOrigin = new URL(document.referrer).origin
        if (!origins.length || origins.includes(referrerOrigin)) {
          return referrerOrigin
        }
        return ''
      } catch {
        /* noop */
      }
    }

    if (origins.length === 1) {
      return origins[0]
    }

    return ''
  })

  const syncDslFromMessage = (message: DecorationMessage) => {
    const raw = message.payload as Record<string, unknown>
    const split = extractSplitDslPayload(raw)
    if (split) {
      pageDsl.value = normalizeDecorationDSL(split.pageDsl)
      const legacyGlobalDsl = normalizeDecorationDSL(split.globalDsl)
      headerDsl.value =
        normalizeDecorationDSL(split.headerDsl) ||
        pickPreviewDslSubset(legacyGlobalDsl, (sectionId) => sectionId !== 'footer')
      footerDsl.value =
        normalizeDecorationDSL(split.footerDsl) ||
        pickPreviewDslSubset(legacyGlobalDsl, (sectionId) => sectionId === 'footer')
      globalDsl.value = legacyGlobalDsl
      // Keep legacy single dsl state for existing consumers.
      dsl.value = pageDsl.value || normalizeDecorationDSL(extractDslPayload(raw))
      if (import.meta.dev) {
        console.info('[ecshopx-decoration-handshake] synced preview dsl', {
          pageOrder: pageDsl.value?.order || [],
          headerOrder: headerDsl.value?.order || [],
          footerOrder: footerDsl.value?.order || [],
          pageSections: Object.keys(pageDsl.value?.sections || {}),
          headerSections: Object.keys(headerDsl.value?.sections || {}),
          footerSections: Object.keys(footerDsl.value?.sections || {}),
        })
      }
    } else {
      const nextDsl = normalizeDecorationDSL(extractDslPayload(raw))
      if (nextDsl) {
        dsl.value = nextDsl
        pageDsl.value = nextDsl
      }
      headerDsl.value = null
      footerDsl.value = null
      globalDsl.value = null
    }
    // 仅当 payload 显式携带 selection/sections 时更新高亮，避免无选中态的推送把描边清空
    if (
      Object.prototype.hasOwnProperty.call(raw, 'selection') ||
      Object.prototype.hasOwnProperty.call(raw, 'sections')
    ) {
      highlightedBlock.value = extractSelectionFromDslPayload(raw)
    }
  }

  const handleMessage = (event: MessageEvent<DecorationMessage>) => {
    const allowed = allowedOrigins.value
    const originOk =
      allowed.length > 0
        ? isAllowedAdminMessageOrigin(event.origin, allowed)
        : import.meta.dev && isLocalDevOrigin(event.origin)

    if (!originOk) {
      return
    }

    const message = event.data
    if (!message || typeof message !== 'object' || !('type' in message)) {
      return
    }

    if (import.meta.dev && (message.type === 'DECORATION_INIT' || message.type === 'DECORATION_UPDATE')) {
      const payload = message.payload as Record<string, unknown>
      console.info('[ecshopx-decoration-handshake] receive decoration payload', {
        origin: event.origin,
        type: message.type,
        pageOrder: Array.isArray((payload.pageDsl as any)?.order)
          ? ((payload.pageDsl as any).order as unknown[]).length
          : 0,
        headerOrder: Array.isArray((payload.headerDsl as any)?.order)
          ? ((payload.headerDsl as any).order as unknown[]).length
          : 0,
        footerOrder: Array.isArray((payload.footerDsl as any)?.order)
          ? ((payload.footerDsl as any).order as unknown[]).length
          : 0,
        globalOrder: Array.isArray((payload.globalDsl as any)?.order)
          ? ((payload.globalDsl as any).order as unknown[]).length
          : 0,
        legacyOrder: Array.isArray((payload.dsl as any)?.order)
          ? ((payload.dsl as any).order as unknown[]).length
          : 0,
        payload,
      })
    }

    if (message.type === 'DECORATION_INIT' || message.type === 'DECORATION_UPDATE') {
      syncDslFromMessage(message)
      return
    }

    if (message.type === 'PREVIEW_READY_ACK') {
      const raw = message as unknown as Record<string, unknown>
      const payload = (raw.payload ?? {}) as Record<string, unknown>
      const ackPageType = String(payload.pageType ?? '').trim()
      if (!ackPageType || ackPageType === resolvePageType()) {
        previewReadyAcked.value = true
        if (previewReadyRetryTimer) {
          clearInterval(previewReadyRetryTimer)
          previewReadyRetryTimer = null
        }
      }
      return
    }

    if (message.type === 'BLOCK_HIGHLIGHT') {
      const raw = message as unknown as Record<string, unknown>
      const payload = (raw.payload ?? raw) as Record<string, unknown>
      highlightedBlock.value = extractHighlightedBlock(payload)
    }
  }

  const postToParent = (message: DecorationMessage) => {
    if (import.meta.server || window.parent === window) {
      if (import.meta.dev && message.type === 'PREVIEW_READY') {
        devWarnHandshake('PREVIEW_READY 未发送', {
          reason: import.meta.server ? 'ssr' : 'top-level-window',
        })
      }
      return
    }

    let origin = String(targetOrigin.value || '').trim()
    // 开发环境：NUXT_PUBLIC_DECORATION_ADMIN_ORIGIN 若与后台实际地址（localhost / 127.0.0.1）不一致，
    // 浏览器会静默丢弃 postMessage，握手永远完不成；嵌入 iframe 时统一用 * 送达父窗口。
    if (import.meta.dev) {
      origin = '*'
    } else if (!origin) {
      // 生产未配置时仍允许 iframe 通知父窗口（与原先逻辑一致）
      origin = '*'
    }
    if (!origin) {
      if (import.meta.dev && message.type === 'PREVIEW_READY') {
        devWarnHandshake('PREVIEW_READY 未发送', { reason: 'empty-target-origin' })
      }
      return
    }

    if (import.meta.dev && message.type === 'PREVIEW_READY') {
      devLogHandshake('postMessage PREVIEW_READY → parent', {
        pageType: resolvePageType(),
        targetOrigin: origin,
      })
    }

    window.parent.postMessage(message, origin)
  }

  const initPreview = () => {
    if (import.meta.server) {
      return
    }
    if (isInitialized.value) {
      if (import.meta.dev) {
        devLogHandshake('initPreview 跳过（已初始化）', { pageType: resolvePageType() })
      }
      return
    }

    window.addEventListener('message', handleMessage)
    isInitialized.value = true
    previewReadyAcked.value = false
    previewReadyRetryAttempts = 0
    if (import.meta.dev) {
      devLogHandshake('initPreview 开始', {
        pageType: resolvePageType(),
        designMode: route.query.designMode,
        inIframe: (() => {
          try {
            return window.parent !== window
          } catch {
            return 'unknown'
          }
        })(),
      })
    }
    const handlePreviewScroll = () => {
      postToParent({
        type: 'PREVIEW_SCROLL',
        payload: {
          pageType: resolvePageType(),
          scrollX: window.scrollX || 0,
          scrollY: window.scrollY || 0,
        },
      })
    }
    window.addEventListener('scroll', handlePreviewScroll, { capture: true, passive: true })
    document.addEventListener('scroll', handlePreviewScroll, { capture: true, passive: true })
    removeScrollListeners = () => {
      window.removeEventListener('scroll', handlePreviewScroll, true)
      document.removeEventListener('scroll', handlePreviewScroll, true)
    }
    postToParent({
      type: 'PREVIEW_READY',
      payload: { pageType: resolvePageType() },
    })
    if (!previewReadyRetryTimer) {
      previewReadyRetryTimer = setInterval(() => {
        if (previewReadyAcked.value) {
          if (previewReadyRetryTimer) {
            clearInterval(previewReadyRetryTimer)
            previewReadyRetryTimer = null
          }
          return
        }

        if (previewReadyRetryAttempts >= PREVIEW_READY_RETRY_LIMIT) {
          if (previewReadyRetryTimer) {
            clearInterval(previewReadyRetryTimer)
            previewReadyRetryTimer = null
          }
          if (import.meta.dev) {
            devWarnHandshake('PREVIEW_READY 重试已达上限', {
              pageType: resolvePageType(),
              attempts: previewReadyRetryAttempts,
            })
          }
          return
        }

        previewReadyRetryAttempts += 1
        postToParent({
          type: 'PREVIEW_READY',
          payload: { pageType: resolvePageType() },
        })
      }, PREVIEW_READY_RETRY_DELAY)
    }
    handlePreviewScroll()
  }

  const focusSection = (sectionId: string) => {
    postToParent({
      type: 'SECTION_FOCUSED',
      payload: { pageType: resolvePageType(), sectionId },
    })
  }

  const focusBlock = (sectionId: string, blockId: string) => {
    postToParent({
      type: 'BLOCK_FOCUSED',
      payload: { pageType: resolvePageType(), sectionId, blockId },
    })
  }

  const requestAddBlock = (
    sectionId: string,
    insertIndex?: number,
    anchor?: { clientX: number; clientY: number },
    area?: DecorationPreviewArea
  ) => {
    postToParent({
      type: 'ADD_BLOCK_REQUESTED',
      payload: { pageType: resolvePageType(), sectionId, insertIndex, anchor, area },
    })
  }

  const requestAddSection = (
    sectionId: string,
    insertIndex?: number,
    anchor?: { clientX: number; clientY: number },
    area?: DecorationPreviewArea
  ) => {
    postToParent({
      type: 'ADD_SECTION_REQUESTED',
      payload: { pageType: resolvePageType(), sectionId, insertIndex, anchor, area },
    })
  }

  const requestMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    postToParent({
      type: 'MOVE_SECTION_REQUESTED',
      payload: { pageType: resolvePageType(), sectionId, direction },
    })
  }

  const requestDuplicateSection = (sectionId: string) => {
    postToParent({
      type: 'DUPLICATE_SECTION_REQUESTED',
      payload: { pageType: resolvePageType(), sectionId },
    })
  }

  const requestRemoveSection = (sectionId: string) => {
    postToParent({
      type: 'REMOVE_SECTION_REQUESTED',
      payload: { pageType: resolvePageType(), sectionId },
    })
  }

  const requestMoveBlock = (sectionId: string, blockId: string, direction: 'up' | 'down') => {
    postToParent({
      type: 'MOVE_BLOCK_REQUESTED',
      payload: { pageType: resolvePageType(), sectionId, blockId, direction },
    })
  }

  const requestDuplicateBlock = (sectionId: string, blockId: string) => {
    postToParent({
      type: 'DUPLICATE_BLOCK_REQUESTED',
      payload: { pageType: resolvePageType(), sectionId, blockId },
    })
  }

  const requestRemoveBlock = (sectionId: string, blockId: string) => {
    postToParent({
      type: 'REMOVE_BLOCK_REQUESTED',
      payload: { pageType: resolvePageType(), sectionId, blockId },
    })
  }

  const reportBlockRect = (sectionId: string, blockId: string, rect: DecorationBlockRect) => {
    postToParent({
      type: 'BLOCK_RECT',
      payload: {
        pageType: resolvePageType(),
        sectionId,
        blockId,
        rect,
        viewport: {
          scrollX: window.scrollX || 0,
          scrollY: window.scrollY || 0,
        },
      },
    })
  }

  const reportSectionRect = (sectionId: string, rect: DecorationBlockRect) => {
    postToParent({
      type: 'SECTION_RECT',
      payload: {
        pageType: resolvePageType(),
        sectionId,
        rect,
        viewport: {
          scrollX: window.scrollX || 0,
          scrollY: window.scrollY || 0,
        },
      },
    })
  }

  const setHoveredSection = (sectionId: string | null) => {
    postToParent({
      type: 'SECTION_HOVERED',
      payload: {
        pageType: resolvePageType(),
        sectionId: sectionId || '',
      },
    })
  }

  const setHoveredBlock = (sectionId: string | null, blockId: string | null) => {
    postToParent({
      type: 'BLOCK_HOVERED',
      payload: {
        pageType: resolvePageType(),
        sectionId: sectionId || '',
        blockId: blockId || '',
      },
    })
  }

  onBeforeUnmount(() => {
    if (import.meta.client && isInitialized.value) {
      window.removeEventListener('message', handleMessage)
      removeScrollListeners?.()
      removeScrollListeners = null
      isInitialized.value = false
    }
    if (previewReadyRetryTimer) {
      clearInterval(previewReadyRetryTimer)
      previewReadyRetryTimer = null
    }
  })

  return {
    dsl,
    pageDsl,
    headerDsl,
    footerDsl,
    globalDsl,
    highlightedBlock,
    initPreview,
    focusSection,
    focusBlock,
    requestAddBlock,
    requestAddSection,
    requestMoveSection,
    requestDuplicateSection,
    requestRemoveSection,
    requestMoveBlock,
    requestDuplicateBlock,
    requestRemoveBlock,
    reportBlockRect,
    reportSectionRect,
    setHoveredSection,
    setHoveredBlock,
  }
}
