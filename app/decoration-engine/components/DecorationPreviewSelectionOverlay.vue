<template>
  <Teleport v-if="overlayTarget" :to="overlayTarget">
    <div class="pointer-events-none fixed inset-0 z-[10050] overflow-visible">
      <div
        v-if="selectedChromeStyle && selectedChrome"
        class="pointer-events-none absolute box-border"
        :style="selectedChromeStyle"
      >
        <div
          class="pointer-events-none absolute inset-0 rounded-none border-2 border-primary shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        />
        <div :class="selectedChromeLabelClass">
          {{ selectedChromeLabel }}
        </div>
        <div
          v-if="selectedChrome.kind === 'section'"
          :class="selectedChromeActionsClass"
          @pointerdown.stop
        >
          <button
            type="button"
            :class="selectedSectionActionButtonClass(selectedSectionActionState.canMoveUp)"
            :disabled="!selectedSectionActionState.canMoveUp"
            :aria-label="t('0dbc43d3.315eac')"
            @click.stop.prevent="handleSelectedSectionAction('up')"
          >
            <ArrowUp
              :size="16"
              :stroke-width="1.8"
              :color="selectedActionIconColor(selectedSectionActionState.canMoveUp)"
            />
          </button>
          <button
            type="button"
            :class="selectedSectionActionButtonClass(selectedSectionActionState.canMoveDown)"
            :disabled="!selectedSectionActionState.canMoveDown"
            :aria-label="t('0dbc43d3.17acd2')"
            @click.stop.prevent="handleSelectedSectionAction('down')"
          >
            <ArrowDown
              :size="16"
              :stroke-width="1.8"
              :color="selectedActionIconColor(selectedSectionActionState.canMoveDown)"
            />
          </button>
          <button
            v-if="selectedSectionActionState.canDuplicate"
            type="button"
            :class="selectedChromeActionButtonClass"
            :aria-label="t('0dbc43d3.79d3ab')"
            @click.stop.prevent="handleSelectedSectionAction('duplicate')"
          >
            <Copy :size="16" :stroke-width="1.8" />
          </button>
          <button
            v-if="selectedSectionActionState.canRemove"
            type="button"
            :class="selectedChromeActionButtonClass"
            :aria-label="t('0dbc43d3.2f4aad')"
            @click.stop.prevent="handleSelectedSectionAction('remove')"
          >
            <Trash2 :size="16" :stroke-width="1.8" />
          </button>
        </div>
        <div
          v-else-if="selectedChrome.kind === 'block'"
          :class="selectedBlockActionsClass"
          @pointerdown.stop
        >
          <button
            type="button"
            :class="selectedBlockActionButtonClass(selectedBlockActionState.canMoveUp)"
            :disabled="!selectedBlockActionState.canMoveUp"
            :aria-label="t('0dbc43d3.315eac')"
            @click.stop.prevent="handleSelectedBlockAction('up')"
          >
            <ArrowUp
              :size="16"
              :stroke-width="1.8"
              :color="selectedActionIconColor(selectedBlockActionState.canMoveUp)"
            />
          </button>
          <button
            type="button"
            :class="selectedBlockActionButtonClass(selectedBlockActionState.canMoveDown)"
            :disabled="!selectedBlockActionState.canMoveDown"
            :aria-label="t('0dbc43d3.17acd2')"
            @click.stop.prevent="handleSelectedBlockAction('down')"
          >
            <ArrowDown
              :size="16"
              :stroke-width="1.8"
              :color="selectedActionIconColor(selectedBlockActionState.canMoveDown)"
            />
          </button>
          <button
            type="button"
            :class="selectedChromeActionButtonClass"
            :aria-label="t('0dbc43d3.79d3ab')"
            @click.stop.prevent="handleSelectedBlockAction('duplicate')"
          >
            <Copy :size="16" :stroke-width="1.8" />
          </button>
          <button
            v-if="selectedBlockActionState.canRemove"
            type="button"
            :class="selectedChromeActionButtonClass"
            :aria-label="t('0dbc43d3.2f4aad')"
            @click.stop.prevent="handleSelectedBlockAction('remove')"
          >
            <Trash2 :size="16" :stroke-width="1.8" />
          </button>
        </div>
        <template v-if="isAdminSyncedChromeSameAsSelected && adminSyncedChrome?.source === 'hover'">
          <button
            type="button"
            data-decoration-add-control="1"
            class="group pointer-events-auto absolute left-1/2 top-0 z-[2] flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white"
            :aria-label="t('0dbc43d3.b58c75')"
            @pointerenter="keepAddControlHover"
            @pointerdown.stop
            @click.stop.prevent="handleAddClick('before', $event)"
          >
            <span class="absolute inset-0 rounded-full bg-primary shadow-sm" />
            <UIcon name="i-heroicons-plus" class="relative h-3.5 w-3.5 shrink-0" />
            <span
              class="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 scale-75 items-center gap-1 whitespace-nowrap rounded-full bg-primary py-1 pl-1 pr-2 text-xs leading-none text-white opacity-0 shadow-sm transition-all duration-150 ease-out group-hover:scale-100 group-hover:opacity-100"
            >
              <UIcon name="i-heroicons-plus" class="h-3.5 w-3.5 shrink-0" />
              {{ addButtonLabel }}
            </span>
          </button>
          <button
            type="button"
            data-decoration-add-control="1"
            class="group pointer-events-auto absolute bottom-0 left-1/2 z-[2] flex h-5 w-5 -translate-x-1/2 translate-y-1/2 items-center justify-center text-white"
            :aria-label="t('0dbc43d3.b58c75')"
            @pointerenter="keepAddControlHover"
            @pointerdown.stop
            @click.stop.prevent="handleAddClick('after', $event)"
          >
            <span class="absolute inset-0 rounded-full bg-primary shadow-sm" />
            <UIcon name="i-heroicons-plus" class="relative h-3.5 w-3.5 shrink-0" />
            <span
              class="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 scale-75 items-center gap-1 whitespace-nowrap rounded-full bg-primary py-1 pl-1 pr-2 text-xs leading-none text-white opacity-0 shadow-sm transition-all duration-150 ease-out group-hover:scale-100 group-hover:opacity-100"
            >
              <UIcon name="i-heroicons-plus" class="h-3.5 w-3.5 shrink-0" />
              {{ addButtonLabel }}
            </span>
          </button>
        </template>
      </div>
      <div
        v-if="adminSyncedChromeStyle && adminSyncedChrome && !isAdminSyncedChromeSameAsSelected"
        class="pointer-events-none absolute box-border"
        :style="adminSyncedChromeStyle"
      >
        <div
          class="pointer-events-none absolute inset-0 rounded-none border-2 border-primary shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        />
        <div :class="adminSyncedChromeLabelClass">
          {{ adminSyncedChromeLabel }}
        </div>
        <template v-if="adminSyncedChrome.source === 'hover'">
          <button
            type="button"
            data-decoration-add-control="1"
            class="group pointer-events-auto absolute left-1/2 top-0 z-[2] flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white"
            :aria-label="t('0dbc43d3.b58c75')"
            @pointerenter="keepAddControlHover"
            @pointerdown.stop
            @click.stop.prevent="handleAddClick('before', $event)"
          >
            <span class="absolute inset-0 rounded-full bg-primary shadow-sm" />
            <UIcon name="i-heroicons-plus" class="relative h-3.5 w-3.5 shrink-0" />
            <span
              class="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 scale-75 items-center gap-1 whitespace-nowrap rounded-full bg-primary py-1 pl-1 pr-2 text-xs leading-none text-white opacity-0 shadow-sm transition-all duration-150 ease-out group-hover:scale-100 group-hover:opacity-100"
            >
              <UIcon name="i-heroicons-plus" class="h-3.5 w-3.5 shrink-0" />
              {{ addButtonLabel }}
            </span>
          </button>
          <button
            type="button"
            data-decoration-add-control="1"
            class="group pointer-events-auto absolute bottom-0 left-1/2 z-[2] flex h-5 w-5 -translate-x-1/2 translate-y-1/2 items-center justify-center text-white"
            :aria-label="t('0dbc43d3.b58c75')"
            @pointerenter="keepAddControlHover"
            @pointerdown.stop
            @click.stop.prevent="handleAddClick('after', $event)"
          >
            <span class="absolute inset-0 rounded-full bg-primary shadow-sm" />
            <UIcon name="i-heroicons-plus" class="relative h-3.5 w-3.5 shrink-0" />
            <span
              class="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 scale-75 items-center gap-1 whitespace-nowrap rounded-full bg-primary py-1 pl-1 pr-2 text-xs leading-none text-white opacity-0 shadow-sm transition-all duration-150 ease-out group-hover:scale-100 group-hover:opacity-100"
            >
              <UIcon name="i-heroicons-plus" class="h-3.5 w-3.5 shrink-0" />
              {{ addButtonLabel }}
            </span>
          </button>
        </template>
      </div>
      <div
        v-for="item in dashedBlockOverlays"
        :key="item.key"
        class="absolute rounded-none border border-dashed border-primary/50 bg-transparent"
        :style="item.style"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'
