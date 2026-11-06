<template>
  <div class="flex flex-col gap-2">
    <div v-if="label" class="flex items-center gap-[3px] text-[14px] leading-5">
      <span v-if="required" class="shrink-0 text-[#d0112f]">*</span>
      <span class="text-[#4a5565]">{{ label }}</span>
    </div>

    <label
      class="relative flex h-[121px] w-[200px] shrink-0 cursor-pointer flex-col items-center justify-center gap-[15px] overflow-hidden border border-dashed border-[#8f99aa] bg-white transition-colors hover:border-[#191a1d] md:h-[170px] md:w-[280px]"
      :class="uploading ? 'opacity-60' : ''"
    >
      <img
        v-if="modelValue"
        :src="modelValue"
        :alt="label || hint || ''"
        class="absolute inset-0 size-full object-cover"
      />
      <template v-else>
        <svg
          class="h-[48px] w-[80px] md:h-[60px] md:w-[100px]"
          viewBox="0 0 100 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="1" y="1" width="98" height="58" rx="2" stroke="#8f99aa" stroke-width="1.2" />
          <template v-if="kind === 'license'">
            <rect x="10" y="12" width="20" height="26" rx="1" stroke="#8f99aa" stroke-width="1.2" />
            <path
              d="M38 16h50M38 24h50M38 32h34M10 46h78"
              stroke="#8f99aa"
              stroke-width="1.2"
              stroke-linecap="round"
            />
            <circle cx="70" cy="37" r="9" stroke="#8f99aa" stroke-width="1.2" />
            <path d="M66 37h8M70 33v8" stroke="#8f99aa" stroke-width="1.2" stroke-linecap="round" />
          </template>
          <template v-else-if="kind === 'id-front'">
            <circle cx="26" cy="27" r="8" stroke="#8f99aa" stroke-width="1.2" />
            <path
              d="M14 44c2-6 6-9 12-9s10 3 12 9"
              stroke="#8f99aa"
              stroke-width="1.2"
              stroke-linecap="round"
            />
            <path
              d="M48 20h40M48 29h40M48 38h28"
              stroke="#8f99aa"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </template>
          <template v-else-if="kind === 'id-back'">
            <circle cx="50" cy="26" r="10" stroke="#8f99aa" stroke-width="1.2" />
            <path
              d="M46 26h8M50 22v8M28 44h44M28 49h24"
              stroke="#8f99aa"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </template>
          <template v-else>
            <path d="M1 16h98" stroke="#8f99aa" stroke-width="1.2" />
            <path
              d="M12 30h22M12 38h14M60 30h28M60 38h20"
              stroke="#8f99aa"
              stroke-width="1.2"
              stroke-linecap="round"
            />
            <circle cx="86" cy="48" r="5" stroke="#8f99aa" stroke-width="1.2" />
          </template>
        </svg>
        <span class="px-2 text-center text-[12px] leading-4 text-[#8f99aa]">
          {{ uploading ? t('merchantSettlement.uploading') : hint }}
        </span>
      </template>
      <input type="file" accept="image/*" class="hidden" :disabled="uploading" @change="onPick" />
    </label>

    <button
      v-if="modelValue"
      type="button"
      class="w-[200px] text-left text-[12px] leading-4 text-[#8f99aa] underline underline-offset-1 md:w-[280px]"
      @click="emit('update:modelValue', '')"
    >
      {{ t('merchantSettlement.removeImage') }}
    </button>

    <p v-if="note" class="whitespace-pre-line text-[12px] leading-4 text-[#8f99aa]">
      {{ note }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { uploadApiClient } from '~/infrastructure/http/clients'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    required?: boolean
    /** 虚线框内文案 */
    hint?: string
    /** 虚线框内插图类型 */
    kind?: 'license' | 'id-front' | 'id-back' | 'bank'
    /** 框下方说明文案 */
    note?: string
  }>(),
  {
    kind: 'license',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
const toast = useToastMessage()
const uploading = ref(false)

async function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const result = await uploadApiClient.uploadImage({ file, group: 'merchant' })
    emit('update:modelValue', result.url)
  } catch (error: any) {
    toast.show(error?.message || t('merchantSettlement.uploadFailed'))
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>
