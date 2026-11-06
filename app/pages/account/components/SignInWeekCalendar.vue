<template>
  <div class="w-full" data-testid="signin-week-calendar">
    <div class="flex w-full items-stretch justify-center gap-1 md:gap-[10px]">
      <div
        v-for="day in days"
        :key="day.date"
        class="flex min-w-0 flex-1 flex-col items-center gap-[6px] md:gap-[10px]"
        :data-status="day.status"
        :data-testid="`signin-day-${day.date}`"
      >
        <span class="text-[12px] leading-none text-[#999]">{{ weekdayLabel(day.weekday) }}</span>

        <div
          class="flex min-h-[52px] w-full flex-1 flex-col items-center justify-center gap-[3px] px-[3px] py-2 md:min-h-[60px] md:gap-[5px] md:py-[10px]"
          :class="dayCardClass(day)"
        >
          <span class="flex h-5 shrink-0 items-center justify-center">
            <SignInIcon
              :name="dayIcon(day)"
              :class="
                day.status === 'missed' ? 'size-[21px]' : isSigned(day) ? 'size-5' : 'size-[18px]'
              "
            />
          </span>
          <!-- 无积分时也占位一行，保证未签到 / 已签到卡片同高 -->
          <span
            class="inline-flex h-[10px] min-h-[10px] items-center justify-center text-[10px] leading-none md:h-3 md:min-h-3 md:text-[12px]"
            :class="dayCaptionClass(day)"
          >
            {{ dayCaption(day) || '\u00A0' }}
          </span>
        </div>

        <span class="text-[10px] leading-none md:text-[12px]" :class="dayDateClass(day)">{{
          dayDateLabel(day)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ISignInWeekDay } from '~/infrastructure/http/clients/MemberSignInApiClient'
import SignInIcon from './SignInIcon.vue'

defineOptions({ name: 'SignInWeekCalendar' })

defineProps<{
  days: ISignInWeekDay[]
}>()

const { t } = useI18n()

function ti(key: string, args: unknown[]) {
  return t(key, args as any)
}

function weekdayLabel(weekday: number) {
  const keys = [
    '',
    'a8f9884.mon',
    'a8f9884.tue',
    'a8f9884.wed',
    'a8f9884.thu',
    'a8f9884.fri',
    'a8f9884.sat',
    'a8f9884.sun',
  ]
  return ti('a8f9884.weekday', [t(keys[weekday] || 'a8f9884.mon')])
}

function dayNum(date: string) {
  const part = date?.split('-')?.[2]
  return part ? String(Number(part)) : ''
}

function isSigned(day: ISignInWeekDay) {
  return day.status === 'signed' || day.status === 'today_signed'
}

function isToday(day: ISignInWeekDay) {
  return day.status === 'today_signed' || day.status === 'today_unsigned'
}

/** 已签到显示实心圆勾，漏签显示空心圆，其余显示礼盒 */
function dayIcon(day: ISignInWeekDay) {
  if (isSigned(day)) return 'check' as const
  if (day.status === 'missed') return 'missed' as const
  return 'boxes' as const
}

/** 漏签固定文案，其余展示当日奖励（+N） */
function dayCaption(day: ISignInWeekDay) {
  if (day.status === 'missed') return t('a8f9884.missed')
  if (day.display) return day.display
  if (Number(day.daily_point) > 0) return `+${day.daily_point}`
  return ''
}

function dayDateLabel(day: ISignInWeekDay) {
  if (isToday(day)) return t('a8f9884.today')
  return ti('a8f9884.dayN', [dayNum(day.date)])
}

function dayCardClass(day: ISignInWeekDay) {
  // 已签到是实底无边框（设计稿），补一个透明边框让各日卡高度一致
  return isSigned(day) ? 'border border-transparent bg-[#f2f2f2]' : 'border border-[#e0e0e0]'
}

function dayCaptionClass(day: ISignInWeekDay) {
  if (isSigned(day)) return 'font-medium text-[rgba(0,0,0,0.9)]'
  if (day.status === 'missed') return 'text-[#999]'
  return 'font-medium text-[#999]'
}

function dayDateClass(day: ISignInWeekDay) {
  return isToday(day) ? 'font-medium text-[#303133]' : 'text-[#a8abb2]'
}
</script>
