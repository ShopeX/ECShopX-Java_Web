import { computed, ref } from 'vue'
import type { LocationQuery } from 'vue-router'

/** 装修后台 iframe URL 使用 `designMode=1` 标识设计/预览态（兼容 query 为 string[] 等形态） */
export function isDecorationPreviewRouteQuery(query: LocationQuery): boolean {
  const raw = query.designMode
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v === undefined || v === null) return false
  return String(v).trim() === '1'
}

/** 从 `?a=1&b=2` 或整段 path+query 中解析 designMode（避免 i18n 等场景下 route.query 与地址栏不同步） */
function designModeFromSearchString(search: string): boolean {
  if (!search) return false
  const q = search.startsWith('?') ? search.slice(1) : search
  try {
    return new URLSearchParams(q).get('designMode')?.trim() === '1'
  } catch {
    return false
  }
}

function designModeFromFullPath(fullPath: string): boolean {
  const i = fullPath.indexOf('?')
  if (i === -1) return false
  return designModeFromSearchString(fullPath.slice(i))
}

/**
 * 是否处于装修设计/预览 URL：以 query 为准，并回退解析 `route.fullPath` 与浏览器 `location.search`。
 */
export function isDecorationPreviewActiveOnRoute(route: {
  query: LocationQuery
  fullPath: string
}): boolean {
  if (isDecorationPreviewRouteQuery(route.query)) {
    return true
  }
  if (designModeFromFullPath(route.fullPath)) {
    return true
  }
  if (import.meta.client && typeof window !== 'undefined') {
    return designModeFromSearchString(window.location.search)
  }
  return false
}

/**
 * 装修预览 / 设计态与 **路由 query + iframe 嵌入** 的公共判定（单一事实来源）。
 *
 * ## 页面里要不要引？
 * - **不必仅为「预览渲染」而引**：`DecorationRenderer` 未传 `isPreview` 时会内部调用本方法；`useHomeDecorationSplit` 不传 `isPreview` 时同样走这里，购物车/列表等可只接渲染 + split。
 * - **需要在页面里引的情况**：
 *   - 业务数据层有 **仅正式访问才执行** 的逻辑（例如首页 `onMounted` 里预览不拉兜底接口），要用到 **`isPreview`**。
 *
 * 判定规则（与布局 `default.vue` 里对预览的补充逻辑一致，避免各写一套）：
 * - **`designMode=1`**（后台设计器 iframe）或 **iframe 嵌入**（父页未把 query 传入子文档时兜底）→ `isPreview === true`
 * - 设计器专用壳层（简头、主区通栏、widget 选中）由 **`default.vue`** 内根据 `isDecorationPreviewActiveOnRoute` 分支，不再使用独立 `design` layout。
 */
export function useDecorationRouteContext() {
  const route = useRoute()

  /** iframe 嵌入且父页未把 query 传进子文档时，仍须视为预览 */
  const isEmbeddedDecorPreview = ref(false)
  if (import.meta.client) {
    try {
      isEmbeddedDecorPreview.value = window.parent !== window
    } catch {
      isEmbeddedDecorPreview.value = false
    }
  }

  const isPreview = computed(
    () => isDecorationPreviewActiveOnRoute(route) || isEmbeddedDecorPreview.value
  )

  return {
    route,
    isEmbeddedDecorPreview,
    isPreview,
  }
}
