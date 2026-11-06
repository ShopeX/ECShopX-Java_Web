<template>
  <div
    class="bg-[#eef0f4] flex flex-col items-start p-[32px] relative self-stretch shrink-0 w-[256px]"
  >
    <div class="w-full pb-6">
      <p class="font-['Noto_Sans_SC:Regular',sans-serif] text-[12px] leading-4 text-[#191a1d]">
        {{ t('8b2de97c.c71d77') }}
      </p>
      <h2
        class="mt-2 w-full truncate font-['Noto_Sans_SC:Medium',sans-serif] text-[16px] font-medium leading-5 text-[#191a1d]"
        :title="welcomeLabel"
      >
        {{ welcomeLabel }}
      </h2>
    </div>

    <nav class="flex flex-col w-full">
      <div v-for="item in menuItems" :key="item.key">
        <button
          type="button"
          class="flex h-[52px] w-full items-center justify-between p-[16px] text-left transition-colors"
          :class="item.key === resolvedActiveMenu ? 'bg-white' : 'hover:bg-white/70'"
          :data-testid="`account-menu-item-${item.key}`"
          @click="handleMenuClick(item.key, item.path)"
        >
          <span
            class="font-['Noto_Sans_SC:Regular',sans-serif] leading-5 relative shrink-0 text-[14px] text-[#364153] whitespace-nowrap"
            :class="item.key === resolvedActiveMenu ? 'font-medium' : 'font-normal'"
            >{{ item.label }}</span
          >
          <UIcon name="i-heroicons-chevron-right" class="h-4 w-4 text-[#364153]" />
        </button>
      </div>

      <div>
        <button
          type="button"
          class="flex h-[52px] w-full items-center justify-between p-[16px] text-left transition-colors hover:bg-white/70"
          data-testid="account-menu-item-logout"
          @click="handleLogout"
        >
          <span
            class="font-['Noto_Sans_SC:Regular',sans-serif] font-normal leading-5 relative shrink-0 text-[14px] text-[#364153] whitespace-nowrap"
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
const { userInfo } = useAuth()
const localePath = useLocalePath()
const { logout } = useAuth()
const { confirm } = useModal()
const isBBC = computed(() => getBusinessMode() === 'bbc')
const welcomeLabel = computed(() => {
  const name = userInfo.value?.username || userInfo.value?.mobile
  return name ? `欢迎回来，${name}` : '欢迎回来'
})

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
