<template>
  <div class="relative shrink-0 w-full" :class="{ 'opacity-60': !item.canBePurchased }">
    <div
      class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex gap-[16px] items-start pb-[32px] pt-0 px-0 relative w-full"
    >
      <!-- 勾选框 -->
      <ECCheckbox :checked="item.selected" size="sm" @change="$emit('toggle-selection', item.id)" />

      <!-- 商品图片 -->
      <div class="relative shrink-0 size-[110px] lg:size-[160px] bg-[#f9f9f9]">
        <img
          :src="item.productImage"
          :alt="item.productName"
          class="absolute max-w-none object-cover size-full"
        />
      </div>

      <!-- 商品详情 -->
      <div
        class="basis-0 content-stretch flex flex-col lg:flex-row gap-[16px] grow items-start min-h-px min-w-px relative self-stretch shrink-0"
      >
        <div class="w-full lg:basis-0 lg:grow min-h-px min-w-px relative shrink-0">
          <div
            class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full"
          >
            <div class="relative shrink-0 w-full mb-1">
              <BCProductMarketingTags :tags="item.marketingTags" placement="inline" />
              <p
                class="font-['Noto_Sans_SC'] font-medium leading-[20px] text-[16px] text-[#191a1d]"
              >
                {{ item.productName }}
              </p>
            </div>
            <div v-if="item.productId" class="relative shrink-0 w-full">
              <p
                class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#364153]"
              >
                {{ t('9864a2ba.fe930f') }} {{ item.productId }}
              </p>
            </div>
            <div v-if="item.specName" class="relative shrink-0 w-full">
              <p
                class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#364153]"
              >
                {{ t('9864a2ba.a74053') }} {{ item.specName }}
              </p>
            </div>
            <div class="relative shrink-0 w-full">
              <p
                class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#364153]"
              >
                {{ t('9864a2ba.1bbfef') }} {{ t('9864a2ba.18c634') }}
              </p>
            </div>
            <div class="relative shrink-0 mt-2">
              <BCCartLinePrice
                :sale-price-cents="item.salePriceCents"
                :member-price-cents="item.memberPriceCents"
                :market-price-cents="item.marketPriceCents"
                :effective-price-display="item.effectivePriceDisplay"
                :market-price-display="item.marketPriceDisplay"
                :has-member-price-layout="item.hasMemberPriceLayout"
                :has-market-discount="item.hasMarketDiscount"
                variant="cart-page"
              />
            </div>
            <div v-if="!item.canBePurchased" class="text-xs text-red-500 mt-1">
              {{ t('9864a2ba.502a91') }}
            </div>
          </div>
        </div>

        <!-- 右侧操作区：数量和删除 -->
        <div class="w-full lg:w-[120px] lg:h-full relative shrink-0">
          <div
            class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex flex-col items-start lg:items-end justify-between relative w-full lg:size-full"
          >
            <!-- 数量调整器 -->
            <div
              class="bg-white border border-[#e5e7eb] border-solid relative shrink-0 w-auto lg:w-full h-[38px] lg:h-[40px]"
            >
              <div
                class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-between p-px relative size-full"
              >
                <button
                  class="w-[40px] lg:basis-0 lg:grow h-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  :disabled="item.quantity <= item.quantityMin || loading"
                  @click="$emit('quantity-change', item.id, item.quantity - 1)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.33331 8H12.6666"
                      stroke="#191A1D"
                      stroke-width="1.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <div class="h-full w-[40px] flex items-center justify-center">
                  <p
                    class="font-['Inter'] font-medium text-[14px] text-[#101828] tracking-[-0.15px]"
                  >
                    {{ item.quantity }}
                  </p>
                </div>
                <button
                  class="w-[40px] lg:basis-0 lg:grow h-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  :disabled="item.quantity >= item.quantityMax || loading"
                  @click="$emit('quantity-change', item.id, item.quantity + 1)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 3.33331V12.6666M3.33331 8H12.6666"
                      stroke="#191A1D"
                      stroke-width="1.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 删除按钮 -->
            <div class="relative shrink-0 w-full lg:mt-auto">
              <div
                class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-start justify-start lg:justify-end pb-0 pt-[16px] px-0 relative w-full"
              >
                <button
                  class="relative shrink-0 hover:text-red-600 transition-colors"
                  @click="showConfirm = true"
                >
                  <p
                    class="font-['Noto_Sans_SC'] font-normal leading-[20px] text-[14px] text-[#191a1d] hover:text-inherit"
                  >
                    {{ t('9864a2ba.2f4aad') }}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 删除确认弹窗 -->
  <ECModal
    v-model="showConfirm"
    :title="t('9864a2ba.2f4aad')"
    :content="t('9864a2ba.3e3483')"
    :confirm-text="t('9864a2ba.2f4aad')"
    @confirm="handleConfirmRemove"
  />
</template>

<script setup lang="ts">
import { ECCheckbox } from '~/components/ECCheckbox'
import { BCCartLinePrice } from '~/components/BCCartLinePrice'
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'
import type { ICartUI } from '~/composables/useCart'

interface Props {
  item: ICartUI['items'][number]
  loading?: boolean
}

const props = defineProps<Props>()
const { t } = useI18n()

const emit = defineEmits<{
  (e: 'toggle-selection', itemId: string): void
  (e: 'quantity-change', itemId: string, quantity: number): void
  (e: 'remove', itemId: string): void
}>()

const showConfirm = ref(false)

function handleConfirmRemove() {
  showConfirm.value = false
  emit('remove', props.item.id)
}
</script>
