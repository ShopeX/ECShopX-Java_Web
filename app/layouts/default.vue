<template>
  <div
    :class="['bg-gray-50', isDecorationPreview ? 'decoration-preview-page' : 'min-h-screen']"
    @click.capture="onLayoutPointerCapture"
    @mousedown.capture="onLayoutPointerCapture"
  >
    <DecorationPreviewSelectionOverlay
      v-if="isDecorationPreview"
      :page-type="decorationPreviewOverlayPageType"
    />

    <!-- 头区：仅由头区装修 DSL 渲染（设计器下可通过 #header 插槽叠 BCHeaderBar） -->
    <DecorationRenderer
      v-if="shouldRenderHeaderDecoration"
      :dsl="resolvedHeaderDecorationDsl"
      :preview-session-key="decorationPreviewSessionKey"
      :highlighted-block="props.highlightedBlock"
      :data-testid="
        isDecorationRouteDesignMode
          ? 'design-layout-decoration-renderer-header'
          : 'layout-decoration-renderer-header'
      "
      @section-click="emit('section-click', $event)"
      @open-category-nav="handleOpenCategoryNav"
      @open-mini-cart="handleOpenMiniCart"
      @open-search="handleOpenSearch"
      @open-user="handleOpenUser"
    />

    <main
      :class="
        isDecorationRouteDesignMode
          ? [
              'py-0',
              isDecorationPreview
                ? 'w-full max-w-none px-0'
                : 'container mx-auto px-0 md:px-4 md:py-8',
            ]
          : 'mx-auto'
      "
    >
      <slot />
    </main>

    <DecorationRenderer
      v-if="shouldRenderFooterDecoration"
      :dsl="resolvedFooterDecorationDsl"
      :preview-session-key="decorationPreviewSessionKey"
      :highlighted-block="props.highlightedBlock"
      data-testid="layout-decoration-renderer-footer"
      @section-click="emit('section-click', $event)"
    />

    <template v-if="!isDecorationRouteDesignMode">
      <div
        v-if="!shouldRenderFooterDecoration && !isDecorationPreview"
        :class="hideMobileFooter ? 'hidden lg:block' : ''"
      >
        <BCFooter />
      </div>

      <BCAiAssistantFab v-if="shouldRenderAiAssistantFab" @open="handleOpenAiAssistant" />

      <USlideover v-model:open="showSearchDrawer" side="left">
        <template #content>
          <BCSearchDrawer
            v-model="showSearchDrawer"
            :hot-keywords="hotKeywords"
            @close="showSearchDrawer = false"
            @search="handleSearch"
          />
        </template>
      </USlideover>

      <USlideover
        v-model:open="showCategoryNav"
        side="left"
        :content="{ style: { width: 'min(100vw, 720px)', maxWidth: '720px' } }"
        :ui="{
          content:
            'left-0 inset-y-0 !w-screen md:!w-[720px] !max-w-[720px] bg-default divide-y divide-default sm:ring ring-default sm:shadow-lg flex flex-col focus:outline-none',
        }"
      >
        <template #content>
          <BCCategoryNav
            v-model="showCategoryNav"
            :menu-id="headerMenuId"
            @close="showCategoryNav = false"
            @search="handleCategorySearch"
            @change-region="handleChangeRegion"
          />
        </template>
      </USlideover>

      <USlideover
        v-model:open="showMiniCart"
        side="right"
        :content="{ style: { width: 'min(100vw, 560px)', maxWidth: '560px' } }"
        :ui="{
          content:
            'right-0 inset-y-0 !w-screen lg:!w-[560px] !max-w-[560px] bg-default divide-y divide-default sm:ring ring-default sm:shadow-lg flex flex-col focus:outline-none',
        }"
      >
        <template #content>
          <div class="flex h-full min-h-0 flex-col">
            <BCMiniCart v-model="showMiniCart" @close="showMiniCart = false" />
          </div>
        </template>
      </USlideover>

      <USlideover
        v-if="isAiAssistantFeatureEnabled"
        v-model:open="showAiAssistantDrawer"
        :title="aiAssistantTitle"
        :description="aiAssistantDescription"
        side="right"
        :content="{ style: { width: 'min(100vw, 560px)', maxWidth: '560px' } }"
        :ui="{
          content:
            'right-0 inset-y-0 !w-screen md:!w-[560px] !max-w-[560px] bg-default sm:ring ring-default sm:shadow-lg flex flex-col focus:outline-none',
        }"
      >
        <template #content>
          <BCAiAssistantDrawer v-model="showAiAssistantDrawer" />
        </template>
      </USlideover>

      <BCProductSkuDrawer
        v-model="recommendationSkuDrawerOpen"
        :product-data="recommendationSkuProductData"
        :fallback-marketing-tags="recommendationSkuMarketingTags"
        :confirm-loading="recommendationSkuConfirmLoading"
        @confirm="handleRecommendationSkuConfirm"
      />
    </template>

    <!-- designMode=1：区块选中 overlay -->
    <div
      v-if="isDecorationRouteDesignMode && selectedWidget"
      class="selection-overlay absolute pointer-events-none z-50 rounded-none border-2 border-primary-500 transition-all duration-75"
      :style="{
        top: `${selectedWidget.top}px`,
        left: `${selectedWidget.left}px`,
        width: `${selectedWidget.width}px`,
        height: `${selectedWidget.height}px`,
      }"
    >
      <div
        class="absolute top-0 left-0 -translate-y-full rounded-none bg-primary-500 px-2 py-1 text-xs text-white pointer-events-auto"
      >
        {{ selectedWidget.label || 'Widget' }}
      </div>

      <div
        class="absolute right-0 top-0 translate-x-full ml-2 flex flex-col gap-1 pointer-events-auto bg-white shadow-lg border border-gray-100 rounded p-1"
      >
        <button class="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Move Up">
          <UIcon name="i-heroicons-arrow-up" class="w-4 h-4" />
        </button>
        <button class="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Move Down">
          <UIcon name="i-heroicons-arrow-down" class="w-4 h-4" />
        </button>
        <button class="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Duplicate">
          <UIcon name="i-heroicons-document-duplicate" class="w-4 h-4" />
        </button>
        <button class="p-1.5 hover:bg-red-50 rounded text-red-500" title="Delete">
          <UIcon name="i-heroicons-trash" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import BCFooter from '~/components/BCFooter/BCFooter.vue'
