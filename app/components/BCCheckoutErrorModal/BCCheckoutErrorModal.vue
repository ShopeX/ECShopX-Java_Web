<template>
  <ECModal
    v-model="visible"
    :title="t('7afcb19c.02d981')"
    :content="errorMessage"
    :confirm-text="t('7afcb19c.c41da8')"
    :cancel-text="t('7afcb19c.3a2c9f')"
    @confirm="handleGoToCart"
    @cancel="handleContinueShopping"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ECModal } from '~/components/ECModal'
import { useRouter } from 'nuxt/app'

interface Props {
  modelValue: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  errorMessage: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const errorMessage = computed(() => props.errorMessage || t('7afcb19c.b40d5e'))

function handleGoToCart() {
  visible.value = false
  router.push(localePath('/cart'))
}

function handleContinueShopping() {
  visible.value = false
  router.push(localePath('/'))
}
</script>