import type { DecorationSection, PageType } from '~/decoration-engine/types/decoration'
import { getDecorationPreviewEditContext } from '~/decoration-engine/composables/useDecorationPreviewEditStore'
import { useDecorationPreview } from '~/decoration-engine/composables/useDecorationPreview'

const props = withDefaults(
  defineProps<{
    /** 须与 DecorationRenderer / useDecorationPreview 的 pageType 一致 */
    pageType?: PageType
  }>(),
  {
    pageType: 'home',
  }
)

const overlayTarget = ref<HTMLElement | null>(null)
const overlayViewportWidth = ref(0)
const overlayScrollX = ref(0)
const overlayScrollY = ref(0)
let overlayResizeObserver: ResizeObserver | null = null

const previewPageType = computed<PageType>(() => {
  const k = props.pageType
  if (
    k === 'home' ||
    k === 'list' ||
    k === 'product_list' ||
    k === 'detail' ||
    k === 'custom' ||
    k === 'global'
  ) {
    return k
  }
  return 'home'
})

const editContext = computed(() => getDecorationPreviewEditContext(previewPageType.value))
/** 与 index / Preview 的 useDecorationPreview(pageType) 同一 key，角标文案才能读到 global+page 合并分区 */
const decorationPreviewBundle = useDecorationPreview(previewPageType.value)
const {
  requestAddBlock,
  requestAddSection,
  requestMoveSection,
  requestDuplicateSection,
  requestRemoveSection,
  requestMoveBlock,
  requestDuplicateBlock,
  requestRemoveBlock,
} = decorationPreviewBundle
const { t } = useI18n()
const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

