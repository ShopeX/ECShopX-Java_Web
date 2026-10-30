<template>
  <footer
    class="bg-[var(--section-background)] text-[var(--section-foreground)]"
    :class="sectionClasses"
    :style="sectionStyle"
    data-section-type="footer"
  >
    <div :class="sectionInnerClasses">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-6">
        <DecorationBlockHost
          v-for="item in footerBlocks"
          :key="item.blockId"
          :section-id="sectionId"
          :block-id="item.blockId"
          :root-class="item.rootClass"
        >
          <component :is="item.component" v-bind="item.props">
            <template v-if="item.kind === 'text'">
              <div :class="item.alignmentClass">
                <div
                  v-if="item.title"
                  :class="['font-semibold leading-7 text-current', item.titleSizeClass]"
                >
                  {{ item.title }}
                </div>
                <div
                  v-if="item.content"
                  :class="['mt-3 leading-6 text-current opacity-70', item.contentSizeClass]"
                  v-html="item.content"
                />
              </div>
            </template>
            <template v-else-if="item.kind === 'menu'">
              <div :class="item.alignmentClass">
                <div
                  v-if="item.title"
                  :class="['font-semibold leading-7 text-current', item.sizeClass]"
                >
                  {{ item.title }}
                </div>
                <ul
                  :class="['mt-3 space-y-3 leading-6 text-current opacity-70', item.itemSizeClass]"
                >
                  <li v-for="menuItem in item.menuItems" :key="menuItem.label">
                    <a
                      :href="menuItem.url"
                      class="inline-block bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_1px] bg-left-bottom bg-no-repeat transition-[background-size,opacity] duration-200 hover:bg-[length:100%_1px] hover:opacity-100"
                    >
                      {{ menuItem.label }}
                    </a>
                  </li>
                </ul>
              </div>
            </template>
            <template v-else-if="item.kind === 'image'">
              <div :class="['flex', item.alignmentClass]">
                <img
                  v-if="item.image"
                  :src="item.image"
                  alt=""
                  :class="['object-cover', item.widthClass, item.radiusClass]"
                />
                <div
                  v-else
                  :class="[
                    'flex min-h-[96px] items-center justify-center border border-current/10 bg-current/5 text-sm text-current opacity-40',
                    item.widthClass,
                    item.radiusClass,
                  ]"
                >
                  footer image
                </div>
              </div>
            </template>
          </component>
        </DecorationBlockHost>
      </div>

      <div class="mt-8 flex justify-center">
        <img
          src="/images/brand/copyright.png"
          alt="Powered by ShopeX"
          class="h-4 w-auto object-contain"
        />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import DecorationBlockHost from '~/decoration-engine/components/DecorationBlockHost.vue'
import {
  resolveWebMenuRequestValue,
  resolveWebMenuItemLink,
  useWebMenu,
  type NormalizedWebMenuSelection,
} from '~/composables/useWebMenu'
import type { WebMenuItem, WebMenuPayload } from '~/decoration-engine/components/webMenuTypes'
import {
  resolveSectionColorScheme,
  resolveSectionPaddingClass,
} from '~/decoration-engine/utils/sectionAppearance'
import type {
  DecorationHighlightedBlock,
  DecorationSection,
} from '~/decoration-engine/types/decoration'
import { resolveBlockSettings, resolveSectionSettings } from '~/decoration-engine/utils/resolveSettings'

const props = defineProps<{
  section: DecorationSection
  sectionId: string
  isPreview?: boolean
  highlightedBlock?: DecorationHighlightedBlock | null
}>()
const { t } = useI18n()
const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

function translateIfGeneratedKey(value: string) {
  return generatedKeyPattern.test(value) ? t(value) : value
}

const sectionClasses = computed(() => [
  resolveSectionPaddingClass(sectionSettings.value.padding_top, 'top'),
  resolveSectionPaddingClass(sectionSettings.value.padding_bottom, 'bottom'),
])
const sectionSettings = computed(() => resolveSectionSettings('footer', props.section.settings))
const sectionInnerClasses = computed(() => [
  sectionSettings.value.full_width === false
    ? 'mx-auto max-w-[1440px] px-6 md:px-12'
    : 'w-full max-w-none px-6 md:px-12',
])
const sectionStyle = computed(() => {
  const scheme = resolveSectionColorScheme(sectionSettings.value.color_scheme)
  return {
    '--section-background': scheme.background,
    '--section-foreground': scheme.foreground,
  }
})

const footerMenuIds = computed(() =>
  props.section.block_order
    .map((blockId) => props.section.blocks[blockId])
    .filter((block) => block?.type === 'footer-menu' && !block.disabled)
    .map((block) =>
      resolveWebMenuRequestValue(resolveBlockSettings(block?.type || '', block?.settings).menu)
    )
    .filter(Boolean)
)

const menuQueries = await Promise.all(
  footerMenuIds.value.map(async (menuId) => {
    const { data } = await useWebMenu(menuId)
    return [menuId, data.value] as const
  })
)

const footerMenuMap = new Map(menuQueries)

