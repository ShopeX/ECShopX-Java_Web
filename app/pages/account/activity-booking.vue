<template>
  <div class="min-h-screen bg-white" data-testid="activity-booking-standalone">
    <!-- PC：独立页，无账户侧栏 -->
    <div
      class="relative hidden w-full shrink-0 content-stretch items-start justify-center px-[128px] py-[32px] md:flex"
    >
      <div
        class="relative flex min-h-px min-w-px flex-[1_0_0] flex-col items-start lg:min-h-[calc(100vh-var(--layout-header-height,68px)-64px)]"
      >
        <div class="relative flex w-full shrink-0 flex-col items-center gap-4 bg-white">
          <div class="relative w-full shrink-0">
            <h2
              class="font-['Noto_Sans_SC:Medium',sans-serif] text-base font-medium leading-5 whitespace-nowrap text-[#191a1d]"
            >
              {{ t('registration.activityBooking') }}
            </h2>
          </div>

          <div class="relative flex w-full shrink-0 items-center border-b border-[#e5e7eb]">
            <button
              v-for="tab in ACTIVITY_STATUS_TABS"
              :key="tab.key"
              type="button"
              class="relative flex min-h-[44px] items-center justify-center px-9 py-3 text-sm leading-5"
              :class="
                activeTab === tab.value
                  ? 'border-b-2 border-[#0f0f10] font-medium text-[#0f0f10]'
                  : 'font-normal text-[#4a5565]'
              "
              @click="activeTab = tab.value"
            >
              {{ t(tab.labelKey) }}
            </button>
          </div>

          <div v-if="loading && !list.length" class="w-full py-16 text-center text-sm text-[#4a5565]">
            {{ t('registration.loading') }}
          </div>
          <div
            v-else-if="!list.length"
            class="w-full py-16 text-center text-sm text-[#4a5565]"
          >
            {{ t('registration.empty') }}
          </div>
          <div
            v-else
            class="grid w-full grid-cols-4 gap-4"
            data-testid="activity-booking-list-pc"
          >
            <ActivityEventCard
              v-for="item in list"
              :key="item.activityId"
              :item="item"
              @apply="handleApply"
              @click="handleApply"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- H5：仅返回 + 标题，无账户菜单 -->
    <div class="md:hidden">
      <div
        class="sticky top-0 z-10 flex h-12 items-center border-b border-[#e5e7eb] bg-white px-4"
      >
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center text-[#191a1d]"
          aria-label="back"
          data-testid="activity-booking-back"
          @click="router.back()"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M12.5 4.5L7 10l5.5 5.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h1 class="flex-1 text-center text-base font-medium leading-5 text-[#191a1d]">
          {{ t('registration.activityBooking') }}
        </h1>
        <div class="h-8 w-8" aria-hidden="true" />
      </div>

      <div class="px-4 pb-8">
        <div class="flex items-center border-b border-[#e5e7eb]">
          <button
            v-for="tab in ACTIVITY_STATUS_TABS"
            :key="`h5-${tab.key}`"
            type="button"
            class="relative flex min-h-[44px] items-center justify-center px-3 py-3 text-sm leading-5"
            :class="
              activeTab === tab.value
                ? 'border-b-2 border-[#0f0f10] font-medium text-[#0f0f10]'
                : 'font-normal text-[#4a5565]'
            "
            @click="activeTab = tab.value"
          >
            {{ t(tab.labelKey) }}
          </button>
        </div>

        <div v-if="loading && !list.length" class="py-16 text-center text-sm text-[#4a5565]">
          {{ t('registration.loading') }}
        </div>
        <div v-else-if="!list.length" class="py-16 text-center text-sm text-[#4a5565]">
          {{ t('registration.empty') }}
        </div>
        <div
          v-else
          class="mt-4 grid grid-cols-1 gap-4"
          data-testid="activity-booking-list-h5"
        >
          <ActivityEventCard
            v-for="item in list"
            :key="`m-${item.activityId}`"
            :item="item"
            @apply="handleApply"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import ActivityEventCard from '~/components/ActivityEventCard/ActivityEventCard.vue'
import {
  ACTIVITY_STATUS_TABS,
  useRegistration,
} from '~/composables/useRegistration'
import type { IRegistrationActivityListItem } from '~/infrastructure/transformers'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const toast = useToastMessage()
const { requireAuth } = useAuthGuard()

const activeTab = ref('')
const list = ref<IRegistrationActivityListItem[]>([])

const { loading, fetchActivityList, joinWithoutForm } = useRegistration()

async function loadList() {
  const result = await fetchActivityList({ status: activeTab.value, page: 1, pageSize: 50 })
  list.value = result.list
}

async function handleApply(item: IRegistrationActivityListItem) {
  await requireAuth(async () => {
    if (item.hasTemp) {
      router.push(
        localePath({
          path: `/registration/${item.activityId}`,
        })
      )
      return
    }
    try {
      await joinWithoutForm(item.activityId)
      toast.show(t('registration.success'))
      router.push(localePath('/account/registrations'))
    } catch (error: any) {
      toast.show(error?.message || error?.data?.message || t('registration.submitFailed'))
    }
  })
}

watch(activeTab, () => {
  loadList()
})

onMounted(() => {
  loadList()
})
</script>
