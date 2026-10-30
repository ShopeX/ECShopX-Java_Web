<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    data-testid="signin-records-modal"
    @click.self="close"
  >
    <div
      class="flex max-h-[85vh] w-full flex-col gap-5 overflow-auto bg-white px-4 py-5 sm:max-w-[720px] sm:gap-8 sm:p-[30px]"
      data-testid="signin-records-panel"
    >
      <div class="flex w-full shrink-0 items-center justify-between">
        <h3 class="text-[20px] font-medium leading-5 text-[#191a1d] sm:text-[14px]">
          {{ t('a8f9884.records') }}
        </h3>
        <button
          type="button"
          class="flex size-6 shrink-0 items-center justify-center text-[#191a1d]"
          data-testid="signin-records-close"
          @click="close"
        >
          <SignInIcon name="close" class="size-6" />
        </button>
      </div>

      <div class="flex w-full shrink-0 items-center justify-between bg-[#f3f4f7] px-4 py-2">
        <button
          type="button"
          class="flex shrink-0 items-start p-1 text-[#4a5565]"
          data-testid="signin-records-prev"
          @click="shiftMonth(-1)"
        >
          <SignInIcon name="chevronLeft" class="size-4" />
        </button>
        <span class="text-[14px] font-medium leading-5 text-[#191a1d]">{{ monthLabel }}</span>
        <button
          type="button"
          class="flex shrink-0 items-start p-1"
          :class="canGoNextMonth ? 'text-[#4a5565]' : 'cursor-not-allowed text-[#d1d5db]'"
          :disabled="!canGoNextMonth"
          data-testid="signin-records-next"
          @click="shiftMonth(1)"
        >
          <SignInIcon name="chevronRight" class="size-4" />
        </button>
      </div>

      <div class="flex w-full shrink-0 items-center border-b border-[#e5e5e5] pb-2">
        <div
          v-for="(label, wi) in weekLabels"
          :key="wi"
          class="flex min-w-0 flex-1 items-center justify-center"
        >
          <span class="text-[13px] font-medium text-[#4a5565] sm:text-[14px]">{{ label }}</span>
        </div>
      </div>

      <div v-if="loading" class="flex shrink-0 justify-center py-10">
        <USkeleton class="h-40 w-full" />
      </div>
      <p v-else-if="!weeks.length" class="shrink-0 py-10 text-center text-[14px] text-[#99a1af]">
        {{ t('a8f9884.recordsEmpty') }}
      </p>
      <div v-else class="flex w-full shrink-0 flex-col sm:gap-2">
        <div
          v-for="(week, wi) in weeks"
          :key="wi"
          class="flex w-full items-center sm:gap-2"
          :data-testid="`signin-records-week-${wi}`"
        >
          <div
            v-for="(cell, ci) in week"
            :key="ci"
            class="flex h-[65px] min-w-0 flex-1 flex-col items-center py-2 sm:h-[78px] sm:py-[10px]"
            :class="cellClass(cell)"
          >
            <template v-if="cell.date">
              <template v-if="cell.signed">
                <div class="flex w-full items-center justify-center pb-[2px]">
                  <span
                    class="text-[14px] font-medium leading-none text-[#191a1d] sm:text-[16px]"
                    >{{ cell.day }}</span
                  >
                </div>
                <div class="flex flex-col items-center gap-[3px]">
                  <SignInIcon name="check" class="size-5 shrink-0 text-[#222222]" />
                  <span class="font-medium leading-3" :class="cellRewardClass(cell)">{{
                    cellRewardLabel(cell)
                  }}</span>
                </div>
              </template>
              <span v-else class="text-[14px] leading-[18px] text-[#8f99aa] sm:text-[16px]">{{
                cell.day
              }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  memberSignInApiClient,
  type ISignInRecordDay,
} from '~/infrastructure/http/clients/MemberSignInApiClient'
import { formatShanghaiDate } from '~/composables/useMemberSignIn'
import SignInIcon from './SignInIcon.vue'

