<template>
  <div
    class="w-full border-b border-[#e5e7eb] bg-white py-[32px] cursor-pointer"
    role="link"
    tabindex="0"
    @click="openDetail"
    @keydown.enter.prevent="openDetail"
    @keydown.space.prevent="openDetail"
  >
    <div class="flex flex-col gap-[16px]">
      <p class="text-[16px] font-medium leading-5 text-[#191a1d] text-right">
        {{ displayStatusText }}
      </p>

      <div class="flex items-center gap-[10px]">
        <UIcon
          name="i-icon-park-outline:application"
          class="size-5 shrink-0 text-[#191a1d]"
          aria-hidden="true"
        />
        <span class="text-[14px] font-medium leading-5 text-[#191a1d]">
          {{ order.storeName || t('de8076e6.0d4934') }}
        </span>
      </div>

      <div class="flex flex-col gap-[32px]">
        <div
          v-for="item in order.items"
          :key="item.itemId"
          class="flex items-start gap-[16px] lg:gap-[32px]"
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
                  {{ t('ee3264ed.e54891') }}: {{ item.skuNo }}
                </p>
                <p v-if="item.style" class="text-[12px] leading-4 text-[#364153]">
                  {{ t('ee3264ed.568510') }}: {{ item.style }}
                </p>
                <p v-if="item.size" class="text-[12px] leading-4 text-[#364153]">
                  {{ t('ee3264ed.c8339f') }}: {{ item.size }}
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
              class="flex shrink-0 flex-col items-end justify-center gap-[4px] min-w-[66px] lg:min-w-0"
            >
              <p class="text-[14px] leading-5 text-[#191a1d]">¥ {{ formatAmount(item.price) }}</p>
              <p class="text-[14px] leading-5 text-[#191a1d]">
                {{ t('ee3264ed.0bf60b') }}:{{ item.quantity }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-[16px]">
        <div
          class="flex items-center justify-start gap-[32px] text-[14px] leading-5 text-[#364153] lg:justify-end"
        >
          <span>{{ t('99fee605.3876bc', { count: order.itemCount }) }}</span>
          <span>
            {{ t('99fee605.a0cd4c') }}:
            <span class="font-medium text-[16px] text-[#191a1d]">
              ¥ {{ formatAmount(order.refundAmount) }}
            </span>
          </span>
        </div>

        <div
          v-if="order.status === 'pending'"
          class="flex items-center justify-end gap-[16px] w-full lg:w-auto"
        >
          <button
            type="button"
            class="flex h-[34px] lg:h-[50px] w-auto items-center justify-center border border-[#0f0f10] px-[17px] lg:px-[33px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50"
            @click.stop="handleCancelClick"
          >
            {{ t('99fee605.eaffc1') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'
interface Props {
  order: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'action', payload: { type: string; order: any }): void
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/
const displayStatusText = computed(() => {
  const statusText = String(props.order.statusText || '')
  return generatedKeyPattern.test(statusText) ? t(statusText) : statusText
})

function openDetail() {
  navigateTo(
    localePath({
      name: 'account-aftersales-id',
      params: {
        id: props.order.aftersalesId,
      },
      query: {
        itemId: props.order.items?.[0]?.itemId || '',
      },
    })
  )
}

function handleCancelClick() {
  emit('action', { type: 'cancel', order: props.order })
}

function formatAmount(amount: number) {
  return Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
