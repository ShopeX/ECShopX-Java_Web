<template>
  <section
    class="group relative w-full"
    :class="sectionThemeClasses"
    :style="sectionStyle"
    data-section-type="carousel"
  >
    <template v-if="slides.length">
      <div :class="carouselInnerClasses">
        <div class="relative w-full overflow-hidden" :style="carouselViewportStyle">
          <div
            class="flex h-full w-full transition-transform duration-500 ease-out will-change-transform"
            :style="trackStyle"
          >
            <component
              :is="resolveSlideTag(slide.link)"
              v-for="slide in slides"
              :key="slide.id"
              :href="resolveSlideHref(slide.link)"
              :target="resolveSlideTarget(slide.link)"
              :rel="resolveSlideRel(slide.link)"
              class="block h-full w-full shrink-0"
              :class="isActiveSlide(slide.id) ? '' : 'pointer-events-none'"
              :aria-hidden="!isActiveSlide(slide.id)"
              :data-section-id="sectionId"
              :data-block-id="slide.id"
              @click="handleSlideClick($event, slide.id)"
            >
              <DecorationBlockHost
                :section-id="sectionId"
                :block-id="slide.id"
                root-class="h-full w-full"
              >
                <img
                  v-if="slide.kind === 'video' && slide.posterUrl && isPreview"
                  :src="slide.posterUrl"
                  :alt="slide.alt"
                  class="h-full w-full object-cover object-center"
                />
                <video
                  v-else-if="slide.kind === 'video' && slide.videoUrl"
                  :key="slide.id"
                  :src="slide.videoUrl"
                  :poster="slide.posterUrl || undefined"
                  class="h-full w-full object-cover object-center"
                  autoplay
                  muted
                  playsinline
                  loop
                />
                <picture
                  v-else-if="slide.kind === 'image' && (slide.pcImage || slide.mobileImage)"
                  class="block h-full w-full"
                >
                  <source
                    v-if="slide.mobileImage"
                    media="(max-width: 767px)"
                    :srcset="slide.mobileImage"
                  />
                  <img
                    :src="slide.pcImage || slide.mobileImage"
                    :alt="slide.alt"
                    class="h-full w-full object-cover object-center"
                  />
                </picture>
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center bg-neutral-200 text-sm text-neutral-500"
                >
                  {{ t('8cac7342.cc2e46') }}
                </div>
              </DecorationBlockHost>
            </component>
          </div>

          <div v-if="shouldShowDots" :class="paginationClass">
            <template v-if="settings.paginationType === 'counter'">
              {{ currentIndex + 1 }}/{{ slides.length }}
            </template>
            <template v-else-if="settings.paginationType === 'number'">
              <button
                v-for="(_, index) in slides"
                :key="index"
                type="button"
                :class="[
                  'flex items-center justify-center rounded-full transition',
                  paginationNumberSizeClass,
                  index === currentIndex
                    ? 'bg-white text-neutral-900'
                    : 'text-white/70 hover:text-white',
                ]"
                :aria-label="`slide-${index + 1}`"
                @click.stop="currentIndex = index"
              >
                {{ index + 1 }}
              </button>
            </template>
            <template v-else>
              <button
                v-for="(_, index) in slides"
                :key="index"
                type="button"
                :class="[
                  'relative overflow-hidden rounded-full bg-neutral-900/25 transition-colors duration-200 hover:bg-neutral-900/45',
                  paginationDotSizeClass,
                  index === currentIndex ? 'bg-neutral-900/25' : '',
                ]"
                :aria-label="`slide-${index + 1}`"
                @click.stop="currentIndex = index"
              >
                <span
                  v-if="index === currentIndex"
                  :key="`${currentIndex}-${settings.interval}`"
                  class="carousel-pagination-progress absolute inset-y-0 left-0 rounded-full bg-neutral-900"
                  :style="paginationProgressStyle"
                />
              </button>
            </template>
          </div>

          <template v-if="shouldShowArrows">
            <button
              type="button"
              class="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition hover:bg-black/50 group-hover:flex"
              aria-label="previous-slide"
              @click.stop="goToPrevious"
            >
              <ChevronLeft :size="20" :stroke-width="1.8" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition hover:bg-black/50 group-hover:flex"
              aria-label="next-slide"
              @click.stop="goToNext"
            >
              <ChevronRight :size="20" :stroke-width="1.8" aria-hidden="true" />
            </button>
          </template>
        </div>
      </div>
    </template>

    <template v-else-if="isPreview && placeholderHighlightBlockId">
      <div :class="carouselInnerClasses">
        <DecorationBlockHost
          :section-id="sectionId"
          :block-id="placeholderHighlightBlockId"
          root-class="flex h-full min-h-[200px] w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400"
        >
          {{ t('8cac7342.cc2e46') }}
        </DecorationBlockHost>
      </div>
    </template>

    <div
      v-else
      :class="[
        'flex h-full min-h-[200px] items-center justify-center bg-neutral-100 text-sm text-neutral-400',
        carouselInnerClasses,
      ]"
    >
      {{ t('8cac7342.cc2e46') }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { DecorationSection } from '~/decoration-engine/types/decoration'
import { useDecorationEditOptional } from '~/decoration-engine/composables/useDecorationEditContext'
import { useDecorationPreview } from '~/decoration-engine/composables/useDecorationPreview'
import { useDecorationRouteContext } from '~/decoration-engine/composables/useDecorationRouteContext'
import {
  resolveSectionColorScheme,
  resolveSectionPaddingClass,
} from '~/decoration-engine/utils/sectionAppearance'
import {
  createDecorationLinkResolver,
  normalizeDecorationLink,
  type DecorationLinkValue,
} from '~/decoration-engine/utils/resolveDecorationLink'
import { resolveBlockSettings, resolveSectionSettings } from '~/decoration-engine/utils/resolveSettings'

interface CarouselSettings {
  autoplay: boolean
  interval: number
  height: string
  paginationType: 'point' | 'counter' | 'number'
  paginationSize: 'small' | 'medium' | 'large'
  showDots: boolean
  showArrows: boolean
  fullWidth: boolean
}

interface CarouselSlide {
  id: string
  kind: 'image' | 'video'
  pcImage: string
  mobileImage: string
  videoUrl: string
  posterUrl: string
  link: Record<string, unknown>
  alt: string
}

const props = defineProps<{
  section: DecorationSection
  sectionId: string
  isPreview?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const slideLinkResolver = createDecorationLinkResolver((path) => localePath(path as any))
const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

function translateIfGeneratedKey(value: string) {
  return generatedKeyPattern.test(value) ? t(value) : value
}
const { focusBlock } = useDecorationPreview()
const { isPreview: routeIsPreview } = useDecorationRouteContext()
const editCtx = useDecorationEditOptional()

const currentIndex = ref(0)
const adaptiveHeight = ref(520)
const autoplayTimer = ref<ReturnType<typeof setInterval> | null>(null)
let resizeObserver: ResizeObserver | null = null
const isDecorationPreview = computed(() => routeIsPreview.value || props.isPreview === true)

const settings = computed<CarouselSettings>(() => {
  const raw = resolveSectionSettings('main-carousel', props.section.settings)
  const rawHeightValue = raw.height
  const rawHeight =
    rawHeightValue === undefined || rawHeightValue === null || rawHeightValue === ''
      ? Number.NaN
      : Number(rawHeightValue)
  const imageHeight = String(raw.image_height || 'medium')
  const paginationType = String(raw.paginate_type || 'point')
  const paginationSize = String(raw.paginate_size || 'medium')
  const intervalSeconds = Number(raw.interval ?? 5)
  const interval = Number.isFinite(intervalSeconds) ? intervalSeconds * 1000 : 5000

  return {
    autoplay: raw.enable_auto_play !== false,
    interval: Number.isFinite(interval) ? Math.max(1000, interval) : 3000,
    height: resolveCarouselHeight(imageHeight, rawHeight, adaptiveHeight.value),
    paginationType: isCarouselPaginationType(paginationType) ? paginationType : 'point',
    paginationSize: isCarouselPaginationSize(paginationSize) ? paginationSize : 'medium',
    showDots: raw.showDots !== false,
    showArrows: raw.enable_arrow !== false,
    fullWidth: raw.full_width === true,
  }
})

const isCarouselPaginationType = (value: string): value is CarouselSettings['paginationType'] =>
  value === 'point' || value === 'counter' || value === 'number'

const isCarouselPaginationSize = (value: string): value is CarouselSettings['paginationSize'] =>
  value === 'small' || value === 'medium' || value === 'large'

const resolveCarouselHeight = (imageHeight: string, rawHeight: number, fallbackHeight: number) => {
  if (Number.isFinite(rawHeight)) {
    return `${Math.min(800, Math.max(200, rawHeight))}px`
  }

  if (imageHeight === 'adapt') {
    return `${Math.max(200, Math.floor(fallbackHeight))}px`
  }

  const heightMap: Record<string, string> = {
    small: 'clamp(280px, 32vw, 420px)',
    medium: 'clamp(360px, 42vw, 560px)',
    large: 'clamp(460px, 52vw, 720px)',
  }

  return heightMap[imageHeight] || heightMap.medium
}

const getPreviewParentHeight = () => {
  try {
    const frameElement = window.frameElement as HTMLElement | null
    const parentElement = frameElement?.parentElement
    return (
      parentElement?.clientHeight || frameElement?.clientHeight || window.parent?.innerHeight || 0
    )
  } catch {
    return 0
  }
}

const updateAdaptiveHeight = () => {
  if (!import.meta.client) return
  const previewHeight = isDecorationPreview.value ? getPreviewParentHeight() : 0
  adaptiveHeight.value = previewHeight || window.innerHeight || adaptiveHeight.value
}

const slides = computed<CarouselSlide[]>(() =>
  props.section.block_order
    .map((blockId) => {
      const block = props.section.blocks[blockId]
      if (!block || block.disabled) {
        return null
      }

      const slideSettings = resolveBlockSettings(block.type, block.settings)
      const kind = block.type === 'video' ? 'video' : 'image'
      return {
        id: blockId,
        kind,
        pcImage: String(slideSettings.pc_image || ''),
        mobileImage: String(slideSettings.mobile_image || ''),
        videoUrl: String(slideSettings.videoUrl || ''),
        posterUrl: String(slideSettings.posterUrl || ''),
        link: normalizeDecorationLink(slideSettings.link as DecorationLinkValue),
        alt: translateIfGeneratedKey(String(slideSettings.alt || props.section.title || '')),
      }
    })
    .filter((slide): slide is CarouselSlide => Boolean(slide))
)

const activeSlide = computed(() => slides.value[currentIndex.value] || slides.value[0] || null)
const isActiveSlide = (slideId: string) => activeSlide.value?.id === slideId
const normalizedHeight = computed(() => settings.value.height)
const sectionThemeClasses = computed(() => {
  return [
    'text-[var(--section-foreground)]',
    resolveSectionPaddingClass(
      resolveSectionSettings('main-carousel', props.section.settings).padding_top,
      'top'
    ),
    resolveSectionPaddingClass(
      resolveSectionSettings('main-carousel', props.section.settings).padding_bottom,
      'bottom'
    ),
    'bg-[var(--section-background)]',
  ]
})
const carouselInnerClasses = computed(() => [
  settings.value.fullWidth ? 'w-full' : 'mx-auto max-w-[1440px]',
])
const sectionStyle = computed(() => {
  const scheme = resolveSectionColorScheme(
    resolveSectionSettings('main-carousel', props.section.settings).color_scheme
  )
  return {
    '--section-background': scheme.background,
    '--section-foreground': scheme.foreground,
  }
})
const carouselViewportStyle = computed(() => ({
  height: normalizedHeight.value,
}))
const trackStyle = computed(() => ({
  transform: `translate3d(-${currentIndex.value * 100}%, 0, 0)`,
}))

/** 后台选中某一帧 slide 时同步当前帧，否则只渲染当前帧的 BlockHost，高亮 blockId 与 DOM 不一致则无描边 */
watch(
  () => (editCtx && props.isPreview ? unref(editCtx.highlightedBlock) : undefined),
  (hb) => {
    if (!props.isPreview || !hb || hb.sectionId !== props.sectionId || !hb.blockId) {
      return
    }
    const idx = slides.value.findIndex((s) => s.id === hb.blockId)
    if (idx >= 0) {
      currentIndex.value = idx
    }
  },
  { immediate: true }
)

/** 无 slide 数据时空占位仍可承接 BLOCK_HIGHLIGHT（与 ImageHotspot 一致） */
const placeholderHighlightBlockId = computed(() => {
  if (slides.value.length > 0 || !props.isPreview) {
    return null
  }
  const hb = editCtx ? unref(editCtx.highlightedBlock) : undefined
  if (!hb || hb.sectionId !== props.sectionId || !hb.blockId) {
    return null
  }
  return hb.blockId
})
const shouldRotate = computed(() => slides.value.length > 1)
const shouldShowDots = computed(() => settings.value.showDots && shouldRotate.value)
const shouldShowArrows = computed(() => settings.value.showArrows && shouldRotate.value)
const paginationClass = computed(() => [
  'absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center text-white',
  settings.value.paginationType === 'counter'
    ? paginationCounterSizeClass.value
    : paginationGapClass.value,
])
const paginationGapClass = computed(() => {
  const sizeMap: Record<CarouselSettings['paginationSize'], string> = {
    small: 'gap-1',
    medium: 'gap-1.5',
    large: 'gap-2',
  }
  return sizeMap[settings.value.paginationSize]
})
const paginationCounterSizeClass = computed(() => {
  const sizeMap: Record<CarouselSettings['paginationSize'], string> = {
    small: 'text-[11px] font-medium drop-shadow',
    medium: 'text-xs font-medium drop-shadow',
    large: 'text-sm font-semibold drop-shadow',
  }
  return sizeMap[settings.value.paginationSize]
})
const paginationDotSizeClass = computed(() => {
  const sizeMap: Record<CarouselSettings['paginationSize'], string> = {
    small: 'h-0.5 w-7',
    medium: 'h-0.5 w-9',
    large: 'h-[3px] w-11',
  }
  return sizeMap[settings.value.paginationSize]
})
const paginationNumberSizeClass = computed(() => {
  const sizeMap: Record<CarouselSettings['paginationSize'], string> = {
    small: 'h-5 min-w-5 px-1 text-[11px]',
    medium: 'h-6 min-w-6 px-1.5 text-xs',
    large: 'h-7 min-w-7 px-2 text-sm',
  }
  return sizeMap[settings.value.paginationSize]
})
const paginationProgressStyle = computed(() => ({
  '--carousel-pagination-duration': `${settings.value.interval}ms`,
}))
const stopAutoplay = () => {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value)
    autoplayTimer.value = null
  }
}