function translateIfGeneratedKey(value: string) {
  return generatedKeyPattern.test(value) ? t(value) : value
}

const mergedPreviewSections = computed(
  (): Record<string, DecorationSection> => ({
    ...(decorationPreviewBundle.headerDsl.value?.sections || {}),
    ...(decorationPreviewBundle.footerDsl.value?.sections || {}),
    ...(decorationPreviewBundle.globalDsl.value?.sections || {}),
    ...(decorationPreviewBundle.pageDsl.value?.sections || {}),
  })
)

type DecorationArea = 'header' | 'template' | 'footer'

function resolveDecorationArea(sectionId: string): DecorationArea {
  if (decorationPreviewBundle.headerDsl.value?.sections?.[sectionId]) return 'header'
  if (decorationPreviewBundle.footerDsl.value?.sections?.[sectionId]) return 'footer'
  return 'template'
}

function resolveAreaOrder(area: DecorationArea) {
  if (area === 'header') return decorationPreviewBundle.headerDsl.value?.order || []
  if (area === 'footer') return decorationPreviewBundle.footerDsl.value?.order || []
  return decorationPreviewBundle.pageDsl.value?.order || []
}

function getSectionAreaOrder(sectionId: string) {
  return resolveAreaOrder(resolveDecorationArea(sectionId))
}

