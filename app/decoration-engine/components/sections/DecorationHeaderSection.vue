<template>
  <div class="w-full">
    <header
      ref="headerRef"
      class="bg-[var(--section-background)] text-[var(--section-foreground)]"
      :class="sectionClasses"
      :style="sectionStyle"
      data-section-type="header"
    >
    <div :class="innerClasses">
      <div class="col-start-1 row-start-1 flex items-center gap-3 lg:gap-6">
        <a v-if="isLogoLeft && isExternalLogoLink" :href="logoLink" class="flex items-center">
          <img :src="logoUrl" :alt="section.title || 'logo'" class="h-10 w-auto object-contain" />
        </a>
        <NuxtLink v-else-if="isLogoLeft" :to="resolvedLogoLink" class="flex items-center">
          <img :src="logoUrl" :alt="section.title || 'logo'" class="h-10 w-auto object-contain" />
        </NuxtLink>

        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
          :aria-label="t('48ec697b.e5f71f')"
          @click="emit('open-search')"
        >
          <Icon name="i-heroicons-magnifying-glass" class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
          :aria-label="t('48ec697b.4ccbdc')"
          @click="emit('open-category-nav')"
        >
          <Icon name="i-heroicons-bars-3" class="h-5 w-5" />
        </button>
      </div>

      <a
        v-if="!isLogoLeft && isExternalLogoLink"
        :href="logoLink"
        class="col-start-2 row-start-1 flex items-center justify-self-center"
      >
        <img :src="logoUrl" :alt="section.title || 'logo'" class="h-10 w-auto object-contain" />
      </a>
      <NuxtLink
        v-else-if="!isLogoLeft"
        :to="resolvedLogoLink"
        class="col-start-2 row-start-1 flex items-center justify-self-center"
      >
        <img :src="logoUrl" :alt="section.title || 'logo'" class="h-10 w-auto object-contain" />
      </NuxtLink>

      <div class="col-start-3 row-start-1 flex h-5 items-center justify-end gap-3 lg:gap-6">
        <button
          type="button"
          class="relative flex h-5 w-5 items-center justify-center self-stretch text-current transition-opacity hover:opacity-70"
          :aria-label="cartAriaLabel"
          @click="emit('open-mini-cart')"
        >
          <ECShoppingBagIcon class="h-[18px] w-[17px] text-current" :count="cartItemCount" />
        </button>
        <HeaderUserEntry
          :guest-aria-label="t('48ec697b.1fd02a')"
          variant="decoration"
          @click="emit('open-user')"
        />
        <div
          v-if="showLanguageSelector"
          ref="languageMenuRef"
          class="relative"
          data-testid="decoration-header-language"
        >
          <button
            type="button"
            class="flex h-5 w-5 items-center justify-center text-current transition-opacity hover:opacity-70"
            :aria-label="t('48ec697b.295bb7')"
            @click="toggleLanguageMenu"
          >
            <Icon name="i-heroicons-globe-alt" class="h-5 w-5" />
          </button>

          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="scale-95 opacity-0"
            enter-to-class="scale-100 opacity-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="scale-100 opacity-100"
            leave-to-class="scale-95 opacity-0"
          >
            <div
              v-if="showLanguageMenu"
              class="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-neutral-200 bg-white py-2 text-neutral-900 shadow-lg"
            >
              <button
                v-for="lang in availableLocales"
                :key="lang.code"
                type="button"
                class="flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-neutral-100"
                :class="
                  currentLocale === lang.code ? 'font-medium text-neutral-950' : 'text-neutral-600'
                "
                @click="switchLanguage(lang.code)"
              >
                <span>{{ lang.name }}</span>
                <Icon
                  v-if="currentLocale === lang.code"
                  name="i-heroicons-check"
                  class="h-4 w-4 text-neutral-950"
                />
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    </header>
    <div
      aria-hidden="true"
      class="pointer-events-none w-full shrink-0"
      :style="{ height: `${headerHeight}px` }"
    />
  </div>
</template>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import HeaderUserEntry from '~/components/BCHeaderBar/HeaderUserEntry.vue'
import {
  resolveSectionColorScheme,
  resolveSectionPaddingClass,
} from '~/decoration-engine/utils/sectionAppearance'
import type {
  DecorationHighlightedBlock,
  DecorationSection,
} from '~/decoration-engine/types/decoration'
import { LOCALE_DEFINITIONS, type AppLocaleCode } from '~/shared/localeConfig'
import { resolveSectionSettings } from '~/decoration-engine/utils/resolveSettings'
import {
  clearSiteLanguageSettingCache,
  fetchSiteLanguageSetting,
  getEnabledLocales,
  markUserPreferredLocale,
} from '~/utils/siteLanguageSetting'

