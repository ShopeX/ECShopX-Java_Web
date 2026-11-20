import type { MaybeRefOrGetter } from 'vue'
import type { DecorationDSL, PageType } from '~/decoration-engine/types/decoration'
import { useDecorationDslFetch } from '~/decoration-engine/composables/useDecorationDslFetch'

export interface UseDecorationPageDslFetchOptions {
  /** 与 `useDecorationPreview(pageType)`、后台协议中的 pageType 一致 */
  pageType: PageType
  /**
   * 请求后端时的 `pageId`（常与模板 ID 一致）；默认与 `pageType` 相同。
   * 首页一般为 `'home'`。
   */
  pageId?: MaybeRefOrGetter<string>
}

/**
 * 拉取单页装修 DSL（前台 `pctemplate/getTemplateContent`），行为与首页 `index.vue` 原逻辑对齐。
 *
 * 新页面接入步骤概要：
 * 1. 在 `PageType` 中增加枚举值（若尚未有）
 * 2. 本 composable 传入相同 `pageType` / `pageId`
 * 3. `useDecorationPreview(pageType)` + `useHomeDecorationSplit`（可不传 `isPreview`）+ 模板里 `preview-session-key` / layout 上 `decoration-preview-session-key` 与 **同一 pageType** 对齐
 * 4. 仅当要切 `design` layout 或业务上要区分预览时，再在页面引入 `useDecorationRouteContext`（见该文件说明）
 */
export async function useDecorationPageDslFetch(options: UseDecorationPageDslFetchOptions) {
  const { dsl: ssrDsl, pageId } = await useDecorationDslFetch({
    pageType: options.pageType,
    pageId: options.pageId,
  })

  return { ssrDsl, pageId }
}
