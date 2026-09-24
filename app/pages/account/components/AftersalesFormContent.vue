<template>
  <div class="flex flex-col gap-[32px]">
    <div data-testid="aftersales-item-list" class="flex flex-col gap-[16px]">
      <div v-for="item in items" :key="item.itemId" class="flex gap-[16px] items-start">
        <button
          type="button"
          class="mt-[2px] flex h-[16px] w-[16px] shrink-0 items-center justify-center border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors disabled:cursor-not-allowed disabled:border-[#d2d6db] disabled:bg-[#f3f4f6]"
          :class="
            selectedItemId === item.itemId
              ? 'border-[#191a1d] bg-[#191a1d]'
              : 'border-[#191a1d] bg-white'
          "
          :disabled="!isItemSelectable(item)"
          :data-testid="`aftersales-item-select-${item.itemId}`"
          @click="emit('selectItem', item.itemId)"
        >
          <svg
            v-if="selectedItemId === item.itemId"
            viewBox="0 0 14 14"
            class="h-[14px] w-[14px] text-white"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 7L5.75 9.75L11 4.5" />
          </svg>
        </button>

        <div class="flex flex-1 gap-[16px] min-w-0 items-start">
          <img
            :src="item.itemImage"
            :alt="item.itemName"
            class="h-[96px] w-[96px] shrink-0 bg-[#f3f4f6] object-cover"
          />

          <div class="flex flex-1 flex-col gap-[8px] min-w-0">
            <div class="flex items-start justify-between gap-[16px]">
              <div class="flex flex-1 flex-col gap-[4px] min-w-0">
                <BCProductMarketingTags :tags="item.marketingTags" placement="inline" />
                <p class="text-[14px] font-medium leading-5 text-[#191a1d]">
                  {{ item.itemName }}
                </p>
                <div class="flex flex-col gap-[2px] text-[12px] leading-4 text-[#364153]">
                  <p v-if="item.skuNo">{{ t('ee3264ed.e54891') }}: {{ item.skuNo }}</p>
                  <p v-if="item.style">{{ t('ee3264ed.568510') }}: {{ item.style }}</p>
                  <p v-if="item.size">{{ t('ee3264ed.c8339f') }}: {{ item.size }}</p>
                  <p v-if="!item.skuNo && !item.style && !item.size && item.specName">
                    {{ item.specName }}
                  </p>
                </div>
              </div>

              <div class="flex shrink-0 flex-col items-end gap-[4px]">
                <p class="text-[14px] leading-5 text-[#191a1d]">¥ {{ formatAmount(item.price) }}</p>
                <p class="text-[14px] leading-5 text-[#191a1d]">
                  {{ t('0747dfee.95fa28') }}:{{ item.quantity }}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between gap-[16px]">
              <p class="text-[14px] font-medium leading-5 text-[#191a1d]">
                {{ t('0747dfee.8e6db6') }}
              </p>
              <div class="flex w-[120px] items-center border border-[#e5e7eb] bg-white p-px">
                <button
                  type="button"
                  class="flex h-[38px] w-[40px] items-center justify-center text-[#191a1d] transition-colors hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:text-[#99a1af]"
                  :disabled="!isItemSelectable(item) || quantityFor(item.itemId) <= 1"
                  :data-testid="`aftersales-quantity-decrease-${item.itemId}`"
                  @click="
                    emit('updateQuantity', {
                      itemId: item.itemId,
                      quantity: quantityFor(item.itemId) - 1,
                    })
                  "
                >
                  <svg
                    viewBox="0 0 16 16"
                    class="h-[16px] w-[16px]"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" d="M4 8H12" />
                  </svg>
                </button>
                <div class="flex h-[38px] w-[40px] items-center justify-center">
                  <span class="font-['Inter'] text-[14px] font-medium leading-5 text-[#191a1d]">
                    {{ quantityFor(item.itemId) }}
                  </span>
                </div>
                <button
                  type="button"
                  class="flex h-[38px] w-[40px] items-center justify-center text-[#191a1d] transition-colors hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:text-[#99a1af]"
                  :disabled="!isItemSelectable(item) || quantityFor(item.itemId) >= maxQuantityFor(item)"
                  :data-testid="`aftersales-quantity-increase-${item.itemId}`"
                  @click="
                    emit('updateQuantity', {
                      itemId: item.itemId,
                      quantity: quantityFor(item.itemId) + 1,
                    })
                  "
                >
                  <svg
                    viewBox="0 0 16 16"
                    class="h-[16px] w-[16px]"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" d="M8 4V12M4 8H12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-[8px]" data-testid="aftersales-refund-reason">
      <p class="text-[14px] font-medium leading-5 text-[#191a1d]">
        {{ t('0747dfee.1e2355') }}
      </p>
      <div class="relative">
        <select
          :value="refundReason"
          class="h-[44px] w-full appearance-none bg-[#f3f4f6] px-[12px] text-[14px] leading-5 text-[#191a1d] outline-none"
          @change="emit('update:refundReason', ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>{{ t('0747dfee.b42a2f') }}</option>
          <option v-for="option in reasonOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <svg
          viewBox="0 0 16 16"
          class="pointer-events-none absolute right-[12px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#4a5565]"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6L8 10L12 6" />
        </svg>
      </div>
    </div>

    <div class="flex flex-col gap-[8px]" data-testid="aftersales-refund-amount">
      <p class="text-[14px] font-medium leading-5 text-[#191a1d]">
        {{ t('0747dfee.a7c3f0') }}
      </p>
      <div
        class="flex h-[44px] items-center bg-[#f3f4f6] px-[12px] text-[14px] leading-5 text-[#99a1af]"
      >
        {{ refundAmountText }}
      </div>
    </div>

    <div class="flex flex-col gap-[8px]" data-testid="aftersales-refund-points">
      <p class="text-[14px] font-medium leading-5 text-[#191a1d]">
        {{ t('0747dfee.77f688') }}
      </p>
      <div
        class="flex h-[44px] items-center bg-[#f3f4f6] px-[12px] text-[14px] leading-5 text-[#99a1af]"
      >
        {{ refundPointsText }}
      </div>
    </div>

    <div class="flex flex-col gap-[8px]" data-testid="aftersales-description">
      <p class="text-[14px] font-medium leading-5 text-[#191a1d]">
        {{ t('0747dfee.2b6d1d') }}
      </p>
      <textarea
        :value="description"
        :placeholder="t('0747dfee.ce7542')"
        :maxlength="500"
        class="h-[80px] w-full resize-none bg-[#f3f4f6] px-[12px] py-[4px] text-[14px] leading-5 text-[#191a1d] outline-none placeholder:text-[#99a1af]"
        @input="emit('update:description', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <div class="flex flex-col gap-[8px]" data-testid="aftersales-image-upload">
      <p class="text-[14px] leading-5 text-[#99a1af]">
        <span class="font-medium text-[#191a1d]">{{ t('0747dfee.c98640') }}</span>
        {{ t('0747dfee.07f6af') }}
      </p>
      <div class="flex flex-wrap gap-[8px]">
        <div
          v-for="(preview, index) in imagePreviews"
          :key="preview"
          class="relative h-[100px] w-[100px] overflow-hidden border border-[#e5e7eb] bg-[#f3f4f6]"
        >
          <img
            :src="preview"
            :alt="`${t('0747dfee.c98640')}${index + 1}`"
            class="h-full w-full object-cover"
          />
          <button
            type="button"
            class="absolute right-[4px] top-[4px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-black/70 text-white"
            :data-testid="`aftersales-image-remove-${index}`"
            @click="emit('removeImage', index)"
          >
            <svg
              viewBox="0 0 12 12"
              class="h-[12px] w-[12px]"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path stroke-linecap="round" d="M2 2L10 10M10 2L2 10" />
            </svg>
          </button>
        </div>

        <button
          v-if="imagePreviews.length < 3"
          type="button"
          class="flex h-[100px] w-[100px] flex-col items-center justify-center gap-[4px] border border-dashed border-[#99a1af] bg-[#f3f4f6] text-[#99a1af]"
          data-testid="aftersales-image-trigger"
          @click="emit('triggerUpload')"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-[24px] w-[24px]"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 7.5h2l1-1.5h3l1 1.5h2A1.5 1.5 0 0118 9v8.25A1.75 1.75 0 0116.25 19h-8.5A1.75 1.75 0 016 17.25V9a1.5 1.5 0 011.5-1.5z"
            />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v4.5M9.75 12.75h4.5" />
          </svg>
          <span class="text-[10px] leading-[14px]">{{ t('0747dfee.372e0a') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'
import type { IMarketingTag } from '~/utils/promotionTags'

export interface AftersalesPanelItem {
  detailId: string
  itemId: string
  itemName: string
  itemImage: string
  skuNo?: string
  style?: string
  size?: string
  specName?: string
  quantity: number
  leftAftersalesNum: number
  price: number
  marketingTags?: IMarketingTag[]
}

interface ReasonOption {
  label: string
  value: string
}

interface Props {
  items: AftersalesPanelItem[]
  selectedItemId: string
  quantities: Record<string, number>
  refundReason: string
  refundAmountText: string
  refundPointsText: string
  description: string
  imagePreviews: string[]
  reasonOptions: ReasonOption[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selectItem: [itemId: string]
  updateQuantity: [payload: { itemId: string; quantity: number }]
  'update:refundReason': [value: string]
  'update:description': [value: string]
  triggerUpload: []
  removeImage: [index: number]
}>()

const { t } = useI18n()

function quantityFor(itemId: string) {
  return props.quantities[itemId] ?? 1
}

function isItemSelectable(item: AftersalesPanelItem) {
  return item.leftAftersalesNum > 0
}

function maxQuantityFor(item: AftersalesPanelItem) {
  return Math.min(Math.max(item.leftAftersalesNum, 0), item.quantity)
}

function formatAmount(amount: number) {
  return Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