const SECTION_TYPE_LABEL: Record<string, string> = {
  'announcement-bar': t('0dbc43d3.3921b6'),
  header: t('0dbc43d3.917f14'),
  footer: t('0dbc43d3.4eb88f'),
  carousel: t('0dbc43d3.a5987d'),
  'image-hotspot': t('0dbc43d3.081a81'),
  'native-product-list': t('0dbc43d3.437974'),
  'product-shelf': t('0dbc43d3.4a02ad'),
}

const BLOCK_TRANSLATION_LABEL: Record<string, string> = {
  'blocks.header_product_list.name': t('0dbc43d3.437974'),
  'blocks.header_collection_product_list.name': t('0dbc43d3.8926e5'),
  'blocks.mega_menu.name': t('0dbc43d3.3f8882'),
}

const BLOCK_TYPE_LABEL: Record<string, string> = {
  announcement: t('0dbc43d3.fa86f1'),
  image: t('0dbc43d3.20def7'),
  video: t('0dbc43d3.7fcf42'),
  hotspot: t('0dbc43d3.50da72'),
  'nav-item': t('0dbc43d3.ff36f6'),
  'footer-link': t('0dbc43d3.406baf'),
  'footer-menu': t('0dbc43d3.4ccbdc'),
  'footer-image': t('0dbc43d3.20def7'),
  'footer-text': t('0dbc43d3.97d076'),
  'product-tab': t('0dbc43d3.81af76'),
  'header-product-list': t('0dbc43d3.437974'),
  'header-collection-product-list': t('0dbc43d3.8926e5'),
  'mega-menu': t('0dbc43d3.3f8882'),
}

function resolvePreviewLabel(value: unknown): string {
  const text = String(value || '').trim()
  if (!text.startsWith('t:')) {
    return translateIfGeneratedKey(text)
  }
  const key = text.slice(2)
  return BLOCK_TRANSLATION_LABEL[key] || key || text
}

function buildPreviewSelectionLabel(
  sections: Record<string, DecorationSection>,
  kind: 'section' | 'block',
  sectionId: string,
  blockId?: string
): string {
  const section = sections[sectionId]
  if (!section) {
    return sectionId
  }
  if (kind === 'block' && blockId) {
    const block = section.blocks?.[blockId]
    if (!block) {
      return blockId
    }
    return BLOCK_TYPE_LABEL[block.type] || block.type || blockId
  }
  const st = String(section.title || '').trim()
  if (st) {
    return translateIfGeneratedKey(st)
  }
  return SECTION_TYPE_LABEL[section.type] || section.type || sectionId
}

function updateOverlayMetrics() {
  if (!import.meta.client) {
    return
  }
  overlayViewportWidth.value = window.innerWidth || document.documentElement?.clientWidth || 0
  overlayScrollX.value = window.scrollX || window.pageXOffset || 0
  overlayScrollY.value = window.scrollY || window.pageYOffset || 0
}

function ensureOverlayRootAttached() {
  if (!import.meta.client) {
    return
  }
  const id = 'decoration-overlay-root'
  let target = document.getElementById(id)
  if (!target) {
    target = document.createElement('div')
    target.id = id
  }
  target.setAttribute('data-decoration-overlay-root', '1')
  document.body.appendChild(target)
  overlayTarget.value = target
}

function detachOverlayRoot() {
  if (!import.meta.client) {
    return
  }
  const target = overlayTarget.value
  overlayTarget.value = null
  if (target?.parentNode) {
    target.parentNode.removeChild(target)
  }
}

