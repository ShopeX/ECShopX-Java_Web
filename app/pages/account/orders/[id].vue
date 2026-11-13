<template>
  <div class="bg-white min-h-screen">
    <!-- 返回导航 -->
    <div class="flex items-center px-4 py-4 lg:px-[128px] lg:py-[16px]">
      <button
        type="button"
        class="flex items-center gap-[4px] lg:gap-[8px] text-[#191a1d] hover:opacity-70 transition-opacity"
        @click="handleBack"
      >
        <UIcon name="i-heroicons-chevron-left" class="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />
        <span class="font-medium text-[16px] lg:text-[24px] leading-[20px] lg:leading-[48px]">
          {{ t('433a5846.d5c47e') }}
        </span>
      </button>
    </div>

    <!-- 加载中 -->
    <div
      v-if="loading"
      class="flex flex-col gap-0 px-4 pb-[120px] lg:flex-row lg:items-start lg:gap-[64px] lg:px-[128px] lg:pb-[32px]"
    >
      <div class="flex w-full min-w-0 flex-1 flex-col gap-[32px] pt-[32px]">
        <USkeleton class="h-5 w-28" />
        <div class="flex items-center gap-[10px]">
          <USkeleton class="h-5 w-5 shrink-0" />
          <USkeleton class="h-5 w-24" />
        </div>

        <div class="flex flex-col gap-[32px]">
          <div class="flex gap-[16px] border-b border-[#e5e7eb] pb-[32px]">
            <USkeleton class="h-[96px] w-[96px] shrink-0" />
            <div class="flex min-w-0 flex-1 flex-col gap-[12px]">
              <USkeleton class="h-5 w-full" />
              <USkeleton class="h-4 w-2/3" />
              <USkeleton class="h-4 w-1/3" />
            </div>
            <div class="hidden min-w-[88px] flex-col items-end gap-[8px] lg:flex">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-12" />
            </div>
          </div>

          <div class="flex gap-[16px] border-b border-[#e5e7eb] pb-[32px]">
            <USkeleton class="h-[96px] w-[96px] shrink-0" />
            <div class="flex min-w-0 flex-1 flex-col gap-[12px]">
              <USkeleton class="h-5 w-5/6" />
              <USkeleton class="h-4 w-1/2" />
              <USkeleton class="h-4 w-1/4" />
            </div>
            <div class="hidden min-w-[88px] flex-col items-end gap-[8px] lg:flex">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-12" />
            </div>
          </div>
        </div>

        <div class="space-y-[16px]">
          <USkeleton class="h-5 w-24" />
          <USkeleton class="h-[220px] w-full" />
        </div>

        <div class="hidden items-center justify-between pb-[32px] lg:flex">
          <div class="flex gap-[32px]">
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-4 w-32" />
          </div>
          <div class="flex gap-[16px]">
            <USkeleton class="h-[50px] w-[132px]" />
            <USkeleton class="h-[50px] w-[132px]" />
          </div>
        </div>
      </div>

      <div class="hidden w-[320px] shrink-0 flex-col gap-[32px] py-[32px] lg:flex">
        <div class="border-b border-[#e5e7eb] pb-[33px]">
          <USkeleton class="mb-[16px] h-5 w-28" />
          <div class="space-y-[12px]">
            <div class="flex items-center justify-between">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-24" />
            </div>
            <div class="flex items-center justify-between">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-28" />
            </div>
            <div class="flex items-start justify-between gap-[32px]">
              <USkeleton class="mt-1 h-4 w-16 shrink-0" />
              <div class="flex flex-1 flex-col gap-[8px]">
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-4/5 self-end" />
              </div>
            </div>
          </div>
        </div>

        <div class="border-b border-[#e5e7eb] pb-[33px]">
          <USkeleton class="mb-[16px] h-5 w-20" />
          <div class="flex items-center justify-between">
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-4 w-24" />
          </div>
        </div>

        <div class="border-b border-[#e5e7eb] pb-[33px]">
          <USkeleton class="mb-[16px] h-5 w-20" />
          <div class="space-y-[12px]">
            <div class="flex items-center justify-between">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-24" />
            </div>
            <div class="flex items-center justify-between">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-28" />
            </div>
          </div>
        </div>

        <div>
          <USkeleton class="mb-[16px] h-5 w-24" />
          <div class="space-y-[12px]">
            <div class="flex items-center justify-between">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-28" />
            </div>
            <div class="flex items-center justify-between">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-28" />
            </div>
            <div class="flex items-center justify-between">
              <USkeleton class="h-4 w-20" />
              <USkeleton class="h-4 w-20" />
            </div>
            <div class="flex items-center justify-between">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-20" />
            </div>
            <div class="flex items-center justify-between">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-5 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="error && !order"
      class="flex flex-col items-center justify-center py-20 text-[#6b7280] px-4"
    >
      <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 mb-4 opacity-30" />
      <p class="text-[14px]">{{ error }}</p>
      <button class="mt-4 text-[14px] underline text-[#191a1d]" @click="fetchOrderDetail(orderId)">
        {{ t('de8076e6.132c5c') }}
      </button>
    </div>

    <!-- 订单详情内容 -->
    <div
      v-else-if="order"
      data-testid="order-detail-page"
      class="flex flex-col lg:flex-row gap-0 lg:gap-[64px] items-start pb-[120px] lg:pb-[32px] px-4 lg:px-[128px]"
    >
      <!-- 左列：订单状态 + 商品列表 + 汇总 + 操作按钮 -->
      <div class="flex-1 min-w-0 w-full flex flex-col gap-[32px] pt-[32px]">
        <!-- 订单状态 -->
        <p class="text-[16px] font-medium leading-5 text-[#191a1d]">{{ order.statusText }}</p>

        <!-- 店铺 -->
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

        <!-- 商品列表 -->
        <OrderDetailItems :items="order.items" />


        <!-- PC：汇总行 + 操作按钮 -->
        <div class="hidden lg:flex items-center justify-between pb-[32px]">
          <div class="flex items-baseline gap-[32px] text-[14px] text-[#364153] whitespace-nowrap shrink-0">
            <span>{{ t('ee3264ed.0bf60b') }}: {{ totalQuantity }}</span>
            <span>
              {{ t('de8076e6.450efd') }}:
              <span class="font-medium text-[16px] text-[#191a1d]">
                {{ formatAmount(order.totalAmount) }}
              </span>
            </span>
          </div>
          <OrderDetailActions
            v-if="availableActions.length > 0"
            :actions="availableActions"
            @cancel="cancelOrder"
            @pay="payNow"
            @change-offline="changeOfflineVoucher"
            @confirm-receipt="confirmReceipt"
            @aftersales="openAftersales"
            @logistics="handleViewLogistics"
            @review="openReview"
          />
        </div>
      </div>

      <!-- 右侧栏（PC only：320px sidebar） -->
      <div class="hidden lg:flex flex-col gap-[32px] w-[320px] shrink-0 py-[32px]">
        <!-- 收货人信息 -->
        <OrderDetailAddress
          :name="order.receiverName"
          :mobile="order.receiverMobile"
          :address="order.shippingAddress"
        />

        <!-- 配送方式 -->
        <div
          v-if="order.shippingMethod"
          class="border-[#e5e7eb] border-b border-solid flex flex-col gap-[16px] items-start pb-[33px] w-full"
        >
          <p class="text-[16px] font-medium leading-5 text-[#191a1d]">
            {{ t('433a5846.edfe4c') }}
          </p>
          <div class="flex items-center justify-between text-[14px] leading-5 w-full">
            <span class="text-[#4a5565]">{{ t('433a5846.edfe4c') }}</span>
            <span class="font-medium text-[#191a1d]">{{ order.shippingMethod }}</span>
          </div>
        </div>

        <!-- 发票信息 -->
        <div
          v-if="displayInvoiceInfo"
          class="border-[#e5e7eb] border-b border-solid flex flex-col gap-[16px] items-start pb-[33px] w-full"
        >
          <p class="text-[16px] font-medium leading-5 text-[#191a1d]">
            {{ t('433a5846.714483') }}
          </p>
          <div
            data-testid="order-detail-invoice-summary"
            class="flex items-center justify-between text-[14px] leading-5 w-full"
          >
            <span class="text-[#4a5565]">{{ t('433a5846.714483') }}</span>
            <span class="font-medium text-[#191a1d]">{{ displayInvoiceInfo }}</span>
          </div>
        </div>

        <!-- 支付信息 -->
        <div
          v-if="order.payTime"
          class="border-[#e5e7eb] border-b border-solid flex flex-col gap-[16px] items-start pb-[33px] w-full"
        >
          <p class="text-[16px] font-medium leading-5 text-[#191a1d]">
            {{ t('433a5846.02b157') }}
          </p>
          <div class="flex flex-col gap-[8px] text-[14px] leading-5 w-full">
            <div v-if="order.statusText" class="flex items-center justify-between">
              <span class="text-[#4a5565]">{{ t('433a5846.598fb8') }}</span>
              <span class="font-medium text-[#191a1d]">{{ paymentMethodText }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#4a5565]">{{ t('433a5846.590c95') }}</span>
              <span class="font-medium text-[#191a1d]">{{ order.payTime }}</span>
            </div>
          </div>
        </div>

        <!-- 订单信息（含金额明细） -->
        <OrderDetailInfo
          :order-id="order.orderId"
          :create-time="order.orderTime"
          :item-fee="order.itemFee"
          :freight-fee="order.freightFee"
          :discount-fee="order.discountFee"
          :promotion-discount="order.promotionDiscount"
          :coupon-discount="order.couponDiscount"
          :member-discount="order.memberDiscount"
          :point-fee="order.pointFee"
          :total-fee="order.totalFee"
        />
      </div>

      <!-- H5：右侧栏内容（单列展示） -->
      <div class="lg:hidden w-full flex flex-col gap-[32px] py-[32px]">
        <OrderDetailAddress
          :name="order.receiverName"
          :mobile="order.receiverMobile"
          :address="order.shippingAddress"
        />

        <div
          v-if="order.shippingMethod"
          class="border-[#e5e7eb] border-b border-solid flex flex-col gap-[16px] items-start pb-[33px] w-full"
        >
          <p class="text-[16px] font-medium leading-5 text-[#191a1d]">
            {{ t('433a5846.edfe4c') }}
          </p>
          <div class="flex items-center justify-between text-[14px] leading-5 w-full">
            <span class="text-[#4a5565]">{{ t('433a5846.edfe4c') }}</span>
            <span class="font-medium text-[#191a1d]">{{ order.shippingMethod }}</span>
          </div>
        </div>

        <div
          v-if="displayInvoiceInfo"
          class="border-[#e5e7eb] border-b border-solid flex flex-col gap-[16px] items-start pb-[33px] w-full"
        >
          <p class="text-[16px] font-medium leading-5 text-[#191a1d]">
            {{ t('433a5846.714483') }}
          </p>
          <div
            data-testid="order-detail-invoice-summary"
            class="flex items-center justify-between text-[14px] leading-5 w-full"
          >
            <span class="text-[#4a5565]">{{ t('433a5846.714483') }}</span>
            <span class="font-medium text-[#191a1d]">{{ displayInvoiceInfo }}</span>
          </div>
        </div>

        <div
          v-if="order.payTime"
          class="border-[#e5e7eb] border-b border-solid flex flex-col gap-[16px] items-start pb-[33px] w-full"
        >
          <p class="text-[16px] font-medium leading-5 text-[#191a1d]">
            {{ t('433a5846.02b157') }}
          </p>
          <div class="flex flex-col gap-[8px] text-[14px] leading-5 w-full">
            <div class="flex items-center justify-between">
              <span class="text-[#4a5565]">{{ t('433a5846.590c95') }}</span>
              <span class="font-medium text-[#191a1d]">{{ order.payTime }}</span>
            </div>
          </div>
        </div>

        <OrderDetailInfo
          :order-id="order.orderId"
          :create-time="order.orderTime"
          :item-fee="order.itemFee"
          :freight-fee="order.freightFee"
          :discount-fee="order.discountFee"
          :promotion-discount="order.promotionDiscount"
          :coupon-discount="order.couponDiscount"
          :member-discount="order.memberDiscount"
          :point-fee="order.pointFee"
          :total-fee="order.totalFee"
        />
      </div>
    </div>

    <!-- H5：底部固定操作栏 -->
    <div
      v-if="order && availableActions.length > 0"
      class="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-[#e5e7eb] px-4 pt-[16px] pb-[32px] flex flex-col gap-[16px] lg:hidden"
    >
      <!-- 汇总行 -->
      <div class="flex items-baseline justify-between text-[14px] text-[#364153]">
        <span>{{ t('ee3264ed.0bf60b') }}: {{ totalQuantity }}</span>
        <span>
          {{ t('ee3264ed.de8e9a') }}：
          <span class="font-medium text-[16px] text-[#191a1d]">
            {{ formatAmount(order.totalAmount) }}
          </span>
        </span>
      </div>
      <!-- 按钮区 -->
      <OrderDetailActions
        :actions="availableActions"
        @cancel="cancelOrder"
        @pay="payNow"
        @change-offline="changeOfflineVoucher"
        @confirm-receipt="confirmReceipt"
        @aftersales="openAftersales"
        @logistics="handleViewLogistics"
        @review="openReview"
      />
    </div>

    <OrderLogisticsDialog
      v-model="logisticsDialogVisible"
      :tracking-no="order?.logisticsNo"
      :company="order?.logisticsCompany"
      :traces="logisticsTraces"
      :loading="logisticsLoading"
      :error="logisticsError"
      @retry="retryLogistics"
    />

    <OrderReviewModal
      v-if="reviewItem.itemId"
      :visible="reviewVisible"
      :order-id="orderId"
      :item="reviewItem"
      @close="reviewVisible = false"
      @submitted="onReviewSubmitted"
    />

    <AftersalesPanel
      :visible="aftersalesVisible"
      :order-id="aftersalesItem.orderId"
      :items="aftersalesItem.items"
      :order-delivery-status="aftersalesItem.orderDeliveryStatus"
      :reason-options="reasonOptions"
      @close="aftersalesVisible = false"
      @submitted="fetchOrderDetail(orderId)"
    />

    <BCCancelOrderReasonModal
      :visible="reasonModalVisible"
      :loading="cancelSubmitting"
      @close="closeReasonModal"
      @submit="submitCancel"
    />

    <BCProductRecommendations
      v-if="recommendationsVisible"
      :recommended-products="recommendedProducts"
      :show-recent-tab="false"
      :adding-product-id="recommendationAddingId"
      show-add-to-cart
      @add-to-cart="handleRecommendationAdd"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAftersalesReasonOptions } from '~/composables/useAftersalesReasonOptions'
