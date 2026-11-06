<template>
  <div v-if="specs.length" class="flex flex-col gap-4">
    <div v-for="spec in specs" :key="spec.spec_name" class="flex flex-col gap-6">
      <h4 class="font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#4a5565]">
        {{ spec.spec_name }}
      </h4>

      <div
        v-if="spec.spec_values.some((value) => value.spec_image_url) || hideDividers"
        class="flex flex-wrap gap-2"
      >
        <button
          v-for="specValue in spec.spec_values"
          :key="specValue.spec_value_id"
          type="button"
          class="relative overflow-hidden border border-solid transition-all"
          :class="[
            specValue.spec_image_url
              ? 'size-20'
              : 'flex min-h-[38px] min-w-[80px] items-center justify-center px-3 py-2 text-sm leading-5 text-[#191a1d]',
            isSpecValueSelected(spec.spec_name, specValue.spec_value_id)
              ? 'border-[#0f0f10] bg-[#e5e5e5]'
              : 'border-transparent bg-white',
          ]"
          @click="emitSelect(spec.spec_name, specValue.spec_value_id)"
        >
          <img
            v-if="specValue.spec_image_url"
            :src="specValue.spec_image_url"
            :alt="specValue.spec_value_name"
            class="size-full object-cover"
          />
          <span v-else>
            {{ specValue.spec_custom_value_name || specValue.spec_value_name }}
          </span>
          <span
            v-if="isSpecValueOutOfStock(spec.spec_name, specValue.spec_value_id)"
            class="absolute right-0 top-0 bg-[#8f99aa] px-1 py-0.5 font-['Noto_Sans_SC'] text-[10px] font-normal leading-3 text-white"
          >
            {{ t('c23b194b.outOfStock') }}
          </span>
        </button>
      </div>

      <div v-else class="grid grid-cols-2 border-l border-t border-[#e5e5e5]">
        <button
          v-for="specValue in spec.spec_values"
          :key="specValue.spec_value_id"
          type="button"
          class="relative box-border flex min-h-[38px] items-center justify-center px-4 py-2 font-['Inter'] text-sm font-normal leading-5 text-[#191a1d] transition-all"
          :class="
            isSpecValueSelected(spec.spec_name, specValue.spec_value_id)
              ? 'z-[1] bg-[#e5e5e5] ring-1 ring-inset ring-[#0f0f10]'
              : 'border-b border-r border-[#e5e5e5] bg-white'
          "
          @click="emitSelect(spec.spec_name, specValue.spec_value_id)"
        >
          {{ specValue.spec_custom_value_name || specValue.spec_value_name }}
          <span
            v-if="isSpecValueOutOfStock(spec.spec_name, specValue.spec_value_id)"
            class="absolute right-0 top-0 bg-[#8f99aa] px-1 py-0.5 font-['Noto_Sans_SC'] text-[10px] font-normal leading-3 text-white"
          >
            {{ t('c23b194b.outOfStock') }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isSingleSkuProduct, isSpecValueInStock } from '~/utils/productSku'
import type { ProductSkuData, ProductSpec } from '~/utils/productSku'

interface Props {
  specs: ProductSpec[]
  selectedSpecs: Record<string, number>
  productData?: ProductSkuData | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [specName: string, specValueId: number]
}>()

const { t } = useI18n()

const hideDividers = computed(() => isSingleSkuProduct(props.productData))

function isSpecValueSelected(specName: string, specValueId: number) {
  return props.selectedSpecs[specName] === specValueId
}

function isSpecValueOutOfStock(specName: string, specValueId: number) {
  return !isSpecValueInStock(
    props.productData,
    props.specs,
    props.selectedSpecs,
    specName,
    specValueId
  )
}

function emitSelect(specName: string, specValueId: number) {
  emit('select', specName, specValueId)
}
</script>
