<template>
  <div class="min-h-screen bg-white" data-testid="account-follow-stores-page">
    <div class="sticky top-0 z-10 shrink-0 lg:hidden">
      <AccountH5FilterBar
        v-model="showMobileMenu"
        :title="t('1d80cba8.a6c36f')"
        :active-key="activeMenu"
        :menu-items="menuItems"
      />
    </div>

    <div class="relative w-full lg:flex lg:justify-center lg:px-[128px] lg:py-[32px]">
      <div
        class="relative flex min-h-px min-w-px flex-[1_0_0] items-start gap-0 lg:gap-[64px] lg:min-h-[calc(100vh-var(--layout-header-height,68px)-64px)]"
      >
        <div
          class="hidden w-64 shrink-0 lg:block lg:self-start lg:sticky lg:top-[var(--layout-header-height,68px)]"
        >
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </div>

        <div class="relative min-w-0 flex-[1_0_0]">
          <div class="w-full bg-white px-4 py-6 lg:px-0 lg:py-0">
            <div class="mb-4 w-full lg:mb-4">
              <h2 class="text-[16px] font-medium leading-5 text-[#191a1d]">
                {{ t('1d80cba8.a6c36f') }}
              </h2>
            </div>

            <div v-if="loading && stores.length === 0" class="space-y-4">
              <div v-for="index in 2" :key="index" class="border border-[#e5e7eb] p-4 lg:p-0">
                <div class="lg:flex">
                  <div class="space-y-3 lg:w-[284px] lg:shrink-0 lg:px-8 lg:py-6">
                    <div class="flex items-center gap-3 lg:flex-col">
                      <USkeleton class="h-12 w-12 rounded-full" />
                      <div class="space-y-2">
                        <USkeleton class="h-5 w-28" />
                        <USkeleton class="h-4 w-36" />
                      </div>
                    </div>
                    <div class="flex gap-3">
                      <USkeleton class="h-9 flex-1" />
                      <USkeleton class="h-9 flex-1" />
                    </div>
                  </div>
                  <div
                    class="mt-4 grid grid-cols-2 gap-3 lg:mt-0 lg:flex lg:flex-1 lg:px-4 lg:py-4"
                  >
                    <div v-for="item in 4" :key="item" class="space-y-2">
                      <USkeleton class="aspect-square w-full lg:h-[120px] lg:w-[120px]" />
                      <USkeleton class="h-4 w-full" />
                      <USkeleton class="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else-if="errorMessage"
              class="flex min-h-[240px] items-center justify-center text-[14px] text-[#6b7280]"
            >
              {{ t(errorMessage) }}
            </div>

            <div
              v-else-if="isEmpty"
              class="flex min-h-[240px] items-center justify-center text-[14px] text-[#6b7280]"
            >
              {{ t('1d80cba8.0b8897') }}
            </div>

            <div v-else class="space-y-4">
              <FollowedStoreCard
                v-for="store in stores"
                :key="store.id || store.distributorId"
                :store="store"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AccountMenu from './components/AccountMenu.vue'
import AccountH5FilterBar from './components/AccountH5FilterBar.vue'
import FollowedStoreCard from './components/FollowedStoreCard.vue'
import { useFollowedStores } from '~/composables/useFollowedStores'
import { getBusinessMode } from '~/composables/useTemplate'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const localePath = useLocalePath()

const { stores, loading, errorMessage, isEmpty, loadFollowedStores } = useFollowedStores()

const isBBC = computed(() => getBusinessMode() === 'bbc')
const activeMenu = ref('followStores')
const showMobileMenu = ref(false)

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

function handleLogout() {
  console.log('用户已退出登录')
}

onMounted(() => {
  loadFollowedStores()
})
</script>
