<template>
  <div class="min-h-screen bg-white">
    <!-- 页面标题 - 根据 Figma 设计 -->
    <div
      class="content-stretch flex items-center px-[16px] lg:px-[128px] py-[16px] relative w-full"
    >
      <p class="font-['Noto_Sans_SC'] font-medium leading-[48px] text-[24px] text-[#191a1d]">
        {{ t('b4f35314.53754b') }}
      </p>
    </div>

    <!-- 购物车内容 -->
    <div
      class="px-[16px] lg:px-[128px] pt-[32px] pb-0 lg:pb-[64px] bg-white flex flex-col min-h-[calc(100vh-80px)]"
    >
      <!-- 加载状态：首次加载或正在加载 -->
      <div v-if="!initialized || loading" class="flex justify-center py-20">
        <ECLoading />
      </div>

      <!-- 空购物车状态：只在初始化完成且数据为空时显示 -->
      <div
        v-else-if="initialized && cartUI.isEmpty"
        class="flex flex-col items-center justify-center py-20 bg-white rounded-lg"
      >
        <svg
          class="w-24 h-24 mb-6 text-gray-300"
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
        <p class="text-xl text-gray-600 mb-2">{{ t('b4f35314.fa0a45') }}</p>
        <p class="text-sm text-gray-400 mb-6">{{ t('b4f35314.723c28') }}</p>
        <NuxtLink
          :to="localePath('/products')"
          class="px-8 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          {{ t('b4f35314.c8e79c') }}
        </NuxtLink>
      </div>

      <!-- 购物车有商品 -->
      <div
        v-else
        class="content-stretch flex flex-col lg:flex-row gap-[32px] lg:gap-[128px] items-start justify-center flex-1"
      >
        <!-- 左侧：商品列表容器 -->
        <div
          class="w-full lg:basis-0 bg-white content-stretch flex flex-col gap-[32px] lg:grow items-start min-h-px min-w-px relative shrink-0"
        >
          <!-- 全选区域 - 桌面端显示 -->
          <div
            class="hidden lg:flex border-[0px_0px_1px] border-[#e5e7eb] border-solid content-stretch gap-[8px] items-center pb-[17px] pt-0 px-0 relative shrink-0 w-full"
          >
            <ECCheckbox
              :checked="cartUI.isAllSelected && cartUI.itemCount > 0"
              size="sm"
              :label="t('79fdede9.66eeac')"
              @change="handleToggleAll"
            />
          </div>

          <!-- 商品列表：BCMiniCartItem 为多根节点，class 无法整组件隐藏，需外层包裹 -->
          <div
            v-for="item in cartUI.items"
            :key="item.id"
            class="content-stretch flex flex-col items-start relative shrink-0 w-full"
          >
            <div class="hidden w-full lg:block">
              <BCCartItem
                :item="item"
                :loading="loading"
                @toggle-selection="handleToggleSelection"
                @quantity-change="handleQuantityChange"
                @remove="handleRemove"
              />
            </div>
            <div class="w-full lg:hidden">
              <BCMiniCartItem
                :item="item"
                :loading="loading"
                show-remove
                @toggle-selection="handleToggleSelection"
                @quantity-change="handleQuantityChange"
                @remove="handleRemove"
              />
            </div>
          </div>

          <!-- 失效商品列表 -->
          <div v-if="cartUI.invalidItems.length > 0" class="w-full mt-8">
            <div class="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h3 class="text-base font-medium text-gray-500">
                {{ t('b4f35314.6fd47f') }} ({{ cartUI.invalidItems.length }})
              </h3>
            </div>
            <div
              v-for="item in cartUI.invalidItems"
              :key="item.id"
              class="content-stretch flex flex-col items-start relative shrink-0 w-full mb-4"
            >
              <BCCartItem :item="item" :loading="loading" @remove="handleRemove" />
            </div>
          </div>
        </div>

        <!-- 右侧：订单汇总 - 桌面端显示 -->
        <div class="hidden lg:block lg:w-auto lg:sticky lg:top-4 h-fit">
          <BCOrderSummary
            :selected-count="cartUI.selectedCount"
            :subtotal-display="cartUI.cartTotalDisplay"
            :discount-display="cartUI.discountFeeDisplay"
            :discount-amount="cartStore.discountFee / 100"
            :total-display="cartUI.finalTotalDisplay"
            :disabled="!cartUI.canCheckout"
            :loading="loading"
            @checkout="handleCheckout"
          />
        </div>
      </div>

      <!-- 移动端：粘性吸底结算区域 -->
      <div
        v-if="!cartUI.isEmpty"
        class="lg:hidden sticky bottom-0 bg-white border-t border-[#e5e7eb] z-40 mt-auto -mx-[16px]"
      >
        <div
          class="content-stretch flex flex-col gap-[16px] items-start p-[16px] w-full"
          style="padding-bottom: max(16px, env(safe-area-inset-bottom))"
        >
          <!-- 全选区域 -->
          <div
            class="border-[0px_0px_1px] border-[#e5e7eb] border-solid content-stretch flex gap-[8px] items-center pb-[17px] pt-0 px-0 relative shrink-0 w-full"
          >
            <ECCheckbox
              :checked="cartUI.isAllSelected && cartUI.itemCount > 0"
              size="sm"
              :label="t('79fdede9.66eeac')"
              @change="handleToggleAll"
            />
          </div>

          <!-- 优惠和总计 -->
          <div
            class="content-stretch flex h-[20px] items-center justify-between pl-0 pr-[0.008px] py-0 relative shrink-0 w-full"
          >
            <div class="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div
                v-if="cartStore.discountFee > 0"
                class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex font-['Noto_Sans_SC'] font-normal items-center leading-[20px] relative text-[14px] text-[#d0112f] text-nowrap"
              >
                <p class="relative shrink-0">{{ t('b60e45d1.dd2fd1') }}</p>
                <p class="relative shrink-0">{{ cartUI.discountFeeDisplay }}</p>
              </div>
            </div>
            <div class="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div
                class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-end leading-[20px] relative text-[#191a1d] text-nowrap w-full"
              >
                <p class="font-['Noto_Sans_SC'] font-normal relative shrink-0 text-[14px]">
                  {{ t('b4f35314.e2c2bc') }}
                </p>
                <p class="font-['Inter'] font-medium not-italic relative shrink-0 text-[16px]">
                  {{ cartUI.finalTotalDisplay }}
                </p>
              </div>
            </div>
          </div>

          <!-- 前往结算按钮 -->
          <div
            class="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full"
          >
            <button
              class="bg-[#0f0f10] relative shrink-0 w-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-black transition-colors"
              :disabled="!cartUI.canCheckout || loading"
              @click="handleCheckout"
            >
              <div
                class="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center px-0 py-[16px] relative w-full"
              >
                <p
                  class="font-['Noto_Sans_SC'] font-medium leading-[20px] relative shrink-0 text-[14px] text-center text-nowrap text-white"
                >
                  {{ loading ? t('b4f35314.2fb90b') : t('b4f35314.f7f353') }}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

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
/**
 * 购物车页面
 *
 * 根据 Figma 设计实现，展示购物袋内容和结算功能
 */
import { ECCheckbox } from '~/components/ECCheckbox'
import BCCartItem from '~/components/BCCartItem/BCCartItem.vue'
import BCMiniCartItem from '~/components/BCMiniCartItem/BCMiniCartItem.vue'
import BCProductRecommendations from '~/components/BCProductRecommendations/BCProductRecommendations.vue'
import { useRecommendationAddToCart } from '~/composables/useRecommendationAddToCart'
import {
  normalizeRecommendationItemIds,
  resolveRecommendationMainItemId,
} from '~/utils/normalizeRecommendationItemIds'

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const cartStore = useCartStore()
const {
  cartUI,
  loading,
  loadCart,
  toggleItemSelection,
  toggleAllSelection,
  updateQuantity,
  removeItem,
  removeSelectedItems,
} = useCart()

// 追踪是否完成首次加载
const initialized = ref(false)

const cartMainItemIds = computed(() =>
  normalizeRecommendationItemIds(
    cartUI.value.items.filter((item) => item.selected).map(resolveRecommendationMainItemId)
  )
)

const { products: recommendedProducts, visible: recommendationsVisible } = useProductRecommendations({
  scene: 'cart',
  mainItemIds: cartMainItemIds,
  enabled: computed(() => initialized.value && cartMainItemIds.value.length > 0),
})

const { addingProductId: recommendationAddingId, handleRecommendationAdd } =
  useRecommendationAddToCart({ mode: 'cart' })

/**
 * 加载购物车数据
 */
onMounted(async () => {
  await loadCart()
  initialized.value = true
})

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
 * 删除商品
 */
async function handleRemove(itemId: string) {
  await removeItem(itemId)
}

/**
 * 删除选中的商品
 */
async function handleRemoveSelected() {
  if (!cartUI.value.hasSelectedItems) return
  await removeSelectedItems()
}

/**
 * 去结算
 */
function handleCheckout() {
  if (!cartUI.value.canCheckout) return
  router.push(localePath('/checkout'))
}
</script>
