<template>
  <div class="min-h-screen bg-white">
    <!-- PC -->
    <div
      class="relative hidden w-full shrink-0 content-stretch items-start justify-center px-[128px] py-[32px] md:flex"
    >
      <div
        class="relative flex min-h-px min-w-px flex-[1_0_0] content-stretch items-start gap-[64px] lg:min-h-[calc(100vh-var(--layout-header-height,68px)-64px)]"
      >
        <div
          class="w-64 shrink-0 lg:sticky lg:top-[var(--layout-header-height,68px)] lg:self-start"
        >
          <AccountMenu v-model="activeMenu" />
        </div>

        <div class="relative flex min-h-px min-w-px flex-[1_0_0] flex-col items-start">
          <div class="relative flex w-full shrink-0 flex-col items-center gap-4 bg-white">
            <div class="relative w-full shrink-0">
              <h2
                class="font-['Noto_Sans_SC:Medium',sans-serif] text-base font-medium leading-5 whitespace-nowrap text-[#191a1d]"
              >
                {{ t('registration.myRegistrations') }}
              </h2>
            </div>

            <div class="relative flex w-full shrink-0 flex-wrap items-center border-b border-[#e5e7eb]">
              <button
                v-for="tab in RECORD_STATUS_TABS"
                :key="tab.key"
                type="button"
                class="relative flex min-h-[44px] items-center justify-center px-6 py-3 text-sm leading-5"
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
              {{ t('registration.emptyRecords') }}
            </div>
            <div v-else class="mx-auto flex w-full max-w-[530px] flex-col gap-4">
              <RegistrationRecordCard
                v-for="item in list"
                :key="item.recordId"
                :item="item"
                @view="handleView"
                @edit="handleEdit"
                @apply="handleApply"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- H5 -->
    <div class="md:hidden">
      <AccountH5FilterBar
        :title="t('registration.myRegistrations')"
        :active-key="activeMenu"
      />
      <div class="px-4 pb-8">
        <div class="flex items-center overflow-x-auto border-b border-[#e5e7eb]">
          <button
            v-for="tab in RECORD_STATUS_TABS"
            :key="`h5-${tab.key}`"
            type="button"
            class="relative flex min-h-[44px] shrink-0 items-center justify-center px-3 py-3 text-sm leading-5"
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
          {{ t('registration.emptyRecords') }}
        </div>
        <div v-else class="mt-4 flex flex-col gap-4">
          <RegistrationRecordCard
            v-for="item in list"
            :key="`m-${item.recordId}`"
            :item="item"
            @view="handleView"
            @edit="handleEdit"
            @apply="handleApply"
          />
        </div>
      </div>
    </div>

    <!-- 对齐 vshop：编辑报名信息 / 代他人报名 -->
    <div
      v-if="applySelectOpen"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center"
      @click.self="applySelectOpen = false"
    >
      <div class="w-full max-w-md bg-white p-6 shadow-lg md:rounded">
        <p class="mb-4 text-base font-medium text-[#191a1d]">{{ t('registration.applySelectTitle') }}</p>
        <button
          type="button"
          class="mb-3 flex w-full items-center justify-center border border-[#0f0f10] px-4 py-3 text-sm font-medium text-[#0f0f10]"
          @click="handleApplySelect('0')"
        >
          {{ t('registration.editCurrent') }}
        </button>
        <button
          type="button"
          class="flex w-full items-center justify-center border border-[#0f0f10] px-4 py-3 text-sm font-medium text-[#0f0f10]"
          @click="handleApplySelect('1')"
        >
          {{ t('registration.applyForOther') }}
        </button>
        <button
          type="button"
          class="mt-4 w-full py-2 text-sm text-[#4a5565]"
          @click="applySelectOpen = false"
        >
          {{ t('registration.dismiss') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import AccountMenu from '../components/AccountMenu.vue'
import AccountH5FilterBar from '../components/AccountH5FilterBar.vue'
import RegistrationRecordCard from '../components/RegistrationRecordCard.vue'
import { RECORD_STATUS_TABS, useRegistration } from '~/composables/useRegistration'
import type { IRegistrationRecordListItem } from '~/infrastructure/transformers'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const route = useRoute()
const { requireAuth } = useAuthGuard()

const activeMenu = ref('registrations')
const activeTab = ref('')
const list = ref<IRegistrationRecordListItem[]>([])

const { loading, fetchRecordList, joinWithoutForm } = useRegistration()
const toast = useToastMessage()
const applySelectOpen = ref(false)
const applyTarget = ref<IRegistrationRecordListItem | null>(null)

async function loadList() {
  await requireAuth(async () => {
    const activityId = route.query.activity_id as string | undefined
    const result = await fetchRecordList({
      status: activeTab.value,
      page: 1,
      pageSize: 50,
      activityId,
    })
    list.value = result.list
  })
}

function handleView(item: IRegistrationRecordListItem) {
  router.push(localePath(`/account/registrations/${item.recordId}`))
}

function handleEdit(item: IRegistrationRecordListItem) {
  router.push(
    localePath({
      path: `/registration/${item.activityId}`,
      query: { record_id: item.recordId },
    })
  )
}

/** 对齐 vshop item-activity onBtnAction('sign') */
async function handleApply(item: IRegistrationRecordListItem) {
  if (item.hasTemp) {
    if (['passed', 'canceled', 'verified'].includes(item.status)) {
      router.push(localePath(`/registration/${item.activityId}`))
    } else {
      applyTarget.value = item
      applySelectOpen.value = true
    }
    return
  }
  try {
    await joinWithoutForm(item.activityId)
    toast.show(t('registration.success'))
    await loadList()
  } catch (error: any) {
    toast.show(error?.message || t('registration.submitFailed'))
  }
}

function handleApplySelect(value: string) {
  const item = applyTarget.value
  applySelectOpen.value = false
  applyTarget.value = null
  if (!item) return
  router.push(
    localePath({
      path: `/registration/${item.activityId}`,
      query: value === '0' ? { record_id: item.recordId } : {},
    })
  )
}

watch(activeTab, () => {
  loadList()
})

onMounted(() => {
  loadList()
})
</script>
