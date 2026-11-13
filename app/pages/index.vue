<template>
  <DefaultLayout
    :header-decoration-dsl="layoutHeaderDecorationDsl"
    :footer-decoration-dsl="layoutFooterDecorationDsl"
    :decoration-preview-session-key="DECORATION_PAGE_TYPE"
    :highlighted-block="highlightedBlock"
  >
    <div :class="[isPreview ? 'decoration-preview-page-content' : 'min-h-screen', 'bg-white']">
      <DecorationRenderer
        :dsl="pageRenderDslWithDefault"
        :preview-session-key="DECORATION_PAGE_TYPE"
        :highlighted-block="highlightedBlock"
        data-testid="home-decoration-renderer-page"
      />
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DecorationRenderer from '~/decoration-engine/components/DecorationRenderer.vue'
import DefaultLayout from '~/layouts/default.vue'
import { useDecorationPreview } from '~/decoration-engine/composables/useDecorationPreview'
import { useDecorationPageDslFetch } from '~/decoration-engine/composables/useDecorationPageDslFetch'
import { useDecorationRouteContext } from '~/decoration-engine/composables/useDecorationRouteContext'
import { useHomeDecorationSplit } from '~/decoration-engine/composables/useHomeDecorationSplit'
import { createDefaultHomeDecorationDsl } from '~/decoration-engine/defaults/defaultDecorationDsl'
import type { DecorationDSL } from '~/decoration-engine/types/decoration'
import { hasDecorationSections } from '~/decoration-engine/types/decoration'

/** 与后台、postMessage、`preview-session-key` 保持一致；其他页面改为各自 pageType 并复用下方 composables */
const DECORATION_PAGE_TYPE = 'home' as const satisfies DecorationDSL['pageType']
const DECORATION_PAGE_ID = 'home'

const { isPreview } = useDecorationRouteContext()
const {
  dsl: previewDsl,
  pageDsl: previewPageDsl,
  headerDsl: previewHeaderDsl,
  footerDsl: previewFooterDsl,
  globalDsl: previewGlobalDsl,
  highlightedBlock,
} = useDecorationPreview(DECORATION_PAGE_TYPE)

const { ssrDsl } = await useDecorationPageDslFetch({
  pageType: DECORATION_PAGE_TYPE,
  pageId: DECORATION_PAGE_ID,
})

const { headerRenderDsl, footerRenderDsl, pageRenderDsl } = useHomeDecorationSplit({
  ssrDsl,
  previewDsl,
  previewPageDsl,
  previewHeaderDsl,
  previewFooterDsl,
  previewGlobalDsl,
})

const defaultHomeDecorationDsl = createDefaultHomeDecorationDsl({ pageId: DECORATION_PAGE_ID })
const pageRenderDslWithDefault = computed(() =>
  hasDecorationSections(pageRenderDsl.value) ? pageRenderDsl.value : defaultHomeDecorationDsl
)

const layoutHeaderDecorationDsl = computed(() => (isPreview.value ? headerRenderDsl.value : null))
const layoutFooterDecorationDsl = computed(() => (isPreview.value ? footerRenderDsl.value : null))

// Disable default layout wrapping
definePageMeta({
  layout: false,
})
</script>
