<template>
  <div
    v-if="resolvedTags.length > 0"
    class="flex flex-wrap gap-2"
    :class="placementClass"
    data-testid="product-marketing-tags"
  >
    <span
      v-for="(tag, index) in resolvedTags"
      :key="`${tag.type}-${index}`"
      class="inline-flex h-5 items-center px-1.5 text-[10px] leading-3 whitespace-nowrap"
      :class="tag.variant === 'solid' ? solidClass : outlineClass"
      data-testid="product-marketing-tag"
    >
      {{ tag.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import {
  resolveMarketingTagText,
  type IMarketingTag,
} from '~/utils/promotionTags'

interface Props {
  tags?: IMarketingTag[] | null
  /** inline：标题上方；overlay：图片左上角 */
  placement?: 'inline' | 'overlay'
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [],
  placement: 'inline',
})

const { t } = useI18n()

const solidClass = 'bg-[#191a1d] text-white'
const outlineClass = 'bg-white border border-[#191a1d] text-[#191a1d]'

const placementClass = computed(() =>
  props.placement === 'overlay' ? 'absolute left-3 top-3 z-10' : 'w-full'
)

const resolvedTags = computed(() => {
  const list = Array.isArray(props.tags) ? props.tags : []
  return list
    .map((tag) => {
      const label = resolveMarketingTagText(tag, t).trim()
      if (!label) return null
      return { ...tag, label }
    })
    .filter((tag): tag is IMarketingTag & { label: string } => Boolean(tag))
})
</script>