import BCProductSkuDrawer from '~/components/BCProductSkuDrawer/BCProductSkuDrawer.vue'
import BCAiAssistantDrawer from '~/components/BCAiAssistantDrawer/BCAiAssistantDrawer.vue'
import BCAiAssistantFab from '~/components/BCAiAssistantFab/BCAiAssistantFab.vue'
import BCCategoryNav from '~/components/BCCategoryNav/BCCategoryNav.vue'
import BCMiniCart from '~/components/BCMiniCart/BCMiniCart.vue'
import { useRecommendationSkuDrawer } from '~/composables/useRecommendationAddToCart'
import BCSearchDrawer from '~/components/BCSearchDrawer/BCSearchDrawer.vue'
import { resolveWebMenuRequestValue } from '~/composables/useWebMenu'
import { useDesignMode } from '~/composables/useDesignMode'
import {
  useShopLayoutDecoration,
  type ShopLayoutDecorationBindProps,
} from '~/composables/useShopLayoutDecoration'
import DecorationPreviewSelectionOverlay from '~/decoration-engine/components/DecorationPreviewSelectionOverlay.vue'
import DecorationRenderer from '~/decoration-engine/components/DecorationRenderer.vue'
import { useDecorationDslFetch } from '~/decoration-engine/composables/useDecorationDslFetch'
import {
  createDefaultFooterDecorationDsl,
  createDefaultHeaderDecorationDsl,
} from '~/decoration-engine/defaults/defaultDecorationDsl'
import schemaMap from '~/templateEngines/schema'
import {
  isAiAssistantEnabled,
  type AiAssistantPublicConfig,
} from '~/utils/aiAssistantEmbed'

