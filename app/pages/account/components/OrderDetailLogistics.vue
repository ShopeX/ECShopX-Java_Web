<template>
  <div
    data-testid="order-detail-logistics"
    class="flex flex-col gap-[16px] border-t border-[#e5e7eb] py-[24px] px-4 lg:px-0"
  >
    <p class="text-[14px] font-medium leading-5 text-[#191a1d]">{{ t('d1c47e84.24bc07') }}</p>

    <div v-if="company || trackingNo" class="flex flex-col gap-[4px]">
      <p v-if="company" class="text-[14px] leading-5 text-[#364153]">
        {{ t('d1c47e84.eb6d92') }}：{{ company }}
      </p>
      <p v-if="trackingNo" class="text-[14px] leading-5 text-[#364153]">
        {{ t('d1c47e84.7a1beb') }}：{{ trackingNo }}
      </p>
    </div>

    <div v-if="traces.length > 0" class="flex flex-col gap-0">
      <div
        v-for="(trace, index) in traces"
        :key="index"
        data-testid="logistics-trace-item"
        class="flex gap-[16px] lg:gap-[32px]"
      >
        <!-- 时间线竖线 + 圆点 -->
        <div class="flex flex-col items-center shrink-0">
          <div
            class="w-[8px] h-[8px] rounded-full mt-[6px] shrink-0"
            :class="index === 0 ? 'bg-[#191a1d]' : 'bg-[#d1d5db]'"
          />
          <div
            v-if="index < traces.length - 1"
            class="w-px flex-1 bg-[#e5e7eb] mt-[4px] min-h-[20px]"
          />
        </div>

        <!-- PC：左时间右内容；H5：上内容下时间 -->
        <div
          class="flex flex-col lg:flex-row lg:gap-[32px] pb-[16px]"
          :class="index === traces.length - 1 ? 'pb-0' : ''"
        >
          <p
            class="text-[12px] leading-4 text-[#6b7280] shrink-0 lg:w-[160px] lg:order-1"
            :class="index === 0 ? 'text-[#191a1d]' : ''"
          >
            {{ trace.time }}
          </p>
          <p
            class="text-[14px] leading-5 lg:order-2"
            :class="index === 0 ? 'text-[#191a1d] font-medium' : 'text-[#6b7280]'"
          >
            {{ trace.content }}
          </p>
        </div>
      </div>
    </div>

    <p v-else class="text-[14px] leading-5 text-[#9ca3af]">{{ t('d1c47e84.9ef69f') }}</p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface LogisticsTrace {
  time: string
  content: string
}

interface Props {
  company?: string
  trackingNo?: string
  traces: LogisticsTrace[]
}

withDefaults(defineProps<Props>(), {
  company: '',
  trackingNo: '',
  traces: () => [],
})
</script>
