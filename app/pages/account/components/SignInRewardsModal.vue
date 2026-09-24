<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
    data-testid="signin-rewards-modal"
    @click.self="close"
  >
    <div
      class="bg-white w-full sm:max-w-[480px] max-h-[85vh] overflow-auto rounded-t-2xl sm:rounded-none p-5 relative"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-[16px] font-medium text-[#191a1d]">{{ t('a8f9884.rewardRecords') }}</h3>
        <button
          type="button"
          class="text-[#99a1af] text-[20px] leading-none px-2"
          data-testid="signin-rewards-close"
          @click="close"
        >
          ×
        </button>
      </div>

      <div v-if="loading" class="py-10">
        <USkeleton class="h-24 w-full" />
      </div>
      <div v-else-if="!list.length" class="py-10 text-center text-[14px] text-[#99a1af]">
        {{ t('a8f9884.rewardsEmpty') }}
      </div>
      <ul v-else class="flex flex-col gap-3" data-testid="signin-rewards-list">
        <li
          v-for="item in list"
          :key="item.id"
          class="flex items-center justify-between border border-[#f3f4f6] px-4 py-3"
        >
          <div class="min-w-0">
            <p class="text-[14px] text-[#191a1d] truncate">
              {{ item.name || item.title || t('a8f9884.point') }}
              <span v-if="item.amount" class="text-[#e8a317]"> +{{ item.amount }}</span>
            </p>
            <p v-if="item.granted_at" class="mt-1 text-[12px] text-[#99a1af]">
              {{ item.granted_at }}
            </p>
          </div>
          <span class="shrink-0 text-[12px] px-2 py-1 bg-[#f3f4f6] text-[#4a5565]">
            {{ t('a8f9884.claimed') }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  memberSignInApiClient,
  type ISignInRewardRecord,
} from '~/infrastructure/http/clients/MemberSignInApiClient'
import { formatShanghaiDate } from '~/composables/useMemberSignIn'

defineOptions({ name: 'SignInRewardsModal' })

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const loading = ref(false)
const list = ref<ISignInRewardRecord[]>([])

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

function normalizeRewardList(rawList: any[]): ISignInRewardRecord[] {
  const out: ISignInRewardRecord[] = []
  for (const row of rawList) {
    const items = Array.isArray(row.reward_items) ? row.reward_items : []
    if (items.length) {
      items.forEach((it: any, idx: number) => {
        out.push({
          id: `${row.id}-${idx}`,
          record_type: row.record_type,
          title: row.title,
          name: it.title || row.title || (it.type === 'coupon' ? 'coupon' : 'points'),
          type: it.type === 'coupon' ? 'coupon' : 'point',
          amount: it.amount,
          status: 'granted',
          granted_at: formatCreated(row.created),
          created: row.created,
          reward_items: items,
        })
      })
    } else {
      out.push({
        id: row.id,
        record_type: row.record_type,
        title: row.title,
        name: row.name || row.title,
        type: row.type || 'point',
        amount: row.amount,
        status: row.status || 'granted',
        granted_at: row.granted_at || formatCreated(row.created),
        created: row.created,
      })
    }
  }
  return out
}

async function load() {
  loading.value = true
  try {
    const res = await memberSignInApiClient.getRewards()
    const raw = res?.data ?? res ?? {}
    const rows = Array.isArray(raw.list) ? raw.list : []
    list.value = normalizeRewardList(rows)
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) load()
  }
)
</script>