interface SelectedWidget {
  el: HTMLElement
  top: number
  left: number
  width: number
  height: number
  label?: string
  widgetName?: string
  schemaConfig?: unknown
}

function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, chr: string | undefined) => (chr ? chr.toUpperCase() : ''))
    .replace(/^([A-Z])/, (m) => m.toLowerCase())
}

const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

function translateIfGeneratedKey(value: string) {
  return generatedKeyPattern.test(value) ? t(value) : value
}

function translateSchemaConfig(value: unknown): unknown {
  if (typeof value === 'string') return translateIfGeneratedKey(value)
  if (Array.isArray(value)) return value.map((item) => translateSchemaConfig(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, translateSchemaConfig(item)])
    )
  }
  return value
}

const props = withDefaults(defineProps<ShopLayoutDecorationBindProps>(), {
  headerDecorationDsl: null,
  footerDecorationDsl: null,
  decorationPreview: false,
  decorationPreviewSessionKey: null,
  highlightedBlock: null,
})

const emit = defineEmits<{
  (e: 'section-click', sectionId: string): void
}>()
const { t } = useI18n()

const [{ dsl: ssrHeaderDecorationDsl }, { dsl: ssrFooterDecorationDsl }] = await Promise.all([
  useDecorationDslFetch({
    pageType: 'header',
    pageId: 'header',
  }),
  useDecorationDslFetch({
    pageType: 'footer',
    pageId: 'footer',
  }),
])

const defaultHeaderDecorationDsl = createDefaultHeaderDecorationDsl()
const defaultFooterDecorationDsl = createDefaultFooterDecorationDsl()

const {
  route,
  isDecorationPreview,
  isDecorationRouteDesignMode,
  decorationPreviewSessionKey,
  decorationPreviewOverlayPageType,
  shouldRenderHeaderDecoration,
  shouldRenderFooterDecoration,
  resolvedHeaderDecorationDsl,
  resolvedFooterDecorationDsl,
} = useShopLayoutDecoration(props, {
  headerDecorationDsl: ssrHeaderDecorationDsl,
  footerDecorationDsl: ssrFooterDecorationDsl,
  defaultHeaderDecorationDsl,
  defaultFooterDecorationDsl,
})

const hideMobileFooter = computed(() => Boolean(route.meta.hideMobileFooter))
const headerMenuId = computed(() => {
  const dsl = resolvedHeaderDecorationDsl.value
  if (!dsl) return ''

  const sectionId = (dsl.order || []).find((id) => dsl.sections?.[id]?.type === 'header')
  if (!sectionId) return ''

  return resolveWebMenuRequestValue(dsl.sections?.[sectionId]?.settings?.menu)
})

const showCategoryNav = ref(false)
const showMiniCart = ref(false)

const {
  skuDrawerOpen: recommendationSkuDrawerOpen,
  skuProductData: recommendationSkuProductData,
  skuMarketingTags: recommendationSkuMarketingTags,
  skuConfirmLoading: recommendationSkuConfirmLoading,
  handleSkuConfirm: handleRecommendationSkuConfirm,
} = useRecommendationSkuDrawer()

watch(recommendationSkuDrawerOpen, (open) => {
  if (open) {
    showMiniCart.value = false
  }
})
const showSearchDrawer = ref(false)
const showAiAssistantDrawer = ref(false)
const runtimeConfig = useRuntimeConfig()
const isAiAssistantFeatureEnabled = computed(() =>
  isAiAssistantEnabled((runtimeConfig.public as AiAssistantPublicConfig).aiAssistant)
)
const isAiAssistantRoute = computed(
  () => route.path.includes('/ai-assistant') || String(route.name || '').includes('ai-assistant')
)
const shouldRenderAiAssistantFab = computed(
  () =>
    isAiAssistantFeatureEnabled.value &&
    !isDecorationPreview.value &&
    !isDecorationRouteDesignMode.value &&
    String(route.query.designMode || '') !== '1' &&
    !isAiAssistantRoute.value
)
const hotKeywords = computed(() => [
  t('de7d1d34.6e4493'),
  t('de7d1d34.9f351b'),
  t('de7d1d34.5f3ca6'),
  t('de7d1d34.abc55f'),
  t('de7d1d34.3fdf19'),
  t('de7d1d34.247d42'),
  t('de7d1d34.89d075'),
])
const aiAssistantTitle = computed(() => t('b4039f35.354274'))
const aiAssistantDescription = computed(() => t('b4039f35.4aaf06'))

