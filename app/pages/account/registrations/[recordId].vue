<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto flex w-full max-w-[720px] flex-col px-4 py-8 md:px-0">
      <div v-if="loading && !detail" class="py-16 text-center text-sm text-[#4a5565]">
        {{ t('registration.loading') }}
      </div>

      <div
        v-else-if="error && !detail"
        class="py-16 text-center text-sm text-[#4a5565]"
        data-testid="registration-detail-error"
      >
        {{ error }}
      </div>

      <template v-else-if="detail">
        <img
          class="h-[176px] w-full object-cover"
          :src="cover"
          :alt="detail.activityName"
        />

        <div class="mt-5 flex flex-col gap-2">
          <div class="flex items-start justify-between gap-3">
            <h1 class="text-base font-medium leading-6 text-[#191a1d]">
              {{ detail.activityName }}
            </h1>
            <span class="shrink-0 text-base font-medium leading-6 text-[#191a1d]">
              {{ detail.statusName }}
            </span>
          </div>

          <div
            v-if="detail.showTime && timeRange"
            class="flex items-center gap-2"
          >
            <UIcon name="i-heroicons-calendar-days" class="h-4 w-4 shrink-0 text-[#4a5565]" />
            <span class="text-sm leading-5 text-[#4a5565]">{{ timeRange }}</span>
          </div>
          <div
            v-if="detail.showPlace && detail.activityPlace"
            class="flex gap-2 text-sm leading-5 text-[#4a5565]"
          >
            <span>{{ t('registration.place') }}</span>
            <span>{{ detail.activityPlace }}</span>
          </div>
          <div
            v-if="detail.showAddress && detail.activityAddress"
            class="flex gap-2 text-sm leading-5 text-[#4a5565]"
          >
            <span>{{ t('registration.address') }}</span>
            <span>{{ detail.activityAddress }}</span>
          </div>
          <p v-if="detail.reason" class="text-sm leading-5 text-[#4a5565]">
            {{ t('registration.reason') }}
            <span class="text-[#191a1d]">{{ detail.reason }}</span>
          </p>
        </div>

        <div class="mt-6 flex flex-col gap-3 bg-[#f3f4f7] p-4 text-sm leading-5">
          <div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-4">
            <span class="shrink-0 text-[#4a5565]">{{ t('registration.mobile') }}</span>
            <span class="break-words text-[#191a1d] md:text-right">{{ detail.mobile }}</span>
          </div>
          <div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-4">
            <span class="shrink-0 text-[#4a5565]">{{ t('registration.points') }}</span>
            <span class="break-words text-[#191a1d] md:text-right">{{ detail.getPoints }}</span>
          </div>
          <div
            v-for="(field, idx) in detail.formData"
            :key="`${field.fieldName}-${idx}`"
            class="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-4"
          >
            <span class="shrink-0 text-[#4a5565] md:max-w-[45%]">{{ field.fieldTitle }}</span>
            <div class="min-w-0 flex-1 break-words text-[#191a1d] md:text-right">
              <template v-if="isImageAnswer(field)">
                <div class="flex flex-wrap gap-2 md:justify-end">
                  <img
                    v-for="(src, i) in imageAnswers(field)"
                    :key="`${src}-${i}`"
                    :src="src"
                    :alt="field.fieldTitle"
                    class="h-[86px] w-[86px] object-contain"
                  />
                </div>
              </template>
              <template v-else>
                {{ formatAnswer(field.answer) }}
              </template>
            </div>
          </div>
        </div>

        <div
          v-if="qrcodeUrl"
          class="mt-8 flex flex-col items-center gap-3"
          data-testid="registration-verify-qr"
        >
          <p class="text-sm font-medium text-[#191a1d]">{{ t('registration.verifyCode') }}</p>
          <img :src="qrcodeUrl" alt="qrcode" class="h-48 w-48" />
          <p v-if="detail.verifyCode" class="text-sm text-[#4a5565]">{{ detail.verifyCode }}</p>
        </div>

        <!-- 对齐 vshop：仅根据 action.cancel / edit / apply 展示 -->
        <div
          v-if="detail.actionCancel || detail.actionEdit || detail.actionApply"
          class="mt-10 flex flex-wrap items-center justify-center gap-4"
          data-testid="registration-detail-actions"
        >
          <button
            v-if="detail.actionCancel"
            type="button"
            class="min-w-[112px] border border-[#0f0f10] px-8 py-[15px] text-sm font-medium text-[#0f0f10]"
            :disabled="submitLoading"
            @click="handleCancel"
          >
            {{ t('registration.cancel') }}
          </button>
          <button
            v-if="detail.actionEdit"
            type="button"
            class="min-w-[112px] bg-[#0f0f10] px-8 py-[15px] text-sm font-medium text-white"
            data-testid="registration-refill-btn"
            @click="handleBtnAction('reFill')"
          >
            {{ t('registration.refill') }}
          </button>
          <button
            v-if="detail.actionApply"
            type="button"
            class="min-w-[112px] bg-[#0f0f10] px-8 py-[15px] text-sm font-medium text-white"
            data-testid="registration-apply-btn"
            :disabled="submitLoading"
            @click="handleBtnAction('sign')"
          >
            {{ t('registration.applyNow') }}
          </button>
        </div>
      </template>
    </div>

    <!-- 对齐 vshop SpSelectModal：编辑报名信息 / 代他人报名 -->
    <div
      v-if="applySelectOpen"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center"
      @click.self="applySelectOpen = false"
    >
      <div class="w-full max-w-md bg-white p-6 shadow-lg md:rounded">
        <p class="mb-4 text-base font-medium text-[#191a1d]">{{ t('registration.applySelectTitle') }}</p>
        <button
          v-for="opt in applySelectOptions"
          :key="opt.value"
          type="button"
          class="mb-3 flex w-full items-center justify-center border border-[#0f0f10] px-4 py-3 text-sm font-medium text-[#0f0f10] last:mb-0"
          @click="handleApplySelect(opt.value)"
        >
          {{ opt.label }}
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import QRCode from 'qrcode'
import { useRegistration } from '~/composables/useRegistration'
import type { IRegistrationField } from '~/infrastructure/transformers'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const toast = useToastMessage()
const { confirm } = useModal()
const { requireAuth } = useAuthGuard()

