<template>
  <div class="min-h-screen bg-white" data-testid="account-points-page">
    <div
      class="hidden content-stretch items-start justify-center px-[128px] py-[32px] relative shrink-0 w-full md:flex"
    >
      <div
        class="content-stretch flex flex-[1_0_0] gap-[64px] items-start min-h-px min-w-px relative lg:min-h-[calc(100vh-var(--layout-header-height,68px)-64px)]"
      >
        <aside class="w-64 shrink-0 lg:sticky lg:top-[var(--layout-header-height,68px)]">
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </aside>

        <main class="min-w-0 flex-1">
          <div class="mb-8 flex items-center text-[16px] font-medium leading-6">
            <NuxtLink
              :to="localePath('/account')"
              class="text-[#191a1d] hover:underline"
              data-testid="points-breadcrumb-account"
            >
              个人中心
            </NuxtLink>
            <span class="text-[#8f99aa]">&nbsp;/&nbsp;我的积分</span>
          </div>

          <section
            class="mb-6 border border-[#e5e7eb] px-6 py-5"
            data-testid="points-summary-card"
          >
            <p class="text-[12px] leading-4 text-[#4a5565]">当前可用积分</p>
            <p class="mt-2 text-[28px] font-medium leading-9 text-[#191a1d]">
              {{ loadingInfo ? '--' : pointTotal }}
            </p>
            <p v-if="errorInfo" class="mt-2 text-[12px] text-[#d0112f]">{{ errorInfo }}</p>
          </section>

          <div class="mb-4 flex items-center gap-4 border-b border-[#e5e7eb]">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="relative min-h-[44px] pb-0 pt-0 text-[14px] leading-5"
              :class="outinType === tab.value ? 'font-medium text-[#191a1d]' : 'text-[#4a5565]'"
              :data-testid="`points-tab-${tab.key}`"
              @click="setOutinType(tab.value)"
            >
              {{ tab.label }}
              <span
                v-if="outinType === tab.value"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#191a1d]"
              />
            </button>
            <span class="ml-auto text-[14px] text-[#8f99aa]">共 {{ totalCount }} 条</span>
          </div>

          <div
            v-if="errorList"
            class="border border-[#e5e5e5] px-6 py-12 text-center"
            data-testid="points-list-error"
          >
            <p class="text-[14px] text-[#4a5565]">{{ errorList }}</p>
            <button
              type="button"
              class="mt-4 border border-[#0f0f10] px-6 py-2 text-[14px]"
              @click="reloadList"
            >
              重试
            </button>
          </div>

          <div
            v-else-if="loadingList && !list.length"
            class="py-16 text-center text-[14px] text-[#4a5565]"
          >
            加载中...
          </div>

          <div
            v-else-if="!list.length"
            class="border border-[#e5e5e5] px-6 py-16 text-center"
            data-testid="points-list-empty"
          >
            <p class="text-[14px] text-[#4a5565]">暂无积分记录</p>
          </div>

          <div v-else class="border border-[#f5f5f5]" data-testid="points-list">
            <div
              v-for="item in list"
              :key="item.id"
              class="flex items-center justify-between border-b border-[#f5f5f5] p-4 last:border-b-0"
              data-testid="points-list-item"
            >
              <div class="flex min-w-0 flex-col gap-1.5">
                <span class="truncate text-[14px] font-medium text-[#191a1d]">
                  {{ item.point_desc || '积分变动' }}
                </span>
                <span class="text-[12px] text-[#8e9196]">{{ formatItemTime(item) }}</span>
              </div>
              <span
                class="shrink-0 text-[16px] font-semibold"
                :class="isIncomeRecord(item) ? 'text-[#191a1d]' : 'text-[#d0112f]'"
              >
                {{ formatItemPoint(item) }}
              </span>
            </div>
          </div>

          <div
            v-if="totalPages > 1"
            class="mt-6 flex items-center justify-end gap-2"
            data-testid="points-list-pagination"
          >
            <button
              type="button"
              class="h-8 border border-[#e5e7eb] px-3 text-[14px] disabled:opacity-40"
              :disabled="pageNo <= 1 || loadingList"
              @click="goPage(pageNo - 1)"
            >
              上一页
            </button>
            <span class="text-[14px] text-[#4a5565]">{{ pageNo }} / {{ totalPages }}</span>
            <button
              type="button"
              class="h-8 border border-[#e5e7eb] px-3 text-[14px] disabled:opacity-40"
              :disabled="pageNo >= totalPages || loadingList"
              @click="goPage(pageNo + 1)"
            >
              下一页
            </button>
          </div>
        </main>
      </div>
    </div>

    <div class="flex min-h-screen flex-col md:hidden">
      <AccountH5FilterBar title="个人中心 / 我的积分" :active-key="activeMenu" />
      <main class="flex flex-1 flex-col gap-4 px-4 py-4">
        <section class="border border-[#e5e7eb] px-4 py-4">
          <p class="text-[12px] text-[#4a5565]">当前可用积分</p>
          <p class="mt-1 text-[24px] font-medium text-[#191a1d]">
            {{ loadingInfo ? '--' : pointTotal }}
          </p>
        </section>

        <div class="flex gap-4 border-b border-[#e5e7eb]">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="relative min-h-11 text-[14px]"
            :class="outinType === tab.value ? 'font-medium text-[#191a1d]' : 'text-[#4a5565]'"
            @click="setOutinType(tab.value)"
          >
            {{ tab.label }}
            <span
              v-if="outinType === tab.value"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#191a1d]"
            />
          </button>
        </div>

        <div v-if="errorList" class="py-10 text-center text-[14px] text-[#4a5565]">
          {{ errorList }}
          <button type="button" class="mt-4 block w-full border py-2" @click="reloadList">
            重试
          </button>
        </div>
        <div v-else-if="!list.length && !loadingList" class="py-16 text-center text-[14px] text-[#4a5565]">
          暂无积分记录
        </div>
        <div v-else class="flex flex-col">
          <div
            v-for="item in list"
            :key="item.id"
            class="flex items-center justify-between border-b border-[#f5f5f5] py-4"
          >
            <div class="flex min-w-0 flex-col gap-1">
              <span class="truncate text-[14px] font-medium text-[#191a1d]">
                {{ item.point_desc || '积分变动' }}
              </span>
              <span class="text-[12px] text-[#8e9196]">{{ formatItemTime(item) }}</span>
            </div>
            <span
              class="shrink-0 text-[16px] font-semibold"
              :class="isIncomeRecord(item) ? 'text-[#191a1d]' : 'text-[#d0112f]'"
            >
              {{ formatItemPoint(item) }}
            </span>
          </div>
        </div>
        <button
          v-if="hasMore"
          type="button"
          class="border border-[#e5e7eb] py-3 text-[14px]"
          :disabled="loadingList"
          @click="loadMore"
        >
          {{ loadingList ? '加载中...' : '加载更多' }}
        </button>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AccountH5FilterBar from './components/AccountH5FilterBar.vue'
import AccountMenu from './components/AccountMenu.vue'
import { useMemberPoint } from '~/composables/useMemberPoint'

definePageMeta({ layout: 'default' })

const localePath = useLocalePath()
const activeMenu = ref('profile')

const tabs = [
  { key: 'all', label: '全部', value: undefined as undefined },
  { key: 'income', label: '获取', value: 'income' as const },
  { key: 'outcome', label: '支出', value: 'outcome' as const },
]

const {
  pointTotal,
  list,
  totalCount,
  pageNo,
  outinType,
  loadingInfo,
  loadingList,
  errorInfo,
  errorList,
  hasMore,
  totalPages,
  formatItemTime,
  formatItemPoint,
  isIncomeRecord,
  setOutinType,
  loadMore,
  loadList,
  init,
} = useMemberPoint()

function reloadList() {
  pageNo.value = 1
  loadList(true)
}

async function goPage(next: number) {
  if (next < 1 || next > totalPages.value || loadingList.value) return
  pageNo.value = next
  await loadList(true)
}

function handleLogout() {
  console.log('用户已退出登录')
}

onMounted(() => {
  void init()
})
</script>
