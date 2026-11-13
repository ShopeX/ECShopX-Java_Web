<template>
  <div class="min-h-screen bg-white" data-testid="account-member-tasks-page">
    <!-- PC -->
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
          <div class="mb-8 flex items-center text-[16px] font-medium leading-6 text-[#101828]">
            <NuxtLink :to="localePath('/account')" class="hover:underline">
              {{ t('m10435.accountCenter') }}
            </NuxtLink>
            <span>&nbsp;/&nbsp;{{ t('m10435.title') }}</span>
          </div>

          <MemberTaskListBody
            :tasks="tasks"
            :loading="loading"
            :status-label="statusLabel"
            @go-complete="goComplete"
            @open-history="openHistory"
          />
        </main>
      </div>
    </div>

    <!-- H5 -->
    <div class="flex min-h-screen flex-col md:hidden">
      <AccountH5FilterBar :title="t('m10435.title')" :active-key="activeMenu" />
      <main class="flex flex-1 flex-col px-4 py-4">
        <MemberTaskListBody
          :tasks="tasks"
          :loading="loading"
          :status-label="statusLabel"
          mobile
          @go-complete="goComplete"
          @open-history="openHistory"
        />
      </main>
    </div>

    <MemberTaskHistoryModal
      :model-value="historyOpen"
      :list="historyList"
      :loading="historyLoading"
      :page="historyPage"
      :total-pages="historyTotalPages"
      @close="closeHistory"
      @page-change="loadHistory"
    />
  </div>
</template>

<script setup lang="ts">
import AccountMenu from './components/AccountMenu.vue'
import AccountH5FilterBar from './components/AccountH5FilterBar.vue'
import MemberTaskListBody from './components/MemberTaskListBody.vue'
import MemberTaskHistoryModal from './components/MemberTaskHistoryModal.vue'
import { useMemberTasks } from '~/composables/useMemberTasks'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const activeMenu = ref('profile')

const {
  tasks,
  loading,
  historyOpen,
  historyList,
  historyLoading,
  historyPage,
  historyTotalPages,
  loadTasks,
  loadHistory,
  openHistory,
  closeHistory,
  goComplete,
  statusLabel,
} = useMemberTasks()

function handleLogout() {
  console.log('用户已退出登录')
}

onMounted(() => {
  void loadTasks()
})
</script>
