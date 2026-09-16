<template>
  <div class="flex flex-wrap gap-2.5" data-testid="registration-idcard-upload">
    <div
      v-for="(side, index) in sides"
      :key="side.key"
      class="flex w-[162px] flex-col items-center gap-3"
    >
      <label
        class="relative flex h-[100px] w-[162px] cursor-pointer flex-col items-center justify-center overflow-hidden"
      >
        <!-- 底图：人像面 / 国徽面示意 -->
        <img
          v-if="!modelValue[index]"
          :src="side.bg"
          alt=""
          class="pointer-events-none absolute inset-0 size-full object-contain opacity-80"
        />
        <!-- 已上传实图 -->
        <img
          v-else
          :src="modelValue[index]"
          alt=""
          class="absolute inset-0 size-full object-cover"
        />

        <!-- 未上传时：相机 + 文案叠层 -->
        <div
          v-if="!modelValue[index]"
          class="relative z-[1] flex flex-col items-center justify-center px-4"
        >
          <img src="/images/registration/camera.svg" alt="" class="h-6 w-6" />
          <span class="mt-0 text-[10px] leading-[14px] text-[#4a5565]">
            {{ t('registration.uploadImage') }}
          </span>
        </div>

        <!-- 已上传可清除 -->
        <button
          v-if="modelValue[index]"
          type="button"
          class="absolute right-1 top-1 z-[2] flex h-5 w-5 items-center justify-center bg-black/60 text-xs text-white"
          aria-label="remove"
          @click.prevent="clearSide(index)"
        >
          ×
        </button>

        <input
          type="file"
          accept="image/*"
          class="hidden"
          :disabled="uploading"
          @change="(e) => onPick(e, index)"
        />
      </label>
      <p class="text-center text-sm leading-5 text-[#364153]">{{ side.label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { uploadApiClient } from '~/infrastructure/http/clients'

const props = withDefaults(
  defineProps<{
    /** [人像面, 国徽面] */
    modelValue?: [string, string] | string[]
  }>(),
  {
    modelValue: () => ['', ''],
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: [string, string]]
}>()

const { t } = useI18n()
const toast = useToastMessage()
const uploading = ref(false)

const sides = computed(() => [
  {
    key: 'front',
    label: t('registration.idFront'),
    bg: '/images/registration/idcard-front.png',
  },
  {
    key: 'back',
    label: t('registration.idBack'),
    bg: '/images/registration/idcard-back.png',
  },
])

function normalized(): [string, string] {
  return [props.modelValue[0] || '', props.modelValue[1] || '']
}

function clearSide(index: number) {
  const next = normalized()
  next[index] = ''
  emit('update:modelValue', next)
}

async function onPick(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const result = await uploadApiClient.uploadImage({ file, group: 'registration' })
    const next = normalized()
    next[index] = result.url
    emit('update:modelValue', next)
  } catch (error: any) {
    toast.show(error?.message || t('registration.submitFailed'))
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>
