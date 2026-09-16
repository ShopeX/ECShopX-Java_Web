<template>
  <button
    :class="[
      'inline-flex items-center justify-center transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-sans',
      variantClasses,
      sizeClasses,
      className,
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span
      v-if="loading"
      class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
    />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buttonVariants, buttonSizes } from '../ECTheme'

export interface ECButtonProps {
  variant?: keyof typeof buttonVariants | 'dark' | 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: keyof typeof buttonSizes | 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
}

const props = withDefaults(defineProps<ECButtonProps>(), {
  variant: 'dark',
  size: 'md',
  disabled: false,
  loading: false,
  className: '',
})

const variantClasses = computed(() => {
  const customVariants: Record<string, string> = {
    primary: 'bg-[#b22420] text-white hover:bg-[#8b1a17]',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    dark: 'bg-[#141414] text-white hover:bg-black rounded-none h-[40px] px-[24px]',
  }

  return customVariants[props.variant as string] || buttonVariants[props.variant as string] || ''
})

const sizeClasses = computed(() => {
  const customSizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm font-medium',
    lg: 'px-8 py-3.5 text-base font-semibold',
  }
  return customSizes[props.size as string] || buttonSizes[props.size as string] || ''
})
</script>