import OrderDetailAddress from '../components/OrderDetailAddress.vue'
import OrderDetailItems from '../components/OrderDetailItems.vue'
import OrderDetailInfo from '../components/OrderDetailInfo.vue'
import OrderDetailActions from '../components/OrderDetailActions.vue'
import OrderLogisticsDialog from '../components/OrderLogisticsDialog.vue'
import OrderReviewModal from '../components/OrderReviewModal.vue'
import AftersalesPanel from '../components/AftersalesPanel.vue'
import type { AftersalesPanelItem } from '../components/AftersalesFormContent.vue'
import BCProductRecommendations from '~/components/BCProductRecommendations/BCProductRecommendations.vue'
import { useRecommendationAddToCart } from '~/composables/useRecommendationAddToCart'
import { formatMoneyYuan } from '~/utils/currencyFormat'
import {
  normalizeRecommendationItemIds,
  resolveRecommendationMainItemId,
} from '~/utils/normalizeRecommendationItemIds'

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

function handleBack() {
  if (window.history.state && window.history.state.back) {
    router.back()
  } else {
    router.replace(localePath('/account/orders'))
  }
}

const toast = useToastMessage()
const orderId = String((route.params as Record<string, string>).id || '')
const { reasonOptions, loadReasonOptions } = useAftersalesReasonOptions()