const {
  recordDetail: detail,
  loading,
  submitLoading,
  error,
  loadRecordDetail,
  cancelRecord,
  joinWithoutForm,
} = useRegistration()

const qrcodeUrl = ref('')
const applySelectOpen = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

const recordId = computed(() => String(route.params.recordId || ''))
const cover = computed(
  () => detail.value?.pics?.[0] || 'https://via.placeholder.com/720x176?text=Activity'
)
const timeRange = computed(() => {
  if (!detail.value) return ''
  const { startDate, endDate } = detail.value
  if (startDate && endDate) return `${startDate} - ${endDate}`
  return startDate || endDate || ''
})

const applySelectOptions = computed(() => [
  { label: t('registration.editCurrent'), value: '0' },
  { label: t('registration.applyForOther'), value: '1' },
])

function isImageAnswer(field: IRegistrationField) {
  return ['image', 'idcard', 'otherfile'].includes(field.formElement)
}

function imageAnswers(field: IRegistrationField): string[] {
  const answer = field.answer
  if (!answer) return []
  if (Array.isArray(answer)) return answer.map(String).filter(Boolean)
  return String(answer)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function formatAnswer(answer: unknown) {
  if (answer == null) return ''
  if (Array.isArray(answer)) return answer.join(', ')
  if (typeof answer === 'object') return JSON.stringify(answer)
  return String(answer)
}

function goForm(activityId: string, withRecordId?: string) {
  router.push(
    localePath({
      path: `/registration/${activityId}`,
      query: withRecordId ? { record_id: withRecordId } : {},
    })
  )
}

async function refresh(isVerify = false) {
  const model = await loadRecordDetail(recordId.value)
  if (!isVerify && model.isOfflineVerify && model.status === 'passed' && model.verifyCode) {
    qrcodeUrl.value = await QRCode.toDataURL(
      JSON.stringify({ verify_code: model.verifyCode, record_id: model.recordId })
    )
    if (!pollTimer) {
      pollTimer = setInterval(() => {
        refresh(true).catch(() => undefined)
      }, 3000)
    }
  }
  if (isVerify && model.status === 'verified' && pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

/** 对齐 vshop activity-detail onBtnAction */
async function handleBtnAction(type: 'reFill' | 'sign') {
  if (!detail.value) return
  const { activityId, recordId: rid, status, hasTemp } = detail.value

  if (type === 'reFill') {
    goForm(activityId, rid)
    return
  }

  // sign：立即报名
  if (hasTemp) {
    if (['passed', 'canceled', 'verified'].includes(status)) {
      goForm(activityId)
    } else {
      // pending / rejected 等：弹出「编辑报名信息 / 代他人报名」
      applySelectOpen.value = true
    }
    return
  }

  try {
    await joinWithoutForm(activityId)
    toast.show(t('registration.success'))
    await refresh()
  } catch (error: any) {
    toast.show(error?.message || t('registration.submitFailed'))
  }
}

function handleApplySelect(value: string) {
  if (!detail.value) return
  applySelectOpen.value = false
  const { activityId, recordId: rid } = detail.value
  // value == '0' → 编辑当前（带 record_id）；否则代他人/新建
  goForm(activityId, value === '0' ? rid : undefined)
}

function handleCancel() {
  if (!detail.value) return
  confirm({
    title: t('registration.cancelConfirmTitle'),
    content: t('registration.cancelConfirmContent'),
    onConfirm: async () => {
      try {
        await cancelRecord(detail.value!.recordId)
        toast.show(t('registration.cancelSuccess'))
        await refresh()
      } catch (error: any) {
        toast.show(error?.message || t('registration.submitFailed'))
      }
    },
  })
}

onMounted(async () => {
  await requireAuth(async () => {
    if (recordId.value) await refresh()
  })
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>