const props = defineProps<{
  section: DecorationSection
  sectionId: string
  isPreview?: boolean
  highlightedBlock?: DecorationHighlightedBlock | null
}>()
const emit = defineEmits<{
  'open-category-nav': []
  'open-mini-cart': []
  'open-search': []
  'open-user': []
}>()

const { mallLogoDarkUrl } = await useMallGlobalSetting()
const localePath = useLocalePath()
const cartStore = useCartStore()
const cartItemCount = computed(() => cartStore.totalItems || 0)
const cartAriaLabel = computed(() => {
  const label = t('48ec697b.53754b')
  return cartItemCount.value > 0 ? `${label} (${cartItemCount.value})` : label
})
const settings = computed(() => resolveSectionSettings('header', props.section.settings))

const logoUrl = computed(() => String(settings.value.logoUrl || mallLogoDarkUrl.value))
const logoLink = computed(() => String(settings.value.logoLink || '/'))
const isExternalLogoLink = computed(() => /^https?:\/\//i.test(logoLink.value))
const resolvedLogoLink = computed(() => localePath(logoLink.value as any))
const logoPosition = computed(() =>
  settings.value.logo_position === 'left' ? 'left' : 'center'
)
const isLogoLeft = computed(() => logoPosition.value === 'left')
const isFullWidth = computed(() => settings.value.full_width === true)
const showLanguageSelector = computed(
  () => settings.value.enable_language_selector !== false
)
const showLineSeparator = computed(() => settings.value.show_line_separator !== false)
const isDarkHeaderScheme = computed(() => {
  const scheme = String(settings.value.color_scheme || 'scheme-1')
  return scheme === 'scheme-3' || scheme === 'scheme-4'
})
const headerRef = ref<HTMLElement | null>(null)
const headerHeight = ref(68)
const sectionClasses = computed(() => [
  'fixed top-0 left-0 right-0 z-50 w-full',
  showLineSeparator.value &&
    (isDarkHeaderScheme.value ? 'border-b border-white/10' : 'border-b border-[#e5e7eb]'),
  resolveSectionPaddingClass(settings.value.padding_top || 'xs', 'top'),
  resolveSectionPaddingClass(settings.value.padding_bottom || 'xs', 'bottom'),
])
const innerClasses = computed(() => [
  'mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-8 px-6',
  isFullWidth.value ? 'w-full max-w-none' : 'max-w-[1440px]',
])
const sectionStyle = computed(() => {
  const scheme = resolveSectionColorScheme(settings.value.color_scheme)
  return {
    '--section-background': scheme.background,
    '--section-foreground': scheme.foreground,
  }
})

const { locale, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const showLanguageMenu = ref(false)
const languageMenuRef = ref<HTMLElement | null>(null)
const currentLocale = computed(() => locale.value)
const availableLocales = ref<{ code: AppLocaleCode; name: string }[]>(
  LOCALE_DEFINITIONS.filter((item) => item.code === 'zh').map(({ code, name }) => ({ code, name }))
)

async function refreshAvailableLocales(force = false) {
  if (force) clearSiteLanguageSettingCache()
  const setting = await fetchSiteLanguageSetting({ force })
  availableLocales.value = getEnabledLocales(setting) as {
    code: AppLocaleCode
    name: string
  }[]
}

function toggleLanguageMenu() {
  showLanguageMenu.value = !showLanguageMenu.value
}

function switchLanguage(localeCode: AppLocaleCode) {
  showLanguageMenu.value = false
  markUserPreferredLocale(localeCode)
  const path = switchLocalePath(localeCode)
  navigateTo(path, { replace: true })
}

function handleClickOutside(event: MouseEvent) {
  if (languageMenuRef.value && !languageMenuRef.value.contains(event.target as Node)) {
    showLanguageMenu.value = false
  }
}

function handleWindowFocus() {
  refreshAvailableLocales(true)
}

function syncLayoutHeaderHeight() {
  if (!import.meta.client || !headerRef.value) return

  const height = Math.ceil(headerRef.value.getBoundingClientRect().height)
  headerHeight.value = height
  document.documentElement.style.setProperty('--layout-header-height', `${height}px`)
}

useResizeObserver(headerRef, () => {
  syncLayoutHeaderHeight()
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('focus', handleWindowFocus)
  refreshAvailableLocales()
  syncLayoutHeaderHeight()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('focus', handleWindowFocus)

  if (import.meta.client) {
    document.documentElement.style.removeProperty('--layout-header-height')
  }
})
</script>