const {
  order,
  loading,
  error,
  availableActions,
  logisticsDialogVisible,
  logisticsLoading,
  logisticsError,
  logisticsTraces,
  reasonModalVisible,
  cancelSubmitting,
  displayInvoiceInfo,
  fetchOrderDetail,
  cancelOrder,
  submitCancel,
  closeReasonModal,
  confirmReceipt,
  payNow,
  changeOfflineVoucher,
  viewLogistics,
  retryLogistics,
} = useOrderDetail()

const totalQuantity = computed(
  () => order.value?.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) ?? 0
)

const orderMainItemIds = computed(() =>
  normalizeRecommendationItemIds(
    (order.value?.items ?? []).map((item: { itemId: string; goodsId?: string }) =>
      resolveRecommendationMainItemId({
        productId: item.itemId,
        goodsId: item.goodsId,
      })
    )
  )
)

const { products: recommendedProducts, visible: recommendationsVisible } = useProductRecommendations({
  scene: 'order_detail',
  mainItemIds: orderMainItemIds,
  enabled: computed(() => !!order.value && !loading.value),
})

const { addingProductId: recommendationAddingId, handleRecommendationAdd } =
  useRecommendationAddToCart({ mode: 'cart' })

const paymentMethodText = computed(() => {
  if (!order.value) return ''
  const status = order.value.status
  if (status === 'pending_payment') return t('433a5846.608afd')
  return t('433a5846.bffe28')
})

