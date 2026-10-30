<template>
  <div class="bg-white min-h-screen">
    <!-- H5 顶栏：使用 AccountH5FilterBar 自带展开菜单 -->
    <div class="lg:hidden sticky top-0 z-10 shrink-0">
      <AccountH5FilterBar
        v-model="showMobileMenu"
        :title="t('de8076e6.a73872')"
        :show-back="true"
        :active-key="activeMenu"
        :menu-items="menuItems"
        @back="router.back()"
      />
    </div>

    <!-- 主布局：PC 保持账户中心布局，H5 按 Figma 375/343 节奏铺开 -->
    <div
      class="content-stretch flex items-start justify-center px-0 py-0 lg:px-[128px] lg:py-[32px] relative shrink-0 w-full"
    >
      <div
        class="content-stretch flex flex-[1_0_0] gap-0 lg:gap-[64px] items-start min-h-px min-w-px relative w-full lg:min-h-[calc(100vh-var(--layout-header-height,68px)-64px)]"
      >
        <!-- 左侧菜单（PC 与 index 一致） -->
        <div
          class="hidden lg:block w-64 shrink-0 lg:self-start lg:sticky lg:top-[var(--layout-header-height,68px)]"
        >
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </div>

        <!-- 右侧内容区域：与 index.vue 一致 -->
        <div
          class="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative min-w-0"
        >
          <div class="content-stretch flex flex-col items-center relative shrink-0 w-full">
            <!-- 状态 Tabs（H5 独立灰底区域，PC 保持白底） -->
            <div class="w-full bg-[#f3f4f6] px-4 py-4 lg:bg-white lg:px-0 lg:py-0">
              <div class="relative shrink-0 w-full">
                <div class="flex overflow-x-auto no-scrollbar items-center lg:overflow-visible">
                  <template v-for="(tab, index) in tabs" :key="tab.key">
                    <button
                      type="button"
                      class="flex items-center gap-1 whitespace-nowrap py-0 text-[14px] leading-5 transition-colors"
                      :class="getOrderTabClass(tab.key, index)"
                      @click="changeStatus(tab.key)"
                    >
                      <span>{{ tab.label }}</span>
                    </button>
                    <div
                      v-if="index < tabs.length - 1"
                      class="h-5 w-px bg-[#99a1af] shrink-0"
                      aria-hidden="true"
                    />
                  </template>
                </div>
              </div>
            </div>

            <!-- 订单列表 -->
            <div class="relative shrink-0 w-full bg-white px-4 lg:px-0">
              <!-- 加载中 -->
              <div v-if="(!hasLoaded || loading) && orders.length === 0" class="space-y-4 pt-4">
                <div v-for="i in 3" :key="i" class="border border-[#e5e7eb] p-4 lg:p-8">
                  <div class="flex justify-between mb-4">
                    <USkeleton class="h-4 w-32" />
                    <USkeleton class="h-4 w-16" />
                  </div>
                  <div class="flex gap-4 lg:gap-8">
                    <USkeleton class="h-20 w-20 lg:h-24 lg:w-24" />
                    <div class="flex-1 space-y-2">
                      <USkeleton class="h-4 w-full" />
                      <USkeleton class="h-4 w-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div
                v-else-if="isEmpty"
                class="flex flex-col items-center justify-center py-20 text-[#6b7280]"
              >
                <UIcon name="i-heroicons-shopping-bag" class="w-16 h-16 mb-4 opacity-20" />
                <p class="text-[14px]">{{ t('de8076e6.2c51b5') }}</p>
              </div>

              <!-- 列表内容（Figma: 订单卡片 py-32 gap-16，商品行 gap-16，单价/数量右对齐竖排） -->
              <div v-else class="flex flex-col gap-0 pb-8 lg:pb-[32px] lg:pt-[32px]">
                <div
                  v-for="order in orders"
                  :key="order.orderId"
                  data-testid="order-item"
                  :data-status="order.status"
                  class="bg-white w-full flex flex-col gap-[16px] py-[32px] border-b border-[#e5e7eb] cursor-pointer"
                  @click="navigateTo(localePath(`/account/orders/${order.orderId}`))"
                >
                  <!-- 状态与店铺（Figma: 16px medium #191a1d + 店铺 14px medium，gap-10px） -->
                  <div class="flex flex-col gap-[16px]">
                    <div class="flex items-center justify-between">
                      <p class="text-[16px] font-medium leading-5 text-[#191a1d]">
                        {{ order.statusText }}
                      </p>
                      <div class="flex items-center gap-[16px] text-[12px] leading-4 text-[#4a5565]">
                        <span>{{ t('de8076e6.1e8dc2') }}: {{ order.orderId }}</span>
                        <span v-if="order.orderTime">{{ t('de8076e6.2240cc') }}: {{ order.orderTime }}</span>
                      </div>
                    </div>
                    <div v-if="order.storeName" class="flex items-center gap-[10px]">
                      <UIcon
                        name="i-icon-park-outline:application"
                        class="size-5 shrink-0 text-[#191a1d]"
                        aria-hidden="true"
                      />
                      <span class="text-[14px] font-medium leading-5 text-[#191a1d]">
                        {{ order.storeName }}
                      </span>
                    </div>
                  </div>

                  <!-- 商品列表（Figma: 图 96x96，信息与单价/数量 gap-32，单价数量竖排右对齐） -->
                  <div class="flex flex-col gap-[32px]">
                    <div
                      v-for="item in order.items"
                      :key="item.itemId"
                      class="flex items-start gap-[16px] lg:gap-[32px]"
                    >
                      <OrderItemThumb
                        :src="item.itemImage"
                        :delivery-status="item.deliveryStatus"
                        :delivery-item-num="item.deliveryItemNum"
                        :quantity="item.quantity"
                        :ship-status="item.shipStatus"
                      />
                      <div class="flex flex-1 min-w-0 gap-[16px] lg:gap-[32px] items-start">
                        <div class="flex-[1_0_0] min-w-0 flex flex-col gap-[4px]">
                          <!-- 对齐 vshop SpTradeItem：订单列表不展示营销标签 -->
                          <h3 class="text-[14px] font-medium leading-5 text-[#101828]">
                            {{ item.itemName }}
                          </h3>
                          <div class="flex flex-col gap-[2px]">
                            <p v-if="item.skuNo" class="text-[12px] leading-4 text-[#364153]">
                              {{ t('ee3264ed.e54891') }}: {{ item.skuNo }}
                            </p>
                            <p v-if="item.style" class="text-[12px] leading-4 text-[#364153]">
                              {{ t('ee3264ed.568510') }}: {{ item.style }}
                            </p>
                            <p v-if="item.size" class="text-[12px] leading-4 text-[#364153]">
                              {{ t('ee3264ed.c8339f') }}: {{ item.size }}
                            </p>
                            <template
                              v-if="!item.skuNo && !item.style && !item.size && item.specName"
                            >
                              <p class="text-[12px] leading-4 text-[#364153]">
                                {{ item.specName }}
                              </p>
                            </template>
                          </div>
                        </div>
                        <div
                          class="flex shrink-0 flex-col items-end justify-center gap-[4px] min-w-[66px] lg:min-w-0 lg:flex-row lg:items-start lg:justify-end lg:gap-[32px]"
                        >
                          <span
                            class="text-[14px] leading-5 text-[#191a1d] text-right lg:order-2 lg:w-auto lg:whitespace-nowrap"
                          >
                            {{ formatAmount(item.price) }}
                          </span>
                          <span
                            class="text-[14px] leading-5 text-[#191a1d] text-right lg:order-1 lg:w-auto lg:whitespace-nowrap"
                          >
                            {{ t('ee3264ed.0bf60b') }}: {{ item.quantity }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-[24px]"
                  >
                    <!-- 订单汇总（Figma: gap-32 + PC 左对齐，与操作按钮底边对齐） -->
                    <div
                      class="flex w-full shrink-0 items-baseline justify-start gap-[32px] text-[14px] text-[#364153] lg:w-auto"
                    >
                      <span>{{ t('ee3264ed.0bf60b') }}: {{ getTotalQuantity(order) }}</span>
                      <span
                        >{{ t('de8076e6.450efd') }}:
                        <span class="font-medium text-[16px] text-[#191a1d]"
                          >{{ formatAmount(order.totalAmount) }}</span
                        ></span
                      >
                    </div>

                    <!-- 操作按钮（Figma: gap-16，主按钮 #0f0f10，次按钮描边） -->
                    <div class="w-full min-w-0 lg:flex-1">
                      <!-- H5：左侧更多 + 右侧主操作（按 Figma 交互） -->
                      <div class="flex w-full min-h-[34px] items-center lg:hidden">
                        <UPopover
                          v-if="getMobileMoreActions(order).length > 0"
                          v-model:open="mobileMoreOpenMap[order.orderId]"
                        >
                          <button
                            type="button"
                            class="flex items-center text-[12px] font-normal leading-[16px] text-[#364153] whitespace-nowrap"
                            @click.stop
                          >
                            <span class="text-center">{{ t('7aa9bfcf.0ec9ea') }}</span>
                            <UIcon
                              name="i-lucide-chevron-down"
                              class="size-[16px] text-[#364153]"
                            />
                          </button>

                          <template #content>
                            <div
                              class="w-[128px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                            >
                              <button
                                v-for="action in getMobileMoreActions(order)"
                                :key="`${order.orderId}-${action}`"
                                type="button"
                                :disabled="
                                  action === 'aftersales' && isOpeningAftersales(order.orderId)
                                "
                                class="flex h-[34px] w-full items-center px-3 text-left text-[12px] leading-4 text-[#191a1d] hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60"
                                @click.stop="handleMobileMoreAction(action, order)"
                              >
                                <UIcon
                                  v-if="
                                    action === 'aftersales' && isOpeningAftersales(order.orderId)
                                  "
                                  name="i-lucide-loader-circle"
                                  class="mr-1 size-4 animate-spin"
                                />
                                {{ getMobileActionLabel(action) }}
                              </button>
                            </div>
                          </template>
                        </UPopover>

                        <div
                          v-if="getMobileVisibleActions(order).length > 0"
                          class="ml-auto flex items-center gap-[8px]"
                        >
                          <button
                            v-for="action in getMobileVisibleActions(order)"
                            :key="`${order.orderId}-${action}`"
                            type="button"
                            :disabled="
                              action === 'aftersales' && isOpeningAftersales(order.orderId)
                            "
                            :class="[
                              'flex h-[34px] items-center justify-center text-[12px] font-medium leading-4 transition-colors',
                              isMobilePrimaryAction(action)
                                ? 'bg-[#0f0f10] px-[16px] text-white transition-opacity hover:opacity-90'
                                : 'border border-[#0f0f10] px-[17px] text-[#191a1d] hover:bg-gray-50',
                              action === 'aftersales' && isOpeningAftersales(order.orderId)
                                ? 'cursor-not-allowed opacity-60'
                                : '',
                            ]"
                            @click.stop="handleMobileAction(action, order)"
                          >
                            <UIcon
                              v-if="action === 'aftersales' && isOpeningAftersales(order.orderId)"
                              name="i-lucide-loader-circle"
                              class="mr-1 size-4 animate-spin"
                            />
                            {{ getMobileActionLabel(action) }}
                          </button>
                        </div>
                      </div>

                      <!-- PC：右对齐换行，避免按钮挤在左侧导致与合计错位 -->
                      <div
                        class="hidden lg:flex lg:w-full lg:flex-wrap lg:items-center lg:justify-end lg:gap-x-[16px] lg:gap-y-[16px]"
                      >
                        <button
                          v-if="order.canCancel"
                          type="button"
                          class="flex h-[50px] w-auto items-center justify-center border border-[#0f0f10] px-[33px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50"
                          @click.stop="cancelOrder(order)"
                        >
                          {{ t('de8076e6.b21b5e') }}
                        </button>
                        <button
                          v-if="order.canChangeOfflineVoucher"
                          type="button"
                          class="flex h-[50px] w-auto items-center justify-center border border-[#0f0f10] px-[33px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50"
                          @click.stop="changeOfflineVoucher(order.orderId)"
                        >
                          {{ t('eab46cc2.changeOfflineVoucher') }}
                        </button>
                        <button
                          v-if="order.canPay"
                          type="button"
                          class="flex h-[50px] w-auto items-center justify-center bg-[#0f0f10] px-8 text-[12px] font-medium leading-4 text-white transition-opacity hover:opacity-90"
                          @click.stop="payNow(order.orderId, order.distributorId)"
                        >
                          {{ t('de8076e6.747349') }}
                        </button>
                        <button
                          v-if="order.canConfirmReceipt"
                          type="button"
                          class="flex h-[50px] w-auto items-center justify-center bg-[#0f0f10] px-8 text-[12px] font-medium leading-4 text-white transition-opacity hover:opacity-90"
                          @click.stop="confirmReceipt(order.orderId)"
                        >
                          {{ t('de8076e6.775b01') }}
                        </button>
                        <button
                          v-if="order.canDelete"
                          type="button"
                          class="flex h-[50px] w-auto items-center justify-center border border-[#0f0f10] px-[33px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50"
                          @click.stop="deleteOrder(order.orderId)"
                        >
                          {{ t('de8076e6.09936f') }}
                        </button>
                        <button
                          v-if="order.canApplyAftersales"
                          type="button"
                          :disabled="isOpeningAftersales(order.orderId)"
                          :aria-busy="isOpeningAftersales(order.orderId)"
                          class="flex h-[50px] w-auto items-center justify-center border border-[#0f0f10] px-[33px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                          data-testid="btn-apply-aftersales"
                          @click.stop="openAftersales(order)"
                        >
                          <UIcon
                            v-if="isOpeningAftersales(order.orderId)"
                            name="i-lucide-loader-circle"
                            class="mr-1 size-4 animate-spin"
                          />
                          {{ t('de8076e6.45eb0c') }}
                        </button>
                        <button
                          v-if="order.canViewLogistics"
                          data-testid="btn-view-logistics"
                          type="button"
                          class="flex h-[50px] w-auto items-center justify-center border border-[#0f0f10] px-[33px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50"
                          @click.stop="viewLogistics(order.orderId)"
                        >
                          {{ t('de8076e6.edf4b2') }}
                        </button>
                        <button
                          v-if="order.canReview"
                          data-testid="btn-review"
                          type="button"
                          class="flex h-[50px] w-auto items-center justify-center bg-[#0f0f10] px-8 text-[12px] font-medium leading-4 text-white transition-opacity hover:opacity-90"
                          @click.stop="openReview(order)"
                        >
                          {{ t('de8076e6.606120') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="totalPages > 1 && !loading" class="mt-10 w-full">
                <ECPagination
                  :total="total"
                  :page-size="pageSize"
                  :current-page="currentPage"
                  @update:current-page="handlePageChange"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <OrderLogisticsDialog
      v-model="logisticsDialogVisible"
      :tracking-no="logisticsTrackingNo"
      :company="logisticsCompany"
      :traces="logisticsTraces"
      :loading="logisticsLoading"
      :error="logisticsError"
      @retry="retryLogistics"
    />

    <OrderReviewModal
      v-if="reviewItem.itemId"
      :visible="reviewVisible"
      :order-id="reviewOrderId"
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
      @submitted="loadOrders(currentStatus, currentPage)"
    />

    <BCCancelOrderReasonModal
      :visible="reasonModalVisible"
      :loading="cancelSubmitting"
      @close="closeReasonModal"
      @submit="submitCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAftersalesReasonOptions } from '~/composables/useAftersalesReasonOptions'
import { getBusinessMode } from '~/composables/useTemplate'
import { orderApiClient } from '~/infrastructure/http/clients/OrderApiClient'
import { OrderTransformer } from '~/infrastructure/transformers/orderTransformer'
import { formatMoneyYuan } from '~/utils/currencyFormat'
import { OrderStatus } from '~/types/api/order'
import { useOrders } from '~/composables/useOrders'
import AccountMenu from '../components/AccountMenu.vue'
import AccountH5FilterBar from '../components/AccountH5FilterBar.vue'
import OrderLogisticsDialog from '../components/OrderLogisticsDialog.vue'
import OrderReviewModal from '../components/OrderReviewModal.vue'
import AftersalesPanel from '../components/AftersalesPanel.vue'
import OrderItemThumb from '../components/OrderItemThumb.vue'
import type { AftersalesPanelItem } from '../components/AftersalesFormContent.vue'

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToastMessage()

const {
  orders,
  loading,
  hasLoaded,
  currentStatus,
  currentPage,
  pageSize,
  total,
  totalPages,
  isEmpty,
  logisticsDialogVisible,
  logisticsLoading,
  logisticsError,
  logisticsTrackingNo,
  logisticsCompany,
  logisticsTraces,
  reasonModalVisible,
  cancelSubmitting,
  loadOrders,
  changeStatus,
  cancelOrder,
  submitCancel,
  closeReasonModal,
  confirmReceipt,
  deleteOrder,
  payNow,
  changeOfflineVoucher,
  viewLogistics,
  retryLogistics,
} = useOrders()

const { reasonOptions, loadReasonOptions } = useAftersalesReasonOptions()

// 状态定义
const activeMenu = ref('orders')
const showMobileMenu = ref(false)
const isBBC = computed(() => getBusinessMode() === 'bbc')

const tabs = computed(() => [
  { key: OrderStatus.ALL, label: t('de8076e6.dbb4d8') },
  { key: OrderStatus.PENDING_PAYMENT, label: t('de8076e6.9246fe') },
  { key: OrderStatus.PARTIAL_SHIPMENT, label: t('de8076e6.5296ac') },
  { key: OrderStatus.SHIPPED, label: t('de8076e6.4933ca') },
  { key: OrderStatus.PENDING_PICKUP, label: t('de8076e6.25d532') },
  { key: OrderStatus.PENDING_REVIEW, label: t('de8076e6.a48b28') },
])

const menuItems = computed(() => {
  const items = [
    { key: 'profile', label: t('96a0d248.4f7a2a'), path: localePath('/account') },
    { key: 'orders', label: t('de8076e6.a73872'), path: localePath('/account/orders') },
    {
      key: 'aftersales',
      label: t('110ad121.056891'),
      path: localePath('/account/aftersales'),
    },
    { key: 'coupons', label: t('ee3264ed.2f3635'), path: localePath('/account/coupons') },
    { key: 'favorites', label: t('8b2de97c.975ff6'), path: localePath('/account/favorites') },
  ]

  if (isBBC.value) {
    items.push({
      key: 'followStores',
      label: t('1d80cba8.a6c36f'),
      path: localePath('/account/follow-stores'),
    })
  }

  items.push(
    { key: 'address', label: t('ee3264ed.748ea9'), path: localePath('/account/address') },
    {
      key: 'registrations',
      label: t('registration.myRegistrations'),
      path: localePath('/account/registrations'),
    },
    { key: 'reviews', label: t('8b2de97c.b3bf09'), path: localePath('/account/reviews') }
  )

  return items
})

type MobileOrderAction =
  | 'pay'
  | 'changeOffline'
  | 'confirmReceipt'
  | 'review'
  | 'cancel'
  | 'delete'
  | 'aftersales'
  | 'logistics'

const mobileMoreOpenMap = ref<Record<string, boolean>>({})
const openingAftersalesOrderIds = ref<Record<string, boolean>>({})

function getMobilePrimaryAction(order: any): MobileOrderAction | null {
  if (order.canPay) return 'pay'
  if (order.canChangeOfflineVoucher) return 'changeOffline'
  if (order.canConfirmReceipt) return 'confirmReceipt'
  if (order.canReview) return 'review'
  return null
}

function isMobilePrimaryAction(action: MobileOrderAction): boolean {
  return (
    action === 'pay' ||
    action === 'changeOffline' ||
    action === 'confirmReceipt' ||
    action === 'review'
  )
}

function getMobileSecondaryActions(order: any): MobileOrderAction[] {
  const actions: MobileOrderAction[] = []
  if (order.canCancel) actions.push('cancel')
  // canPay 为主按钮时，修改凭证放次要操作
  if (order.canChangeOfflineVoucher && order.canPay) actions.push('changeOffline')
  if (order.canApplyAftersales) actions.push('aftersales')
  if (order.canViewLogistics) actions.push('logistics')
  if (order.canDelete) actions.push('delete')
  return actions
}

function getMobileVisibleActions(order: any): MobileOrderAction[] {
  const primary = getMobilePrimaryAction(order)
  const secondary = getMobileSecondaryActions(order)
  if (primary) {
    return [...secondary.slice(0, 2), primary]
  }
  return secondary.slice(0, 3)
}

function getMobileMoreActions(order: any): MobileOrderAction[] {
  const primary = getMobilePrimaryAction(order)
  const secondary = getMobileSecondaryActions(order)
  const visibleSecondaryCount = primary ? 2 : 3
  const overflowSecondary = secondary.slice(visibleSecondaryCount)
  return overflowSecondary
}

function getMobileActionLabel(action: MobileOrderAction): string {
  switch (action) {
    case 'pay':
      return t('de8076e6.747349')
    case 'changeOffline':
      return t('eab46cc2.changeOfflineVoucher')
    case 'confirmReceipt':
      return t('de8076e6.775b01')
    case 'review':
      return t('de8076e6.606120')
    case 'cancel':
      return t('de8076e6.b21b5e')
    case 'delete':
      return t('de8076e6.09936f')
    case 'aftersales':
      return t('de8076e6.45eb0c')
    case 'logistics':
      return t('de8076e6.edf4b2')
  }
}

function isOpeningAftersales(orderId: string) {
  return Boolean(openingAftersalesOrderIds.value[orderId])
}

function handleMobileAction(action: MobileOrderAction, order: any) {
  switch (action) {
    case 'pay':
      payNow(order.orderId, order.distributorId)
      break
    case 'changeOffline':
      changeOfflineVoucher(order.orderId, order.distributorId)
      break
    case 'confirmReceipt':
      confirmReceipt(order.orderId)
      break
    case 'review':
      openReview(order)
      break
    case 'cancel':
      cancelOrder(order)
      break
    case 'delete':
      deleteOrder(order.orderId)
      break
    case 'aftersales':
      openAftersales(order)
      break
    case 'logistics':
      viewLogistics(order.orderId)
      break
  }
}

async function handleMobileMoreAction(action: MobileOrderAction, order: any) {
  if (action === 'aftersales') {
    await openAftersales(order)
    mobileMoreOpenMap.value[order.orderId] = false
    return
  }

  mobileMoreOpenMap.value[order.orderId] = false
  handleMobileAction(action, order)
}

function getOrderTabClass(status: OrderStatus, index: number) {
  const isActive = currentStatus.value === status
  const spacingClass =
    index === 0 ? 'pr-[32px]' : index === tabs.value.length - 1 ? 'pl-[32px]' : 'px-[32px]'

  return [
    spacingClass,
    isActive ? 'font-medium text-[#191a1d]' : 'font-normal text-[#99a1af] hover:text-[#364153]',
  ]
}

// 计算属性/辅助函数
function getTotalQuantity(order: any) {
  return order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)
}

function formatAmount(amount: number) {
  return formatMoneyYuan(Number(amount || 0))
}

function handlePageChange(page: number) {
  loadOrders(currentStatus.value, page)
}

function handleLogout() {
  console.log('用户已退出登录')
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

function mapAftersalesItems(items: any[] = []) {
  return items.map((item: any) => ({
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
}

async function openAftersales(order: any) {
  if (isOpeningAftersales(order.orderId)) return

  openingAftersalesOrderIds.value = {
    ...openingAftersalesOrderIds.value,
    [order.orderId]: true,
  }

  try {
    const [detailResponse] = await Promise.all([
      orderApiClient.getOrderDetail(order.orderId),
      loadReasonOptions(),
    ])
    const detailModel = OrderTransformer.toOrderDetailModel(
      detailResponse?.orderInfo || detailResponse
    )
    const items = mapAftersalesItems(detailModel.items ?? [])
    if (items.length === 0) return

    aftersalesItem.value = {
      orderId: order.orderId,
      items,
      orderDeliveryStatus: String(detailModel.deliveryStatusRaw ?? ''),
    }
    aftersalesVisible.value = true
  } catch (error: any) {
    toast.show(error?.message || error?.data?.message || t('9233eff9.bd87f5'))
  } finally {
    openingAftersalesOrderIds.value = {
      ...openingAftersalesOrderIds.value,
      [order.orderId]: false,
    }
  }
}

// 评价弹窗
const reviewVisible = ref(false)
const reviewOrderId = ref('')
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

function openReview(order: any) {
  const firstItem = order.items?.[0]
  if (!firstItem) return
  reviewOrderId.value = order.orderId
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
  loadOrders(currentStatus.value, currentPage.value)
}

// 初始化
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
