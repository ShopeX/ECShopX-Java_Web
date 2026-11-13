<template>
  <DefaultLayout
    :header-decoration-dsl="layoutHeaderDecorationDsl"
    :footer-decoration-dsl="layoutFooterDecorationDsl"
    :decoration-preview-session-key="DECORATION_PAGE_TYPE"
    :highlighted-block="highlightedBlock"
  >
    <div :class="[isPreview ? 'decoration-preview-page-content' : 'min-h-screen', 'bg-white']">
      <DecorationRenderer
        :dsl="pageRenderDsl"
        :preview-session-key="DECORATION_PAGE_TYPE"
        :highlighted-block="highlightedBlock"
        data-testid="custom-decoration-renderer-page"
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
import type { DecorationDSL } from '~/decoration-engine/types/decoration'

const DECORATION_PAGE_TYPE = 'custom' as const satisfies DecorationDSL['pageType']

const route = useRoute()
const customPageId = computed(() => String(route.params.id || route.query.pageId || '').trim())
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
  pageId: customPageId,
})

const { headerRenderDsl, footerRenderDsl, pageRenderDsl } = useHomeDecorationSplit({
  ssrDsl,
  previewDsl,
  previewPageDsl,
  previewHeaderDsl,
  previewFooterDsl,
  previewGlobalDsl,
})

const layoutHeaderDecorationDsl = computed(() => (isPreview.value ? headerRenderDsl.value : null))
const layoutFooterDecorationDsl = computed(() => (isPreview.value ? footerRenderDsl.value : null))

definePageMeta({
  layout: false,
})
</script>