function formatAmount(amount: number) {
  return formatMoneyYuan(Number(amount || 0))
}

function handleViewLogistics() {
  viewLogistics()
}

// 评价弹窗
const reviewVisible = ref(false)
const reviewItem = ref<{
  itemId: string
  itemName: string
  itemImage: string
  skuNo?: string
  style?: string
  size?: string
  specName?: string
}>({
  itemId: '',
  itemName: '',
  itemImage: '',
})

function openReview() {
  const firstItem = order.value?.items?.[0]
  if (!firstItem) return
  reviewItem.value = {
    itemId: firstItem.itemId,
    itemName: firstItem.itemName,
    itemImage: firstItem.itemImage,
    skuNo: firstItem.skuNo,
    style: firstItem.style,
    size: firstItem.size,
    specName: firstItem.specName,
  }
  reviewVisible.value = true
}

function onReviewSubmitted() {
  fetchOrderDetail(orderId)
}

// 售后弹窗
const aftersalesVisible = ref(false)
const aftersalesItem = ref<{
  orderId: string
  items: AftersalesPanelItem[]
  orderDeliveryStatus: string
}>({
  orderId: '',
  items: [],
  orderDeliveryStatus: '',
})

async function openAftersales() {
  try {
    await loadReasonOptions()
    const items = (order.value?.items ?? []).map((item: any) => ({
      detailId: item.detailId,
      itemId: item.itemId,
      itemName: item.itemName,
      itemImage: item.itemImage,
      skuNo: item.skuNo,
      style: item.style,
      size: item.size,
      specName: item.specName,
      quantity: item.quantity,
      leftAftersalesNum: item.leftAftersalesNum,
      leftRefundOnlyNum: item.leftRefundOnlyNum ?? 0,
      deliveryStatus: item.deliveryStatus,
      deliveryItemNum: item.deliveryItemNum ?? 0,
      shipStatus: item.shipStatus ?? 0,
      price: item.price,
      marketingTags: item.marketingTags,
    }))
    if (items.length === 0) return

    aftersalesItem.value = {
      orderId: orderId,
      items,
      orderDeliveryStatus: String(order.value?.deliveryStatusRaw ?? ''),
    }
    aftersalesVisible.value = true
  } catch (error: any) {
    toast.show(error?.message || error?.data?.message || t('9233eff9.bd87f5'))
  }
}

onMounted(() => {
  fetchOrderDetail(orderId)
})
</script>
