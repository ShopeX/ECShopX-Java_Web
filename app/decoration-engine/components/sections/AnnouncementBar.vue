<template>
  <section
    class="w-full border-b border-neutral-200 bg-[var(--section-background)] text-[var(--section-foreground)]"
    :class="sectionClasses"
    :style="sectionStyle"
    data-section-type="announcement-bar"
  >
    <div
      class="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-3 gap-y-1 px-6 py-2 text-sm md:px-12"
    >
      <template v-if="orderedBlocks.length">
        <DecorationBlockHost
          v-for="row in orderedBlocks"
          :key="row.blockId"
          :section-id="sectionId"
          :block-id="row.blockId"
          root-class="min-w-0 flex-1"
        >
          <div class="truncate">
            {{ row.text }}
          </div>
        </DecorationBlockHost>
      </template>
      <div v-else class="min-w-0 flex-1 truncate opacity-70">--</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DecorationSection } from '~/decoration-engine/types/decoration'
import { resolveSectionColorScheme, resolveSectionPaddingClass } from '~/decoration-engine/utils/sectionAppearance'
import { resolveBlockSettings, resolveSectionSettings } from '~/decoration-engine/utils/resolveSettings'

const props = defineProps<{
  section: DecorationSection
  sectionId: string
  isPreview?: boolean
}>()

const settings = computed(() => {
  const raw = resolveSectionSettings('announcement-bar', props.section.settings)
  return {
    color_mode: String(raw.color_mode || 'light'),
    color_scheme: raw.color_scheme,
    padding_top: raw.padding_top,
    padding_bottom: raw.padding_bottom,
  }
})
const sectionClasses = computed(() => [
  resolveSectionPaddingClass(settings.value.padding_top || 'none', 'top'),
  resolveSectionPaddingClass(settings.value.padding_bottom || 'none', 'bottom'),
])
const sectionStyle = computed(() => {
  const scheme = resolveSectionColorScheme(settings.value.color_scheme)
  return {
    '--section-background': scheme.background,
    '--section-foreground': scheme.foreground,
  }
})

/** 每条公告独立 BlockHost，多 block 时后台选中任一条都能上报 rect */
const orderedBlocks = computed(() =>
  (props.section.block_order || [])
    .map((blockId) => {
      const block = props.section.blocks?.[blockId]
      if (!block || block.disabled) {
        return null
      }
      const settings = resolveBlockSettings(block.type, block.settings)
      return {
        blockId,
        text: String(settings.text || '--'),
      }
    })
    .filter(Boolean) as Array<{ blockId: string; text: string }>
)
</script>
