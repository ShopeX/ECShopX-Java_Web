<template>
  <div class="flex items-center gap-[8px]">
    <button
      v-for="n in 5"
      :key="n"
      type="button"
      :data-testid="`star-${n}`"
      class="shrink-0 size-[24px] focus:outline-none"
      @click="emit('update:modelValue', n)"
    >
      <svg
        viewBox="0 0 24 24"
        class="size-[24px]"
        :class="n <= modelValue ? 'text-[#f59e0b]' : 'text-[#d1d5dc]'"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M11.0489 2.92705C11.3483 2.00574 12.6517 2.00574 12.9511 2.92705L14.2451 6.90983C14.379 7.32185 14.763 7.60081 15.1962 7.60081H19.3839C20.3527 7.60081 20.7554 8.84043 19.9717 9.40983L16.5838 11.8713C16.2333 12.126 16.0866 12.5773 16.2205 13.0114L17.5146 16.9942C17.8139 17.9156 16.7595 18.6806 15.9759 18.1112L12.588 15.6497C12.2375 15.395 11.7625 15.395 11.412 15.6497L8.02412 18.1112C7.24051 18.6806 6.18607 17.9156 6.48545 16.9942L7.77952 13.0114C7.91338 12.5773 7.76672 12.126 7.41618 11.8713L4.02832 9.40983C3.24471 8.84043 3.64744 7.60081 4.61623 7.60081H8.80385C9.23706 7.60081 9.62099 7.32185 9.75486 6.90983L11.0489 2.92705Z"
        />
      </svg>
    </button>

    <span data-testid="review-satisfaction-text" class="text-[14px] leading-5 text-[#4a5565]">
      {{ satisfactionText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 5,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const { t } = useI18n()

const satisfactionMap: Record<number, string> = {
  1: '49f8a834.5d6da6',
  2: '49f8a834.894cca',
  3: '49f8a834.2ab01e',
  4: '49f8a834.195b8a',
  5: '49f8a834.67e6ef',
}

const satisfactionText = computed(() => {
  const key = satisfactionMap[props.modelValue]
  return key ? t(key) : ''
})
</script>
