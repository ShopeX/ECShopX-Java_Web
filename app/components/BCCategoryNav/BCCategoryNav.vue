<template>
  <div class="flex h-full w-full flex-col bg-white px-4 py-6 md:px-8 md:py-8">
    <div class="hidden items-center justify-between pb-6 md:flex">
      <button class="flex h-6 w-6 items-center justify-center" @click="handleClose">
        <UIcon name="i-heroicons-x-mark" class="h-6 w-6 text-[#191a1d]" />
      </button>
    </div>

    <div data-testid="category-nav-mobile-header" class="flex items-center pb-10 md:hidden">
      <button
        type="button"
        class="flex h-6 w-6 items-center justify-center"
        :aria-label="t('df37674e.687724')"
        @click="handleClose"
      >
        <UIcon name="i-heroicons-x-mark" class="h-6 w-6 text-[#191a1d]" />
      </button>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto md:hidden">
      <div
        v-if="mobileMenuLevel === 'primary'"
        data-testid="category-nav-mobile-primary"
        class="flex flex-col gap-8"
      >
        <button
          v-for="item in mobilePrimaryItems"
          :key="item.id"
          type="button"
          class="flex w-full items-center justify-between text-left text-[16px] font-medium leading-5 text-[#4a5565]"
          :class="item.children?.length ? 'text-[#191a1d]' : ''"
          @click="openMobilePrimary(item)"
        >
          <span>{{ item.name }}</span>
          <UIcon
            v-if="item.children?.length"
            name="i-heroicons-chevron-right"
            class="h-5 w-5 text-[#191a1d]"
          />
        </button>
      </div>

      <div
        v-else-if="mobileMenuLevel === 'secondary'"
        data-testid="category-nav-mobile-secondary"
        class="flex flex-col gap-8"
      >
        <button
          type="button"
          class="flex items-center gap-2 text-[16px] font-normal leading-6 text-[#4a5565]"
          @click="goMobileBack"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-5 w-5 text-[#191a1d]" />
          <span>{{ mobileSecondaryTitle }}</span>
        </button>
        <button
          v-for="item in mobileSecondaryItems"
          :key="item.id"
          type="button"
          class="flex w-full items-center justify-between text-left text-[16px] font-medium leading-5 text-[#4a5565]"
          :class="item.children?.length ? 'text-[#191a1d]' : ''"
          @click="openMobileSecondary(item)"
        >
          <span>{{ item.name }}</span>
          <UIcon
            v-if="item.children?.length"
            name="i-heroicons-chevron-right"
            class="h-5 w-5 text-[#191a1d]"
          />
        </button>
      </div>

      <div v-else data-testid="category-nav-mobile-tertiary" class="flex flex-col gap-8">
        <button
          type="button"
          class="flex items-center gap-2 text-[16px] font-normal leading-6 text-[#4a5565]"
          @click="goMobileBack"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-5 w-5 text-[#191a1d]" />
          <span>{{ mobileTertiaryTitle }}</span>
        </button>
        <component
          :is="item.external ? 'a' : NuxtLink"
          v-for="item in mobileTertiaryItems"
          :key="item.id"
          v-bind="getMenuLinkProps(item)"
          class="flex w-full flex-col gap-4 text-left"
          @click="handleClose"
        >
          <div class="h-[150px] w-full overflow-hidden bg-[#f3f4f6]">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-[#f3f4f6] text-[14px] text-[#4a5565]"
            >
              {{ item.name }}
            </div>
          </div>
          <span class="text-[16px] font-medium leading-5 text-[#191a1d]">{{ item.name }}</span>
        </component>
      </div>
    </div>

    <div class="hidden min-h-0 flex-1 flex-col overflow-hidden md:flex">
      <div class="flex items-center gap-2 border-b border-[#e5e7eb] pb-4">
        <button class="flex h-5 w-5 items-center justify-center">
          <UIcon name="i-heroicons-magnifying-glass" class="h-5 w-5 text-[#191a1d]" />
        </button>
        <input
          v-model="searchKeyword"
          type="text"
          :placeholder="t('e11aa0ec.2470ef')"
          class="flex-1 border-none bg-transparent text-sm leading-5 text-[#99a1af] outline-none"
          @input="handleSearch"
        />
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto pt-8">
        <div
          v-if="menuColumns.length"
          class="grid min-h-full grid-cols-1 content-start gap-y-8 md:grid-cols-[197px_197px_197px] md:items-start md:gap-x-8"
        >
          <div class="flex flex-col gap-[32px]">
            <button
              v-for="item in menuColumns"
              :key="item.id"
              type="button"
              class="group flex items-center justify-between text-left text-[16px] leading-5 text-[#191a1d] transition-colors"
              :class="item.id === activePrimaryId ? 'font-medium' : 'font-normal hover:opacity-70'"
              @mouseenter="setActivePrimary(item.id)"
              @focus="setActivePrimary(item.id)"
              @click="handlePrimaryAction(item)"
            >
              <span>{{ item.name }}</span>
              <UIcon
                v-if="item.children?.length"
                name="i-heroicons-chevron-right"
                class="h-5 w-5 text-[#191a1d] transition-opacity"
                :class="
                  item.id === activePrimaryId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                "
              />
            </button>
          </div>

          <div v-if="secondaryItems.length" class="flex flex-col gap-[32px]">
            <button
              v-for="secondaryItem in secondaryItems"
              :key="secondaryItem.id"
              type="button"
              class="group flex items-center justify-between text-left text-[16px] leading-5 text-[#191a1d] transition-opacity hover:opacity-70"
              :class="secondaryItem.id === activeSecondaryId ? 'font-medium' : 'font-normal'"
              @mouseenter="setActiveSecondary(secondaryItem.id)"
              @focus="setActiveSecondary(secondaryItem.id)"
              @click="handleSecondaryAction(secondaryItem)"
            >
              <span>{{ secondaryItem.name }}</span>
              <UIcon
                v-if="secondaryItem.children?.length"
                name="i-heroicons-chevron-right"
                class="h-5 w-5 text-[#191a1d] transition-opacity"
                :class="
                  secondaryItem.id === activeSecondaryId
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                "
              />
            </button>
          </div>
          <div v-else class="hidden md:block" />

          <div
            v-if="tertiaryItems.length"
            class="flex flex-col self-start md:w-[197px] md:max-w-[197px] gap-8"
          >
            <component
              :is="featureCard.external ? 'a' : NuxtLink"
              v-for="featureCard in tertiaryItems"
              :key="featureCard.id"
              v-bind="getMenuLinkProps(featureCard)"
              class="flex w-full flex-none flex-col gap-4 text-left transition-opacity hover:opacity-80"
              @click="handleClose"
            >
              <div class="w-full overflow-hidden rounded-none bg-[#f3f4f6]">
                <img
                  v-if="featureCard.image_url"
                  :src="featureCard.image_url"
                  :alt="featureCard.name"
                  class="h-[130px] w-full object-cover"
                />
                <div
                  v-else
                  class="flex h-[130px] w-full items-center justify-center bg-[#f3f4f6] text-sm text-[#6b7280]"
                >
                  {{ featureCard.name }}
                </div>
              </div>
              <span class="text-[16px] font-medium leading-5 text-[#191a1d]">
                {{ featureCard.name }}
              </span>
            </component>
          </div>
        </div>

        <nav v-else class="flex flex-col gap-8">
          <component
            :is="category.external ? 'a' : NuxtLink"
            v-for="category in fallbackCategories"
            :key="category.id"
            v-bind="getMenuLinkProps(category)"
            class="text-base font-medium leading-5 text-[#191a1d] transition-opacity hover:opacity-70"
            @click="handleClose"
          >
            {{ category.name }}
          </component>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NuxtLink } from '#components'
import type { WebMenuItem } from '~/decoration-engine/components/webMenuTypes'
import { isExternalWebMenuLink, resolveWebMenuItemLink, useWebMenu } from '~/composables/useWebMenu'

defineOptions({
  name: 'CategoryNav',
})

interface Props {
  modelValue?: boolean
  menuId?: string | number | null
}

interface CategoryItem extends WebMenuItem {
  external?: boolean
  link: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  menuId: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  search: [keyword: string]
  changeRegion: []
}>()

const localePath = useLocalePath()
const router = useRouter()
const { t } = useI18n()
const { data: menu } = await useWebMenu(props.menuId)

const searchKeyword = ref('')
const activePrimaryId = ref<number | null>(null)
const activeSecondaryId = ref<number | null>(null)
const mobileMenuLevel = ref<'primary' | 'secondary' | 'tertiary'>('primary')
const mobileActivePrimaryId = ref<number | null>(null)
const mobileActiveSecondaryId = ref<number | null>(null)

const fallbackCategories = computed<CategoryItem[]>(() => [
  {
    id: 1,
    name: t('df37674e.7c85ce'),
    link: '/collections/new',
    external: false,
    image_url: '',
    link_type: 'url',
    link_value: '/collections/new',
    children: [],
    sort: 0,
  },
  {
    id: 2,
    name: t('df37674e.6e4493'),
    link: '/collections/bags',
    external: false,
    image_url: '',
    link_type: 'url',
    link_value: '/collections/bags',
    children: [],
    sort: 0,
  },
  {
    id: 3,
    name: t('df37674e.7eff9d'),
    link: '/collections/women',
    external: false,
    image_url: '',
    link_type: 'url',
    link_value: '/collections/women',
    children: [],
    sort: 0,
  },
  {
    id: 4,
    name: t('df37674e.6f340b'),
    link: '/collections/men',
    external: false,
    image_url: '',
    link_type: 'url',
    link_value: '/collections/men',
    children: [],
    sort: 0,
  },
  {
    id: 5,
    name: t('df37674e.7a502d'),
    link: '/collections/kids',
    external: false,
    image_url: '',
    link_type: 'url',
    link_value: '/collections/kids',
    children: [],
    sort: 0,
  },
  {
    id: 6,
    name: t('df37674e.874834'),
    link: '/collections/travel',
    external: false,
    image_url: '',
    link_type: 'url',
    link_value: '/collections/travel',
    children: [],
    sort: 0,
  },
  {
    id: 7,
    name: t('df37674e.7035b2'),
    link: '/collections/jewelry-watches',
    external: false,
    image_url: '',
    link_type: 'url',
    link_value: '/collections/jewelry-watches',
    children: [],
    sort: 0,
  },
  {
    id: 8,
    name: t('df37674e.8cf901'),
    link: '/collections/fragrance-makeup',
    external: false,
    image_url: '',
    link_type: 'url',
    link_value: '/collections/fragrance-makeup',
    children: [],
    sort: 0,
  },
  {
    id: 9,
    name: t('df37674e.259752'),
    link: '/collections/home-living',
    external: false,
    image_url: '',
    link_type: 'url',
    link_value: '/collections/home-living',
    children: [],
    sort: 0,
  },
])

function normalizeMenuItem(item: WebMenuItem): CategoryItem {
  const link = resolveWebMenuItemLink(item)
  return {
    ...item,
    link,
    external: isExternalWebMenuLink(link),
    children: Array.isArray(item.children) ? item.children.map(normalizeMenuItem) : [],
  }
}

const menuColumns = computed<CategoryItem[]>(() =>
  Array.isArray(menu.value?.items) ? menu.value.items.map(normalizeMenuItem) : []
)

const mobilePrimaryItems = computed<CategoryItem[]>(() =>
  menuColumns.value.length ? menuColumns.value : fallbackCategories.value
)

watch(
  menuColumns,
  (items) => {
    if (!items.length) {
      activePrimaryId.value = null
      return
    }

    const hasCurrent = items.some((item) => item.id === activePrimaryId.value)
    if (!hasCurrent) {
      activePrimaryId.value = items[0]?.id ?? null
    }
  },
  { immediate: true }
)

const activePrimary = computed<CategoryItem | null>(
  () => menuColumns.value.find((item) => item.id === activePrimaryId.value) || null
)

const secondaryItems = computed<CategoryItem[]>(() => activePrimary.value?.children || [])

watch(
  secondaryItems,
  (items) => {
    if (!items.length) {
      activeSecondaryId.value = null
      return
    }

    const hasCurrent = items.some((item) => item.id === activeSecondaryId.value)
    if (!hasCurrent) {
      const firstExpandable = items.find((item) => item.children?.length)
      activeSecondaryId.value = firstExpandable?.id ?? items[0]?.id ?? null
    }
  },
  { immediate: true }
)

function setActivePrimary(id: number) {
  activePrimaryId.value = id
}

const activeSecondary = computed<CategoryItem | null>(
  () => secondaryItems.value.find((item) => item.id === activeSecondaryId.value) || null
)

const tertiaryItems = computed<CategoryItem[]>(() => {
  if (activeSecondary.value?.children?.length) {
    return activeSecondary.value.children
      .filter((item) => Boolean(item.image_url))
      .concat(activeSecondary.value.children.filter((item) => !item.image_url))
      .slice(0, 4)
  }

  return []
})

const mobileActivePrimary = computed<CategoryItem | null>(
  () => mobilePrimaryItems.value.find((item) => item.id === mobileActivePrimaryId.value) || null
)

const mobileSecondaryTitle = computed(() => mobileActivePrimary.value?.name || '')
const mobileSecondaryItems = computed<CategoryItem[]>(
  () => mobileActivePrimary.value?.children || []
)

const mobileActiveSecondary = computed<CategoryItem | null>(
  () => mobileSecondaryItems.value.find((item) => item.id === mobileActiveSecondaryId.value) || null
)

const mobileTertiaryTitle = computed(() => mobileActiveSecondary.value?.name || '')
const mobileTertiaryItems = computed<CategoryItem[]>(() => {
  if (mobileActiveSecondary.value?.children?.length) {
    return mobileActiveSecondary.value.children
      .filter((item) => Boolean(item.image_url))
      .concat(mobileActiveSecondary.value.children.filter((item) => !item.image_url))
  }

  return []
})

function setActiveSecondary(id: number) {
  activeSecondaryId.value = id
}

function openMobilePrimary(item: CategoryItem) {
  if (!item.children?.length) {
    navigateMenuItem(item)
    return
  }

  mobileActivePrimaryId.value = item.id
  mobileActiveSecondaryId.value = null
  mobileMenuLevel.value = 'secondary'
}

function openMobileSecondary(item: CategoryItem) {
  if (!item.children?.length) {
    navigateMenuItem(item)
    return
  }

  mobileActiveSecondaryId.value = item.id
  mobileMenuLevel.value = 'tertiary'
}

function goMobileBack() {
  if (mobileMenuLevel.value === 'tertiary') {
    mobileMenuLevel.value = 'secondary'
    mobileActiveSecondaryId.value = null
    return
  }

  mobileMenuLevel.value = 'primary'
  mobileActivePrimaryId.value = null
  mobileActiveSecondaryId.value = null
}

function navigateMenuItem(item: CategoryItem) {
  handleClose()
  if (item.external && import.meta.client) {
    window.open(item.link, '_blank', 'noopener,noreferrer')
    return
  }

  router.push(localePath(item.link))
}

function handlePrimaryAction(item: CategoryItem) {
  if (item.children?.length) {
    setActivePrimary(item.id)
    return
  }

  navigateMenuItem(item)
}

function handleSecondaryAction(item: CategoryItem) {
  if (item.children?.length) {
    setActiveSecondary(item.id)
    return
  }

  navigateMenuItem(item)
}

function getMenuLinkProps(item: CategoryItem) {
  if (item.external) {
    return {
      href: item.link,
      target: '_blank',
      rel: 'noopener noreferrer',
    }
  }

  return {
    to: localePath(item.link),
  }
}

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleSearch() {
  emit('search', searchKeyword.value)
}
</script>

<style scoped>
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px white inset;
  -webkit-text-fill-color: #99a1af;
}

input:focus {
  outline: none;
}
</style>
