<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    data-testid="signin-rewards-modal"
    @click.self="close"
  >
    <div
      class="flex max-h-[85vh] w-full flex-col gap-5 overflow-auto bg-white p-5 sm:max-w-[600px] sm:p-[30px]"
      data-testid="signin-rewards-panel"
    >
      <div class="flex w-full shrink-0 items-center justify-between">
        <h3 class="text-[20px] font-medium leading-5 text-[#191a1d]">
          {{ t('a8f9884.rewardsTitle') }}
        </h3>
        <button
          type="button"
          class="flex size-6 shrink-0 items-center justify-center text-[#191a1d]"
          data-testid="signin-rewards-close"
          @click="close"
        >
          <SignInIcon name="close" class="size-6" />
        </button>
      </div>

      <div v-if="loading" class="flex shrink-0 justify-center py-10">
        <USkeleton class="h-40 w-full" />
      </div>
      <p v-else-if="!list.length" class="shrink-0 py-10 text-center text-[14px] text-[#99a1af]">
        {{ t('a8f9884.rewardsEmpty') }}
      </p>
      <ul v-else class="flex w-full shrink-0 flex-col" data-testid="signin-rewards-list">
        <li
          v-for="item in list"
          :key="item.id"
          class="flex w-full items-start justify-between border-b border-[#f2f2f2] py-[15px] last:border-b-0 sm:py-5"
        >
          <div class="flex min-w-0 flex-1 flex-col gap-[6px] sm:gap-[10px]">
            <p class="truncate text-[14px] font-medium text-[#616672]">
              {{ item.title || t('a8f9884.rewardsTitle') }}
            </p>
            <p v-if="item.granted_at" class="text-[12px] font-medium text-[#999]">
              {{ item.granted_at }}
            </p>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-[9px]">
            <div
              v-for="(reward, ri) in recordRewards(item)"
              :key="ri"
              class="flex items-center justify-end gap-[5px] sm:gap-[10px]"
            >
              <SignInIcon
                :name="reward.type === 'coupon' ? 'coupon' : 'boxes'"
                class="size-[15px] shrink-0 text-[#999] sm:size-[17px]"
              />
              <span
                class="whitespace-nowrap text-[12px] leading-none text-[rgba(0,0,0,0.9)] sm:text-[14px]"
                >{{ reward.label }}</span
              >
              <SignInIcon
                name="arrowRight"
                class="h-[6px] w-[3px] shrink-0 text-[#999] sm:h-2 sm:w-1"
              />
            </div>
          </div>
        </li>
      </ul>

      <div
        v-if="totalPages > 1"
        class="flex w-full shrink-0 items-center justify-center"
        data-testid="signin-rewards-pagination"
      >
        <button
          type="button"
          class="flex size-8 shrink-0 items-center justify-center"
          :class="page > 1 ? 'text-[#4a5565]' : 'cursor-not-allowed text-[#c0c4cc]'"
          :disabled="page <= 1"
          data-testid="signin-rewards-prev"
          @click="goPage(page - 1)"
        >
          <SignInIcon name="chevronLeft" class="size-3.5" />
        </button>
        <template v-for="(p, pi) in pageList" :key="pi">
          <span
            v-if="p === 'more'"
            class="flex size-8 shrink-0 items-center justify-center text-[12px] text-[#606266]"
            >···</span
          >
          <button
            v-else
            type="button"
            class="flex size-8 shrink-0 items-center justify-center text-[12px]"
            :class="p === page ? 'font-medium text-black' : 'text-[#606266]'"
            :data-testid="`signin-rewards-page-${p}`"
            @click="goPage(p)"
          >
            {{ p }}
          </button>
        </template>
        <button
          type="button"
          class="flex size-8 shrink-0 items-center justify-center"
          :class="page < totalPages ? 'text-[#4a5565]' : 'cursor-not-allowed text-[#c0c4cc]'"
          :disabled="page >= totalPages"
          data-testid="signin-rewards-next"
          @click="goPage(page + 1)"
        >
          <SignInIcon name="chevronRight" class="size-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  memberSignInApiClient,
  type ISignInRewardRecord,
} from '~/infrastructure/http/clients/MemberSignInApiClient'
import { formatShanghaiDate } from '~/composables/useMemberSignIn'
import SignInIcon from './SignInIcon.vue'

