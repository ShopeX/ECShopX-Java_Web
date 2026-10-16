<template>
  <div class="bg-white min-h-screen">
    <!-- PC 端布局：与会员中心标准布局（account/index.vue）一致 -->
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
          <AccountMenu v-model="activeMenu" />
        </div>

        <!-- 右侧内容区域 -->
        <div
          class="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative min-w-0"
        >
          <div
            class="bg-white content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full"
          >
            <!-- 页面标题 -->
            <div class="relative shrink-0 w-full border-b border-[#f3f4f6] pb-4">
              <h2
                class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#101828] text-[16px] whitespace-nowrap"
              >
                {{ t('8b2de97c.b3bf09') }}
              </h2>
            </div>

            <!-- 评价列表：同步 Figma 2657:8443 -->
            <div v-if="loading && reviews.length === 0" class="w-full space-y-8 pt-4">
              <div v-for="i in 3" :key="i" class="border-b border-[#e5e7eb] pb-8">
                <USkeleton class="h-24 w-24 mb-4" />
                <USkeleton class="h-4 w-full mb-2" />
                <USkeleton class="h-4 w-2/3" />
              </div>
            </div>

            <div v-else-if="reviews.length > 0" class="w-full flex flex-col">
              <div
                v-for="(review, index) in reviews"
                :key="index"
                class="flex flex-col gap-4 py-8 border-b border-[#e5e7eb] last:border-0"
              >
                <!-- 商品行 -->
                <div class="flex items-start gap-4">
                  <img
                    :src="review.itemImage"
                    class="w-20 h-20 object-cover bg-[#f9fafb] shrink-0"
                    alt=""
                  />
                  <div class="flex-1 min-w-0 flex flex-col gap-1">
                    <h3 class="text-[14px] font-medium leading-5 text-[#191a1d] truncate">
                      {{ review.itemName }}
                    </h3>
                    <div class="flex flex-col gap-0.5 text-[12px] text-[#4a5565]">
                      <p v-if="review.skuNo">{{ t('ee3264ed.e54891') }}: {{ review.skuNo }}</p>
                      <p v-if="review.style">{{ t('ee3264ed.568510') }}: {{ review.style }}</p>
                      <p v-if="review.size">{{ t('ee3264ed.c8339f') }}: {{ review.size }}</p>
                      <p v-else-if="review.specName">{{ review.specName }}</p>
                    </div>
                  </div>
                </div>

                <!-- 评价内容区 -->
                <div class="flex flex-col gap-4">
                  <div class="flex items-center gap-2">
                    <div class="flex items-center">
                      <svg
                        v-for="star in 5"
                        :key="star"
                        viewBox="0 0 24 24"
                        class="w-5 h-5"
                        :class="star <= review.star ? 'text-[#fdc700]' : 'text-[#e5e7eb]'"
                        fill="currentColor"
                      >
                        <path
                          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        />
                      </svg>
                    </div>
                    <span class="text-[14px] text-[#4a5565]">{{ getStarLabel(review.star) }}</span>
                  </div>
                  <p class="text-[14px] leading-5 text-[#191a1d]">
                    {{ review.content }}
                  </p>
                  <p class="text-[12px] text-[#4a5565]">
                    {{ review.time }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div
              v-else-if="!loading"
              class="w-full flex flex-col items-center py-20 text-[#99a1af]"
            >
              <UIcon
                name="i-heroicons-chat-bubble-bottom-center-text"
                class="w-16 h-16 opacity-20 mb-4"
              />
              <p class="text-[14px]">{{ t('de8076e6.2c51b5') }}</p>
            </div>

            <!-- 分页 -->
            <div v-if="total > pageSize" class="w-full py-8">
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

    <!-- H5 端布局：使用通用的 AccountH5FilterBar -->
    <div class="flex flex-col min-h-screen md:hidden">
      <AccountH5FilterBar :title="t('8b2de97c.b3bf09')" />

      <div class="flex flex-col items-start px-4 flex-1 w-full bg-white">
        <div v-if="loading && reviews.length === 0" class="w-full space-y-6 py-6">
          <div v-for="i in 3" :key="i" class="border-b border-[#e5e7eb] pb-6">
            <USkeleton class="h-20 w-20 mb-4" />
            <USkeleton class="h-4 w-full" />
          </div>
        </div>

        <div v-else-if="reviews.length > 0" class="w-full flex flex-col">
          <div
            v-for="(review, index) in reviews"
            :key="index"
            class="flex flex-col gap-4 py-6 border-b border-[#e5e7eb] last:border-0"
          >
            <div class="flex items-start gap-4">
              <img
                :src="review.itemImage"
                class="w-20 h-20 object-cover bg-[#f9fafb] shrink-0"
                alt=""
              />
              <div class="flex-1 min-w-0 flex flex-col gap-1">
                <h3 class="text-[14px] font-medium leading-5 text-[#191a1d] truncate">
                  {{ review.itemName }}
                </h3>
                <div class="flex flex-col gap-0.5 text-[12px] text-[#4a5565]">
                  <p v-if="review.skuNo">{{ t('7b21da5b.e54891') }}: {{ review.skuNo }}</p>
                  <p v-if="review.style">{{ t('7b21da5b.568510') }}: {{ review.style }}</p>
                  <p v-if="review.size">{{ t('7b21da5b.c8339f') }}: {{ review.size }}</p>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-2">
                <div class="flex items-center">
                  <svg
                    v-for="star in 5"
                    :key="star"
                    viewBox="0 0 24 24"
                    class="w-4 h-4"
                    :class="star <= review.star ? 'text-[#fdc700]' : 'text-[#e5e7eb]'"
                    fill="currentColor"
                  >
                    <path
                      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    />
                  </svg>
                </div>
              </div>
              <p class="text-[14px] leading-5 text-[#191a1d]">
                {{ review.content }}
              </p>
              <p class="text-[12px] text-[#4a5565]">
                {{ review.time }}
              </p>
            </div>
          </div>
        </div>

        <div v-else-if="!loading" class="w-full flex flex-col items-center py-20 text-[#99a1af]">
          <UIcon
            name="i-heroicons-chat-bubble-bottom-center-text"
            class="w-16 h-16 opacity-20 mb-4"
          />
          <p class="text-[14px]">{{ t('de8076e6.2c51b5') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AccountMenu from './components/AccountMenu.vue'
import AccountH5FilterBar from './components/AccountH5FilterBar.vue'
import { orderApiClient } from '~/infrastructure/http/clients/OrderApiClient'
import { OrderTransformer } from '~/infrastructure/transformers/orderTransformer'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const router = useRouter()

const activeMenu = ref('reviews')
const reviews = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

function getStarLabel(star: number) {
  const labels: Record<number, string> = {
    1: '7b21da5b.7334ed',
    2: '7b21da5b.a3d534',
    3: '7b21da5b.2ab01e',
    4: '7b21da5b.195b8a',
    5: '7b21da5b.67e6ef',
  }
  const key = labels[star]
  return key ? t(key) : ''
}

async function loadData(page = 1) {
  loading.value = true
  try {
    const params = {
      page,
      pageSize: pageSize.value,
      is_rate: '1',
    }
    const response = await orderApiClient.getOrderList(params)
    const result = OrderTransformer.toOrderListModel(response)

    const mappedReviews: any[] = []
    result.orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        mappedReviews.push({
          itemName: item.itemName,
          itemImage: item.itemImage,
          skuNo: item.skuNo,
          style: item.style,
          size: item.size,
          specName: item.specName,
          star: 5,
          content: t('7b21da5b.d4f604'),
          time: '2025-10-30 23:34:23',
        })
      })
    })

    reviews.value = mappedReviews
    total.value = result.total
    currentPage.value = page
  } catch (error) {
    console.error('Failed to load reviews:', error)
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  loadData(page)
}

onMounted(() => {
  loadData()
})
</script>