const startAutoplay = () => {
  if (!import.meta.client) {
    return
  }

  stopAutoplay()
  if (!settings.value.autoplay || !shouldRotate.value) {
    return
  }

  autoplayTimer.value = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % slides.value.length
  }, settings.value.interval)
}

const goToPrevious = () => {
  if (!slides.value.length) {
    return
  }

  currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length
}

const goToNext = () => {
  if (!slides.value.length) {
    return
  }

  currentIndex.value = (currentIndex.value + 1) % slides.value.length
}

const resolveSlideTag = (link: DecorationLinkValue) =>
  slideLinkResolver.resolveHref(link, { preview: props.isPreview }) && !props.isPreview ? 'a' : 'div'
const resolveSlideHref = (link: DecorationLinkValue) =>
  slideLinkResolver.resolveHref(link, { preview: props.isPreview })
const resolveSlideTarget = (link: DecorationLinkValue) =>
  slideLinkResolver.isExternalHref(link, { preview: props.isPreview }) ? '_blank' : undefined
const resolveSlideRel = (link: DecorationLinkValue) =>
  slideLinkResolver.isExternalHref(link, { preview: props.isPreview })
    ? 'noopener noreferrer'
    : undefined

const handleSlideClick = (event: MouseEvent, blockId: string) => {
  if (!props.isPreview) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  focusBlock(props.sectionId, blockId)
}

watch(
  () => slides.value.length,
  (length) => {
    if (!length) {
      currentIndex.value = 0
      stopAutoplay()
      return
    }

    if (currentIndex.value >= length) {
      currentIndex.value = 0
    }
  },
  { immediate: true }
)

watch(
  () => [settings.value.autoplay, settings.value.interval, slides.value.length],
  () => {
    startAutoplay()
  },
  { immediate: true }
)

watch(isDecorationPreview, updateAdaptiveHeight)

onMounted(() => {
  updateAdaptiveHeight()
  window.addEventListener('resize', updateAdaptiveHeight)

  try {
    const frameElement = window.frameElement as HTMLElement | null
    const parentElement = frameElement?.parentElement
    if (parentElement && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateAdaptiveHeight)
      resizeObserver.observe(parentElement)
    }
  } catch {
    resizeObserver = null
  }
})

onBeforeUnmount(() => {
  stopAutoplay()
  if (import.meta.client) {
    window.removeEventListener('resize', updateAdaptiveHeight)
  }
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<style scoped>
.carousel-pagination-progress {
  animation: carousel-pagination-progress var(--carousel-pagination-duration) linear forwards;
}

@keyframes carousel-pagination-progress {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}
</style>
