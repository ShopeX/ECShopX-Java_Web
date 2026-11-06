<template>
  <div class="page-builder">
    <component
      :is="resolveWidget(widget.type)"
      v-for="widget in widgets"
      :key="widget.id"
      v-bind="widget.data"
      :class="widget.class"
      :style="widget.style"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// Widget Types
type WidgetType = 'carousel' | 'product_list' | 'banner' | 'hot_zone'

interface Widget {
  id: string
  type: WidgetType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  class?: string
  style?: Record<string, string>
}

defineProps<{
  widgets: Widget[]
}>()

// Dynamic Component Resolution
const WidgetCarousel = defineAsyncComponent(() => import('./WCWidgetCarousel/WCWidgetCarousel.vue'))
const WidgetProductList = defineAsyncComponent(
  () => import('./WCWidgetProductList/WCWidgetProductList.vue')
)
const WidgetBanner = defineAsyncComponent(() => import('./WCWidgetBanner/WCWidgetBanner.vue'))
const WidgetHotZone = defineAsyncComponent(() => import('./WCWidgetHotZone/WCWidgetHotZone.vue'))

const resolveWidget = (type: WidgetType) => {
  switch (type) {
    case 'carousel':
      return WidgetCarousel
    case 'product_list':
      return WidgetProductList
    case 'banner':
      return WidgetBanner
    case 'hot_zone':
      return WidgetHotZone
    default:
      return null
  }
}
</script>
