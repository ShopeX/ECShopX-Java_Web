<template>
  <div class="flex flex-col gap-[32px]">
    <div
      v-if="showOnlyRefundTab"
      data-testid="aftersales-type-tabs"
      class="flex gap-[24px] border-b border-[#e5e7eb]"
    >
      <button
        v-for="tab in aftersalesTypeTabs"
        :key="tab.value"
        type="button"
        class="relative pb-[12px] text-[14px] leading-5 transition-colors"
        :class="
          aftersalesType === tab.value ? 'font-medium text-[#191a1d]' : 'font-normal text-[#4a5565]'
        "
        :data-testid="`aftersales-type-${tab.value}`"
        @click="emit('update:aftersalesType', tab.value)"
      >
        {{ tab.label }}
        <span
          class="absolute inset-x-0 bottom-0 h-[2px]"
          :class="aftersalesType === tab.value ? 'bg-[#191a1d]' : 'bg-transparent'"
        />
      </button>
    </div>

    <div data-testid="aftersales-item-list" class="flex flex-col gap-[16px]">
      <div v-for="item in items" :key="item.itemId" class="flex gap-[16px] items-start">
        <button
          type="button"
          role="checkbox"
          class="mt-[2px] flex h-[16px] w-[16px] shrink-0 items-center justify-center border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors disabled:cursor-not-allowed disabled:border-[#d2d6db] disabled:bg-[#f3f4f6]"
          :class="
            isItemChecked(item.itemId)
              ? 'border-[#191a1d] bg-[#191a1d]'
              : 'border-[#191a1d] bg-white'
          "
          :aria-checked="isItemChecked(item.itemId)"
          :disabled="!isItemSelectable(item)"
          :data-testid="`aftersales-item-select-${item.itemId}`"
          @click="emit('toggleItem', item.itemId)"
        >
          <svg
            v-if="isItemChecked(item.itemId)"
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
          <div class="relative h-[96px] w-[96px] shrink-0 overflow-hidden bg-[#f3f4f6]">
            <img :src="item.itemImage" :alt="item.itemName" class="h-full w-full object-cover" />
            <span
              v-if="deliveryTagFor(item)"
              data-testid="aftersales-item-delivery-tag"
              class="absolute inset-x-0 bottom-0 flex h-5 items-center justify-center bg-black/45 px-1 text-center text-[12px] leading-5 text-white"
            >
              {{ deliveryTagFor(item) }}
            </span>
          </div>

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
                <p class="text-[14px] leading-5 text-[#191a1d]">
                  ¥ {{ formatAmount(unitPriceFor(item)) }}
                </p>
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
                  :disabled="!canChangeQuantity(item) || quantityFor(item.itemId) <= 1"
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
                  :disabled="
                    !canChangeQuantity(item) || quantityFor(item.itemId) >= maxQuantityFor(item)
                  "
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
            <p
              v-if="showOnlyRefundBlockedTip(item)"
              data-testid="aftersales-only-refund-blocked-tip"
              class="text-[12px] leading-4 text-[#d0112f]"
            >
              {{ t('0747dfee.47107ea8') }}
            </p>
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
import {
  AFTERSALES_ITEM_DELIVERY_TAG_I18N,
  canSelectAftersalesItem,
  isUnshippedAftersalesItem,
  resolveAftersalesItemDeliveryTagKind,
  resolveAftersalesQuantityMax,
  type AftersalesType,
} from '~/utils/orderItemDelivery'

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
  leftRefundOnlyNum?: number
  deliveryStatus?: string
  deliveryItemNum?: number
  shipStatus?: number
  price: number
  marketingTags?: IMarketingTag[]
}

interface ReasonOption {
  label: string
  value: string
}

interface Props {
  items: AftersalesPanelItem[]
  /** 多选勾选（对齐小程序 checked） */
  selectedItemIds: string[]
  quantities: Record<string, number>
  aftersalesType: AftersalesType
  showOnlyRefundTab: boolean
  orderDeliveryStatus?: string
  refundReason: string
  refundAmountText: string
  refundPointsText: string
  description: string
  imagePreviews: string[]
  reasonOptions: ReasonOption[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggleItem: [itemId: string]
  updateQuantity: [payload: { itemId: string; quantity: number }]
  'update:aftersalesType': [value: AftersalesType]
  'update:refundReason': [value: string]
  'update:description': [value: string]
  triggerUpload: []
  removeImage: [index: number]
}>()

const { t } = useI18n()

const aftersalesTypeTabs = computed(() => [
  { value: 'ONLY_REFUND' as const, label: t('0747dfee.6b8821') },
  { value: 'REFUND_GOODS' as const, label: t('0747dfee.cc0193') },
])

const selectedIdSet = computed(() => new Set(props.selectedItemIds))

function isItemChecked(itemId: string) {
  return selectedIdSet.value.has(itemId)
}

function quantityFor(itemId: string) {
  return props.quantities[itemId] ?? 1
}

function isItemSelectable(item: AftersalesPanelItem) {
  return canSelectAftersalesItem(item, props.aftersalesType)
}

function canChangeQuantity(item: AftersalesPanelItem) {
  if (!isItemChecked(item.itemId)) return false
  if (props.aftersalesType === 'ONLY_REFUND' && isUnshippedAftersalesItem(item)) {
    return false
  }
  return isItemSelectable(item)
}

function maxQuantityFor(item: AftersalesPanelItem) {
  return resolveAftersalesQuantityMax(item, props.aftersalesType)
}

/** 对齐 vshop onlyRefundBlocked：仅退款 Tab 下已发货行提示不可选原因 */
function showOnlyRefundBlockedTip(item: AftersalesPanelItem) {
  return props.aftersalesType === 'ONLY_REFUND' && !isUnshippedAftersalesItem(item)
}

function deliveryTagFor(item: AftersalesPanelItem) {
  const kind = resolveAftersalesItemDeliveryTagKind({
    itemDeliveryStatus: item.deliveryStatus,
    deliveryItemNum: item.deliveryItemNum,
    quantity: item.quantity,
    shipStatus: item.shipStatus,
    leftRefundOnlyNum: item.leftRefundOnlyNum,
    leftAftersalesNum: item.leftAftersalesNum,
  })
  return t(AFTERSALES_ITEM_DELIVERY_TAG_I18N[kind])
}

/** 对齐小程序 SpPrice：展示单价 = 行总价 / 购买数量 */
function unitPriceFor(item: AftersalesPanelItem) {
  const qty = Math.max(1, Number(item.quantity) || 1)
  return Number(item.price || 0) / qty
}

function formatAmount(amount: number) {
  return Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
