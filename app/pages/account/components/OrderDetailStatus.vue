<template>
  <div data-testid="order-detail-status" class="flex flex-col gap-[8px] py-[24px] px-4 lg:px-0">
    <p class="text-[20px] font-medium leading-7 text-[#191a1d]">{{ statusText }}</p>
    <p class="text-[14px] leading-5 text-[#6b7280]">{{ statusHint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { t } = useI18n()

interface Props {
  status: string
}

const props = defineProps<Props>()

const statusTextMap: Record<string, string> = {
  pending_payment: t('de8076e6.9246fe'),
  pending_shipment: t('de8076e6.d8476e'),
  shipped: t('de8076e6.4933ca'),
  completed: t('de8076e6.fad522'),
  cancelled: t('de8076e6.2111cc'),
  pending_pickup: t('de8076e6.25d532'),
  after_sales: t('f62e8236.a19124'),
  pending_review: t('de8076e6.a48b28'),
}

const statusText = computed(() => statusTextMap[props.status] || t('de8076e6.a8b0c2'))

const hintMap: Record<string, string> = {
  pending_payment: t('c03153ac.101311'),
  pending_shipment: t('c03153ac.0c80ff'),
  shipped: t('c03153ac.c7133e'),
  completed: t('de8076e6.fad522'),
  cancelled: t('de8076e6.2111cc'),
  pending_pickup: t('c03153ac.87871d'),
  after_sales: t('c03153ac.bb8d43'),
  pending_review: t('c03153ac.347d94'),
}

const statusHint = computed(() => hintMap[props.status] || '')
</script>
