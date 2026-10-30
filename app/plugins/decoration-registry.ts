import type { Component } from 'vue'
import Carousel from '~/decoration-engine/components/sections/Carousel.vue'
import AnnouncementBar from '~/decoration-engine/components/sections/AnnouncementBar.vue'
import DecorationFooterSection from '~/decoration-engine/components/sections/DecorationFooterSection.vue'
import DecorationHeaderSection from '~/decoration-engine/components/sections/DecorationHeaderSection.vue'
import ImageHotspot from '~/decoration-engine/components/sections/ImageHotspot.vue'
import ProductShelf from '~/decoration-engine/components/sections/ProductShelf.vue'
import ProductTabShelf from '~/decoration-engine/components/sections/ProductTabShelf.vue'

export type DecorationRegistry = Record<string, Component>

export const decorationRegistry: DecorationRegistry = {
  'announcement-bar': AnnouncementBar,
  header: DecorationHeaderSection,
  footer: DecorationFooterSection,
  carousel: Carousel,
  'main-carousel': Carousel,
  'image-hotspot': ImageHotspot,
  'product-shelf': ProductShelf,
  'product-tab-shelf': ProductTabShelf,
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('decorationRegistry', decorationRegistry)
})