const router = useRouter()
const localePath = useLocalePath()
const { openUserCenter } = useHeaderUser()

const handleOpenCategoryNav = () => {
  showCategoryNav.value = true
}

const handleOpenMiniCart = () => {
  showMiniCart.value = true
}

const handleOpenAiAssistant = () => {
  showAiAssistantDrawer.value = true
}

const handleOpenSearch = () => {
  showSearchDrawer.value = true
}

const handleOpenUser = () => {
  void openUserCenter()
}

const handleSearch = (keyword: string) => {
  if (keyword.trim()) {
    showSearchDrawer.value = false
    router.push({
      path: '/collections/all',
      query: { keyword },
    })
  }
}

const handleCategorySearch = (keyword: string) => {
  console.log('分类搜索:', keyword)
  if (keyword.trim()) {
    showCategoryNav.value = false
    router.push({
      path: '/search',
      query: { q: keyword },
    })
  }
}

const handleChangeRegion = () => {
  console.log('更改配送地区')
}

const selectedWidget = ref<SelectedWidget | null>(null)
const { notifySelection } = useDesignMode()

const getAbsolutePosition = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  const scrollLeft = window.scrollX ?? document.documentElement.scrollLeft
  const scrollTop = window.scrollY ?? document.documentElement.scrollTop
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    width: rect.width,
    height: rect.height,
  }
}

const updateOverlay = () => {
  if (selectedWidget.value?.el) {
    if (!selectedWidget.value.el.isConnected) {
      selectedWidget.value = null
      return
    }
    const pos = getAbsolutePosition(selectedWidget.value.el)
    selectedWidget.value.top = pos.top
    selectedWidget.value.left = pos.left
    selectedWidget.value.width = pos.width
    selectedWidget.value.height = pos.height
  }
}

const handleMouseEvent = (e: MouseEvent) => {
  const target = e.target as HTMLElement

  if (target.closest('.selection-overlay')) {
    return
  }

  const widget = target.closest('.section-widget') as HTMLElement | null

  if (widget) {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'mousedown') {
      const pos = getAbsolutePosition(widget)
      const label = widget.getAttribute('data-label') || t('de7d1d34.6c3721')

      const widgetNameAttr = widget.getAttribute('widget-name') || ''
      const widgetNameCamel = widgetNameAttr ? toCamelCase(widgetNameAttr) : ''

      const rawSchemaConfig =
        widgetNameCamel && Object.prototype.hasOwnProperty.call(schemaMap, widgetNameCamel)
          ? (schemaMap as Record<string, (typeof schemaMap)[keyof typeof schemaMap]>)[
              widgetNameCamel
            ]
          : undefined
      const schemaConfig = translateSchemaConfig(rawSchemaConfig)

      selectedWidget.value = {
        el: widget,
        top: pos.top,
        left: pos.left,
        width: pos.width,
        height: pos.height,
        label,
        widgetName: widgetNameCamel,
        schemaConfig,
      }

      notifySelection(widgetNameCamel, selectedWidget.value, schemaConfig)
    }
  } else if (e.type === 'mousedown') {
    selectedWidget.value = null
    notifySelection(null)
  }
}

const onLayoutPointerCapture = (e: MouseEvent) => {
  if (!isDecorationRouteDesignMode.value) return
  handleMouseEvent(e)
}

onMounted(() => {
  if (isDecorationRouteDesignMode.value) {
    window.addEventListener('resize', updateOverlay)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateOverlay)
})
</script>