function bindOverlayMetrics() {
  if (!import.meta.client) {
    return
  }
  updateOverlayMetrics()
  if (!overlayResizeObserver) {
    overlayResizeObserver = new ResizeObserver(() => updateOverlayMetrics())
    overlayResizeObserver.observe(document.documentElement)
  }
  window.addEventListener('resize', updateOverlayMetrics)
  window.addEventListener('scroll', updateOverlayMetrics, { passive: true })
}

function unbindOverlayMetrics() {
  if (!import.meta.client) {
    return
  }
  overlayResizeObserver?.disconnect()
  overlayResizeObserver = null
  window.removeEventListener('resize', updateOverlayMetrics)
  window.removeEventListener('scroll', updateOverlayMetrics)
}

onMounted(() => {
  if (!import.meta.client) {
    return
  }
  ensureOverlayRootAttached()
  bindOverlayMetrics()
})

onBeforeUnmount(() => {
  unbindOverlayMetrics()
  detachOverlayRoot()
})

watch(
  () => ({
    sectionRects: editContext.value.sectionRects.value,
    blockRects: editContext.value.blockRects.value,
    pinnedSectionId: editContext.value.pinnedSectionId.value,
    highlightedBlock: editContext.value.highlightedBlock.value,
    hoverSectionId: editContext.value.hoverSectionId.value,
    hoveredBlock: editContext.value.hoveredBlock.value,
  }),
  () => {
    if (import.meta.client) {
      updateOverlayMetrics()
    }
  },
  { deep: true }
)

const activeBlockKey = computed(() => {
  const ctx = editContext.value
  const hl = ctx.highlightedBlock.value
  const hlId = hl?.blockId != null ? String(hl.blockId).trim() : ''
  if (hl?.sectionId && hlId) {
    return `${hl.sectionId}::${hlId}`
  }
  const hb = ctx.hoveredBlock.value
  const hbId = hb?.blockId != null ? String(hb.blockId).trim() : ''
  if (hb?.sectionId && hbId) {
    return `${hb.sectionId}::${hbId}`
  }
  return ''
})

type PreviewChromeRect = { top: number; left: number; width: number; height: number }

function toViewportRect(rect: PreviewChromeRect): PreviewChromeRect {
  return {
    top: rect.top - overlayScrollY.value,
    left: rect.left - overlayScrollX.value,
    width: rect.width,
    height: rect.height,
  }
}

const adminSyncedChrome = computed(() => {
  const ctx = editContext.value
  const hb = ctx.hoveredBlock.value
  const hoverBlockIdRaw = hb?.blockId != null ? String(hb.blockId).trim() : ''
  if (hb?.sectionId && hoverBlockIdRaw) {
    const key = `${hb.sectionId}::${hoverBlockIdRaw}`
    const rect = ctx.blockRects.value[key] as PreviewChromeRect | undefined
    if (rect) {
      return {
        kind: 'block' as const,
        source: 'hover' as const,
        sectionId: hb.sectionId,
        blockId: hoverBlockIdRaw,
        rect,
      }
    }
  }

  const hoverSectionId = ctx.hoverSectionId.value
  if (hoverSectionId) {
    const rect = ctx.sectionRects.value[hoverSectionId] as PreviewChromeRect | undefined
    if (rect) {
      return {
        kind: 'section' as const,
        source: 'hover' as const,
        sectionId: hoverSectionId,
        rect,
      }
    }
  }

  return null
})

const selectedChrome = computed(() => {
  const ctx = editContext.value

  const hl = unref(ctx.highlightedBlock)
  const blockIdRaw = hl?.blockId != null ? String(hl.blockId).trim() : ''

  if (hl?.sectionId && blockIdRaw) {
    const key = `${hl.sectionId}::${blockIdRaw}`
    const rect = ctx.blockRects.value[key] as PreviewChromeRect | undefined
    if (rect) {
      return {
        kind: 'block' as const,
        source: 'selected' as const,
        sectionId: hl.sectionId,
        blockId: blockIdRaw,
        rect,
      }
    }
    return null
  }

  const pin = ctx.pinnedSectionId.value
  const sid = pin || hl?.sectionId || ''
  if (!sid) {
    return null
  }
  if (hl?.sectionId && hl.sectionId !== sid) {
    return null
  }
  if (hl?.sectionId === sid && blockIdRaw) {
    return null
  }
  const rect = ctx.sectionRects.value[sid] as PreviewChromeRect | undefined
  if (!rect) {
    return null
  }
  return { kind: 'section' as const, source: 'selected' as const, sectionId: sid, rect }
})

