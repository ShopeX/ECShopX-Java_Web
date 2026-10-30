<template>
  <section
    class="relative w-full overflow-hidden bg-[var(--section-background)] text-[var(--section-foreground)]"
    :class="sectionClasses"
    :style="sectionStyle"
    data-section-type="image-hotspot"
  >
    <!--
      无背景图时原先不渲染 DecorationBlockHost，Admin 选中「图片」块后预览区没有任何描边节点。
      统一用同一 relative 容器：有/无底图都叠加热区；无热区时在预览下可用整块占位承接 BLOCK_HIGHLIGHT。
    -->
    <div :class="innerClasses">
      <div class="relative w-full">
        <picture v-if="backgroundImage || mobileBackgroundImage">
          <source
            v-if="mobileBackgroundImage"
            media="(max-width: 767px)"
            :srcset="mobileBackgroundImage"
          />
          <img
            :src="backgroundImage || mobileBackgroundImage"
            :alt="sectionAlt"
            class="block w-full h-auto"
          />
        </picture>
        <div
          v-else
          class="flex min-h-[200px] items-center justify-center bg-neutral-100 text-sm text-neutral-400"
        >
          {{ t('44646d39.9bb1a6') }}
        </div>

        <div
          v-for="hotspot in activeHotspots"
          :key="hotspot.id"
          class="group absolute z-[1] flex items-center justify-center"
          :style="hotspot.style"
        >
          <component
            :is="resolveHotspotTag(hotspot.link)"
            class="relative block h-full w-full"
            :href="resolveHotspotHref(hotspot.link)"
            :target="resolveHotspotTarget(hotspot.link)"
            :rel="resolveHotspotRel(hotspot.link)"
            :aria-label="hotspot.label || `hotspot-${hotspot.id}`"
            @click="handleHotspotClick"
          >
            <span class="block h-full w-full" />

            <span
              v-if="props.isPreview && hotspot.label"
              class="pointer-events-none absolute -top-3 left-1/2 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-black/75 px-3 py-1 text-xs text-white group-hover:block"
            >
              {{ hotspot.label }}
            </span>
          </component>
        </div>

        <DecorationBlockHost
          v-if="isPreview && placeholderHighlightBlockId"
          :section-id="sectionId"
          :block-id="placeholderHighlightBlockId"
          root-class="absolute inset-0 z-[2] min-h-[120px]"
        >
          <span class="sr-only">{{ t('44646d39.9bb1a6') }}</span>
        </DecorationBlockHost>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DecorationSection } from '~/decoration-engine/types/decoration'
import { useDecorationEditOptional } from '~/decoration-engine/composables/useDecorationEditContext'
import {
  resolveSectionColorScheme,
  resolveSectionPaddingClass,
} from '~/decoration-engine/utils/sectionAppearance'
import { createDecorationLinkResolver } from '~/decoration-engine/utils/resolveDecorationLink'
import { resolveBlockSettings, resolveSectionSettings } from '~/decoration-engine/utils/resolveSettings'

interface HotspotBlock {
  id: string
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
  link: Record<string, unknown>
  label: string
  shape: 'circle' | 'rect'
  style: {
    left: string
    top: string
    width: string
    height: string
  }
}

