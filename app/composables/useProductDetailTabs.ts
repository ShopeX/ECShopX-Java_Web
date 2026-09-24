import { nextTick, onMounted, onUnmounted, ref, toValue, type MaybeRefOrGetter } from 'vue'

export type ProductDetailTabId = 'reviews' | 'details'

export interface UseProductDetailTabsOptions {
  sectionIds: MaybeRefOrGetter<Record<ProductDetailTabId, string>>
  defaultTab?: ProductDetailTabId
}

export function useProductDetailTabs(options: UseProductDetailTabsOptions) {
  const activeTab = ref<ProductDetailTabId>(options.defaultTab ?? 'reviews')
  const tabBarRef = ref<HTMLElement | null>(null)
  const isClickScrolling = ref(false)

  let clickScrollTimer: ReturnType<typeof setTimeout> | null = null
  let scrollRafId: number | null = null

  const getStickyOffset = () => {
    const headerHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--layout-header-height')
      ) || 68
    const tabBarHeight = tabBarRef.value?.offsetHeight ?? 48
    return headerHeight + tabBarHeight + 8
  }

  const updateActiveTabFromScroll = () => {
    if (isClickScrolling.value) {
      return
    }

    const offset = getStickyOffset()
    const sections = Object.entries(toValue(options.sectionIds)) as Array<
      [ProductDetailTabId, string]
    >

    let currentTab = sections[0]?.[0] ?? 'reviews'

    for (const [tab, sectionId] of sections) {
      const element = document.getElementById(sectionId)
      if (!element) {
        continue
      }

      if (element.getBoundingClientRect().top <= offset) {
        currentTab = tab
      }
    }

    activeTab.value = currentTab
  }

  const handleScroll = () => {
    if (scrollRafId !== null) {
      return
    }

    scrollRafId = window.requestAnimationFrame(() => {
      scrollRafId = null
      updateActiveTabFromScroll()
    })
  }

  const scrollToSection = (tab: ProductDetailTabId) => {
    const sectionId = toValue(options.sectionIds)[tab]
    const element = document.getElementById(sectionId)
    if (!element) {
      return
    }

    activeTab.value = tab
    isClickScrolling.value = true

    const top = element.getBoundingClientRect().top + window.scrollY - getStickyOffset()
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })

    if (clickScrollTimer) {
      clearTimeout(clickScrollTimer)
    }
    clickScrollTimer = setTimeout(() => {
      isClickScrolling.value = false
      updateActiveTabFromScroll()
    }, 800)
  }

  const setupObserver = () => {
    if (typeof window === 'undefined') {
      return
    }

    nextTick(() => {
      updateActiveTabFromScroll()
    })
  }

  const setActiveTab = (tab: ProductDetailTabId) => {
    activeTab.value = tab
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    setupObserver()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleScroll)
    if (scrollRafId !== null) {
      window.cancelAnimationFrame(scrollRafId)
    }
    if (clickScrollTimer) {
      clearTimeout(clickScrollTimer)
    }
  })

  return {
    activeTab,
    tabBarRef,
    scrollToSection,
    setupObserver,
    setActiveTab,
  }
}
