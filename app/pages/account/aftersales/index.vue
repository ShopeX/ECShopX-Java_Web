<template>
  <div class="min-h-screen bg-white">
    <div class="sticky top-0 z-10 shrink-0 lg:hidden">
      <AccountH5FilterBar
        v-model="showMobileMenu"
        :title="t('110ad121.056891')"
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
          <div class="w-full bg-[#f3f4f6] px-4 py-4 lg:bg-white lg:px-0 lg:py-0">
            <div class="flex items-center overflow-x-auto no-scrollbar lg:overflow-visible">
              <template v-for="(tab, index) in tabs" :key="tab.key">
                <button
                  type="button"
                  class="whitespace-nowrap py-0 text-[14px] leading-5 transition-colors"
                  :class="getTabClass(tab.key, index)"
                  @click="changeStatus(tab.key)"
                >
                  {{ tab.label }}
                </button>
                <div
                  v-if="index < tabs.length - 1"
                  class="h-5 w-px shrink-0 bg-[#99a1af]"
                  aria-hidden="true"
                />
              </template>
            </div>
          </div>

          <div class="w-full bg-white px-4 lg:px-0">
            <div v-if="(!hasLoaded || loading) && orders.length === 0" class="space-y-4 pt-4">
              <div v-for="i in 3" :key="i" class="border-b border-[#e5e7eb] py-[32px]">
                <div class="mb-4 flex justify-end">
                  <USkeleton class="h-5 w-16" />
                </div>
                <div class="mb-4 flex items-center gap-[10px]">
                  <USkeleton class="h-5 w-5" />
                  <USkeleton class="h-5 w-24" />
                </div>
                <div class="space-y-8">
                  <div v-for="j in 2" :key="j" class="flex gap-4">
                    <USkeleton class="h-24 w-24 shrink-0" />
                    <div class="flex-1 space-y-2">
                      <USkeleton class="h-5 w-40" />
                      <USkeleton class="h-4 w-32" />
                      <USkeleton class="h-4 w-24" />
                    </div>
                    <div class="space-y-2">
                      <USkeleton class="h-5 w-16" />
                      <USkeleton class="h-5 w-14" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else-if="isEmpty"
              class="flex flex-col items-center justify-center py-20 text-[#6b7280]"
            >
              <UIcon
                name="i-heroicons-arrow-path-rounded-square"
                class="mb-4 h-16 w-16 opacity-20"
              />
              <p class="text-[14px]">{{ t('110ad121.346f1a') }}</p>
            </div>

            <div v-else class="pb-8 lg:pt-[32px]">
              <AftersalesOrderCard
                v-for="order in orders"
                :key="order.aftersalesId || order.orderId"
                :order="order"
                @action="handleOrderAction"
              />

              <div v-if="totalPages > 1 && !loading" class="mt-10 w-full">
                <ECPagination
                  :total="total"
                  :page-size="pageSize"
                  :current-page="currentPage"
                  @update:current-page="handlePageChange"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { AftersalesTabKey } from '~/types/api/aftersales'
import { useAftersalesOrders } from '~/composables/useAftersalesOrders'
import AccountMenu from '../components/AccountMenu.vue'
import AccountH5FilterBar from '../components/AccountH5FilterBar.vue'
import AftersalesOrderCard from '../components/AftersalesOrderCard.vue'
import { getBusinessMode } from '~/composables/useTemplate'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const localePath = useLocalePath()

const {
  orders,
  loading,
  hasLoaded,
  currentStatus,
  currentPage,
  pageSize,
  total,
  totalPages,
  isEmpty,
  loadAftersalesOrders,
  changeStatus,
  cancelAftersales,
} = useAftersalesOrders()

const activeMenu = ref('aftersales')
const showMobileMenu = ref(false)
const isBBC = computed(() => getBusinessMode() === 'bbc')

const tabs = computed<{ key: AftersalesTabKey; label: string }[]>(() => [
  { key: 'all', label: t('110ad121.dbb4d8') },
  { key: 'pending', label: t('110ad121.047109') },
  { key: 'processing', label: t('110ad121.5d459d') },
  { key: 'processed', label: t('110ad121.5ad605') },
  { key: 'rejected', label: t('110ad121.dbf36d') },
  { key: 'closed', label: t('110ad121.9c5850') },
])

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

function getTabClass(status: AftersalesTabKey, index: number) {
  const isActive = currentStatus.value === status
  const spacingClass =
    index === 0
      ? 'pr-[8px] lg:pr-[32px]'
      : index === tabs.value.length - 1
        ? 'pl-[8px] lg:pl-[32px]'
        : 'px-[8px] lg:px-[32px]'

  return [
    spacingClass,
    isActive ? 'font-medium text-[#191a1d]' : 'font-normal text-[#99a1af] hover:text-[#364153]',
  ]
}

function handlePageChange(page: number) {
  loadAftersalesOrders(currentStatus.value, page)
}

function handleLogout() {
  console.log('用户已退出登录')
}

function handleOrderAction(payload: { type: string; order: any }) {
  if (payload.type === 'cancel') {
    const aftersalesId = payload.order.aftersalesId
    const itemId = payload.order.items?.[0]?.itemId || payload.order.items?.[0]?.id || ''
    cancelAftersales(aftersalesId, itemId)
  }
}

onMounted(() => {
  loadAftersalesOrders()
})
</script>