defineOptions({ name: 'SignInRecordsModal' })

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const loading = ref(false)
const month = ref('')
const days = ref<ISignInRecordDay[]>([])

const weekLabels = computed(() => [
  t('a8f9884.mon'),
  t('a8f9884.tue'),
  t('a8f9884.wed'),
  t('a8f9884.thu'),
  t('a8f9884.fri'),
  t('a8f9884.sat'),
  t('a8f9884.sun'),
])

const monthLabel = computed(() => {
  if (!month.value) return t('a8f9884.records')
  const [y, m] = month.value.split('-')
  // vue-i18n list 插值：勿先 t() 再手替，否则 {0} 会被清空
  return t('a8f9884.monthRecords', [Number(m), y])
})

/** 不允许翻到当前月之后（未来月无签到记录） */
const canGoNextMonth = computed(() => {
  if (!month.value) return false
  return month.value < currentMonthKey()
})

type Cell = {
  date?: string
  day?: number
  signed?: boolean
  daily_point?: number | null
  display?: string | null
}

const cells = computed<Cell[]>(() => {
  if (!month.value) return []
  const [y, m] = month.value.split('-').map(Number)
  const firstStr = `${month.value}-01`
  // Mon=1 ... Sun=7 → pad Mon-based
  const [yy, mm, dd] = firstStr.split('-').map(Number)
  const firstUtc = new Date(Date.UTC(yy, mm - 1, dd, 12, 0, 0))
  const short = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    weekday: 'short',
  }).format(firstUtc)
  const wd = ({ Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 } as Record<string, number>)[
    short
  ]
  const mondayIndex = wd - 1
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const map = new Map(days.value.map((d) => [d.date, d]))
  const out: Cell[] = []
  for (let i = 0; i < mondayIndex; i++) out.push({})
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const rec = map.get(date)
    out.push({
      date,
      day,
      signed: !!rec?.signed,
      daily_point: rec?.daily_point,
      display: rec?.display,
    })
  }
  return out
})

/** 按周切行，末行补齐到 7 格（设计稿每行 7 列等宽） */
const weeks = computed<Cell[][]>(() => {
  const out: Cell[][] = []
  for (let i = 0; i < cells.value.length; i += 7) {
    const row = cells.value.slice(i, i + 7)
    while (row.length < 7) row.push({})
    out.push(row)
  }
  return out
})

/** 已签日历格是浅灰实底，未签格内容垂直居中 */
function cellClass(cell: Cell) {
  return cell.signed ? 'bg-[#f2f2f2]' : 'justify-center'
}

function cellRewardLabel(cell: Cell) {
  if (cell.display) return cell.display
  if (Number(cell.daily_point) > 0) return `+${cell.daily_point}`
  return t('a8f9884.signedShort')
}

function cellRewardClass(cell: Cell) {
  const hasReward = !!(cell.display || Number(cell.daily_point) > 0)
  const size = hasReward ? 'text-[10px]' : 'text-[9px]'
  return `${size} sm:text-[14px] ${hasReward ? 'text-[#222]' : 'text-[#999]'}`
}

function close() {
  emit('update:modelValue', false)
}

function currentMonthKey() {
  return formatShanghaiDate().slice(0, 7)
}

function shiftMonth(delta: number) {
  if (delta > 0 && !canGoNextMonth.value) return
  const [y, m] = month.value.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  const next = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
  if (next > currentMonthKey()) return
  month.value = next
  load()
}

async function load() {
  loading.value = true
  try {
    const res = await memberSignInApiClient.getRecords(month.value)
    const raw = res?.data ?? res ?? {}
    const list = Array.isArray(raw.days) ? raw.days : []
    days.value = list.map((d: any) => ({
      date: d.date,
      signed: !!d.signed,
      daily_point: d.daily_points ?? d.daily_point ?? null,
      display: d.display ?? null,
      day_status: d.day_status,
      activity_seq: d.activity_seq ?? null,
    }))
  } catch {
    days.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      month.value = currentMonthKey()
      load()
    }
  }
)
</script>
