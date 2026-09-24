<template>
  <div
    class="bg-[#f3f4f6] flex flex-col items-start p-[32px] relative self-stretch shrink-0 w-[256px]"
  >
    <div class="mb-4">
      <h2
        class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[48px] relative shrink-0 text-[24px] text-[color:var(--color黑,#191a1d)] whitespace-nowrap"
      >
        {{ t('8b2de97c.c71d77') }}
      </h2>
    </div>

    <nav class="flex flex-col w-full">
      <div v-for="item in menuItems" :key="item.key" class="py-[16px]">
        <button
          type="button"
          class="flex w-full items-center justify-between p-[16px] text-left transition-colors"
          :class="item.key === resolvedActiveMenu ? 'bg-white' : 'hover:bg-white/70'"
          :data-testid="`account-menu-item-${item.key}`"
          @click="handleMenuClick(item.key, item.path)"
        >
          <span
            class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[16px] text-[color:var(--color亚黑,#364153)] whitespace-nowrap"
            >{{ item.label }}</span
          >
          <UIcon name="i-heroicons-chevron-right" class="h-4 w-4 text-[#364153]" />
        </button>
      </div>

      <div class="py-[16px]">
        <button
          type="button"
          class="flex w-full items-center justify-between p-[16px] text-left transition-colors hover:bg-white/70"
          data-testid="account-menu-item-logout"
          @click="handleLogout"
        >
          <span
            class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[16px] text-[color:var(--color亚黑,#364153)] whitespace-nowrap"
            >{{ t('8b2de97c.44efd1') }}</span
          >
          <UIcon name="i-heroicons-chevron-right" class="h-4 w-4 text-[#364153]" />
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useModal } from '~/composables/useModal'
import { getBusinessMode } from '~/composables/useTemplate'

// Props
interface Props {
  /** 当前激活的菜单项 */
  modelValue?: string
}

defineOptions({
  name: 'AccountMenu',
})

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'profile',
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  logout: []
}>()

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { logout } = useAuth()
const { confirm } = useModal()
const isBBC = computed(() => getBusinessMode() === 'bbc')

const menuItems = computed(() => {
  const items = [
    { key: 'profile', label: t('96a0d248.4f7a2a'), path: localePath('/account') },
    { key: 'orders', label: t('de8076e6.a73872'), path: localePath('/account/orders') },
    {
      key: 'aftersales',
      label: t('110ad121.056891'),
      path: localePath('/account/aftersales'),
    },
    { key: 'coupons', label: t('ee3264ed.2f3635'), path: localePath('/account/coupons') },
    { key: 'favorites', label: t('8b2de97c.975ff6'), path: localePath('/account/favorites') },
  ]

  if (isBBC.value) {
    items.push({
      key: 'followStores',
      label: t('1d80cba8.a6c36f'),
      path: localePath('/account/follow-stores'),
    })
  }

  items.push(
    { key: 'address', label: t('ee3264ed.748ea9'), path: localePath('/account/address') },
    {
      key: 'activityBooking',
      label: t('registration.activityBooking'),
      path: localePath('/account/activity-booking'),
    },
    {
      key: 'registrations',
      label: t('registration.myRegistrations'),
      path: localePath('/account/registrations'),
    },
    { key: 'reviews', label: t('8b2de97c.b3bf09'), path: localePath('/account/reviews') }
  )

  return items
})

const activeRouteKey = computed(() => {
  const match = menuItems.value.find((item) => item.path === route.path)
  return match?.key
})

const resolvedActiveMenu = computed(() => activeRouteKey.value ?? props.modelValue)

watch(
  activeRouteKey,
  (value) => {
    if (value && value !== props.modelValue) {
      emit('update:modelValue', value)
    }
  },
  { immediate: true }
)

/**
 * 处理菜单点击
 */
function handleMenuClick(menuKey: string, path: string) {
  emit('update:modelValue', menuKey)

  if (route.path !== path) {
    router.push(path)
  }
}

/**
 * 处理退出登录
 */
function handleLogout() {
  confirm({
    title: t('8b2de97c.44efd1'),
    content: t('8b2de97c.75c78d'),
    onConfirm: async () => {
      try {
        await logout()
        emit('logout')
        router.push(localePath('/'))
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    },
  })
}
</script>

<style scoped>
/* Noto Sans SC 字体已在全局引入，这里不需要额外设置 */
</style>
