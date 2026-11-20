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
            class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium text-[16px] leading-6 text-[#101828]"
          >
            {{ t('a8f9884.title') }}
          </h2>

          <div class="flex w-full items-start gap-[30px]">
            <div class="flex min-w-[500px] max-w-[720px] flex-1 flex-col gap-4">
              <section
                class="w-full border border-[#ebebeb] px-5 py-[30px]"
                data-testid="signin-week-section"
              >
                <div class="flex items-start justify-between">
                  <h3 class="flex-1 text-[20px] font-medium leading-5 text-[#191a1d]">
                    {{ monthTitle }}
                  </h3>
                  <div
                    class="flex shrink-0 items-center gap-[10px] text-[12px] font-medium tracking-[0.4px] text-[rgba(27,31,38,0.72)]"
                  >
                    <button
                      type="button"
                      class="hover:text-[#191a1d]"
                      data-testid="signin-open-records"
                      @click="showRecords = true"
                    >
                      {{ t('a8f9884.records') }}
                    </button>
                    <span class="h-[10px] w-px shrink-0 bg-[#e9e9eb]" aria-hidden="true" />
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

                <div class="mt-6">
                  <USkeleton v-if="loading" class="h-20 w-full" data-testid="signin-week-loading" />
                  <SignInWeekCalendar v-else :days="weekDays" />
                </div>

                <button
                  type="button"
                  class="mt-6 w-full py-4 text-[14px] font-medium tracking-[0.1px]"
                  :class="
                    canSign
                      ? 'bg-[#0f0f10] text-white hover:bg-black'
                      : 'bg-[#b5b9bf] text-white cursor-not-allowed'
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
                class="w-full border border-[#e5e5e5] px-5 py-[30px]"
                data-testid="signin-activity-section"
              >
                <div class="flex items-start justify-between gap-4 py-[3px]">
                  <div class="flex min-w-0 flex-1 flex-col gap-[10px]">
                    <h3 class="text-[16px] font-medium leading-none text-[rgba(0,0,0,0.9)]">
                      {{ t('a8f9884.cumRewards') }}
                    </h3>
                    <p class="whitespace-nowrap text-[12px] leading-none text-[#999]">
                      {{ t('a8f9884.validRange') }}：{{
                        formatRange(activity.start_at, activity.end_at)
                      }}
                    </p>
                  </div>
                  <div class="flex shrink-0 items-baseline gap-1 whitespace-nowrap">
                    <span class="text-[14px] leading-5 text-[#999]">{{
                      t('a8f9884.cumDays')
                    }}</span>
                    <span class="text-[16px] font-medium leading-6 text-[rgba(0,0,0,0.9)]">{{
                      activity.progress_count ?? 0
                    }}</span>
                    <span class="text-[14px] leading-5 text-[#999]">{{
                      t('a8f9884.daysUnit')
                    }}</span>
                  </div>
                </div>

                <ul class="mt-5 flex flex-col">
                  <li
                    v-for="(tier, idx) in activity.tiers || []"
                    :key="idx"
                    class="flex w-full items-center justify-between border-b border-[#f2f2f2] py-5 last:border-b-0"
                  >
                    <div class="flex min-w-0 items-center gap-[30px]">
                      <span class="shrink-0 whitespace-nowrap text-[14px] font-medium text-[#666]">
                        {{ ti('a8f9884.tierDays', [tier.threshold]) }}
                      </span>
                      <div class="flex shrink-0 flex-col gap-2">
                        <span
                          v-for="(reward, i) in tierRewards(tier)"
                          :key="i"
                          class="flex items-center gap-[10px]"
                        >
                          <SignInIcon
                            :name="reward.type === 'coupon' ? 'coupon' : 'boxes'"
                            class="size-[15px] shrink-0 text-[#DADADA]"
                          />
                          <span class="text-[12px] font-medium text-[#222]">{{
                            reward.label
                          }}</span>
                        </span>
                      </div>
                    </div>
                    <span
                      class="flex w-20 shrink-0 items-center justify-center px-4 py-2 text-[12px]"
                      :class="tierStatusClass(tier.status)"
                    >
                      {{ tierStatusText(tier.status) }}
                    </span>
                  </li>
                </ul>
              </section>
            </div>

            <aside
              v-if="ruleDesc"
              class="flex w-[280px] shrink flex-col gap-3 self-stretch border border-[#eaebee] px-5 py-[30px]"
              data-testid="signin-rules-section"
            >
              <h3 class="w-full text-[14px] font-medium text-[#1a1d20]">
                {{ t('a8f9884.rulesTitle') }}
              </h3>
              <div
                class="signin-rule-desc w-full text-[12px] leading-[1.5] text-[#626875]"
                data-testid="signin-rule-desc"
                v-html="ruleDesc"
              />
            </aside>
          </div>
        </div>
      </div>
    </div>

    <!-- H5 -->
    <div class="flex flex-col min-h-screen md:hidden" data-testid="account-signin-h5">
      <AccountH5FilterBar :title="t('a8f9884.title')" />
      <div class="flex w-full flex-col gap-[9px] p-[10px]">
        <section class="flex w-full flex-col gap-6 border border-[#ebebeb] px-3 py-4">
          <div class="flex items-start justify-between">
            <h3 class="flex-1 text-[16px] font-medium leading-5 text-[#191a1d]">
              {{ monthTitle }}
            </h3>
            <div
              class="flex shrink-0 items-center gap-[10px] text-[12px] font-medium tracking-[0.4px] text-[rgba(27,31,38,0.72)]"
            >
              <button
                type="button"
                data-testid="signin-open-records-h5"
                @click="showRecords = true"
              >
                {{ t('a8f9884.records') }}
              </button>
              <span class="h-[10px] w-px shrink-0 bg-[#e9e9eb]" aria-hidden="true" />
              <button
                type="button"
                data-testid="signin-open-rewards-h5"
                @click="showRewards = true"
              >
                {{ t('a8f9884.rewardRecords') }}
              </button>
            </div>
          </div>
          <USkeleton v-if="loading" class="h-20 w-full" />
          <SignInWeekCalendar v-else :days="weekDays" />
          <button
            type="button"
            class="w-full py-4 text-[14px] font-medium tracking-[0.1px]"
            :class="
              canSign ? 'bg-[#0f0f10] text-white' : 'bg-[#b5b9bf] text-white cursor-not-allowed'
            "
            :disabled="!canSign"
            data-testid="signin-submit-btn-h5"
            @click="onSignIn"
          >
            {{
              signing ? t('a8f9884.signing') : todaySigned ? t('a8f9884.signed') : t('a8f9884.sign')
            }}
          </button>
        </section>

        <section
          v-if="activity"
          class="flex w-full flex-col gap-[10px] border border-[#e5e5e5] px-3 py-4"
        >
          <div class="flex items-start justify-between gap-3 py-[3px]">
            <div class="flex min-w-0 flex-1 flex-col gap-[10px]">
              <h3 class="text-[14px] font-medium leading-none text-[rgba(0,0,0,0.9)]">
                {{ t('a8f9884.cumRewards') }}
              </h3>
              <p class="whitespace-nowrap text-[12px] leading-none text-[#999]">
                {{ t('a8f9884.validRange') }}：{{ formatRange(activity.start_at, activity.end_at) }}
              </p>
            </div>
            <div class="flex shrink-0 items-baseline gap-1 whitespace-nowrap">
              <span class="text-[14px] leading-5 text-[#999]">{{ t('a8f9884.cumDays') }}</span>
              <span class="text-[16px] font-medium leading-6 text-[rgba(0,0,0,0.9)]">{{
                activity.progress_count ?? 0
              }}</span>
              <span class="text-[14px] leading-5 text-[#999]">{{ t('a8f9884.daysUnit') }}</span>
            </div>
          </div>
          <ul class="flex w-full flex-col">
            <li
              v-for="(tier, idx) in activity.tiers || []"
              :key="idx"
              class="flex w-full items-center justify-between border-b border-[#f2f2f2] py-[10px] last:border-b-0"
            >
              <div class="flex min-w-0 items-center gap-[15px]">
                <span class="shrink-0 whitespace-nowrap text-[12px] font-medium text-[#666]">
                  {{ ti('a8f9884.tierDays', [tier.threshold]) }}
                </span>
                <div class="flex shrink-0 flex-col gap-[5px]">
                  <span
                    v-for="(reward, i) in tierRewards(tier)"
                    :key="i"
                    class="flex items-center gap-2"
                  >
                    <SignInIcon
                      :name="reward.type === 'coupon' ? 'coupon' : 'boxes'"
                      class="size-[15px] shrink-0 text-[#DADADA]"
                    />
                    <span class="text-[11px] font-medium text-[#222]">{{ reward.label }}</span>
                  </span>
                </div>
              </div>
              <span
                class="flex w-[60px] shrink-0 items-center justify-center px-3 py-1.5 text-[10px]"
                :class="tierStatusClass(tier.status)"
              >
                {{ tierStatusText(tier.status) }}
              </span>
            </li>
          </ul>
        </section>

        <section
          v-if="ruleDesc"
          class="flex w-full flex-col gap-3 border border-[#eaebee] px-3 py-4"
          data-testid="signin-rules-section-h5"
        >
          <h3 class="w-full text-[13px] font-bold text-[#1a1d20]">
            {{ t('a8f9884.rulesTitle') }}
          </h3>
          <div
            class="signin-rule-desc w-full text-[11px] leading-[1.4] text-[#626875]"
            data-testid="signin-rule-desc-h5"
            v-html="ruleDesc"
          />
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
            class="text-[18px] text-[#0f0f10] font-medium"
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
import SignInIcon from './components/SignInIcon.vue'
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
  ruleDesc,
  activity,
  lastResult,
  canSign,
  init,
  submitSignIn,
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

function tierRewards(tier: { point?: number; coupon_name?: string }) {
  const rewards: { type: 'point' | 'coupon'; label: string }[] = []
  if (tier.coupon_name) rewards.push({ type: 'coupon', label: tier.coupon_name })
  if (tier.point) rewards.push({ type: 'point', label: `${t('a8f9884.point')} +${tier.point}` })
  return rewards
}

function tierStatusText(status: SignInRewardTierStatus) {
  if (status === 'granted') return t('a8f9884.claimed')
  if (status === 'claimable') return t('a8f9884.claim')
  if (status === 'failed') return t('a8f9884.failed')
  return t('a8f9884.pending')
}

function tierStatusClass(status: SignInRewardTierStatus) {
  if (status === 'claimable') return 'bg-black text-white'
  if (status === 'granted') return 'border border-[#cdd0d6] bg-white text-black'
  if (status === 'failed') return 'bg-[#fee2e2] text-[#b91c1c]'
  return 'bg-[#f2f3f5] text-[#c0c4cc]'
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
