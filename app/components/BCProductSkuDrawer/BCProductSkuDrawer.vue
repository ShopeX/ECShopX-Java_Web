<template>
  <ECDrawer
    :model-value="modelValue"
    panel-class="max-w-[560px]"
    @update:model-value="emit('update:modelValue', $event)"
    @close="emit('close')"
  >
    <div class="flex h-full flex-col bg-white px-8 pt-8">
      <div class="flex shrink-0 items-center justify-between py-4">
        <h2 class="font-['Noto_Sans_SC'] text-xl font-medium leading-5 text-[#191a1d]">
          {{ t('c23b194b.selectSpec') }}
        </h2>
        <button
          type="button"
          class="flex size-6 items-center justify-center text-[#191a1d]"
          :aria-label="t('c23b194b.closeSpec')"
          @click="closeDrawer"
        >
          <UIcon name="i-heroicons-x-mark" class="size-6" />
        </button>
      </div>

      <div v-if="loading" class="flex flex-1 items-center justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin text-[#4a5565]" />
      </div>

      <div v-else-if="productData" class="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto pb-8">
        <div class="flex flex-col gap-2">
          <BCProductMarketingTags v-if="marketingTags.length" :tags="marketingTags" />

          <div class="flex items-start justify-between gap-4">
            <h3
              class="min-w-0 flex-1 font-['Noto_Sans_SC'] text-2xl font-normal leading-[1.2] tracking-[-0.48px] text-[#191a1d]"
            >
              {{ productTitle }}
            </h3>
            <button
              type="button"
              class="flex size-6 shrink-0 items-center justify-center"
              :aria-pressed="isFavorite"
              :aria-label="t('79fdede9.ae336c')"
              @click="toggleFavorite"
            >
              <UIcon
                :name="favoriteIconName"
                class="size-6"
                :class="isFavorite ? 'text-[#e11d48]' : 'text-[#191a1d]'"
              />
            </button>
          </div>

          <div class="flex flex-col gap-1">
            <template v-if="hasMemberPrice">
              <div class="flex items-center gap-1">
                <span class="font-['Inter'] text-2xl font-medium leading-9 text-[#191a1d]">
                  {{ formatDisplayFromFen(memberPriceCents) }}
                </span>
                <span
                  class="shrink-0 border border-[#fd9c00] bg-[#fff5e1] px-[3px] py-[3px] font-['Noto_Sans_SC'] text-[9px] font-normal leading-[9px] text-[#fd9c00]"
                >
                  {{ t('464b6330.8fdd6f') }}
                </span>
              </div>
              <p class="font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#8f99aa]">
                {{ t('c23b194b.nonMemberPrice') }}
                {{ formatDisplayFromFen(salePriceCents) }}
              </p>
            </template>
            <template v-else>
              <span class="font-['Inter'] text-2xl font-medium leading-9 text-[#191a1d]">
                {{ formatDisplayFromFen(salePriceCents) }}
              </span>
              <span
                v-if="showMarketPrice"
                class="font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#8f99aa] line-through"
              >
                {{ formatDisplayFromFen(marketPriceCents) }}
              </span>
            </template>
          </div>
        </div>

        <BCProductSpecSelector
          :specs="specs"
          :selected-specs="selectedSpecs"
          :product-data="productData"
          @select="selectSpecValue"
        />

        <div class="flex items-center gap-6 py-6">
          <p class="min-w-0 flex-1 font-['Noto_Sans_SC'] text-sm font-normal leading-5 text-[#4a5565]">
            <span>{{ t('ee3264ed.0bf60b') }}</span>
            <span v-if="showStartNum" class="text-xs font-normal leading-4 text-[#8f99aa]">
              {{ t('2043bbcc.989408', { count: quantityMin }) }}
            </span>
          </p>
          <QuantityStepper
            class="shrink-0"
            :quantity="quantity"
            :min="quantityMin"
            :max="quantityMax"
            :loading="confirmLoading"
            @decrease="decreaseQuantity"
            @increase="increaseQuantity"
          />
        </div>

        <button
          type="button"
          class="touch-manipulation flex w-full items-center justify-center bg-[#0f0f10] py-4 font-['Noto_Sans_SC'] text-sm font-medium leading-5 text-white transition-colors hover:bg-[#191a1d] disabled:cursor-not-allowed disabled:bg-[#8f99aa] disabled:opacity-100"
          :disabled="confirmLoading || !canConfirm"
          @click.stop="handleConfirm"
        >
          <UIcon
            v-if="confirmLoading"
            name="i-heroicons-arrow-path"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  </ECDrawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ECDrawer from '~/components/ECDrawer/ECDrawer.vue'