const props = defineProps<{
  section: DecorationSection
  sectionId: string
  isPreview?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const decorationLink = createDecorationLinkResolver((path) => localePath(path as any))
const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

function translateIfGeneratedKey(value: string) {
  return generatedKeyPattern.test(value) ? t(value) : value
}

const sectionAlt = computed(() =>
  translateIfGeneratedKey(String(props.section.title || 'image hotspot'))
)
const editCtx = useDecorationEditOptional()
const isMobileViewport = ref(false)

const updateViewport = () => {
  if (!import.meta.client) return
  isMobileViewport.value = window.innerWidth <= 767
}

const sectionSettings = computed(() => {
  const raw = resolveSectionSettings('image-hotspot', props.section.settings)
  const pcImage = String(raw.pc_image || '')
  const mobileImage = String(raw.mobile_image || '')
  const pcHotspots = Array.isArray(raw.pc_hotspots) ? raw.pc_hotspots : []
  const mobileHotspots = Array.isArray(raw.mobile_hotspots) ? raw.mobile_hotspots : []
  const legacyHotspots = Array.isArray(raw.hotspot) ? raw.hotspot : []

  return {
    pcImage,
    mobileImage,
    pcHotspots,
    mobileHotspots,
    legacyHotspots,
  }
})

const backgroundImage = computed(() => sectionSettings.value.pcImage)
const mobileBackgroundImage = computed(() => sectionSettings.value.mobileImage)
const sectionClasses = computed(() => [
  resolveSectionPaddingClass(
    resolveSectionSettings('image-hotspot', props.section.settings).padding_top,
    'top'
  ),
  resolveSectionPaddingClass(
    resolveSectionSettings('image-hotspot', props.section.settings).padding_bottom,
    'bottom'
  ),
])
const innerClasses = computed(() => [
  resolveSectionSettings('image-hotspot', props.section.settings).full_width === true
    ? 'w-full'
    : 'mx-auto max-w-[1440px]',
])
const sectionStyle = computed(() => {
  const scheme = resolveSectionColorScheme(
    resolveSectionSettings('image-hotspot', props.section.settings).color_scheme
  )
  return {
    '--section-background': scheme.background,
    '--section-foreground': scheme.foreground,
  }
})

const toPercent = (value: unknown) => {
  const numberValue = Number(value) || 0
  const percentValue = numberValue > 1 ? numberValue : numberValue * 100

  return Math.min(100, Math.max(0, percentValue))
}

const activeHotspots = computed<HotspotBlock[]>(() => {
  const deviceHotspots = isMobileViewport.value
    ? sectionSettings.value.mobileHotspots
    : sectionSettings.value.pcHotspots
  const rawHotspots = deviceHotspots.length
    ? deviceHotspots
    : sectionSettings.value.legacyHotspots.length
      ? sectionSettings.value.legacyHotspots
      : props.section.block_order.map((blockId) => {
          const block = props.section.blocks[blockId]
          const settings = block
            ? resolveBlockSettings(block.type, block.settings)
            : undefined

          return settings
            ? {
                id: blockId,
                x: settings.x,
                y: settings.y,
                width: settings.width || 12,
                height: settings.height || 12,
                link: settings.link,
                label: settings.label,
                shape: settings.shape,
              }
            : null
        })

  const normalized = rawHotspots.map((item: any, index: number) => {
    const rect = item?.rect || {
      x: Number(item?.leftPer ?? item?.x ?? 0),
      y: Number(item?.topPer ?? item?.y ?? 0),
      width: Number(item?.widthPer ?? item?.width ?? 0),
      height: Number(item?.heightPer ?? item?.height ?? 0),
    }
    const x = toPercent(rect.x)
    const y = toPercent(rect.y)
    const width = toPercent(rect.width)
    const height = toPercent(rect.height)
    const shape: HotspotBlock['shape'] = item?.shape === 'rect' ? 'rect' : 'circle'

    return {
      id: item?.id || `hotspot_${index}`,
      rect: { x, y, width, height },
      link: item?.link || {
        linkType: item?.linkType ?? 0,
        linkUrl: item?.linkUrl || '',
        linkPage: item?.linkPage || '',
        id: item?.id || '',
        title: item?.title || '',
      },
      label: String(item?.label || ''),
      shape,
      style: {
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
      },
    }
  })

  return normalized.filter(Boolean)
})

/** 无热区节点时（仅空底图占位），用编辑上下文里的高亮块 id 撑一层整区 BlockHost，便于看到选中描边 */
const placeholderHighlightBlockId = computed(() => {
  if (activeHotspots.value.length > 0 || backgroundImage.value || mobileBackgroundImage.value) {
    return null
  }
  const hb = editCtx ? unref(editCtx.highlightedBlock) : undefined
  if (!hb || hb.sectionId !== props.sectionId || !hb.blockId) {
    return null
  }
  return hb.blockId
})

const resolveHotspotHref = (link: Record<string, unknown>) =>
  decorationLink.resolveHref(link, { preview: props.isPreview })

const resolveHotspotTag = (link: Record<string, unknown>) =>
  resolveHotspotHref(link) && !props.isPreview ? 'a' : 'button'

const resolveHotspotTarget = (link: Record<string, unknown>) =>
  decorationLink.isExternalHref(link, { preview: props.isPreview }) ? '_blank' : undefined

const resolveHotspotRel = (link: Record<string, unknown>) =>
  decorationLink.isExternalHref(link, { preview: props.isPreview })
    ? 'noopener noreferrer'
    : undefined

const handleHotspotClick = (event: MouseEvent) => {
  if (!props.isPreview) {
    return
  }

  event.preventDefault()
}

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('resize', updateViewport)
})
</script>