function toChromeStyle(chrome: { rect?: PreviewChromeRect } | null) {
  if (!chrome?.rect) {
    return null
  }
  const r = toViewportRect(chrome.rect)
  return {
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
  }
}

const adminSyncedChromeStyle = computed(() => {
  return toChromeStyle(adminSyncedChrome.value)
})

const selectedChromeStyle = computed(() => toChromeStyle(selectedChrome.value))

const isAdminSyncedChromeSameAsSelected = computed(() => {
  const adminChrome = adminSyncedChrome.value
  const selected = selectedChrome.value
  if (!adminChrome || !selected || adminChrome.kind !== selected.kind) {
    return false
  }
  if (adminChrome.sectionId !== selected.sectionId) {
    return false
  }
  if (adminChrome.kind === 'block') {
    return adminChrome.blockId === (selected.kind === 'block' ? selected.blockId : '')
  }
  return true
})

const adminSyncedChromeLabel = computed(() => {
  const c = adminSyncedChrome.value
  if (!c) {
    return ''
  }
  const sections = mergedPreviewSections.value
  if (c.kind === 'block') {
    return buildPreviewSelectionLabel(sections, 'block', c.sectionId, c.blockId)
  }
  return buildPreviewSelectionLabel(sections, 'section', c.sectionId)
})

const selectedChromeLabel = computed(() => {
  const c = selectedChrome.value
  if (!c) {
    return ''
  }
  const sections = mergedPreviewSections.value
  if (c.kind === 'block') {
    return buildPreviewSelectionLabel(sections, 'block', c.sectionId, c.blockId)
  }
  return buildPreviewSelectionLabel(sections, 'section', c.sectionId)
})

const adminSyncedChromeLabelClass = computed(() => {
  const c = adminSyncedChrome.value
  const canPlaceAbove = Boolean(c?.rect && toViewportRect(c.rect).top >= 24)
  return [
    'pointer-events-auto absolute left-0 z-[1] rounded-none bg-primary px-2 py-1 text-[11px] font-medium leading-tight text-white shadow-sm',
    canPlaceAbove ? 'top-0 -translate-y-full' : 'top-0 translate-y-0',
  ]
})

const selectedChromeLabelClass = computed(() => {
  const c = selectedChrome.value
  const canPlaceAbove = Boolean(c?.rect && toViewportRect(c.rect).top >= 24)
  return [
    'pointer-events-auto absolute left-0 z-[1] rounded-none bg-primary px-2 py-1 text-[11px] font-medium leading-tight text-white shadow-sm',
    canPlaceAbove ? 'top-0 -translate-y-full' : 'top-0 translate-y-0',
  ]
})

const selectedChromeActionsClass = computed(() => {
  const c = selectedChrome.value
  const viewportWidth = overlayViewportWidth.value
  const actionsWidth = 40
  const gap = 8
  const rect = c?.rect ? toViewportRect(c.rect) : null
  const canPlaceOutsideRight = Boolean(
    rect && rect.left + rect.width + actionsWidth + gap <= viewportWidth
  )
  return [
    'pointer-events-auto absolute top-0 z-[1] flex flex-col items-center gap-1 rounded-xl border border-slate-100 bg-white px-2 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.12)]',
    canPlaceOutsideRight ? 'right-0 ml-2 translate-x-full' : 'right-1 translate-x-0',
  ]
})

