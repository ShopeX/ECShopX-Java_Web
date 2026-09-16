<template>
  <div class="bg-white min-h-screen">
    <!-- PC 端布局：与原有一致，带左侧菜单 -->
    <div
      class="hidden md:flex content-stretch items-start justify-center px-[128px] py-[32px] relative shrink-0 w-full"
    >
      <div
        class="content-stretch flex flex-[1_0_0] gap-[64px] items-start min-h-px min-w-px relative lg:min-h-[calc(100vh-var(--layout-header-height,68px)-64px)]"
      >
        <div
          class="w-64 shrink-0 lg:self-start lg:sticky lg:top-[var(--layout-header-height,68px)]"
        >
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </div>
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
                  {{ t('96a0d248.4f7a2a') }}
                </h2>
              </div>
            </div>
            <div class="relative shrink-0 w-full">
              <div
                class="border border-[#e5e7eb] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px px-[17px] py-[33px] relative"
              >
                <div
                  class="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full"
                >
                  <div
                    class="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center justify-center relative whitespace-nowrap"
                  >
                    <span
                      class="font-['Noto_Sans_SC:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-[color:var(--color次亚黑,#4a5565)]"
                      >{{ t('96a0d248.b97575') }}</span
                    >
                    <USkeleton v-if="loadingInfo" class="h-9 w-20" />
                    <span
                      v-else
                      class="font-['Inter:Medium',sans-serif] font-medium leading-[36px] not-italic relative shrink-0 text-[36px] text-[color:var(--color黑,#191a1d)]"
                      data-testid="point-total"
                    >
                      {{ pointTotal }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="bg-white content-stretch flex flex-col gap-[16px] items-center py-[32px] relative shrink-0 w-full"
          >
            <div class="relative shrink-0 w-full">
              <div
                class="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full"
              >
                <h2
                  class="font-['Inter:Medium','Noto_Sans_SC:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[16px] text-[color:var(--color黑,#191a1d)] whitespace-nowrap"
                >
                  {{ t('96a0d248.2076e8') }}
                </h2>
              </div>
            </div>
            <div
              v-if="loadingList"
              class="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full"
            >
              <div
                v-for="i in 3"
                :key="i"
                class="content-stretch flex flex-col gap-[8px] items-start relative w-full"
              >
                <USkeleton class="h-5 w-32" />
                <div class="flex items-center justify-between w-full">
                  <USkeleton class="h-5 w-48" />
                  <USkeleton class="h-5 w-12" />
                </div>
              </div>
            </div>
            <div
              v-else-if="pointRecords.length > 0"
              class="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full"
            >
              <div
                v-for="(record, index) in pointRecords"
                :key="index"
                class="content-stretch flex flex-col gap-[8px] items-start relative w-full"
              >
                <div
                  class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[16px] text-[color:var(--color黑,#191a1d)] whitespace-nowrap"
                >
                  {{ formatItemTime(record) }}
                </div>
                <div
                  class="content-stretch flex items-center justify-between leading-[20px] relative shrink-0 text-[14px] w-full whitespace-nowrap"
                >
                  <span
                    class="font-['Noto_Sans_SC:Regular',sans-serif] font-normal relative shrink-0 text-[color:var(--color次亚黑,#4a5565)]"
                    >{{ record.point_desc || record.description }}</span
                  >
                  <span
                    class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium relative shrink-0 text-[color:var(--color黑,#191a1d)]"
                    >{{ formatItemPoint(record) }}</span
                  >
                </div>
              </div>
            </div>
            <div
              v-else
              class="py-8 text-center text-gray-500 font-['Noto_Sans_SC:Regular',sans-serif] text-[14px]"
            >
              {{ t('96a0d248.551786') }}
            </div>
            <div v-if="totalPages > 1 && pointRecords.length > 0" class="w-full">
              <ECPagination
                :total="totalCount"
                :page-size="pageSize"
                :current-page="pageNo"
                data-testid="point-pagination"
                @update:current-page="handlePageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- H5 端布局：与 Figma 2955:17036（H5-个人中心）一致，FilterBar 使用 2896:3722 组件 -->
    <div class="flex flex-col min-h-screen md:hidden">
      <AccountH5FilterBar :title="t('96a0d248.4f7a2a')" />

      <!-- 内容区：2956:17478，px-16 -->
      <div class="flex flex-col items-start px-4 flex-1 w-full">
        <!-- 积分卡片：2956:17479，单块边框 #e5e7eb、px-[17px] py-[33px] -->
        <div class="bg-white flex flex-col items-center w-full">
          <div class="w-full">
            <div
              class="border border-[#e5e7eb] rounded-none flex flex-col items-start px-[17px] py-[33px]"
            >
              <div class="flex gap-4 items-center justify-center w-full">
                <span
                  class="font-['Noto_Sans_SC:Regular',sans-serif] text-[14px] leading-5 text-[#4a5565]"
                  >{{ t('96a0d248.b97575') }}</span
                >
                <USkeleton v-if="loadingInfo" class="h-9 w-20" />
                <span
                  v-else
                  class="font-['Inter',sans-serif] font-medium text-[36px] leading-[36px] text-[#191a1d]"
                  data-testid="point-total"
                >
                  {{ pointTotal }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 积分明细：2956:17491，py-[32px]、标题 16px #191a1d、列表 gap-[8px] -->
        <div class="bg-white flex flex-col gap-4 items-center py-8 w-full">
          <div class="w-full">
            <div class="flex items-center justify-between w-full">
              <h2
                class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-5 text-[16px] text-[#191a1d] whitespace-nowrap"
              >
                {{ t('96a0d248.2076e8') }}
              </h2>
            </div>
          </div>
          <div v-if="loadingList" class="flex flex-col gap-4 items-start w-full">
            <div v-for="i in 3" :key="i" class="flex flex-col gap-2 items-start w-full">
              <USkeleton class="h-5 w-32" />
              <div class="flex items-center justify-between w-full">
                <USkeleton class="h-5 w-48" />
                <USkeleton class="h-5 w-12" />
              </div>
            </div>
          </div>
          <div v-else-if="pointRecords.length > 0" class="flex flex-col gap-4 items-start w-full">
            <div
              v-for="(record, index) in pointRecords"
              :key="index"
              class="flex flex-col gap-2 items-start w-full"
            >
              <p
                class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium leading-5 text-[16px] text-[#191a1d]"
              >
                {{ formatItemTime(record) }}
              </p>
              <div class="flex items-center justify-between leading-5 text-[14px] w-full">
                <span class="font-['Noto_Sans_SC:Regular',sans-serif] text-[#4a5565]">{{
                  record.point_desc || record.description
                }}</span>
                <span class="font-['Noto_Sans_SC:Medium',sans-serif] font-medium text-[#191a1d]">{{
                  formatItemPoint(record)
                }}</span>
              </div>
            </div>
          </div>
          <div
            v-else
            class="py-8 text-center text-gray-500 font-['Noto_Sans_SC:Regular',sans-serif] text-[14px]"
          >
            {{ t('96a0d248.551786') }}
          </div>
          <div v-if="totalPages > 1 && pointRecords.length > 0" class="w-full">
            <ECPagination
              :total="totalCount"
              :page-size="pageSize"
              :current-page="pageNo"
              data-testid="point-pagination"
              @update:current-page="handlePageChange"
            />
          </div>
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
import { useMemberPoint } from '~/composables/useMemberPoint'

// 设置页面元信息
definePageMeta({
  layout: 'default',
})

const router = useRouter()
const { t } = useI18n()

const {
  pointTotal,
  list: pointRecords,
  init,
  loadList,
  formatItemTime,
  formatItemPoint,
  loadingList,
  loadingInfo,
  totalCount,
  pageSize,
  pageNo,
  totalPages,
} = useMemberPoint()

function handlePageChange(page: number) {
  pageNo.value = page
  loadList(true)
}

// 当前激活的菜单项
const activeMenu = ref('profile')

onMounted(() => {
  init()
})

/**
 * 处理退出登录
 */
function handleLogout() {
  console.log('用户已退出登录')
}
</script>
