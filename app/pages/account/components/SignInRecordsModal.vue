<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
    data-testid="signin-records-modal"
    @click.self="close"
  >
    <div
      class="bg-white w-full sm:max-w-[720px] max-h-[85vh] overflow-auto rounded-t-2xl sm:rounded-none p-5 relative"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-[16px] font-medium text-[#191a1d]">{{ t('a8f9884.records') }}</h3>
        <button
          type="button"
          class="text-[#99a1af] text-[20px] leading-none px-2"
          data-testid="signin-records-close"
          @click="close"
        >
          ×
        </button>
      </div>

      <div class="flex items-center justify-between bg-[#f3f4f6] px-4 py-3 mb-4">
        <button
          type="button"
          class="text-[#4a5565] px-2"
          data-testid="signin-records-prev"
          @click="shiftMonth(-1)"
        >
          ‹
        </button>
        <span class="text-[14px] text-[#191a1d]">{{ monthLabel }}</span>
        <button
          type="button"
          class="px-2"
          :class="canGoNextMonth ? 'text-[#4a5565]' : 'text-[#d1d5db] cursor-not-allowed'"
          :disabled="!canGoNextMonth"
          data-testid="signin-records-next"
          @click="shiftMonth(1)"
        >
          ›
        </button>
      </div>

      <div class="grid grid-cols-7 gap-1 text-center text-[12px] text-[#4a5565] mb-2">
        <span v-for="w in weekLabels" :key="w">{{ w }}</span>
      </div>

      <div v-if="loading" class="py-10 flex justify-center">
        <USkeleton class="h-40 w-full" />
      </div>
      <div v-else-if="!cells.length" class="py-10 text-center text-[14px] text-[#99a1af]">
        {{ t('a8f9884.recordsEmpty') }}
      </div>
      <div v-else class="grid grid-cols-7 gap-1">
        <div
          v-for="(cell, idx) in cells"
          :key="idx"
          class="min-h-[64px] p-1 text-left"
          :class="cell.date ? (cell.signed ? 'bg-[#f3f4f6]' : '') : ''"
        >
          <template v-if="cell.date">
            <p class="text-[13px] font-medium text-[#191a1d]">{{ cell.day }}</p>
            <p v-if="cell.signed" class="mt-1 text-[11px] text-[#e8a317]">
              <span v-if="cell.display">{{ cell.display }}</span>
              <span v-else-if="Number(cell.daily_point) > 0">+{{ cell.daily_point }}</span>
              <span v-else>{{ t('a8f9884.signedShort') }}</span>
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { memberSignInApiClient, type ISignInRecordDay } from '~/infrastructure/http/clients/MemberSignInApiClient'
import { formatShanghaiDate } from '~/composables/useMemberSignIn'

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
