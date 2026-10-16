<template>
  <div class="min-h-screen bg-white" data-testid="account-home-page">
    <div
      class="hidden content-stretch items-start justify-center px-[128px] py-[32px] relative shrink-0 w-full md:flex"
    >
      <div
        class="content-stretch flex flex-[1_0_0] gap-[64px] items-start min-h-px min-w-px relative lg:min-h-[calc(100vh-var(--layout-header-height,68px)-64px)]"
      >
        <aside class="w-64 shrink-0 lg:sticky lg:top-[var(--layout-header-height,68px)]">
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </aside>

        <main class="min-w-0 flex-1" data-testid="account-profile-summary">
          <h1 class="mb-8 text-[16px] font-medium leading-6 text-[#101828]">个人中心</h1>

          <section class="flex items-center justify-between py-8">
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EBEBEB]"
              >
                <UIcon name="i-icon-park-outline:classroom" class="h-9 w-9 text-[#ffffff]" />
              </span>
              <!-- <AccountDefaultAvatar class="h-9 w-9 shrink-0" data-testid="account-avatar" /> -->
              <div class="flex min-w-0 flex-col items-start justify-center gap-2">
                <div class="flex min-w-0 items-center gap-2">
                  <span class="truncate text-[14px] font-normal leading-5 text-[#4a5565]">
                    {{ username }}
                  </span>
                  <button
                    type="button"
                    class="flex shrink-0 items-center gap-1 text-[14px] font-normal leading-5 text-[#4a5565] underline transition-colors hover:text-[#191a1d]"
                    data-testid="account-profile-link"
                    @click="showProfileNotice"
                  >
                    个人信息
                    <UIcon name="i-heroicons-pencil-square" class="h-4 w-4" />
                  </button>
                  -->
                </div>
                <span
                  class="shrink-0 bg-[#f3f4f7] px-1 py-0.5 text-[12px] font-normal leading-4 text-[#4a5565]"
                  data-testid="account-vip-badge"
                >
                  {{ memberLabel }}
                </span>
              </div>
            </div>
            <button
              type="button"
              class="flex shrink-0 flex-col items-center justify-center gap-1 px-5 text-[#4a5565] transition-colors hover:text-[#191a1d]"
              data-testid="account-signin-entry"
              @click="goSignIn"
            >
              <SignInCalendarIcon class="h-[38px] w-[38px]" />
              <span class="text-[14px] font-normal leading-5 text-[rgba(0,0,0,0.9)]">
                {{ t('a8f9884.entry') }}
              </span>
            </button>
          </section>

          <section
            class="mt-6 grid grid-cols-2 border border-[#e5e5e5]"
            aria-label="会员资产摘要"
            data-testid="account-asset-card"
          >
            <NuxtLink
              :to="localePath('/account/coupons')"
              class="flex min-h-[132px] flex-col items-center justify-center transition-colors hover:bg-[#fafafa]"
              data-testid="account-stat-coupon"
            >
              <span class="text-[24px] font-medium leading-9 text-[#191a1d]">{{
                couponCount
              }}</span>
              <span class="mt-2 text-[14px] leading-5 text-[#4a5565]">优惠券</span>
            </NuxtLink>
            <NuxtLink
              :to="localePath('/account/points')"
              class="flex min-h-[132px] flex-col items-center justify-center transition-colors hover:bg-[#fafafa]"
              data-testid="account-stat-point"
            >
              <span class="text-[24px] font-medium leading-9 text-[#191a1d]">{{ pointTotal }}</span>
              <span class="mt-2 text-[14px] leading-5 text-[#4a5565]">积分</span>
            </NuxtLink>
            <!-- 临时隐藏余额入口，后续放开
            <NuxtLink
              v-if="depositEnabled"
              :to="localePath('/account/balance')"
              class="flex min-h-[132px] flex-col items-center justify-center transition-colors hover:bg-[#fafafa]"
              data-testid="account-stat-balance"
            >
              <span class="text-[24px] font-medium leading-9 text-[#191a1d]">{{ balance }}</span>
              <span class="mt-2 text-[14px] leading-5 text-[#4a5565]">余额(元)</span>
            </NuxtLink>
            -->
          </section>

          <p v-if="notice" class="mt-4 text-[12px] leading-4 text-[#4a5565]" role="status">
            {{ notice }}
          </p>
        </main>
      </div>
    </div>

    <div class="flex min-h-screen flex-col md:hidden">
      <AccountH5FilterBar title="个人中心" :active-key="activeMenu" />
      <main class="flex flex-1 flex-col px-4 py-4" data-testid="account-profile-summary-mobile">
        <h1 class="mb-6 text-[16px] font-medium leading-6 text-[#101828]">个人中心</h1>

        <section class="flex items-center justify-between py-8">
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EBEBEB]"
            >
              <UIcon name="i-icon-park-outline:classroom" class="h-9 w-9 text-[#ffffff]" />
            </span>
            <div class="flex min-w-0 flex-col items-start justify-center gap-2">
              <div class="flex min-w-0 items-center gap-2">
                <span class="truncate text-[14px] font-normal leading-5 text-[#4a5565]">{{
                  username
                }}</span>
                <button
                  type="button"
                  class="flex shrink-0 items-center justify-center text-[#4a5565]"
                  aria-label="个人信息"
                  @click="showProfileNotice"
                >
                  <UIcon name="i-heroicons-pencil-square" class="h-4 w-4" />
                </button>
                -->
              </div>
              <span
                class="w-fit bg-[#f3f4f7] px-1 py-0.5 text-[12px] font-normal leading-4 text-[#4a5565]"
              >
                {{ memberLabel }}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="flex shrink-0 flex-col items-center justify-center gap-1 px-[10px] text-[#4a5565]"
            data-testid="account-signin-entry-h5"
            @click="goSignIn"
          >
            <SignInCalendarIcon class="h-[26px] w-[26px]" :stroke-width="1.5" />
            <span class="text-[11px] leading-[13px] tracking-[0.06px] text-[rgba(0,0,0,0.9)]">
              {{ t('a8f9884.entry') }}
            </span>
          </button>
        </section>

        <section class="mt-4 grid grid-cols-2 border border-[#e5e5e5]" aria-label="会员资产摘要">
          <NuxtLink
            :to="localePath('/account/coupons')"
            class="flex flex-col items-center justify-center py-[21px]"
          >
            <span class="text-[20px] font-medium leading-[25px] tracking-[-0.45px] text-[#191a1d]">
              {{ couponCount }}
            </span>
            <span class="mt-2 text-[12px] leading-4 tracking-[0.5px] text-[#4a5565]">优惠券</span>
          </NuxtLink>
          <NuxtLink
            :to="localePath('/account/points')"
            class="flex flex-col items-center justify-center py-[21px]"
            data-testid="account-stat-point-mobile"
          >
            <span class="text-[20px] font-medium leading-[25px] tracking-[-0.45px] text-[#191a1d]">
              {{ pointTotal }}
            </span>
            <span class="mt-2 text-[12px] leading-4 tracking-[0.5px] text-[#4a5565]">积分</span>
          </NuxtLink>
          <!-- 临时隐藏余额入口，后续放开
          <NuxtLink
            v-if="depositEnabled"
            :to="localePath('/account/balance')"
            class="flex flex-col items-center justify-center py-[21px]"
            data-testid="account-stat-balance-mobile"
          >
            <span class="text-[20px] font-medium leading-[25px] tracking-[-0.45px] text-[#191a1d]">
              {{ balance }}
            </span>
            <span class="mt-2 text-[12px] leading-4 tracking-[0.5px] text-[#4a5565]">余额(元)</span>
          </NuxtLink>
          -->
        </section>

        <p v-if="notice" class="mt-4 text-[12px] leading-4 text-[#4a5565]" role="status">
          {{ notice }}
        </p>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AccountH5FilterBar from './components/AccountH5FilterBar.vue'