const selectedBlockActionsClass = computed(() => {
  const chrome = selectedChrome.value
  const rect = chrome?.rect ? toViewportRect(chrome.rect) : null
  const viewportWidth = overlayViewportWidth.value
  const viewportHeight = import.meta.client
    ? window.innerHeight || document.documentElement?.clientHeight || 0
    : 0
  const actionsWidth = 152
  const actionsHeight = 48
  const gap = 8
  const canPlaceBelow = Boolean(
    rect && rect.top + rect.height + actionsHeight + gap <= viewportHeight
  )
  const canAlignRight = Boolean(rect && rect.left + rect.width - actionsWidth >= 0)
  return [
    'pointer-events-auto absolute z-[1] flex items-center gap-1 rounded-xl border border-slate-100 bg-white px-2 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.12)]',
    canPlaceBelow ? 'bottom-0 translate-y-[calc(100%+8px)]' : 'bottom-2 translate-y-0',
    canAlignRight ? 'right-0' : 'left-0',
  ]
})

const selectedChromeActionButtonClass = [
  'flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition-colors',
  'hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
]

const selectedSectionActionState = computed(() => {
  const chrome = selectedChrome.value
  if (!chrome || chrome.kind !== 'section') {
    return {
      canMoveUp: false,
      canMoveDown: false,
      canDuplicate: false,
      canRemove: false,
    }
  }
  const area = resolveDecorationArea(chrome.sectionId)
  const sectionOrder = resolveAreaOrder(area)
  const currentIndex = sectionOrder.indexOf(chrome.sectionId)
  const canMove = currentIndex >= 0
  const locked = isLockedNativeSection(chrome.sectionId)
  return {
    canMoveUp: canMove && currentIndex > 0,
    canMoveDown: canMove && currentIndex < sectionOrder.length - 1,
    canDuplicate: area === 'template' && !locked,
    canRemove: sectionOrder.length > 1 && !locked,
  }
})

function isLockedNativeSection(sectionId: string) {
  const section = mergedPreviewSections.value[sectionId]
  return Boolean(
    section?.type === 'native-product-list' ||
      section?.settings?.locked === true ||
      (section as DecorationSection & { locked?: boolean })?.locked === true
  )
}

function getBlockOrder(sectionId: string) {
  const section = mergedPreviewSections.value[sectionId]
  return Array.isArray(section?.block_order) ? section.block_order : []
}

const selectedBlockActionState = computed(() => {
  const chrome = selectedChrome.value
  if (!chrome || chrome.kind !== 'block' || !chrome.blockId) {
    return {
      canMoveUp: false,
      canMoveDown: false,
      canRemove: false,
    }
  }
  const blockOrder = getBlockOrder(chrome.sectionId)
  const currentIndex = blockOrder.indexOf(chrome.blockId)
  const canMove = currentIndex >= 0
  return {
    canMoveUp: canMove && currentIndex > 0,
    canMoveDown: canMove && currentIndex < blockOrder.length - 1,
    canRemove: blockOrder.length > 1,
  }
})

function selectedBlockActionButtonClass(enabled: boolean) {
  return [
    ...selectedChromeActionButtonClass,
    enabled
      ? ''
      : 'cursor-not-allowed text-[#B8BEC8] hover:bg-transparent hover:text-[#B8BEC8] active:bg-transparent',
  ]
}

function selectedSectionActionButtonClass(enabled: boolean) {
  return selectedBlockActionButtonClass(enabled)
}

function selectedActionIconColor(enabled: boolean) {
  return enabled ? '#475569' : '#AEB4BE'
}

const addButtonLabel = computed(() =>
  adminSyncedChrome.value?.kind === 'block' ? t('0dbc43d3.fc318c') : t('0dbc43d3.2e2d33')
)

function handleSelectedSectionAction(action: 'up' | 'down' | 'duplicate' | 'remove') {
  const chrome = selectedChrome.value
  if (!chrome || chrome.kind !== 'section') {
    return
  }
  if (action === 'up' || action === 'down') {
    if (action === 'up' && !selectedSectionActionState.value.canMoveUp) return
    if (action === 'down' && !selectedSectionActionState.value.canMoveDown) return
    requestMoveSection(chrome.sectionId, action)
    return
  }
  if (action === 'duplicate') {
    if (!selectedSectionActionState.value.canDuplicate) return
    requestDuplicateSection(chrome.sectionId)
    return
  }
  if (!selectedSectionActionState.value.canRemove) return
  requestRemoveSection(chrome.sectionId)
}

