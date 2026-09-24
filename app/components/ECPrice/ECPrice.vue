<template>
  <span :class="['inline-flex items-baseline font-mono', className]" v-bind="$attrs">
    <span :class="['mr-0.5', symbolClass]">{{ symbol }}</span>
    <span :class="amountClass">{{ formattedAmount }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ECPriceProps {
  amount: number | string // Amount in cents (分)
  symbol?: string
  className?: string
  symbolClass?: string
  amountClass?: string
}

const props = withDefaults(defineProps<ECPriceProps>(), {
  symbol: '￥',
  className: '',
  symbolClass: 'text-sm',
  amountClass: 'text-lg font-bold',
})

const formattedAmount = computed(() => {
  const num = typeof props.amount === 'string' ? parseFloat(props.amount) : (props.amount as number)
  if (isNaN(num)) return '0.00'
  return (num / 100).toFixed(2)
})
</script>