import QuantityStepper from '~/components/BCMiniCartItem/QuantityStepper.vue'
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'
import BCProductSpecSelector from '~/components/BCProductSpecSelector/BCProductSpecSelector.vue'
import { useProductPriceDisplay } from '~/composables/useProductPriceDisplay'
import { mapPromotionTags, mergeMarketingTags } from '~/utils/promotionTags'
import type { IMarketingTag } from '~/utils/promotionTags'
import {
  buildSpecIdString,
  getInitialSelectedSpecs,
  parseProductSpecs,
  resolvePriceCents,
  resolveProductStartNum,
  resolveProductStock,
  resolveQuantityMin,
  resolveSkuItemId,
} from '~/utils/productSku'
import type { ProductSkuData, ProductSpec } from '~/utils/productSku'
import { resolveDistributorId } from '~/utils/resolveDistributorId'
import { collectApiClient } from '~/infrastructure/http/clients/CollectApiClient'
import { useAuthGuard } from '~/composables/useAuthGuard'
import { useToastMessage } from '~/composables/useToastMessage'
import { logger } from '~/utils/log'

interface Props {
  modelValue: boolean
  productData: ProductSkuData | null
  /** 推荐列表等外部来源的标签，与详情字段合并展示 */
  fallbackMarketingTags?: readonly IMarketingTag[] | IMarketingTag[] | null
  loading?: boolean
  confirmLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fallbackMarketingTags: () => [],
  loading: false,
  confirmLoading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  confirm: [payload: { itemId: string; num: number; distributorId: string }]
}>()

const { t } = useI18n()
const toast = useToastMessage()
const { requireAuth, isLoggedIn } = useAuthGuard()

const selectedSpecs = ref<Record<string, number>>({})
const quantity = ref(1)
const isFavorite = ref(false)

const productItemId = computed(() =>
  String(props.productData?.item_id ?? props.productData?.itemId ?? '')
)

const favoriteIconName = computed(() =>
  isFavorite.value ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'
)

const specs = computed<ProductSpec[]>(() => parseProductSpecs(props.productData?.item_spec_desc))

const marketingTags = computed(() =>
  mergeMarketingTags(props.fallbackMarketingTags, mapPromotionTags(props.productData ?? {}))
)

const productTitle = computed(() =>
  String(props.productData?.item_name ?? props.productData?.itemName ?? '')
)

const currentSpecIdString = computed(() => buildSpecIdString(specs.value, selectedSpecs.value))

const resolvedItemId = computed(() =>
  resolveSkuItemId(props.productData, currentSpecIdString.value)
)

const currentStock = computed(() =>
  resolveProductStock(props.productData, currentSpecIdString.value)
)

const productStartNum = computed(() => resolveProductStartNum(props.productData))

const showStartNum = computed(() => productStartNum.value > 0)

const quantityMin = computed(() => resolveQuantityMin(props.productData, currentSpecIdString.value))

const quantityMax = computed(() => {
  const stock = currentStock.value
  const max = stock > 0 ? stock : quantityMin.value
  return Math.max(max, quantityMin.value)
})

const salePriceCents = computed(() =>
  resolvePriceCents(props.productData, currentSpecIdString.value, 'price')
)

const marketPriceCents = computed(() =>
  resolvePriceCents(props.productData, currentSpecIdString.value, 'market_price')
)