import AccountMenu from './components/AccountMenu.vue'
import AccountDefaultAvatar from './components/AccountDefaultAvatar.vue'
import SignInCalendarIcon from './components/SignInCalendarIcon.vue'
import { useAuth } from '~/composables/useAuth'
// 临时隐藏余额入口，后续放开
// import { loadDepositAvailability } from '~/composables/useMemberDeposit'
// import { formatFenToYuan, resolveDepositFen } from '~/utils/memberDeposit'
import { useMemberPoint } from '~/composables/useMemberPoint'
import { useUserCoupons } from '~/composables/useUserCoupons'

definePageMeta({ layout: 'default' })

const router = useRouter()
const { t } = useI18n()
const { userInfo } = useAuth()
const localePath = useLocalePath()
const activeMenu = ref('profile')
// 临时隐藏余额入口，后续放开
// const balanceFen = ref(0)
// const depositEnabled = ref(false)
const notice = ref('')
const { availableList, fetchCoupons } = useUserCoupons()
const { pointTotal, loadPointInfo } = useMemberPoint()

const username = computed(() => userInfo.value?.username || userInfo.value?.mobile || '暂无')
const memberLabel = computed(() => (userInfo.value?.isPlusVip ? 'VIP会员' : '会员'))
const couponCount = computed(() => availableList.value.length)
// const balance = computed(() => formatFenToYuan(balanceFen.value))

// 默认头像为设计稿占位（#EBEBEB + 白色线稿）；恢复 API 头像时改回 img + userInfo.avatar

async function loadAccountSummary() {
  await Promise.allSettled([fetchCoupons(), loadPointInfo()])
}

// 临时隐藏余额入口，后续放开
// async function loadDepositEntry() {
//   const { enabled, info } = await loadDepositAvailability()
//   depositEnabled.value = enabled
//   balanceFen.value = info ? resolveDepositFen(info) : 0
// }

function goSignIn() {
  router.push(localePath('/account/sign-in'))
}

function showProfileNotice() {
  notice.value = '个人信息编辑功能即将开放'
  window.setTimeout(() => {
    notice.value = ''
  }, 3000)
}

function handleLogout() {
  console.log('用户已退出登录')
}

onMounted(loadAccountSummary)
</script>
