<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto flex w-full max-w-[720px] flex-col px-4 py-6 md:px-0 md:py-8">
      <div v-if="loading && !activity" class="py-16 text-center text-sm text-[#4a5565]">
        {{ t('registration.loading') }}
      </div>

      <template v-else>
        <img
          class="h-[176px] w-full object-cover"
          :src="banner"
          alt=""
          data-testid="registration-hero"
        />

        <h1 class="mt-6 text-xl font-medium leading-5 text-[#191a1d]">
          {{ t('registration.applyTitle') }}
        </h1>
        <p v-if="activity?.activityName" class="mt-2 text-sm leading-5 text-[#364153]">
          {{ activity.activityName }}
        </p>

        <form class="mt-6 flex flex-col gap-8" @submit.prevent="handleSubmit">
          <template v-for="(section, sIdx) in sections" :key="`s-${sIdx}`">
            <div class="flex flex-col gap-6">
              <h2
                v-if="section.title"
                class="text-base font-medium leading-6 text-[#191a1d]"
              >
                {{ section.title }}
              </h2>

              <div
                v-for="(field, fIdx) in section.formdata"
                :key="field.id || `${field.fieldName}-${fIdx}`"
                class="flex flex-col gap-3"
              >
                <label class="flex items-center gap-0.5 text-sm leading-5 text-[#364153]">
                  <span v-if="field.isRequired" class="text-[#fb2c36]">*</span>
                  <span>{{ field.fieldTitle }}</span>
                </label>

                <!-- text / tel / number：Figma 浅灰底输入框 -->
                <input
                  v-if="['text', 'tel', 'number'].includes(field.formElement)"
                  v-model="answers[fieldKey(sIdx, fIdx)]"
                  class="field-input"
                  :type="
                    field.formElement === 'number'
                      ? 'number'
                      : field.formElement === 'tel'
                        ? 'tel'
                        : 'text'
                  "
                  :placeholder="`请填写${field.fieldTitle}`"
                />

                <!-- textarea -->
                <textarea
                  v-else-if="field.formElement === 'textarea'"
                  v-model="answers[fieldKey(sIdx, fIdx)]"
                  class="field-input min-h-[96px] py-3"
                  :placeholder="`请填写${field.fieldTitle}`"
                />

                <!-- select / radio：组件库 ECSelect（对齐 vshop Picker） -->
                <ECSelect
                  v-else-if="['select', 'radio'].includes(field.formElement)"
                  v-model="answers[fieldKey(sIdx, fIdx)]"
                  :options="toSelectOptions(field.options)"
                  :placeholder="`请选择${field.fieldTitle}`"
                  size="lg"
                  variant="default"
                />

                <!-- checkbox：纵向选项列表，文案取 value（接口无 label） -->
                <div
                  v-else-if="field.formElement === 'checkbox'"
                  class="flex flex-col gap-3"
                >
                  <label
                    v-for="opt in field.options"
                    :key="String(opt.value)"
                    class="flex cursor-pointer items-start gap-3 text-sm leading-5 text-[#191a1d]"
                  >
                    <input
                      v-model="checkboxAnswers[fieldKey(sIdx, fIdx)]"
                      type="checkbox"
                      class="field-check mt-0.5"
                      :value="opt.value"
                    />
                    <span>{{ opt.label || opt.value }}</span>
                  </label>
                </div>

                <!-- date -->
                <input
                  v-else-if="field.formElement === 'date'"
                  v-model="answers[fieldKey(sIdx, fIdx)]"
                  type="date"
                  class="field-input"
                />

                <!-- area -->
                <input
                  v-else-if="field.formElement === 'area'"
                  v-model="answers[fieldKey(sIdx, fIdx)]"
                  class="field-input"
                  :placeholder="`请填写${field.fieldTitle}`"
                />

                <FieldAttachmentUpload
                  v-else-if="field.formElement === 'image'"
                  :model-value="imageAnswers[fieldKey(sIdx, fIdx)] || []"
                  @update:model-value="(urls) => onImageModelUpdate(sIdx, fIdx, urls)"
                />

                <FieldAttachmentUpload
                  v-else-if="field.formElement === 'otherfile'"
                  :model-value="imageAnswers[fieldKey(sIdx, fIdx)] || []"
                  :max="9"
                  @update:model-value="(urls) => onImageModelUpdate(sIdx, fIdx, urls)"
                />

                <FieldIdCardUpload
                  v-else-if="field.formElement === 'idcard'"
                  :model-value="idCardAnswers[fieldKey(sIdx, fIdx)] || ['', '']"
                  @update:model-value="(pair) => onIdCardModelUpdate(sIdx, fIdx, pair)"
                />

                <input
                  v-else
                  v-model="answers[fieldKey(sIdx, fIdx)]"
                  class="field-input"
                  :placeholder="`请填写${field.fieldTitle}`"
                />
              </div>
            </div>
          </template>

          <div class="pt-4">
            <button
              type="submit"
              class="h-[52px] w-full bg-[#0f0f10] text-sm font-medium text-white disabled:opacity-60 md:mx-auto md:block md:w-[496px]"
              :disabled="submitLoading"
              data-testid="registration-submit"
            >
              {{ t('registration.submit') }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRegistration } from '~/composables/useRegistration'
