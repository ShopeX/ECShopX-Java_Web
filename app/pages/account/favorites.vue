<template>
  <div class="bg-white min-h-screen">
    <!-- PC 端布局：与 account/index.vue 一致 -->
    <div
      class="hidden md:flex content-stretch items-start justify-center px-[128px] py-[32px] relative shrink-0 w-full"
    >
      <div
        class="content-stretch flex flex-[1_0_0] gap-[64px] items-start min-h-px min-w-px relative lg:min-h-[calc(100vh-var(--layout-header-height,68px)-64px)]"
      >
        <!-- 左侧菜单 -->
        <div
          class="w-64 shrink-0 lg:self-start lg:sticky lg:top-[var(--layout-header-height,68px)]"
        >
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </div>

        <!-- 右侧内容区域 -->
        <div
          class="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative"
        >
          <div
            class="bg-white content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full"
          >
            <div class="relative shrink-0 w-full">
              <div
                class="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative w-full"
              >
                <h2
                  class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#101828] text-[16px] whitespace-nowrap"
                >
                  {{ t('8b2de97c.975ff6') }}
                </h2>
              </div>
            </div>

            <!-- 加载中 -->
            <div
              v-if="loading"
              class="py-16 text-center text-[#4a5565] font-['Noto_Sans_SC:Regular',sans-serif] text-[14px] w-full"
            >
              {{ t('de8076e6.26b5bd') }}
            </div>
            <!-- 收藏商品网格 - 每行 4 个 -->
            <div
              v-else-if="productList.length > 0"
              class="relative shrink-0 w-full content-stretch flex flex-col gap-[16px] items-start"
            >
              <div
                v-for="(row, rowIndex) in productRows"
                :key="rowIndex"
                class="grid grid-cols-4 gap-6 w-full"
              >
                <FavoriteProductCard
                  v-for="product in row"
                  :key="product.id"
                  :product="product"
                  @select="goToProductDetail(product.id)"
                  @remove="handleRemoveFavorite"
                />
              </div>
            </div>
            <!-- 空状态 -->
            <div
              v-else
              class="py-16 text-center text-[#4a5565] font-['Noto_Sans_SC:Regular',sans-serif] text-[14px] w-full"
            >
              {{ t('6d935aa9.c8a595') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- H5 端布局（本需求验收范围） -->
    <ClientOnly>
      <div
        class="flex flex-col min-h-screen md:hidden overflow-x-hidden"
        data-testid="account-favorites-page"
      >
        <div data-testid="account-favorites-filter-bar">
          <AccountH5FilterBar :title="t('8b2de97c.975ff6')" :active-key="activeMenu" />
        </div>

        <!-- 收藏列表：按 Figma 375/343 节奏铺开，双列无缝拼接 -->
        <div class="flex-1 pb-8">
          <div v-if="loading" class="px-4 py-16 text-center text-[#4a5565]">
            {{ t('de8076e6.26b5bd') }}
          </div>
          <div
            v-else-if="productList.length > 0"
            class="w-full"
            data-testid="account-favorites-list"
          >
            <div
              v-for="(row, rowIndex) in mobileProductRows"
              :key="rowIndex"
              class="flex items-start px-4"
            >
              <div
                v-for="product in row"
                :key="product.id"
                class="min-h-px min-w-px flex-[1_0_0]"
                data-testid="account-favorites-item"
              >
                <FavoriteProductCard
                  :product="product"
                  :show-remove-button="true"
                  @select="goToProductDetail(product.id)"
                  @remove="handleRemoveFavorite"
                />
              </div>
              <div v-if="row.length === 1" class="min-h-px min-w-px flex-[1_0_0] bg-white" />
            </div>
          </div>
          <div
            v-else
            class="px-4 py-16 text-center text-sm text-[#4a5565]"
            data-testid="account-favorites-empty"
          >
            {{ t('6d935aa9.c8a595') }}
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToastMessage } from '~/composables/useToastMessage'
import AccountMenu from './components/AccountMenu.vue'
import AccountH5FilterBar from './components/AccountH5FilterBar.vue'
import FavoriteProductCard from './components/FavoriteProductCard.vue'
import { collectApiClient } from '~/infrastructure/http/clients/CollectApiClient'
import {
  CollectItemTransformer,
  type IFavoriteProduct,
} from '~/infrastructure/transformers/collectItemTransformer'

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const toast = useToastMessage()
const activeMenu = ref('favorites')
const favoritesResponse = ref<any>({ data: { list: [] } })
const loading = ref(false)

const productList = computed<IFavoriteProduct[]>(() => {
  return CollectItemTransformer.toFavoriteList(
    favoritesResponse.value?.data ?? favoritesResponse.value ?? { list: [] }
  )
})

// PC 端每行 4 个的二维数组
const productRows = computed(() => {
  const rows: IFavoriteProduct[][] = []
  for (let i = 0; i < productList.value.length; i += 4) {
    rows.push(productList.value.slice(i, i + 4))
  }
  return rows
})

// H5 端每行 2 个的二维数组，贴合 Figma 双列节奏
const mobileProductRows = computed(() => {
  const rows: IFavoriteProduct[][] = []
  for (let i = 0; i < productList.value.length; i += 2) {
    rows.push(productList.value.slice(i, i + 2))
  }
  return rows
})

function handleLogout() {
  console.log('用户已退出登录')
}

async function fetchFavorites() {
  loading.value = true
  try {
    favoritesResponse.value = await collectApiClient.getCollectItemList()
  } catch (err) {
    console.error('获取收藏列表失败:', err)
    favoritesResponse.value = { data: { list: [] } }
  } finally {
    loading.value = false
  }
}

async function handleRemoveFavorite(productId: string | number) {
  try {
    await collectApiClient.removeCollectItems([String(productId)])
    const currentData = favoritesResponse.value?.data ?? favoritesResponse.value ?? {}
    const currentList = Array.isArray(currentData.list) ? currentData.list : []
    const nextList = currentList.filter((item: any) => {
      const currentItemId = String(
        item.id ?? item.item_id ?? item.goods_id ?? item.collect_id ?? ''
      )
      return currentItemId !== String(productId)
    })
    favoritesResponse.value = { data: { list: nextList } }
    toast.show(t('6d935aa9.b46077'))
  } catch (err) {
    console.error('移除收藏失败:', err)
    toast.show(t('6d935aa9.8bd80b'))
  }
}

function goToProductDetail(productId: string | number) {
  router.push(localePath(`/products/${productId}`))
}

onMounted(() => {
  fetchFavorites()
})
</script>
