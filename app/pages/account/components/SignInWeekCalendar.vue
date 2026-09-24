<template>
  <div class="w-full" data-testid="signin-week-calendar">
    <div class="grid grid-cols-7 gap-1 sm:gap-2 w-full">
      <div
        v-for="day in days"
        :key="day.date"
        class="flex flex-col items-center gap-1 min-h-[72px]"
        :data-status="day.status"
        :data-testid="`signin-day-${day.date}`"
      >
        <span class="text-[12px] leading-4 text-[#4a5565]">{{ weekdayLabel(day.weekday) }}</span>
        <span class="text-[12px] leading-4 text-[#99a1af]">{{ dayNum(day.date) }}</span>
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full"
          :class="dayCircleClass(day)"
        >
          <span v-if="isSigned(day)" class="text-[16px] text-white">✓</span>
          <span v-else-if="day.status === 'missed'" class="text-[10px] text-[#99a1af]">{{
            t('a8f9884.missed')
          }}</span>
          <span v-else class="text-[12px] text-[#c9a227]">★</span>
        </div>
        <span v-if="day.activity_seq" class="text-[11px] leading-4 text-[#c9a227]">{{
          ti('a8f9884.nth', [day.activity_seq])
        }}</span>
        <span
          v-else-if="dayCaption(day)"
          class="text-[11px] leading-4 text-[#c9a227]"
          >{{ dayCaption(day) }}</span
        >
        <span v-if="isToday(day)" class="text-[11px] leading-4 text-[#191a1d]">{{
          t('a8f9884.today')
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ISignInWeekDay } from '~/infrastructure/http/clients/MemberSignInApiClient'

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
  return t(keys[weekday] || 'a8f9884.mon')
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

function dayCaption(day: ISignInWeekDay) {
  if (day.display) return day.display
  if (Number(day.daily_point) > 0) return `+${day.daily_point}`
  return ''
}

function dayCircleClass(day: ISignInWeekDay) {
  if (isSigned(day)) return 'bg-[#e8a317]'
  if (day.status === 'missed') return 'bg-[#f3f4f6]'
  if (day.status === 'today_unsigned') return 'bg-[#fff7e6] border-2 border-[#e8a317]'
  return 'bg-[#fff7e6] border border-[#f0d78c]'
}
</script>
