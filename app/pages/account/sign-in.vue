<template>
  <div class="bg-white min-h-screen" data-testid="account-signin-page">
    <!-- PC -->
    <div
      class="hidden md:flex content-stretch items-start justify-center px-[128px] py-[32px] relative shrink-0 w-full"
    >
      <div
        class="content-stretch flex flex-[1_0_0] gap-[64px] items-start min-h-px min-w-px relative lg:min-h-[calc(100vh-var(--layout-header-height,68px)-64px)]"
      >
        <div
          class="w-64 shrink-0 lg:self-start lg:sticky lg:top-[var(--layout-header-height,68px)]"
        >
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </div>

        <div class="content-stretch flex flex-[1_0_0] flex-col gap-6 items-start min-w-px w-full">
          <h2
            class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium text-[16px] leading-5 text-[#101828]"
          >
            {{ t('a8f9884.title') }}
          </h2>

          <div class="flex w-full gap-6 items-start">
            <div class="flex flex-1 flex-col gap-6 min-w-0">
              <section class="border border-[#e5e7eb] p-6 w-full" data-testid="signin-week-section">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-[16px] font-medium text-[#191a1d]">{{ monthTitle }}</h3>
                  <div class="flex gap-4 text-[14px] text-[#4a5565]">
                    <button
                      type="button"
                      class="hover:text-[#191a1d]"
                      data-testid="signin-open-records"
                      @click="showRecords = true"
                    >
                      {{ t('a8f9884.records') }}
                    </button>
                    <button
                      type="button"
                      class="hover:text-[#191a1d]"
                      data-testid="signin-open-rewards"
                      @click="showRewards = true"
                    >
                      {{ t('a8f9884.rewardRecords') }}
                    </button>
                  </div>
                </div>

                <USkeleton v-if="loading" class="h-24 w-full" data-testid="signin-week-loading" />
                <SignInWeekCalendar v-else :days="weekDays" />

                <button
                  type="button"
                  class="mt-6 w-full h-11 text-[16px] font-medium"
                  :class="
                    canSign
                      ? 'bg-[#e8a317] text-white hover:bg-[#d49610]'
                      : 'bg-[#e5e7eb] text-[#99a1af] cursor-not-allowed'
                  "
                  :disabled="!canSign"
                  data-testid="signin-submit-btn"
                  @click="onSignIn"
                >
                  {{
                    signing
                      ? t('a8f9884.signing')
                      : todaySigned
                        ? t('a8f9884.signed')
                        : t('a8f9884.sign')
                  }}
                </button>
              </section>

              <section
                v-if="activity"
                class="border border-[#e5e7eb] p-6 w-full"
                data-testid="signin-activity-section"
              >
                <div class="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 class="text-[16px] font-medium text-[#191a1d]">
                      {{ t('a8f9884.cumRewards') }}
                    </h3>
                    <p class="mt-1 text-[12px] text-[#99a1af]">
                      {{ t('a8f9884.validRange') }}：{{
                        formatRange(activity.start_at, activity.end_at)
                      }}
                    </p>
                  </div>
                  <p class="text-[14px] text-[#4a5565] whitespace-nowrap">
                    {{ t('a8f9884.cumDays') }}
                    <span class="text-[#e8a317] font-medium">{{
                      activity.progress_count ?? 0
                    }}</span>
                    {{ t('a8f9884.daysUnit') }}
                  </p>
                </div>

                <ul class="mt-4 flex flex-col gap-3">
                  <li
                    v-for="(tier, idx) in activity.tiers || []"
                    :key="idx"
                    class="flex items-center justify-between gap-3 border border-[#f3f4f6] px-4 py-3"
                  >
                    <div class="min-w-0">
                      <p class="text-[14px] text-[#191a1d]">
                        {{ ti('a8f9884.tierDays', [tier.threshold]) }}
                      </p>
                      <p class="text-[12px] text-[#4a5565] mt-1">
                        {{ formatTierReward(tier) }}
                      </p>
                    </div>
                    <span
                      class="shrink-0 px-3 py-1.5 text-[12px]"
                      :class="tierStatusClass(tier.status)"
                    >
                      {{ tierStatusText(tier.status) }}
                    </span>
                  </li>
                </ul>
              </section>
            </div>

            <aside class="w-[280px] shrink-0 border border-[#e5e7eb] p-5">
              <h3 class="text-[14px] font-medium text-[#191a1d] mb-3">
                {{ t('a8f9884.rulesTitle') }}
              </h3>
              <ol class="list-decimal pl-4 text-[12px] leading-5 text-[#4a5565] space-y-2">
                <li>{{ t('a8f9884.rule1') }}</li>
                <li>{{ t('a8f9884.rule2') }}</li>
                <li>{{ t('a8f9884.rule3') }}</li>
              </ol>
              <div
                class="mt-5 flex items-center justify-between gap-3 border-t border-[#f3f4f6] pt-4"
                data-testid="signin-reminder"
              >
                <span class="text-[13px] text-[#191a1d]">{{ t('a8f9884.reminder') }}</span>
                <button
                  type="button"
                  role="switch"
                  class="relative h-6 w-11 rounded-full transition-colors"
                  :class="reminderEnabled ? 'bg-[#e8a317]' : 'bg-[#e5e7eb]'"
                  :aria-checked="reminderEnabled"
                  :disabled="reminderSaving || reminderUnavailable"
                  data-testid="signin-reminder-switch"
                  @click="onToggleReminder"
                >
                  <span
                    class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                    :class="reminderEnabled ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>

    <!-- H5 -->
    <div class="flex flex-col min-h-screen md:hidden" data-testid="account-signin-h5">
      <AccountH5FilterBar :title="t('a8f9884.title')" />
      <div class="flex flex-col gap-4 px-4 pb-8 w-full">
        <section class="border border-[#e5e7eb] p-4 w-full">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-[15px] font-medium text-[#191a1d]">{{ monthTitle }}</h3>
            <div class="flex gap-3 text-[13px] text-[#4a5565]">
              <button type="button" data-testid="signin-open-records-h5" @click="showRecords = true">
                {{ t('a8f9884.records') }}
              </button>
              <button type="button" data-testid="signin-open-rewards-h5" @click="showRewards = true">
                {{ t('a8f9884.rewardRecords') }}
              </button>
            </div>
          </div>
          <USkeleton v-if="loading" class="h-24 w-full" />
          <SignInWeekCalendar v-else :days="weekDays" />
          <button
            type="button"
            class="mt-4 w-full h-11 text-[15px] font-medium"
            :class="
              canSign
                ? 'bg-[#e8a317] text-white'
                : 'bg-[#e5e7eb] text-[#99a1af] cursor-not-allowed'
            "
            :disabled="!canSign"
            data-testid="signin-submit-btn-h5"
            @click="onSignIn"
          >
            {{
              signing
                ? t('a8f9884.signing')
                : todaySigned
                  ? t('a8f9884.signed')
                  : t('a8f9884.sign')
            }}
          </button>
        </section>

        <section v-if="activity" class="border border-[#e5e7eb] p-4 w-full">
          <div class="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 class="text-[15px] font-medium text-[#191a1d]">{{ t('a8f9884.cumRewards') }}</h3>
              <p class="mt-1 text-[11px] text-[#99a1af]">
                {{ t('a8f9884.validRange') }}：{{ formatRange(activity.start_at, activity.end_at) }}
              </p>
            </div>
            <p class="text-[12px] text-[#4a5565] whitespace-nowrap">
              {{ t('a8f9884.cumDays') }}
              <span class="text-[#e8a317]">{{ activity.progress_count ?? 0 }}</span>
              {{ t('a8f9884.daysUnit') }}
            </p>
          </div>
          <ul class="flex flex-col gap-2">
            <li
              v-for="(tier, idx) in activity.tiers || []"
              :key="idx"
              class="flex items-center justify-between gap-2 border border-[#f3f4f6] px-3 py-2"
            >
              <div class="min-w-0">
                <p class="text-[13px] text-[#191a1d]">
                  {{ ti('a8f9884.tierDays', [tier.threshold]) }}
                </p>
                <p class="text-[11px] text-[#4a5565]">{{ formatTierReward(tier) }}</p>
              </div>
              <span class="shrink-0 text-[11px] px-2 py-1" :class="tierStatusClass(tier.status)">
                {{ tierStatusText(tier.status) }}
              </span>
            </li>
          </ul>
        </section>

        <section
          class="border border-[#e5e7eb] p-4 w-full flex items-center justify-between gap-3"
          data-testid="signin-reminder-h5"
        >
          <span class="text-[14px] text-[#191a1d]">{{ t('a8f9884.reminder') }}</span>
          <button
            type="button"
            role="switch"
            class="relative h-6 w-11 rounded-full transition-colors"
            :class="reminderEnabled ? 'bg-[#e8a317]' : 'bg-[#e5e7eb]'"
            :aria-checked="reminderEnabled"
            :disabled="reminderSaving || reminderUnavailable"
            data-testid="signin-reminder-switch-h5"
            @click="onToggleReminder"
          >
            <span
              class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform"
              :class="reminderEnabled ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </section>
      </div>
    </div>

    <!-- 签到成功弹层 -->
    <div
      v-if="showSuccess"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      data-testid="signin-success-modal"
      @click.self="showSuccess = false"
    >
      <div class="bg-white w-full max-w-[290px] p-6 relative">
        <button
          type="button"
          class="absolute right-3 top-3 text-[#99a1af]"
          data-testid="signin-success-close"
          @click="showSuccess = false"
        >
          ×
        </button>
        <h3 class="text-center text-[16px] font-medium text-[#191a1d]">
          {{ t('a8f9884.successTitle') }}
        </h3>
        <p class="mt-2 text-center text-[12px] text-[#4a5565]">{{ t('a8f9884.successHint') }}</p>
        <div class="mt-4 flex flex-col items-center gap-2">
          <p
            v-if="Number(lastResult?.daily_point) > 0"
            class="text-[18px] text-[#e8a317] font-medium"
          >
            {{ t('a8f9884.point') }} +{{ lastResult?.daily_point }}
          </p>
          <template v-for="(r, i) in lastResult?.rewards || []" :key="i">
            <p class="text-[14px] text-[#191a1d]">
              {{
                r.title ||
                r.name ||
                (r.type === 'coupon' ? t('a8f9884.coupon') : t('a8f9884.point'))
              }}
              <span v-if="r.amount"> +{{ r.amount }}</span>
            </p>
          </template>
        </div>
      </div>
    </div>

    <SignInRecordsModal v-model="showRecords" />
    <SignInRewardsModal v-model="showRewards" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AccountMenu from './components/AccountMenu.vue'
import AccountH5FilterBar from './components/AccountH5FilterBar.vue'
import SignInWeekCalendar from './components/SignInWeekCalendar.vue'
import SignInRecordsModal from './components/SignInRecordsModal.vue'
import SignInRewardsModal from './components/SignInRewardsModal.vue'
import { useMemberSignIn } from '~/composables/useMemberSignIn'
import { useAuthGuard } from '~/composables/useAuthGuard'
import { useToastMessage } from '~/composables/useToastMessage'
import type { SignInRewardTierStatus } from '~/infrastructure/http/clients/MemberSignInApiClient'

definePageMeta({
  layout: 'default',
  hideMobileHeader: true,
  hideMobileFooter: true,
})

const { t } = useI18n()
const { checkAuth } = useAuthGuard()
const toast = useToastMessage()
const activeMenu = ref('profile')
const showRecords = ref(false)
const showRewards = ref(false)
const showSuccess = ref(false)

const {
  loading,
  signing,
  weekDays,
  todaySigned,
  activity,
  lastResult,
  canSign,
  reminderEnabled,
  reminderUnavailable,
  reminderSaving,
  init,
  submitSignIn,
  setReminderEnabled,
} = useMemberSignIn()

const monthTitle = computed(() => {
  const d =
    weekDays.value.find((x) => x.status?.startsWith('today'))?.date || weekDays.value[0]?.date
  if (!d) return t('a8f9884.monthSignIn')
  const m = Number(d.split('-')[1] || 0)
  return ti('a8f9884.monthSignInN', [m])
})

function ti(key: string, args: unknown[]) {
  return t(key, args as any)
}

function formatRange(start?: string, end?: string) {
  if (!start && !end) return '-'
  const fmt = (s?: string) => (s ? s.slice(0, 10).replace(/-/g, '.') : '')
  return `${fmt(start)} - ${fmt(end)}`
}

function formatTierReward(tier: { point?: number; coupon_name?: string }) {
  const parts: string[] = []
  if (tier.coupon_name) parts.push(tier.coupon_name)
  if (tier.point) parts.push(`${t('a8f9884.point')} +${tier.point}`)
  return parts.join(' / ') || '-'
}

function tierStatusText(status: SignInRewardTierStatus) {
  if (status === 'granted') return t('a8f9884.claimed')
  if (status === 'claimable') return t('a8f9884.claim')
  if (status === 'failed') return t('a8f9884.failed')
  return t('a8f9884.pending')
}

function tierStatusClass(status: SignInRewardTierStatus) {
  if (status === 'claimable') return 'bg-[#e8a317] text-white'
  if (status === 'granted') return 'bg-[#e5e7eb] text-[#99a1af]'
  if (status === 'failed') return 'bg-[#fee2e2] text-[#b91c1c]'
  return 'bg-[#fff7e6] text-[#c9a227]'
}

async function onToggleReminder() {
  const next = !reminderEnabled.value
  try {
    await setReminderEnabled(next)
  } catch (e: any) {
    if (e?.reminderUnavailable) {
      toast.show(t('a8f9884.reminderUnavailable'))
      return
    }
    if (e?.reminderDenied) {
      toast.show(t('a8f9884.reminderDenied'))
      return
    }
    toast.show(e?.message || t('a8f9884.signFailed'))
  }
}

async function onSignIn() {
  try {
    await submitSignIn()
    showSuccess.value = true
  } catch (e: any) {
    if (e?.alreadySigned) {
      toast.show(t('a8f9884.alreadySigned'))
      return
    }
    toast.show(e?.message || t('a8f9884.signFailed'))
  }
}

function handleLogout() {}

onMounted(async () => {
  const ok = checkAuth({ redirectToLogin: true })
  if (!ok) return
  await init()
})
</script>