const footerBlocks = computed(
  () =>
    props.section.block_order
      .map((blockId) => {
        const block = props.section.blocks[blockId]
        if (!block || block.disabled) {
          return null
        }

        const settings = resolveBlockSettings(block.type, block.settings)
        const columnSpan = normalizeColumnSpan(settings.column_span)

        if (block.type === 'footer-menu') {
          const menu = normalizeSelectedMenu(settings.menu)
          const menuId = resolveWebMenuRequestValue(menu)
          const menuData = footerMenuMap.get(menuId) as WebMenuPayload | null | undefined
          return {
            blockId,
            kind: 'menu',
            rootClass: spanClass(columnSpan),
            title: translateIfGeneratedKey(
              String(settings.title || menu?.name || menuData?.name || '')
            ),
            menuItems: normalizeMenuItems(menuData?.items || settings.menu_items),
            sizeClass: resolveTextSizeClass(settings.size, 'small'),
            itemSizeClass: resolveMenuItemSizeClass(settings.size),
            alignmentClass: resolveTextAlignmentClass(settings.alignment),
            component: 'div',
            props: {},
          }
        }

        if (block.type === 'footer-image') {
          return {
            blockId,
            kind: 'image',
            rootClass: spanClass(columnSpan),
            image: String(settings.image || ''),
            alignmentClass: resolveImageAlignmentClass(settings.alignment),
            widthClass: resolveImageWidthClass(settings.width),
            radiusClass: resolveImageRadiusClass(settings.radius),
            component: 'div',
            props: {},
          }
        }

        return {
          blockId,
          kind: 'text',
          rootClass: spanClass(columnSpan),
          title: translateIfGeneratedKey(String(settings.title || '')),
          content: translateIfGeneratedKey(String(settings.content || '')),
          titleSizeClass: resolveTextSizeClass(settings.title_size, 'medium'),
          contentSizeClass: resolveTextSizeClass(settings.content_size, 'small'),
          alignmentClass: resolveTextAlignmentClass(settings.alignment),
          component: 'div',
          props: {},
        }
      })
      .filter(Boolean) as Array<{ blockId: string; label: string; link: string }>
)

function normalizeColumnSpan(value: unknown): number {
  const next = Number(value)
  if (!Number.isFinite(next)) return 12
  return Math.min(12, Math.max(1, Math.round(next)))
}

function spanClass(span: number): string {
  const map: Record<number, string> = {
    12: 'md:col-span-12',
    11: 'md:col-span-11',
    10: 'md:col-span-10',
    9: 'md:col-span-9',
    8: 'md:col-span-8',
    7: 'md:col-span-7',
    6: 'md:col-span-6',
    5: 'md:col-span-5',
    4: 'md:col-span-4',
    3: 'md:col-span-3',
    2: 'md:col-span-2',
    1: 'md:col-span-1',
  }
  return map[span] || 'md:col-span-12'
}

function resolveTextSizeClass(value: unknown, fallback: string): string {
  const size = String(value || fallback)
  const map: Record<string, string> = {
    xsmall: 'text-sm',
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl',
  }
  return map[size] || map[fallback] || map.medium
}

function resolveMenuItemSizeClass(value: unknown): string {
  const size = String(value || 'small')
  const itemSizeMap: Record<string, string> = {
    xsmall: 'text-xs',
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl',
    xlarge: 'text-2xl',
  }
  return itemSizeMap[size] || itemSizeMap.small
}

function resolveTextAlignmentClass(value: unknown): string {
  const alignment = String(value || 'left')
  if (alignment === 'center') return 'text-center'
  if (alignment === 'right') return 'text-right'
  return 'text-left'
}

function resolveImageAlignmentClass(value: unknown): string {
  const alignment = String(value || 'left')
  if (alignment === 'center') return 'justify-center'
  if (alignment === 'right') return 'justify-end'
  return 'justify-start'
}

function resolveImageWidthClass(value: unknown): string {
  const width = String(value || '100')
  const map: Record<string, string> = {
    '25': 'w-1/4',
    '50': 'w-1/2',
    '75': 'w-3/4',
    '100': 'w-full',
  }
  return map[width] || map['100']
}

function resolveImageRadiusClass(value: unknown): string {
  const radius = String(value || 'medium')
  const map: Record<string, string> = {
    none: 'rounded-none',
    small: 'rounded',
    medium: 'rounded-lg',
    large: 'rounded-2xl',
    full: 'rounded-full',
  }
  return map[radius] || map.medium
}

function normalizeSelectedMenu(menu: unknown): NormalizedWebMenuSelection | null {
  if (!menu) return null
  if (typeof menu === 'object') return menu as NormalizedWebMenuSelection

  const value = String(menu).trim()
  if (!value) return null

  if (/^\d+$/.test(value)) {
    return { id: value, key: value, name: value }
  }

  return { key: value, name: value }
}

function normalizeMenuItems(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (item && typeof item === 'object' && 'link_type' in item) {
        const menuItem = item as WebMenuItem
        return {
          label: String(menuItem.name || ''),
          url: resolveWebMenuItemLink(menuItem),
        }
      }

      return {
        label: translateIfGeneratedKey(String(item?.label || item?.title || '')),
        url: String(item?.url || '#'),
      }
    })
    .filter((item) => item.label)
}
</script>
