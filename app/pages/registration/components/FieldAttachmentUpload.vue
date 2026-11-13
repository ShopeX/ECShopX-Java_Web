<template>
  <div class="flex flex-wrap gap-3" data-testid="registration-attachment-upload">
    <!-- 已上传预览 -->
    <div
      v-for="(url, index) in modelValue"
      :key="`${url}-${index}`"
      class="relative h-[100px] w-[100px] overflow-hidden bg-[#f3f4f6]"
    >
      <img :src="url" alt="" class="h-full w-full object-cover" />
      <button
        type="button"
        class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center bg-black/60 text-xs text-white"
        aria-label="remove"
        @click="removeAt(index)"
      >
        ×
      </button>
    </div>

    <!-- 上传入口：对齐 Figma 100x100 浅灰块 + 相机 + 上传图片 -->
    <label
      v-if="modelValue.length < max"
      class="relative flex h-[100px] w-[100px] cursor-pointer flex-col items-center justify-center gap-1 bg-[#f3f4f6] text-[#4a5565]"
    >
      <img
        src="/images/registration/camera.svg"
        alt=""
        class="h-6 w-6"
      />
      <span class="text-[10px] leading-[14px]">{{ t('registration.uploadImage') }}</span>
      <input
        type="file"
        accept="image/*"
        class="hidden"
        :disabled="uploading"
        @change="onPick"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { uploadApiClient } from '~/infrastructure/http/clients'

const props = withDefaults(
  defineProps<{
    modelValue?: string[]
    max?: number
  }>(),
  {
    modelValue: () => [],
    max: 9,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const { t } = useI18n()
const toast = useToastMessage()
const uploading = ref(false)

function removeAt(index: number) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

async function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const result = await uploadApiClient.uploadImage({ file, group: 'registration' })
    emit('update:modelValue', [...props.modelValue, result.url])
  } catch (error: any) {
    toast.show(error?.message || t('registration.submitFailed'))
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>
