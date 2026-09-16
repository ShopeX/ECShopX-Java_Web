<template>
  <!-- 布局与 account/index.vue 保持一致 -->
  <div class="bg-white min-h-screen">
    <!-- PC 端布局：与 index.vue 一致 -->
    <div
      class="hidden md:flex content-stretch items-start justify-center px-[128px] py-[32px] relative shrink-0 w-full"
    >
      <div
        class="content-stretch flex flex-[1_0_0] gap-[64px] items-start min-h-px min-w-px relative lg:min-h-[calc(100vh-var(--layout-header-height,68px)-64px)]"
      >
        <!-- 左侧菜单 -->
        <div
          class="w-64 shrink-0 lg:self-start lg:sticky lg:top-[var(--layout-header-height,68px)]"
        >
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </div>

        <!-- 右侧内容区域 -->
        <div
          class="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative"
        >
          <div
            class="bg-white content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full"
          >
            <div class="relative shrink-0 w-full">
              <!-- 标题：与 index 一致 16px #101828 -->
              <div
                class="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative w-full"
              >
                <h2
                  class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[16px] text-[#101828] whitespace-nowrap"
                >
                  {{ t('ee3264ed.2f3635') }}
                </h2>
              </div>
            </div>

            <!-- Tab 切换 -->
            <div class="relative shrink-0 w-full border-b border-[#e5e7eb] flex gap-4 items-center">
              <button
                type="button"
                class="min-h-[44px] flex items-center gap-0.5 relative cursor-pointer pb-0 pt-0"
                @click="activeTab = 'available'"
              >
                <span
                  class="text-sm leading-5"
                  :class="
                    activeTab === 'available' ? 'text-[#191a1d] font-medium' : 'text-[#4a5565]'
                  "
                  >{{ t('6c65730d.968205') }}</span
                ><span
                  class="text-xs leading-4"
                  :class="activeTab === 'available' ? 'text-[#191a1d]' : 'text-[#99a1af]'"
                  >({{ availableList.length }})</span
                >
                <div
                  v-if="activeTab === 'available'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#191a1d]"
                />
              </button>
              <button
                type="button"
                class="min-h-[44px] flex items-center gap-0.5 relative cursor-pointer pb-0 pt-0"
                @click="activeTab = 'unavailable'"
              >
                <span
                  class="text-sm leading-5"
                  :class="
                    activeTab === 'unavailable' ? 'text-[#191a1d] font-medium' : 'text-[#4a5565]'
                  "
                  >{{ t('6c65730d.c3a1b6') }}</span
                ><span
                  class="text-xs leading-4"
                  :class="activeTab === 'unavailable' ? 'text-[#191a1d]' : 'text-[#99a1af]'"
                  >({{ unavailableList.length }})</span
                >
                <div
                  v-if="activeTab === 'unavailable'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#191a1d]"
                />
              </button>
            </div>

            <!-- 优惠券列表 -->
            <div
              class="relative shrink-0 w-full content-stretch flex flex-col gap-[16px] items-start"
            >
              <div v-if="loading" class="py-16 text-center text-[#4a5565] w-full">
                {{ t('de8076e6.26b5bd') }}
              </div>
              <div v-else-if="currentList.length > 0" class="grid grid-cols-2 gap-4 w-full">
                <CouponCard v-for="coupon in currentList" :key="coupon.id" :coupon="coupon" />
              </div>
              <div
                v-else
                class="py-16 text-center text-[#4a5565] text-sm w-full font-['Noto_Sans_SC:Regular',sans-serif]"
              >
                {{ t('6c65730d.25b35e') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- H5 端布局：按 Figma 2956:17534 还原 -->
    <ClientOnly>
      <div class="relative flex flex-col bg-white md:hidden" data-testid="coupons-page">
        <div
          class="flex flex-wrap items-start justify-center gap-y-[10px] bg-white px-4"
          data-testid="coupons-mobile-header"
        >
          <div class="flex min-h-px w-full items-center justify-between py-6">
            <div class="flex w-[167.5px] items-center gap-4">
              <NuxtLink
                :to="localePath('/')"
                class="shrink-0 font-['Inter',sans-serif] text-[20px] font-semibold leading-10 tracking-[-0.531px] text-[#191a1d]"
              >
                LOGO
              </NuxtLink>
              <div class="flex h-5 items-center gap-3">
                <button
                  type="button"
                  class="flex h-5 w-5 items-center justify-center"
                  :aria-label="t('6c65730d.e5f71f')"
                >
                  <svg class="h-5 w-5 text-[#191a1d]" viewBox="0 0 20 20" fill="none">
                    <circle cx="8.5" cy="8.5" r="5.375" stroke="currentColor" stroke-width="1.25" />
                    <path
                      d="M12.6 12.6L17.5 17.5"
                      stroke="currentColor"
                      stroke-width="1.25"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  class="flex h-5 w-5 items-center justify-center"
                  :aria-label="t('6c65730d.4ccbdc')"
                >
                  <svg class="h-5 w-5 text-[#191a1d]" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M3.333 4.792H16.667"
                      stroke="currentColor"
                      stroke-width="1.25"
                      stroke-linecap="round"
                    />
                    <path
                      d="M3.333 10H16.667"
                      stroke="currentColor"
                      stroke-width="1.25"
                      stroke-linecap="round"
                    />
                    <path
                      d="M3.333 15.208H16.667"
                      stroke="currentColor"
                      stroke-width="1.25"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex h-5 items-center justify-end gap-3">
              <button
                type="button"
                class="flex h-5 w-5 items-center justify-center"
                :aria-label="t('6c65730d.53754b')"
                @click="router.push(localePath('/cart'))"
              >
                <svg class="h-5 w-5 text-[#191a1d]" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="2.5"
                    y="1.667"
                    width="15"
                    height="16.667"
                    rx="1.5"
                    stroke="currentColor"
                    stroke-width="1.25"
                  />
                  <path
                    d="M4 5H16"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-linecap="round"
                  />
                  <text
                    x="10"
                    y="11.5"
                    text-anchor="middle"
                    font-size="10"
                    font-weight="500"
                    fill="currentColor"
                    font-family="Inter, sans-serif"
                  >
                    {{ cartItemCount > 0 ? (cartItemCount > 99 ? '99' : cartItemCount) : '' }}
                  </text>
                </svg>
              </button>
              <button
                type="button"
                class="flex h-5 w-5 items-center justify-center"
                :aria-label="t('de8076e6.a73872')"
                @click="router.push(localePath('/account/orders'))"
              >
                <svg class="h-5 w-5 text-[#191a1d]" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="3"
                    y="1.667"
                    width="14"
                    height="16.667"
                    rx="1.5"
                    stroke="currentColor"
                    stroke-width="1.25"
                  />
                  <path
                    d="M6 6H14"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-linecap="round"
                  />
                  <path
                    d="M6 10H14"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-linecap="round"
                  />
                  <path
                    d="M6 14H14"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                class="flex h-5 w-5 items-center justify-center"
                :aria-label="t('6c65730d.1fd02a')"
                @click="handleMobileUser"
              >
                <svg class="h-5 w-5 text-[#191a1d]" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5.417 16.667C5.417 14.365 7.568 12.5 10.001 12.5C12.434 12.5 14.584 14.365 14.584 16.667"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-linecap="round"
                  />
                  <circle cx="10" cy="6.25" r="3.125" stroke="currentColor" stroke-width="1.25" />
                </svg>
              </button>
              <button
                type="button"
                class="flex h-5 w-5 items-center justify-center"
                :aria-label="t('6c65730d.295bb7')"
              >
                <svg class="h-5 w-5 text-[#191a1d]" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.25" />
                  <path
                    d="M2.917 10H17.083"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-linecap="round"
                  />
                  <path
                    d="M10 2.5C11.995 4.585 13.125 7.219 13.125 10C13.125 12.781 11.995 15.415 10 17.5"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-linecap="round"
                  />
                  <path
                    d="M10 2.5C8.005 4.585 6.875 7.219 6.875 10C6.875 12.781 8.005 15.415 10 17.5"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="relative">
          <div
            class="flex items-center justify-between bg-white p-4"
            data-testid="coupons-filter-bar"
          >
            <button
              type="button"
              class="flex items-center gap-2"
              data-testid="coupons-filter-trigger"
              @click="showMobileMenu = !showMobileMenu"
            >
              <span
                class="font-['Noto_Sans_SC',sans-serif] text-[16px] font-medium leading-5 text-[#191a1d]"
              >
                {{ t('ee3264ed.2f3635') }}
              </span>
              <Icon
                name="ph:caret-down"
                class="h-4 w-4 text-[#191a1d] transition-transform"
                :class="showMobileMenu ? 'rotate-180' : ''"
              />
            </button>
          </div>

          <div
            v-if="showMobileMenu"
            class="absolute left-0 right-0 top-full z-40 flex min-h-[calc(100vh-52px)] w-full flex-col items-start bg-white px-4"
            data-testid="coupons-mobile-sheet"
          >
            <button
              v-for="item in mobileMenuItems"
              :key="item.key"
              type="button"
              class="flex w-full items-center justify-start border-b border-[#e5e7eb] py-4 text-left"
              @click="handleMobileMenuSelect(item)"
            >
              <span
                class="block w-full font-['Noto_Sans_SC',sans-serif] text-[16px] font-medium leading-5"
                :class="item.key === activeMenu ? 'text-[#191a1d]' : 'text-[#4a5565]'"
              >
                {{ item.label }}
              </span>
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-4 px-4" data-testid="coupons-mobile-content">
          <div class="flex items-center gap-4 border-b border-[#e5e7eb]" data-testid="coupons-tabs">
            <button
              type="button"
              class="relative h-11 w-[99.844px] shrink-0 cursor-pointer"
              data-testid="coupons-tab-available"
              :aria-selected="activeTab === 'available' ? 'true' : 'false'"
              @click="activeTab = 'available'"
            >
              <span
                class="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap text-center text-[0px] leading-none"
                :class="activeTab === 'available' ? 'text-[#191a1d]' : 'text-[#4a5565]'"
              >
                <span class="text-[14px] leading-5">{{ t('6c65730d.968205') }}</span>
                <span
                  class="text-[12px] leading-4"
                  :class="activeTab === 'available' ? 'text-[#191a1d]' : 'text-[#99a1af]'"
                >
                  ({{ availableList.length }})
                </span>
              </span>
              <div
                v-if="activeTab === 'available'"
                class="absolute left-5 top-[42px] h-0.5 w-[59.844px] bg-[#191a1d]"
              />
            </button>
            <button
              type="button"
              class="relative h-11 w-[98.313px] shrink-0 cursor-pointer"
              data-testid="coupons-tab-unavailable"
              :aria-selected="activeTab === 'unavailable' ? 'true' : 'false'"
              @click="activeTab = 'unavailable'"
            >
              <span
                class="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap text-center text-[0px] leading-none"
                :class="activeTab === 'unavailable' ? 'text-[#191a1d]' : 'text-[#4a5565]'"
              >
                <span class="text-[14px] leading-5">{{ t('6c65730d.c3a1b6') }}</span>
                <span
                  class="text-[12px] leading-4"
                  :class="activeTab === 'unavailable' ? 'text-[#191a1d]' : 'text-[#99a1af]'"
                >
                  ({{ unavailableList.length }})
                </span>
              </span>
              <div
                v-if="activeTab === 'unavailable'"
                class="absolute left-5 top-[42px] h-0.5 w-[59.844px] bg-[#191a1d]"
              />
            </button>
          </div>

          <div v-if="loading" class="py-16 text-center text-[#4a5565]">
            {{ t('de8076e6.26b5bd') }}
          </div>
          <div
            v-else-if="currentList.length > 0"
            class="flex flex-col gap-4"
            data-testid="coupons-list"
          >
            <CouponCard
              v-for="coupon in currentList"
              :key="coupon.id"
              :coupon="coupon"
              :mobile-display="true"
              test-id="coupon-card"
            />
          </div>

          <div v-else class="py-16 text-center text-sm text-[#4a5565]" data-testid="coupons-empty">
            {{ t('6c65730d.25b35e') }}
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AccountMenu from './components/AccountMenu.vue'
import CouponCard from './components/CouponCard.vue'
import { useUserCoupons } from '~/composables/useUserCoupons'
import { getBusinessMode } from '~/composables/useTemplate'

// 设置页面元信息
definePageMeta({
  layout: 'default',
  hideMobileHeader: true,
  hideMobileFooter: true,
})

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const userStore = useUserStore()
const cartStore = useCartStore()
const activeMenu = ref('coupons')
const showMobileMenu = ref(false)
const isBBC = computed(() => getBusinessMode() === 'bbc')

const mobileMenuItems = computed(() => {
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

const cartItemCount = computed(() => cartStore.totalItems || 0)

// 优惠券数据
const { availableList, unavailableList, loading, fetchCoupons } = useUserCoupons()

// Tab 状态: 'available' | 'unavailable'
const activeTab = ref<'available' | 'unavailable'>('available')

// 当前选中的优惠券列表（PC 与 H5 共用，按 Tab 切换）
const currentList = computed(() => {
  return activeTab.value === 'available' ? availableList.value : unavailableList.value
})

/**
 * 处理退出登录
 */
function handleLogout() {
  console.log('用户已退出登录')
}

async function handleMobileMenuSelect(item: { key: string; label: string; path: string }) {
  showMobileMenu.value = false

  if (item.path && item.path !== router.currentRoute.value.path) {
    await router.push(item.path)
  }
}

function handleMobileUser() {
  if (userStore.isLoggedIn) {
    router.push(localePath('/account'))
    return
  }

  router.push({
    path: localePath('/account/login'),
    query: {
      redirect: router.currentRoute.value.fullPath,
    },
  })
}

onMounted(() => {
  fetchCoupons()
})
</script>
