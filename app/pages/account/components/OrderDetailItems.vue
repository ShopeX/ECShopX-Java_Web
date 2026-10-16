<template>
  <div data-testid="order-detail-items" class="flex flex-col w-full">
    <div
      v-for="item in items"
      :key="item.itemId"
      data-testid="order-item-row"
      class="flex gap-[16px] lg:gap-[32px] items-start border-b border-[#e5e7eb] pb-[32px] mb-[32px] last:mb-0"
    >
      <!-- 商品图片 -->
      <img
        :src="item.itemImage"
        class="h-[96px] w-[96px] object-cover bg-[#f9fafb] shrink-0"
        alt=""
      />

      <!-- 商品信息区 -->
      <div class="flex flex-[1_0_0] min-w-0 gap-[16px] lg:gap-[32px] items-start">
        <!-- 名称 + 规格 -->
        <div class="flex-[1_0_0] min-w-0 flex flex-col gap-[4px]">
          <BCProductMarketingTags :tags="item.marketingTags" placement="inline" />
          <h3 data-testid="item-name" class="text-[14px] font-medium leading-5 text-[#101828]">
            {{ item.itemName }}
          </h3>
          <div class="flex flex-col gap-[2px]">
            <p v-if="item.skuNo" class="text-[12px] leading-4 text-[#364153]">
              {{ t('ee3264ed.e54891') }}: {{ item.skuNo }}
            </p>
            <p v-if="item.style" class="text-[12px] leading-4 text-[#364153]">
              {{ t('ee3264ed.568510') }}: {{ item.style }}
            </p>
            <p v-if="item.size" class="text-[12px] leading-4 text-[#364153]">
              {{ t('ee3264ed.c8339f') }}: {{ item.size }}
            </p>
            <template v-if="!item.skuNo && !item.style && !item.size && item.specName">
              <p class="text-[12px] leading-4 text-[#364153]">{{ item.specName }}</p>
            </template>
          </div>
        </div>

        <!-- PC：数量 + 价格（各自无宽度限制） / H5：右侧竖排 -->
        <div
          class="flex shrink-0 flex-col items-end gap-[4px] min-w-[66px] lg:min-w-0 lg:flex-row lg:items-start lg:justify-end lg:gap-[32px]"
        >
          <!-- H5: 价格在上；PC: price 在右（order-2） -->
          <div
            class="flex flex-col items-end lg:items-start justify-center py-px lg:w-auto order-1 lg:order-2"
          >
            <span
              data-testid="item-price"
              class="text-[14px] leading-5 text-[#191a1d] w-full lg:w-auto text-right lg:whitespace-nowrap"
            >
              {{ formatAmount(item.displayPrice || item.price) }}
            </span>
          </div>
          <!-- H5: 数量在下；PC: quantity 在左（order-1） -->
          <div
            class="flex flex-col items-end lg:items-start justify-center py-px lg:w-auto order-2 lg:order-1"
          >
            <span
              data-testid="item-quantity"
              class="text-[14px] leading-5 text-[#191a1d] w-full lg:w-auto text-right lg:whitespace-nowrap"
            >
              {{ t('ee3264ed.0bf60b') }}: {{ item.quantity }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatMoneyYuan } from '~/utils/currencyFormat'
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'

const { t } = useI18n()

interface Props {
  items: any[]
}

defineProps<Props>()

function formatAmount(amount: number) {
  return formatMoneyYuan(Number(amount || 0))
}
</script>
