<template>
  <nav class="w-full" :aria-label="ariaLabel">
    <!-- 桌面端：完整三步 -->
    <ol class="hidden items-center py-6 md:flex">
      <li v-for="(item, index) in steps" :key="item.index" class="flex flex-1 items-center">
        <div class="flex shrink-0 items-center gap-3">
          <span
            class="flex size-7 shrink-0 items-center justify-center text-[14px] leading-5"
            :class="numberClass(item.index)"
          >
            {{ item.index }}
          </span>
          <span class="whitespace-nowrap text-[14px] leading-5" :class="labelClass(item.index)">
            {{ item.label }}
          </span>
        </div>
        <span
          v-if="index < steps.length - 1"
          class="mx-2 flex-1 border-t border-dashed border-[#d9dce3]"
          aria-hidden="true"
        />
      </li>
    </ol>

    <!-- 移动端：只保留当前步骤与下一步，避免 375 宽下挤压 -->
    <ol class="flex items-center gap-2 py-3 md:hidden">
      <li
        v-for="(item, index) in mobileSteps"
        :key="item.index"
        class="flex items-center gap-2"
        :class="index === mobileSteps.length - 1 ? '' : 'min-w-0 flex-1'"
      >
        <div class="flex shrink-0 items-center gap-2">
          <span
            class="flex size-7 shrink-0 items-center justify-center text-[14px] leading-5"
            :class="numberClass(item.index)"
          >
            {{ item.index }}
          </span>
          <span class="whitespace-nowrap text-[14px] leading-5" :class="labelClass(item.index)">
            {{ item.label }}
          </span>
        </div>
        <span
          v-if="index < mobileSteps.length - 1"
          class="min-w-4 flex-1 border-t border-dashed border-[#d9dce3]"
          aria-hidden="true"
        />
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface IStepItem {
  index: number
  label: string
}

const props = defineProps<{
  current: number
  steps: IStepItem[]
  ariaLabel?: string
}>()

const mobileSteps = computed(() => {
  if (props.current >= 3) return props.steps.filter((step) => step.index >= 2)
  return props.steps.filter((step) => step.index >= props.current).slice(0, 2)
})

function numberClass(index: number) {
  return index <= props.current
    ? 'bg-[#191a1d] text-white'
    : 'border border-[#191a1d] bg-white text-[#191a1d]'
}

function labelClass(index: number) {
  return index === props.current ? 'font-bold text-[#191a1d]' : 'text-[#8f99aa]'
}
</script>
