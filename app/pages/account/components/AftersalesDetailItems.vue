<template>
  <div class="flex flex-col gap-[32px] w-full">
    <div class="flex items-center gap-[10px] w-full">
      <UIcon
        name="i-icon-park-outline:application"
        class="size-5 shrink-0 text-[#191a1d]"
        aria-hidden="true"
      />
      <span class="text-[14px] font-medium leading-5 text-[#191a1d]">
        {{ storeName || t('d8cfaa2d.0d4934') }}
      </span>
    </div>

    <div class="flex flex-col w-full">
      <div
        v-for="item in items"
        :key="item.detailId || item.itemId"
        class="flex items-start gap-[16px] lg:gap-[32px] border-b border-[#e5e7eb] pb-[32px] mb-[32px] last:mb-0"
      >
        <img
          :src="item.itemImage"
          :alt="item.itemName"
          class="h-[96px] w-[96px] shrink-0 bg-[#f3f4f6] object-cover"
        />

        <div class="flex min-w-0 flex-1 items-start gap-[16px] lg:gap-[32px]">
          <div class="flex min-w-0 flex-[1_0_0] flex-col gap-[4px]">
            <BCProductMarketingTags :tags="item.marketingTags" placement="inline" />
            <p class="text-[14px] font-medium leading-5 text-[#191a1d]">
              {{ item.itemName }}
            </p>
            <div class="flex flex-col gap-[2px]">
              <p v-if="item.skuNo" class="text-[12px] leading-4 text-[#364153]">
                {{ t('d8cfaa2d.e54891') }}: {{ item.skuNo }}
              </p>
              <p v-if="item.style" class="text-[12px] leading-4 text-[#364153]">
                {{ t('d8cfaa2d.568510') }}: {{ item.style }}
              </p>
              <p v-if="item.size" class="text-[12px] leading-4 text-[#364153]">
                {{ t('d8cfaa2d.c8339f') }}: {{ item.size }}
              </p>
              <p
                v-if="!item.skuNo && !item.style && !item.size && item.specName"
                class="text-[12px] leading-4 text-[#364153]"
              >
                {{ item.specName }}
              </p>
            </div>
          </div>

          <div
            class="flex shrink-0 flex-col items-end gap-[4px] min-w-[66px] lg:min-w-0 lg:flex-row lg:items-start lg:justify-end lg:gap-[32px]"
          >
            <div class="flex flex-col items-end justify-center py-px lg:order-2">
              <span class="text-[14px] leading-5 text-[#191a1d] whitespace-nowrap">
                ¥ {{ formatAmount(item.price) }}
              </span>
            </div>
            <div class="flex flex-col items-end justify-center py-px lg:order-1">
              <span class="text-[14px] leading-5 text-[#191a1d] whitespace-nowrap">
                {{ t('d8cfaa2d.0bf60b') }}:{{ item.quantity }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hidden lg:flex items-center justify-between pb-[32px]">
      <div class="flex items-center gap-[32px] text-[14px] leading-5 text-[#364153]">
        <span>{{ t('d8cfaa2d.0bf60b') }}: {{ itemCount }}</span>
        <span>
          {{ t('d8cfaa2d.98194d') }}:
          <span class="font-medium text-[16px] text-[#191a1d]"
            >¥ {{ formatAmount(refundAmount) }}</span
          >
        </span>
      </div>
      <div v-if="resolvedButtons.length" class="flex items-center gap-[16px]">
        <button
          v-for="button in resolvedButtons"
          :key="button.type"
          type="button"
          class="h-[50px] border border-[#0f0f10] px-[32px] text-[14px] font-medium leading-4 text-[#0f0f10] transition hover:opacity-80"
          :class="button.primary ? 'bg-[#0f0f10] text-white' : 'bg-white'"
          @click="$emit('action', button)"
        >
          {{ button.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'

interface ItemModel {
  detailId?: string
  itemId: string
  itemName: string
  itemImage: string
  specName: string
  skuNo: string
  style: string
  size: string
  quantity: number
  price: number
}

interface ActionButton {
  type: string
  name: string
  primary?: boolean
}

interface Props {
  storeName: string
  items: ItemModel[]
  itemCount: number
  refundAmount: number
  actionButtons?: ActionButton[]
}

const { t } = useI18n()

const props = defineProps<Props>()

defineEmits<{
  (e: 'action', button: ActionButton): void
}>()

const resolvedButtons = computed(() => {
  if (!props.actionButtons || props.actionButtons.length === 0) return []
  return props.actionButtons.map((button, index) => ({
    ...button,
    primary:
      typeof button.primary !== 'undefined'
        ? button.primary
        : index === props.actionButtons!.length - 1,
  }))
})

function formatAmount(amount: number) {
  return Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
