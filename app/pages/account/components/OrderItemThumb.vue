<template>
  <div class="relative h-[96px] w-[96px] shrink-0 overflow-hidden bg-[#f9fafb]">
    <img :src="src" class="h-full w-full object-cover" alt="" />
    <span
      v-if="shipLabel"
      data-testid="order-item-ship-badge"
      class="absolute inset-x-0 bottom-0 flex h-5 items-center justify-center bg-black/45 px-1 text-center text-[12px] leading-5 text-white"
    >
      {{ shipLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import {
  ORDER_ITEM_SHIP_LABEL_I18N,
  resolveOrderItemShipLabelKind,
  type OrderItemShipSource,
} from '~/utils/orderItemDelivery'

interface Props extends OrderItemShipSource {
  src: string
}

const props = defineProps<Props>()
const { t } = useI18n()

const shipLabel = computed(() => {
  const kind = resolveOrderItemShipLabelKind(props)
  return kind ? t(ORDER_ITEM_SHIP_LABEL_I18N[kind]) : ''
})
</script>