defineOptions({ name: 'SignInRewardsModal' })

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

/** 设计稿分页每页条数 */
const PAGE_SIZE = 10

const { t } = useI18n()
const loading = ref(false)
const list = ref<ISignInRewardRecord[]>([])
const page = ref(1)
const total = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

/** 页码列表：首尾常驻 + 当前页附近，中间用 more 占位 */
const pageList = computed<(number | 'more')[]>(() => {
  const last = totalPages.value
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const cur = page.value
  if (cur <= 6) return [1, 2, 3, 4, 5, 6, 'more', last]
  if (cur >= last - 5) {
    return [1, 'more', last - 5, last - 4, last - 3, last - 2, last - 1, last]
  }
  return [1, 'more', cur - 1, cur, cur + 1, 'more', last]
})

function close() {
  emit('update:modelValue', false)
}

function formatCreated(created?: number) {
  if (!created) return ''
  const d = new Date(Number(created) * 1000)
  if (Number.isNaN(d.getTime())) return ''
  const day = formatShanghaiDate(d)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${day} ${hh}:${mm}:${ss}`
}

/**
 * 一条领奖记录 = 一行：左侧任务名 + 时间，右侧该次发放的奖励列表。
 * reward_items 可能是多项（如「积分+500」+「满500减60元券」），保持在一行内展示。
 */
function normalizeRewardList(rawList: any[]): ISignInRewardRecord[] {
  return rawList.map((row: any) => {
    const items = Array.isArray(row.reward_items) ? row.reward_items : []
    return {
      id: row.id,
      record_type: row.record_type,
      activity_id: row.activity_id ?? null,
      title: row.title || row.activity_name,
      name: row.name,
      type: row.type,
      amount: row.amount,
      status: row.status || 'granted',
      granted_at: row.granted_at || formatCreated(row.created),
      created: row.created,
      reward_items: items.length
        ? items.map((it: any) => ({
            type: it.type === 'coupon' ? 'coupon' : 'points',
            amount: it.amount,
            coupon_id: it.coupon_id,
            title: it.title,
          }))
        : undefined,
    } as ISignInRewardRecord
  })
}

/** 奖励文案：接口已带数量的标题不重复拼接 */
function rewardLabel(type: 'point' | 'coupon', title?: string, amount?: number) {
  const base = title || (type === 'coupon' ? t('a8f9884.coupon') : t('a8f9884.point'))
  if (!amount) return base
  return base.includes(String(amount)) ? base : `${base}+${amount}`
}

function recordRewards(record: ISignInRewardRecord) {
  const items = record.reward_items || []
  const source = items.length
    ? items.map((it) => ({
        type: it.type === 'coupon' ? ('coupon' as const) : ('point' as const),
        title: it.title,
        amount: it.amount,
      }))
    : [
        {
          type: record.type === 'coupon' ? ('coupon' as const) : ('point' as const),
          title: record.name,
          amount: record.amount,
        },
      ]
  return source.map((it) => ({ type: it.type, label: rewardLabel(it.type, it.title, it.amount) }))
}

function goPage(next: number) {
  if (next < 1 || next > totalPages.value || next === page.value) return
  page.value = next
  load()
}

async function load() {
  loading.value = true
  try {
    const res = await memberSignInApiClient.getRewards({ page: page.value, page_size: PAGE_SIZE })
    const raw = res?.data ?? res ?? {}
    const rows = Array.isArray(raw.list) ? raw.list : []
    list.value = normalizeRewardList(rows)
    const count = Number(raw.total_count)
    total.value = Number.isFinite(count) && count > 0 ? count : rows.length
  } catch {
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      page.value = 1
      load()
    }
  }
)
</script>
