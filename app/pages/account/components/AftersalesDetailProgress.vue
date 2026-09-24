<template>
  <div class="flex flex-col gap-[32px] pt-[16px] lg:pt-[32px] w-full">
    <div class="flex items-center justify-end w-full">
      <p class="text-[16px] font-medium leading-5 text-[#191a1d]">
        {{ translateIfKey(statusText) }}
      </p>
    </div>

    <div class="flex items-start w-full">
      <div
        v-for="(step, index) in resolvedSteps"
        :key="step.key"
        class="flex flex-1 flex-col items-center gap-[2px]"
      >
        <div class="relative h-[24px] w-full">
          <div class="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center">
            <div
              class="h-px flex-1"
              :class="
                index === 0
                  ? 'bg-transparent'
                  : resolvedSteps[index - 1]?.active && step.active
                    ? 'bg-[#0f0f10]'
                    : 'bg-[#e5e7eb]'
              "
            />
            <div
              class="h-px flex-1"
              :class="
                index === resolvedSteps.length - 1
                  ? 'bg-transparent'
                  : step.active && resolvedSteps[index + 1]?.active
                    ? 'bg-[#0f0f10]'
                    : 'bg-[#e5e7eb]'
              "
            />
          </div>
          <div
            class="absolute left-1/2 top-1/2 size-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            :class="step.active ? 'bg-[#0f0f10]' : 'bg-[#e5e7eb]'"
          />
        </div>
        <div class="flex flex-col items-center px-[8px]">
          <p class="w-full text-center text-[14px] leading-5 text-[#191a1d]">
            {{ translateIfKey(step.label) }}
          </p>
        </div>
      </div>
    </div>

    <p v-if="progressText" class="text-[14px] leading-5 text-[#4a5565]">{{ progressText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ProgressStep {
  key: string
  label: string
  active: boolean
}

interface Props {
  statusText: string
  progressText?: string
  progressSteps: ProgressStep[]
}

const props = defineProps<Props>()
const { t } = useI18n()

const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/
const defaultProgressLabels = ['c0a0b852.0830b4', 'c0a0b852.f6324c', 'c0a0b852.265b00']

function translateIfKey(value: string) {
  return generatedKeyPattern.test(value) ? t(value) : value
}

const resolvedSteps = computed(() =>
  props.progressSteps?.length
    ? props.progressSteps
    : defaultProgressLabels.map((label, index) => ({
        key: `step-${index + 1}`,
        label,
        active: index === 0,
      }))
)
</script>
