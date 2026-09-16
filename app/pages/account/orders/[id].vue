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
          <svg
            class="w-5 h-5 text-[#191a1d] shrink-0"
            viewBox="0 0 20 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M19.9995 6.88428C19.9983 6.4752 19.9323 6.06898 19.804 5.6811L19.7873 5.59126L18.0671 1.37718C17.9084 0.966999 17.6298 0.615667 17.2687 0.370135C16.9076 0.124602 16.4812 -0.00343601 16.0463 0.00312995H4.09294C3.65601 -0.0212692 3.22264 0.0947131 2.85461 0.334538C2.48659 0.574363 2.2027 0.925786 2.04344 1.33869L0.208829 5.61282L0.192581 5.69757C0.0655586 6.08567 0.000583713 6.49186 0.000114432 6.90074C0.00250163 7.43765 0.114873 7.96821 0.330117 8.45885C0.545361 8.94948 0.858791 9.38951 1.25057 9.75109L1.25515 17.1552C1.27117 18.1801 2.09596 19 3.10463 19L3.13038 18.9998H3.13164L16.8764 18.9917H16.8939C17.9055 18.9917 18.7328 18.1707 18.7514 17.1439V9.73382C19.5305 9.01103 19.9953 7.98417 19.9995 6.88428ZM1.37907 6.09646L1.40448 6.01902L1.40997 5.99039L3.18977 1.84354L3.19915 1.82175L3.20773 1.79961C3.33074 1.4807 3.64026 1.26636 3.97782 1.26636L4.02405 1.26763L4.0585 1.2696H16.0463L16.0692 1.26949L16.0784 1.26937C16.4454 1.26937 16.7693 1.49311 16.9118 1.86117L18.5831 5.95538L18.5917 6.0021L18.6184 6.08348C18.7036 6.33993 18.7479 6.6085 18.7495 6.87907C18.7455 7.85492 18.2127 8.74151 17.3724 9.18573C16.9785 9.38715 16.5434 9.49232 16.1022 9.49281L16.0663 9.49258H16.0104C15.6199 9.49258 15.2339 9.40779 14.8784 9.24394C14.5229 9.08009 14.2062 8.84097 13.9497 8.5427L13.0035 7.44257L12.0616 8.54629C11.5469 9.14956 10.8003 9.49757 9.99874 9.50127C9.60854 9.50099 9.22292 9.41601 8.86787 9.25203C8.51282 9.08806 8.19657 8.84891 7.94043 8.5507L6.99709 7.45289L6.05422 8.55116C5.58286 9.09992 4.91835 9.44016 4.20267 9.49919L3.94304 9.50487L3.88457 9.50545C3.46256 9.50545 3.03964 9.40494 2.66867 9.21842C1.79788 8.77362 1.25423 7.88344 1.25023 6.90202C1.25045 6.62825 1.29395 6.35629 1.37907 6.09646ZM17.5016 17.1203C17.4953 17.4538 17.2227 17.7252 16.8756 17.7251L3.1044 17.7334C2.77897 17.7334 2.51007 17.4652 2.50504 17.1544L2.50149 11.4058H2.50217V10.5205C2.97159 10.6962 3.46938 10.7811 3.9697 10.7708V10.7753H3.97908C4.55128 10.7753 5.11681 10.6509 5.6375 10.4105C6.1582 10.1702 6.62194 9.81951 6.99744 9.38211C7.37084 9.8167 7.83182 10.1652 8.34932 10.4042C8.86683 10.6432 9.42887 10.767 9.9976 10.7675H10.0189C10.5863 10.7649 11.1465 10.6392 11.662 10.3989C12.1774 10.1586 12.6361 9.80931 13.0071 9.37445C13.384 9.81266 13.8499 10.1632 14.3729 10.4021C14.8959 10.641 15.4637 10.7626 16.0374 10.7586H16.0506C16.5453 10.7649 17.037 10.6796 17.5015 10.507V12.4825H17.5013L17.5016 17.1203Z"
              fill="currentColor"
            />
          </svg>
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
const aftersalesItem = ref<{ orderId: string; items: AftersalesPanelItem[] }>({
  orderId: '',
  items: [],
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
      price: item.price,
    }))
    if (items.length === 0) return

    aftersalesItem.value = {
      orderId: orderId,
      items,
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