const memberPriceCents = computed(() =>
  resolvePriceCents(props.productData, currentSpecIdString.value, 'member_price')
)

const { hasMemberPrice, showMarketPrice, formatDisplayFromFen } = useProductPriceDisplay({
  salePriceCents,
  marketPriceCents,
  memberPriceCents,
})

const canConfirm = computed(() => Boolean(resolvedItemId.value) && currentStock.value > 0)

const allSpecsSelected = computed(() =>
  specs.value.every((spec) => selectedSpecs.value[spec.spec_name] !== undefined)
)

const showNoStockHint = computed(() => {
  if (!props.productData) return false

  if (specs.value.length === 0) {
    return currentStock.value <= 0
  }

  return allSpecsSelected.value && currentStock.value <= 0
})

const confirmButtonText = computed(() => {
  if (props.confirmLoading) {
    return t('464b6330.49ac5f')
  }

  if (showNoStockHint.value) {
    return t('c23b194b.noStockAvailable')
  }

  return t('464b6330.fb4e7c')
})

async function syncFavoriteStatus() {
  if (!productItemId.value || !isLoggedIn.value) {
    isFavorite.value = false
    return
  }

  try {
    const response = await collectApiClient.getCollectItemList()
    const currentData = response?.data ?? response ?? {}
    const currentList = Array.isArray(currentData.list) ? currentData.list : []
    isFavorite.value = currentList.some((item: any) => {
      const currentItemId = String(
        item.id ?? item.item_id ?? item.goods_id ?? item.collect_id ?? ''
      )
      return currentItemId === productItemId.value
    })
  } catch (error) {
    logger.warn('[product-sku-drawer] sync favorite status failed', error)
    isFavorite.value = false
  }
}

async function toggleFavorite() {
  if (!productItemId.value) return

  await requireAuth(
    async () => {
      if (isFavorite.value) {
        await collectApiClient.removeCollectItems([productItemId.value])
        toast.show(t('464b6330.b46077'))
      } else {
        await collectApiClient.addCollectItem(productItemId.value)
        toast.show(t('464b6330.9e9a9a'))
      }
      isFavorite.value = !isFavorite.value
    },
    {
      loginMessage: t('464b6330.39bf36'),
      redirectAfterLogin: true,
    }
  )
}

watch(
  () => props.productData,
  (data) => {
    if (!data) {
      selectedSpecs.value = {}
      quantity.value = 1
      isFavorite.value = false
      return
    }

    selectedSpecs.value = getInitialSelectedSpecs(parseProductSpecs(data.item_spec_desc))
    quantity.value = resolveQuantityMin(data, buildSpecIdString(specs.value, selectedSpecs.value))
    void syncFavoriteStatus()
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  (open) => {
    if (open && props.productData) {
      void syncFavoriteStatus()
    }
  }
)

watch(quantityMin, (min) => {
  if (quantity.value < min) {
    quantity.value = min
  }
})

watch(currentSpecIdString, () => {
  quantity.value = quantityMin.value
})

function selectSpecValue(specName: string, specValueId: number) {
  selectedSpecs.value[specName] = specValueId
}

function decreaseQuantity() {
  if (quantity.value > quantityMin.value) {
    quantity.value -= 1
  }
}

function increaseQuantity() {
  if (quantity.value < quantityMax.value) {
    quantity.value += 1
  }
}

function closeDrawer() {
  emit('update:modelValue', false)
  emit('close')
}

function handleConfirm() {
  if (!canConfirm.value) {
    if (!resolvedItemId.value) {
      toast.show(t('c23b194b.addInvalid'))
    } else if (currentStock.value <= 0) {
      toast.show(t('c23b194b.noStockAvailable'))
    }
    return
  }

  emit('confirm', {
    itemId: resolvedItemId.value,
    num: quantity.value,
    distributorId: resolveDistributorId(
      props.productData?.distributor_id ?? props.productData?.distributorId
    ),
  })
}
</script>