import type { IRegistrationOption, IRegistrationSection } from '~/infrastructure/transformers'
import { ECSelect } from '~/components/ECSelect'
import type { ISelectOption } from '~/components/ECSelect'
import FieldAttachmentUpload from './components/FieldAttachmentUpload.vue'
import FieldIdCardUpload from './components/FieldIdCardUpload.vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const toast = useToastMessage()
const { requireAuth } = useAuthGuard()

const {
  activity,
  formTemplate,
  loading,
  submitLoading,
  loadActivity,
  loadRecordDetail,
  submitRegistration,
  joinWithoutForm,
} = useRegistration()

const answers = reactive<Record<string, any>>({})
const checkboxAnswers = reactive<Record<string, any[]>>({})
const imageAnswers = reactive<Record<string, string[]>>({})
const idCardAnswers = reactive<Record<string, [string, string]>>({})

const activityId = computed(() => String(route.params.activityId || ''))
const recordId = computed(() => String(route.query.record_id || ''))

const sections = computed<IRegistrationSection[]>(() => formTemplate.value?.content || [])

const banner = computed(
  () =>
    formTemplate.value?.headerBgPic ||
    activity.value?.pics?.[0] ||
    'https://via.placeholder.com/720x176?text=Registration'
)

function fieldKey(sIdx: number, fIdx: number) {
  return `${sIdx}-${fIdx}`
}

function toSelectOptions(options: IRegistrationOption[] = []): ISelectOption[] {
  return options.map((opt) => ({
    label: String(opt.label || opt.value),
    value: opt.value as string | number,
    disabled: opt.disabled,
  }))
}

function ensureImageModel(key: string) {
  if (!imageAnswers[key]) imageAnswers[key] = []
}

function ensureIdCardModel(key: string) {
  if (!idCardAnswers[key]) idCardAnswers[key] = ['', '']
}

function onImageModelUpdate(sIdx: number, fIdx: number, urls: string[]) {
  const key = fieldKey(sIdx, fIdx)
  imageAnswers[key] = urls
  answers[key] = urls
}

function onIdCardModelUpdate(sIdx: number, fIdx: number, pair: [string, string]) {
  const key = fieldKey(sIdx, fIdx)
  idCardAnswers[key] = pair
  answers[key] = pair
}

