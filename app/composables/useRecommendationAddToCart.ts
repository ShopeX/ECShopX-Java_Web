import type { MaybeRefOrGetter } from 'vue'
import { readonly, ref, toValue, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProductRecommendation } from '~/components/BCProductRecommendations/types'
import type { IMarketingTag } from '~/utils/promotionTags'
import { itemApiClient } from '~/infrastructure/http/clients/ItemApiClient'
import { useAuthGuard } from '~/composables/useAuthGuard'
import { useCart } from '~/composables/useCart'
import { useToastMessage } from '~/composables/useToastMessage'
import { logger } from '~/utils/log'
import { isMultiSpecProduct, resolveQuantityMin, resolveSkuItemId } from '~/utils/productSku'
import type { ProductSkuData } from '~/utils/productSku'
import { resolveDistributorId } from '~/utils/resolveDistributorId'

export type RecommendationAddMode = 'cart' | 'checkout'

export interface RecommendationAddPayload {
  itemId: string
  num: number
  distributorId: string
}

export interface UseRecommendationAddToCartOptions {
  mode: MaybeRefOrGetter<RecommendationAddMode>
  onCheckoutAdd?: (
    product: ProductRecommendation,
    payload: RecommendationAddPayload
  ) => Promise<boolean>
  /** 加购成功后回调（如 Mini Cart 内刷新列表且保持抽屉打开） */
  onAddSuccess?: () => void | Promise<void>
}

type SkuConfirmExecutor = (payload: RecommendationAddPayload) => Promise<boolean>

/** 全局唯一 SKU 抽屉状态，避免多页面多实例层叠导致点击失效 */
const skuDrawerOpen = ref(false)
const skuConfirmLoading = ref(false)
const skuProductData = ref<ProductSkuData | null>(null)
const skuMarketingTags = ref<IMarketingTag[]>([])
let skuConfirmExecutor: SkuConfirmExecutor | null = null

watch(skuDrawerOpen, (open) => {
  if (!open) {
    skuProductData.value = null
    skuMarketingTags.value = []
    skuConfirmExecutor = null
  }
})

export function useRecommendationSkuDrawer() {
  const { t } = useI18n()
  const toast = useToastMessage()

  async function handleSkuConfirm(payload: RecommendationAddPayload) {
    if (skuConfirmLoading.value) {
      return
    }

    if (!skuConfirmExecutor) {
      logger.warn('[recommendation-add-to-cart] sku confirm without active session')
      toast.show(t('c23b194b.addFailed'))
      return
    }

    skuConfirmLoading.value = true

    try {
      const success = await skuConfirmExecutor(payload)
      if (success) {
        skuDrawerOpen.value = false
      }
    } finally {
      skuConfirmLoading.value = false
    }
  }

  return {
    skuDrawerOpen,
    skuConfirmLoading: readonly(skuConfirmLoading),
    skuProductData,
    skuMarketingTags: readonly(skuMarketingTags),
    handleSkuConfirm,
  }
}

export function useRecommendationAddToCart(options: UseRecommendationAddToCartOptions) {
  const { t } = useI18n()
  const { requireAuth } = useAuthGuard()
  const { addToCart } = useCart()
  const toast = useToastMessage()

  const addingProductId = ref<string | null>(null)

  async function executeAdd(
    product: ProductRecommendation,
    payload: RecommendationAddPayload
  ): Promise<boolean> {
    if (toValue(options.mode) === 'checkout') {
      if (!options.onCheckoutAdd) return false
      return options.onCheckoutAdd(product, payload)
    }

    const result = await addToCart({
      item_id: payload.itemId,
      num: payload.num,
      distributor_id: payload.distributorId,
      cart_type: 'cart',
      shop_type: 'distributor',
    })

    if (result.success) {
      await options.onAddSuccess?.()
    }

    return result.success
  }

  async function handleRecommendationAdd(product: ProductRecommendation) {
    if (addingProductId.value || skuConfirmLoading.value) {
      return
    }

    await requireAuth(
      async () => {
        addingProductId.value = product.id

        try {
          const data = await itemApiClient.getItemDetail({
            id: product.id,
            distributor_id: resolveDistributorId(product.distributorId),
          })

          if (isMultiSpecProduct(data)) {
            skuConfirmExecutor = (payload) => executeAdd(product, payload)
            skuProductData.value = data
            skuMarketingTags.value = product.marketingTags ?? []
            skuDrawerOpen.value = true
            return
          }

          const specIdString = 'default'
          await executeAdd(product, {
            itemId: resolveSkuItemId(data, specIdString) || product.id,
            num: resolveQuantityMin(data, specIdString),
            distributorId: resolveDistributorId(
              data?.distributor_id ?? product.distributorId
            ),
          })
        } catch (error) {
          logger.warn('[recommendation-add-to-cart] load product failed', error)
          toast.show(t('c23b194b.addFailed'))
        } finally {
          addingProductId.value = null
        }
      },
      {
        redirectAfterLogin: true,
      }
    )
  }

  return {
    addingProductId: readonly(addingProductId),
    skuDrawerOpen,
    skuConfirmLoading: readonly(skuConfirmLoading),
    skuProductData,
    handleRecommendationAdd,
  }
}