function handleSelectedBlockAction(action: 'up' | 'down' | 'duplicate' | 'remove') {
  const chrome = selectedChrome.value
  if (!chrome || chrome.kind !== 'block' || !chrome.blockId) {
    return
  }
  if (action === 'up' || action === 'down') {
    if (action === 'up' && !selectedBlockActionState.value.canMoveUp) return
    if (action === 'down' && !selectedBlockActionState.value.canMoveDown) return
    requestMoveBlock(chrome.sectionId, chrome.blockId, action)
    return
  }
  if (action === 'duplicate') {
    requestDuplicateBlock(chrome.sectionId, chrome.blockId)
    return
  }
  if (!selectedBlockActionState.value.canRemove) return
  requestRemoveBlock(chrome.sectionId, chrome.blockId)
}

function keepAddControlHover() {
  const chrome = adminSyncedChrome.value
  const ctx = editContext.value
  if (!chrome) {
    return
  }
  if (chrome.kind === 'block') {
    ctx.setHoveredBlock(chrome.sectionId, chrome.blockId)
    return
  }
  ctx.setHoverSection(chrome.sectionId)
}

function handleAddClick(position: 'before' | 'after', event: MouseEvent) {
  const chrome = adminSyncedChrome.value
  if (!chrome) return
  if (chrome.kind === 'block') {
    handleAddBlockClick(chrome.sectionId, chrome.blockId, position, event)
    return
  }
  handleAddSectionClick(chrome.sectionId, position, event)
}

function handleAddBlockClick(
  sectionId: string,
  blockId: string,
  position: 'before' | 'after',
  event: MouseEvent
) {
  const blockOrder = getBlockOrder(sectionId)
  const activeIndex = blockId ? blockOrder.indexOf(blockId) : -1
  const insertIndex =
    activeIndex >= 0 ? activeIndex + (position === 'after' ? 1 : 0) : blockOrder.length || undefined
  requestAddBlock(
    sectionId,
    insertIndex,
    { clientX: event.clientX, clientY: event.clientY },
    resolveDecorationArea(sectionId)
  )
}

function handleAddSectionClick(sectionId: string, position: 'before' | 'after', event: MouseEvent) {
  const area = resolveDecorationArea(sectionId)
  const order = resolveAreaOrder(area)
  const activeIndex = order.indexOf(sectionId)
  const insertIndex = activeIndex >= 0 ? activeIndex + (position === 'after' ? 1 : 0) : undefined
  requestAddSection(
    sectionId,
    insertIndex,
    { clientX: event.clientX, clientY: event.clientY },
    area
  )
}

const dashedBlockOverlays = computed(() => {
  const ctx = editContext.value
  const sid = ctx.hoverSectionId.value
  if (!sid) {
    return []
  }
  const currentSection = mergedPreviewSections.value[sid]
  const currentBlockIds = new Set(currentSection?.block_order || [])
  const blockRectMap = new Map<string, PreviewChromeRect & { key: string }>()
  Object.keys(ctx.blockRects.value)
    .map((key) => {
      const rect = ctx.blockRects.value[key]
      return rect ? { key, ...rect } : null
    })
    .filter((item): item is PreviewChromeRect & { key: string } =>
      Boolean(
        item &&
          item.sectionId === sid &&
          currentBlockIds.has(item.blockId) &&
          item.key === `${sid}::${item.blockId}` &&
          item.key !== activeBlockKey.value
      )
    )
    .forEach((item) => {
      blockRectMap.set(item.key, item)
    })

  return Array.from(blockRectMap.values())
    .map((item) => {
      const rect = toViewportRect(item)
      return {
        key: item.key,
        style: {
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        },
      }
    })
})
</script>