function parseImageList(answer: unknown): string[] {
  if (Array.isArray(answer)) return answer.map(String).filter(Boolean)
  if (!answer) return []
  return String(answer)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function seedAnswersFromTemplate() {
  sections.value.forEach((section, sIdx) => {
    section.formdata.forEach((field, fIdx) => {
      const key = fieldKey(sIdx, fIdx)
      const answer = field.answer
      if (field.formElement === 'checkbox') {
        checkboxAnswers[key] = Array.isArray(answer)
          ? answer
          : String(answer || '')
              .split(',')
              .filter(Boolean)
      } else if (field.formElement === 'image' || field.formElement === 'otherfile') {
        const list = parseImageList(answer)
        imageAnswers[key] = list
        answers[key] = list
      } else if (field.formElement === 'idcard') {
        const list = parseImageList(answer)
        idCardAnswers[key] = [list[0] || '', list[1] || '']
        answers[key] = idCardAnswers[key]
      } else if (answer != null) {
        answers[key] = answer
      } else {
        answers[key] = ''
      }
      if (field.formElement === 'image' || field.formElement === 'otherfile') {
        ensureImageModel(key)
      }
      if (field.formElement === 'idcard') {
        ensureIdCardModel(key)
      }
    })
  })
}

function buildContentPayload() {
  return sections.value.map((section, sIdx) => ({
    title: section.title,
    sort: section.sort,
    formdata: section.formdata.map((field, fIdx) => {
      const key = fieldKey(sIdx, fIdx)
      let answer: unknown = answers[key]
      if (field.formElement === 'checkbox') {
        answer = checkboxAnswers[key] || []
      } else if (field.formElement === 'image' || field.formElement === 'otherfile') {
        answer = imageAnswers[key] || []
      } else if (field.formElement === 'idcard') {
        answer = (idCardAnswers[key] || ['', '']).filter(Boolean)
      }
      return {
        id: field.id,
        field_title: field.fieldTitle,
        field_name: field.fieldName,
        form_element: field.sourceFormElement || field.formElement,
        is_required: field.isRequired ? 1 : 0,
        // 提交回传原始 { value }，避免带上仅前端用的 label
        options: field.options.map((opt) => ({ value: opt.value })),
        image_url: field.imageUrl,
        sort: field.sort,
        status: field.status,
        answer,
      }
    }),
  }))
}

function validateRequired(): boolean {
  for (let sIdx = 0; sIdx < sections.value.length; sIdx++) {
    const section = sections.value[sIdx]
    for (let fIdx = 0; fIdx < section.formdata.length; fIdx++) {
      const field = section.formdata[fIdx]
      if (!field.isRequired) continue
      const key = fieldKey(sIdx, fIdx)

      if (field.formElement === 'idcard') {
        const pair = idCardAnswers[key] || ['', '']
        if (!pair[0] || !pair[1]) return false
        continue
      }

      if (field.formElement === 'image' || field.formElement === 'otherfile') {
        if (!(imageAnswers[key] || []).length) return false
        continue
      }

      const value =
        field.formElement === 'checkbox' ? checkboxAnswers[key] : answers[key]
      const empty =
        value == null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      if (empty) return false
    }
  }
  return true
}

async function handleSubmit() {
  await requireAuth(async () => {
    if (!activityId.value) return

    if (!activity.value?.hasTemp) {
      try {
        await joinWithoutForm(activityId.value)
        toast.show(t('registration.success'))
        router.replace(localePath('/account/registrations'))
      } catch (error: any) {
        toast.show(error?.message || t('registration.submitFailed'))
      }
      return
    }

    if (!validateRequired()) {
      toast.show(t('registration.required'))
      return
    }

    try {
      const content = buildContentPayload()
      const result = await submitRegistration({
        activityId: activityId.value,
        content,
        recordId: recordId.value || undefined,
      })
      toast.show(t('registration.success'))
      const newRecordId =
        result?.data?.record_id || result?.record_id || recordId.value
      if (newRecordId) {
        router.replace(localePath(`/account/registrations/${newRecordId}`))
      } else {
        router.replace(localePath('/account/registrations'))
      }
    } catch (error: any) {
      toast.show(error?.message || error?.data?.message || t('registration.submitFailed'))
    }
  })
}

onMounted(async () => {
  await requireAuth(async () => {
    if (!activityId.value) return
    await loadActivity(activityId.value)
    if (recordId.value) {
      const record = await loadRecordDetail(recordId.value)
      if (record.formData?.length && formTemplate.value?.content?.length) {
        // 优先按字段 id 回填；同模板大量 field_name 可能都是 type
        const byId = new Map(
          record.formData
            .filter((f) => f.id)
            .map((f) => [f.id, f.answer] as const)
        )
        const byTitle = new Map(
          record.formData.map((f) => [f.fieldTitle, f.answer] as const)
        )
        formTemplate.value.content.forEach((section) => {
          section.formdata.forEach((field) => {
            if (field.id && byId.has(field.id)) {
              field.answer = byId.get(field.id)
            } else if (byTitle.has(field.fieldTitle)) {
              field.answer = byTitle.get(field.fieldTitle)
            }
          })
        })
      }
    }
    seedAnswersFromTemplate()
  })
})
</script>

<style scoped>
.field-input {
  height: 48px;
  width: 100%;
  background: #f3f4f7;
  border: none;
  padding: 0 12px;
  font-size: 14px;
  line-height: 20px;
  color: #191a1d;
  outline: none;
}

.field-input::placeholder {
  color: #8f99aa;
}

.field-input.min-h-\[96px\] {
  height: auto;
}

.field-check {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  appearance: none;
  border: 1px solid #191a1d;
  background: #fff;
  cursor: pointer;
}

.field-check:checked {
  background: #191a1d;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.5 8.5L6.5 11.5L12.5 4.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-size: 12px 12px;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
