<template>
  <div
    class="relative flex h-full min-h-0 flex-col overflow-hidden bg-white px-4 py-8 lg:px-8 lg:py-0"
  >
    <!-- 标题栏 -->
    <div class="relative flex w-full shrink-0 items-center justify-between px-0 py-[16px] lg:pt-8">
      <p
        class="font-['Noto_Sans_SC'] text-[20px] font-medium leading-[20px] text-[#191a1d] text-nowrap"
      >
        {{ t('b60e45d1.346eab', { count: cartUI.itemCount }) }}
      </p>
      <button
        type="button"
        class="relative size-[24px] shrink-0 transition-opacity hover:opacity-70"
        @click="handleClose"
      >
        <UIcon name="i-heroicons-x-mark" class="h-6 w-6 text-[#191a1d]" />
      </button>
    </div>

    <!-- 可滚动内容：商品列表 + 推荐 -->
    <div
      class="mini-cart-scroll flex min-h-0 flex-1 flex-col gap-[32px] overflow-y-auto overscroll-contain pt-[16px] pb-6"
    >
      <!-- 加载状态 -->
      <div v-if="!initialized" class="flex w-full justify-center py-10">
        <ECLoading />
      </div>

      <!-- 空购物车状态 -->
      <div
        v-else-if="initialized && cartUI.isEmpty"
        class="flex w-full flex-col items-center justify-center py-10"
      >
        <svg
          class="mb-4 h-16 w-16 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <p class="mb-2 text-base text-gray-600">{{ t('b60e45d1.fa0a45') }}</p>
        <p class="text-sm text-gray-400">{{ t('b60e45d1.723c28') }}</p>
      </div>

      <!-- 商品列表（按店铺分组） -->
      <template v-else>
        <section
          v-for="group in cartStoreGroupsUI"
          :key="group.id"
          class="flex w-full flex-col gap-8"
        >
          <BCMiniCartStoreHeader
            v-if="group.storeName"
            :store-name="group.storeName"
            :store-logo="group.storeLogo"
          />

          <BCMiniCartItem
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            :loading="loading"
            display-mode="drawer"
            show-remove
            external-remove-confirm
            @toggle-selection="handleToggleSelection"
            @quantity-change="handleQuantityChange"
            @request-remove="handleRequestRemove"
          />
        </section>

        <div
          v-if="recommendationsVisible"
          class="mini-cart-recommendations relative z-0 w-full shrink-0 pb-2"
        >
          <BCProductRecommendations
            :recommended-products="recommendedProducts"
            :show-recent-tab="false"
            :adding-product-id="recommendationAddingId"
            show-add-to-cart
            @add-to-cart="handleRecommendationAdd"
          />
        </div>
      </template>
    </div>

    <!-- 底部区域：sticky + 较高层级，避免与推荐区点击重叠 -->
    <div
      v-if="!cartUI.isEmpty"
      class="relative z-30 w-full shrink-0 border-t border-[#e5e7eb] bg-white pt-4 lg:pb-8"
      :class="{ 'pointer-events-none opacity-70': isRecommendationActionActive }"
    >
      <div class="relative flex w-full flex-col items-start gap-4 px-0 pb-0 lg:gap-4">
        <!-- 全选 -->
        <div
          class="border-[0px_0px_1px] border-[#e5e7eb] border-solid content-stretch flex gap-[8px] items-center pb-[17px] pt-0 px-0 relative shrink-0 w-full"
        >
          <div
            class="shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[16px] flex items-center justify-center cursor-pointer"
            :class="[
              cartUI.isAllSelected && cartUI.itemCount > 0
                ? 'bg-black border border-black'
                : 'bg-white border border-[#191a1d]',
            ]"
            @click="handleToggleAll"
          >
            <svg
              v-if="cartUI.isAllSelected && cartUI.itemCount > 0"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="relative shrink-0">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center relative"
            >
              <p
                class="font-['Noto_Sans_SC'] font-normal leading-[20px] relative shrink-0 text-[14px] text-[#191a1d] text-nowrap"
              >
                {{ t('b60e45d1.66eeac') }}
              </p>
            </div>
          </div>
        </div>

        <!-- 优惠和总计 -->
        <div
          class="content-stretch flex h-[20px] items-center justify-between pl-0 pr-[0.008px] py-0 relative shrink-0 w-full"
        >
          <!-- 优惠 -->
          <div class="basis-0 grow min-h-px min-w-px relative shrink-0">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex font-['Noto_Sans_SC'] font-normal items-center leading-[20px] relative text-[14px] text-[#d0112f] text-nowrap w-full"
            >
              <p class="relative shrink-0">{{ t('b60e45d1.dd2fd1') }}</p>
              <p class="relative shrink-0">{{ cartUI.discountFeeDisplay }}</p>
            </div>
          </div>
          <!-- 商品总计 -->
          <div class="basis-0 grow min-h-px min-w-px relative shrink-0">
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-end leading-[20px] relative text-[#191a1d] text-nowrap w-full"
            >
              <p class="font-['Noto_Sans_SC'] font-normal relative shrink-0 text-[14px]">
                {{ t('b60e45d1.e2c2bc') }}
              </p>
              <p class="font-['Inter'] font-medium not-italic relative shrink-0 text-[16px]">
                {{ cartUI.finalTotalDisplay }}
              </p>
            </div>
          </div>
        </div>

        <!-- 按钮组 -->
        <div
          class="content-stretch flex flex-col gap-[16px] h-[118px] items-start relative shrink-0 w-full"
        >
          <!-- 前往结算按钮 -->
          <button
            class="bg-[#0f0f10] relative shrink-0 w-full hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!cartUI.canCheckout || loading"
            @click="handleCheckout"
          >
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center px-0 py-[16px] relative w-full"
            >
              <p
                class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[14px] text-center text-nowrap text-white"
              >
                {{ t('b60e45d1.f7f353') }}
              </p>
            </div>
          </button>

          <!-- 查看购物袋按钮 -->
          <button
            class="basis-0 bg-white border border-[#0f0f10] border-solid grow min-h-px min-w-px relative shrink-0 w-full hover:bg-gray-50 transition-colors"
            @click="handleViewCart"
          >
            <div
              class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center px-0 py-[16px] relative size-full"
            >
              <p
                class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[14px] text-[#191a1d] text-center text-nowrap"
              >
                {{ t('b60e45d1.f67520') }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <ECModal
      v-model="showRemoveConfirm"
      inline
      :title="t('9864a2ba.2f4aad')"
      :content="t('9864a2ba.3e3483')"
      :confirm-text="t('9864a2ba.2f4aad')"
      @confirm="handleConfirmRemove"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Mini 购物车组件
 *
 * 从右往左弹出的购物车抽屉，用于快速查看和管理购物车
 * 参照 Figma 设计实现，复用购物车页面的逻辑
 */

import { ECLoading } from '~/components/ECLoading'
import BCMiniCartItem from '~/components/BCMiniCartItem/BCMiniCartItem.vue'
import BCMiniCartStoreHeader from '~/components/BCMiniCart/BCMiniCartStoreHeader.vue'
import BCProductRecommendations from '~/components/BCProductRecommendations/BCProductRecommendations.vue'
import { useRecommendationAddToCart } from '~/composables/useRecommendationAddToCart'
import {
  normalizeRecommendationItemIds,
  resolveRecommendationMainItemId,
} from '~/utils/normalizeRecommendationItemIds'

defineOptions({
  name: 'MiniCart',
})

// Props
interface Props {
  /** 是否显示 */
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const {
  cartUI,
  cartStoreGroupsUI,
  loading,
  loadCart,
  toggleItemSelection,
  toggleAllSelection,
  updateQuantity,
  removeItem,
} = useCart()

// 追踪是否完成首次加载
const initialized = ref(false)
const showRemoveConfirm = ref(false)
const removingItemId = ref<string | null>(null)

const cartMainItemIds = computed(() =>
  normalizeRecommendationItemIds(
    cartUI.value.items.filter((item) => item.selected).map(resolveRecommendationMainItemId)
  )
)

const { products: recommendedProducts, visible: recommendationsVisible } =
  useProductRecommendations({
    scene: 'cart',
    mainItemIds: cartMainItemIds,
    enabled: computed(
      () => props.modelValue && initialized.value && cartMainItemIds.value.length > 0
    ),
  })

const {
  addingProductId: recommendationAddingId,
  skuDrawerOpen,
  skuConfirmLoading,
  handleRecommendationAdd,
} = useRecommendationAddToCart({
  mode: 'cart',
  onAddSuccess: async () => {
    await loadCart({ silent: true })
  },
})

const isRecommendationActionActive = computed(
  () => Boolean(recommendationAddingId.value) || skuConfirmLoading.value || skuDrawerOpen.value
)

/**
 * 监听 modelValue 变化，打开时加载购物车数据
 */
watch(
  () => props.modelValue,
  async (newValue) => {
    if (!newValue) return
    await loadCart()
    initialized.value = true
  },
  { immediate: true }
)

/**
 * 处理关闭
 */
function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

/**
 * 切换商品选中状态
 */
async function handleToggleSelection(itemId: string) {
  await toggleItemSelection(itemId)
}

/**
 * 全选/取消全选
 */
async function handleToggleAll() {
  await toggleAllSelection(!cartUI.value.isAllSelected)
}

/**
 * 更新商品数量
 */
async function handleQuantityChange(itemId: string, quantity: number) {
  await updateQuantity(itemId, quantity)
}

/**
 * 打开删除确认（弹窗挂在抽屉根节点，避免被 Slideover 遮挡）
 */
function handleRequestRemove(itemId: string) {
  removingItemId.value = itemId
  showRemoveConfirm.value = true
}

/**
 * 删除商品
 */
async function handleRemove(itemId: string) {
  await removeItem(itemId)
}

async function handleConfirmRemove() {
  if (!removingItemId.value) return
  const itemId = removingItemId.value
  try {
    await handleRemove(itemId)
  } finally {
    removingItemId.value = null
    showRemoveConfirm.value = false
  }
}

/**
 * 前往结算
 */
function handleCheckout() {
  if (!cartUI.value.canCheckout) return
  handleClose()
  const checkoutPath = localePath('/checkout')
  if (route.path === checkoutPath) {
    router.replace({ path: checkoutPath, query: { t: Date.now().toString() } })
  } else {
    router.push(checkoutPath)
  }
}

/**
 * 查看购物袋
 */
function handleViewCart() {
  handleClose()
  router.push(localePath('/cart'))
}
</script>

<style scoped>
.mini-cart-scroll::-webkit-scrollbar {
  width: 4px;
}

.mini-cart-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.mini-cart-scroll::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.mini-cart-scroll::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

/* 抽屉宽度 560px，强制使用横向滚动布局而非 PC 五列轮播 */
.mini-cart-recommendations :deep(.hidden.lg\:flex) {
  display: none !important;
}

.mini-cart-recommendations :deep(.lg\:hidden) {
  display: block !important;
}

.mini-cart-recommendations :deep(.flex.justify-center.px-4.py-8) {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
