<template>
  <div class="bg-white min-h-screen pb-32 lg:pb-16 pt-4 lg:pt-8 px-4 lg:px-[120px]">
    <div
      class="flex flex-col lg:flex-row gap-8 lg:gap-20 items-start justify-center max-w-[1440px] mx-auto"
    >
      <!-- 左侧：配送信息、优惠券、积分、发票 -->
      <div class="w-full lg:flex-1 flex flex-col gap-8 lg:gap-2 min-w-0">
        <!-- 配送信息 -->
        <div class="bg-white flex flex-col gap-4 p-4 lg:p-6">
          <h3 class="text-base font-medium text-[#101828] leading-5">
            {{ $t('ee3264ed.d4327c') }}
          </h3>

          <!-- 配送方式选择 -->
          <div class="flex flex-col gap-4">
            <p class="text-sm text-[#191a1d] leading-5">{{ $t('ee3264ed.7126bb') }}</p>
            <div class="flex gap-8 items-center">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  :checked="form.receiptType === 'logistics'"
                  class="w-4 h-4 border border-[#191a1d] rounded-full appearance-none checked:bg-[#191a1d] checked:border-[#191a1d] relative checked:after:content-[''] checked:after:absolute checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:start-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                  @change="form.receiptType = 'logistics'"
                />
                <span class="text-sm font-medium text-[#191a1d] leading-5">{{
                  $t('ee3264ed.790974')
                }}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  :checked="form.receiptType === 'ziti'"
                  class="w-4 h-4 border border-[#191a1d] rounded-full appearance-none checked:bg-[#191a1d] checked:border-[#191a1d] relative checked:after:content-[''] checked:after:absolute checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:start-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                  @change="form.receiptType = 'ziti'"
                />
                <span class="text-sm font-medium text-[#191a1d] leading-5">{{
                  $t('ee3264ed.7f549e')
                }}</span>
              </label>
            </div>
          </div>

          <!-- ========== 快递配送：地址选择 ========== -->
          <template v-if="form.receiptType === 'logistics'">
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <h4 class="text-base font-medium text-[#191a1d] leading-5">
                  {{ $t('ee3264ed.748ea9') }}
                </h4>
                <button
                  class="bg-white border border-[#e5e7eb] px-[17px] py-[9px] hover:bg-gray-50 transition-colors"
                  @click="handleAddAddress"
                >
                  <span class="text-xs font-medium text-[#191a1d] leading-4">{{
                    $t('ee3264ed.dd4bb4')
                  }}</span>
                </button>
              </div>

              <!-- 加载中骨架屏 -->
              <div v-if="initialAddressesLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div
                  v-for="i in 2"
                  :key="i"
                  class="border p-[17px] flex flex-col gap-4 border-[#e5e7eb]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <USkeleton class="h-5 w-16" />
                      <USkeleton class="h-5 w-24" />
                    </div>
                    <USkeleton class="h-4 w-12" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <USkeleton class="h-5 w-32" />
                    <USkeleton class="h-5 w-full" />
                  </div>
                </div>
              </div>

              <!-- 地址列表 -->
              <div v-else-if="addresses.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div
                  v-for="address in addresses"
                  :key="address.id"
                  class="border p-[17px] flex flex-col gap-4 cursor-pointer transition-colors"
                  :class="
                    selectedAddress?.id === address.id ? 'border-[#191a1d]' : 'border-[#e5e7eb]'
                  "
                  @click="selectAddress(address.id)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span
                        v-if="address.isDefault"
                        class="bg-[#f3f4f6] px-2 py-1 text-xs font-medium text-[#191a1d] leading-4"
                      >
                        {{ $t('ee3264ed.18c634') }}
                      </span>
                      <span class="text-sm font-medium text-[#191a1d] leading-5">
                        {{ address.name }}
                      </span>
                    </div>
                    <button
                      class="text-xs text-[#4a5565] underline leading-4"
                      @click.stop="handleEditAddress(address.id)"
                    >
                      {{ $t('ee3264ed.95b351') }}
                    </button>
                  </div>
                  <div class="flex flex-col gap-1">
                    <p class="text-sm text-[#4a5565] leading-5">{{ address.phone }}</p>
                    <p class="text-sm text-[#4a5565] leading-5">{{ address.fullAddress }}</p>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-else class="py-8 text-center text-[#4a5565]">
                {{ $t('ee3264ed.7daf4d') }}
              </div>
            </div>
          </template>

          <!-- ========== 门店自提 ========== -->
          <template v-else-if="form.receiptType === 'ziti'">
            <div class="flex flex-col gap-4">
              <!-- 收货人/手机号 -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-[#191a1d] leading-5">{{
                    $t('ee3264ed.ff9089')
                  }}</label>
                  <input
                    v-model="form.pickupName"
                    type="text"
                    :placeholder="$t('ee3264ed.1521d9')"
                    class="h-11 w-full bg-[#f3f4f6] border border-transparent px-3 text-[14px] leading-5 text-[#191a1d] outline-none focus:border-[#191a1d]"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-[#191a1d] leading-5">{{
                    $t('ee3264ed.8098e2')
                  }}</label>
                  <input
                    v-model="form.pickupPhone"
                    type="tel"
                    :placeholder="$t('ee3264ed.6e4f4b')"
                    class="h-11 w-full bg-[#f3f4f6] border border-transparent px-3 text-[14px] leading-5 text-[#191a1d] outline-none focus:border-[#191a1d]"
                  />
                </div>
              </div>

              <!-- 查询门店 -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#191a1d] leading-5">{{
                  $t('ee3264ed.d1b62f')
                }}</label>
                <div class="flex gap-4 items-end">
                  <div class="grid grid-cols-2 gap-4 flex-1">
                    <ECSelect
                      :model-value="form.pickupProvince"
                      :options="pickupProvinces"
                      :placeholder="$t('ee3264ed.3d14d1')"
                      @update:model-value="handlePickupProvinceChange($event)"
                    />
                    <ECSelect
                      :model-value="form.pickupCity"
                      :options="pickupCities"
                      :placeholder="$t('ee3264ed.371528')"
                      @update:model-value="form.pickupCity = String($event ?? '')"
                    />
                  </div>
                  <button
                    type="button"
                    :disabled="storesLoading"
                    class="h-10 shrink-0 bg-[#0f0f10] px-4 text-sm font-medium text-white leading-5 hover:bg-[#191a1d] transition-colors disabled:opacity-50 whitespace-nowrap"
                    @click="handleSearchStores"
                  >
                    {{ storesLoading ? $t('ee3264ed.4ea9bf') : $t('ee3264ed.e63bb6') }}
                  </button>
                </div>
              </div>

              <!-- 门店列表 -->
              <div v-if="storesLoading" class="flex flex-col gap-3 pt-2">
                <div v-for="i in 3" :key="i" class="flex items-start gap-3 animate-pulse">
                  <div class="w-4 h-4 rounded-full bg-[#e5e7eb] mt-0.5 shrink-0" />
                  <div class="flex-1 flex flex-col gap-1">
                    <div class="h-5 w-32 rounded bg-[#e5e7eb]" />
                    <div class="h-4 w-48 rounded bg-[#e5e7eb]" />
                    <div class="h-4 w-28 rounded bg-[#e5e7eb]" />
                  </div>
                </div>
              </div>

              <div v-else-if="stores.length > 0" class="flex flex-col gap-3 pt-2">
                <label
                  v-for="store in stores"
                  :key="store.id"
                  class="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    :checked="selectedStore?.id === store.id"
                    class="mt-0.5 w-4 h-4 border border-[#191a1d] rounded-full appearance-none checked:bg-[#191a1d] checked:border-[#191a1d] relative checked:after:content-[''] checked:after:absolute checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:start-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 shrink-0"
                    @change="selectStore(store.id)"
                  />
                  <div class="flex-1 flex flex-col gap-0.5">
                    <span class="text-sm font-medium text-[#191a1d] leading-5">{{
                      store.name
                    }}</span>
                    <span class="text-xs text-[#4a5565] leading-4">{{ store.address }}</span>
                    <span class="text-xs text-[#4a5565] leading-4">{{ store.phone }}</span>
                  </div>
                </label>
              </div>

              <div
                v-else-if="stores.length === 0 && !storesLoading && hasSearched"
                class="py-6 text-center text-sm text-[#4a5565]"
              >
                {{ $t('ee3264ed.9e6a2d') }}
              </div>
            </div>
          </template>
        </div>

        <!-- 收货地址下边框 -->
        <div class="mx-4 lg:mx-6 h-px bg-[rgba(0,0,0,0.1)]"></div>

        <!-- 优惠券 -->
        <div class="bg-white flex flex-col gap-4 p-4 lg:p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-medium text-[#101828] leading-5">
              {{ $t('ee3264ed.2f3635') }}
            </h3>
            <button
              type="button"
              class="flex items-center gap-2 cursor-pointer"
              data-testid="checkout-coupon-entry"
              @click="handleOpenCouponSelector"
            >
              <span v-if="selectedCoupon" class="text-sm text-[#191a1d] leading-5">
                {{ selectedCoupon.title }}
              </span>
              <span v-else class="text-sm text-[#191a1d] leading-5">{{
                $t('ee3264ed.45bcee')
              }}</span>
              <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-[#4a5565]" />
            </button>
          </div>
        </div>

        <!-- 优惠券下边框 -->
        <div class="mx-4 lg:mx-6 h-px bg-[rgba(0,0,0,0.1)]"></div>

        <!-- 积分抵扣 -->
        <div class="bg-white flex flex-col gap-4 p-4 lg:p-6 mb-4 lg:mb-6 rounded-md">
          <div class="flex items-center gap-2 relative" ref="popoverWrapperRef">
            <h3 class="text-[16px] font-medium text-[#101828] leading-[20px] whitespace-nowrap">
              {{ $t('ee3264ed.d443a9') }}
            </h3>
            <button
              type="button"
              class="flex items-center justify-center outline-none cursor-pointer relative z-[51]"
              @click.stop="showPointsRules = true"
            >
              <UIcon
                name="i-heroicons-information-circle"
                class="w-4 h-4 text-[#4a5565] pointer-events-none"
              />
            </button>

            <!-- PC 端弹窗 (大屏幕显示) -->
            <div
              v-show="showPointsRules"
              class="hidden lg:block absolute top-[32px] left-[70px] z-[61] bg-white px-[16px] shadow-[0px_2px_6px_0px_#dbdbdb] transition-opacity pointer-events-none"
            >
              <div
                class="bg-white flex flex-col gap-[8px] items-start justify-center p-[16px] text-[14px] whitespace-nowrap"
              >
                <div class="font-medium text-[#0f0f10] leading-[20px]">
                  {{ $t('ee3264ed.2e6e96') }}
                </div>
                <div class="text-[#4a5565] font-normal leading-[20px]">
                  {{ $t('ee3264ed.0f8505') }}
                </div>
                <div class="text-[#4a5565] font-normal leading-[20px]">
                  <p class="mb-0">{{ $t('ee3264ed.d2fec8') }}</p>
                  <p class="mb-0">{{ $t('ee3264ed.1ae505') }}</p>
                </div>
              </div>
            </div>

            <!-- H5 底部弹窗 (小屏幕显示) -->
            <Teleport to="body">
              <div
                v-if="showPointsRules"
                class="lg:hidden fixed inset-0 z-[100] flex flex-col justify-end pointer-events-auto"
                @touchmove.prevent
                @wheel.prevent
              >
                <!-- 遮罩背景 -->
                <div
                  class="absolute inset-0 bg-[#282828]/50 transition-opacity"
                  @click.stop="showPointsRules = false"
                ></div>

                <!-- H5 底部弹窗内容 -->
                <div
                  class="lg:hidden relative w-full bg-white flex flex-col gap-[16px] items-start px-[16px] py-[32px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-clip transform transition-transform"
                >
                  <div class="flex items-center justify-between w-full mb-2">
                    <p
                      class="font-medium leading-[20px] text-[20px] text-[#191a1d] whitespace-nowrap"
                    >
                      {{ $t('ee3264ed.117486') }}
                    </p>
                    <button
                      type="button"
                      class="block cursor-pointer outline-none w-[24px] h-[24px]"
                      @click.stop="showPointsRules = false"
                    >
                      <UIcon name="i-heroicons-x-mark" class="w-full h-full text-[#191a1d]" />
                    </button>
                  </div>
                  <div
                    class="text-[14px] font-normal text-[#4a5565] leading-[20px] w-full text-left"
                  >
                    {{ $t('ee3264ed.0f8505') }}
                  </div>
                  <div
                    class="text-[14px] font-normal text-[#4a5565] leading-[20px] w-full text-left"
                  >
                    <p class="mb-1">{{ $t('ee3264ed.d2fec8') }}</p>
                    <p class="mb-0">{{ $t('ee3264ed.1ae505') }}</p>
                  </div>
                </div>
              </div>
            </Teleport>
          </div>

          <div
            v-if="calculateResult"
            class="flex flex-col lg:flex-row lg:items-center justify-between gap-y-2 text-[14px] text-[#101828] font-medium leading-[20px]"
          >
            <span>{{ $t('ee3264ed.648843', { count: calculateResult?.userPoint || 0 }) }}</span>
            <span>{{ $t('ee3264ed.6c9425', { count: calculateResult?.maxPoint || 0 }) }}</span>
          </div>

          <ECCheckbox
            :checked="form.usePoint"
            size="sm"
            :label="$t('ee3264ed.f929c7')"
            @change="toggleUsePoint"
          />

          <div v-if="form.usePoint" class="flex items-center gap-2">
            <ECCheckbox
              :checked="form.useFullPoint"
              size="sm"
              :label="$t('ee3264ed.a23745')"
              @change="toggleUseFullPoint"
            />
            <input
              v-if="!form.useFullPoint"
              v-model.number="form.pointUse"
              type="number"
              :max="calculateResult?.maxPoint || 0"
              class="border border-[#99a1af] h-5 w-[100px] px-2 text-sm outline-none focus:border-[#101828]"
              @input="calculateOrderAmount"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：订单摘要 (PC 显示，H5 隐藏) -->
      <div
        class="hidden lg:flex lg:self-start lg:sticky lg:top-[calc(var(--layout-header-height,68px)+20px)] w-[420px] shrink-0 h-fit bg-white flex-col gap-8 p-6"
      >
        <!-- 商品数量 -->
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4 text-[#4a5565]" />
          <span class="text-sm text-[#4a5565] leading-5">{{
            $t('ee3264ed.26b6eb', { count: itemCount })
          }}</span>
        </div>

        <!-- 商品模块上边框 -->
        <div class="h-px bg-[rgba(0,0,0,0.1)]"></div>

        <!-- 商品列表 -->
        <div v-if="isCheckoutSummaryReady" class="flex flex-col gap-4">
          <div v-for="item in selectedItems" :key="item.id" class="flex gap-4">
            <div class="w-24 h-24 shrink-0 bg-[#f9fafb] relative overflow-hidden">
              <img
                :src="item.productImage || '/images/placeholder.png'"
                :alt="item.productName"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 flex flex-col gap-1 min-w-0">
              <BCProductMarketingTags :tags="item.marketingTags" placement="inline" />
              <div class="flex items-center gap-2 min-w-0">
                <h4 class="flex-1 min-w-0 text-sm font-medium text-[#101828] leading-5 truncate">
                  {{ item.productName }}
                </h4>
                <button
                  v-if="item.isCheckoutRecommendation"
                  type="button"
                  class="shrink-0 text-xs leading-4 text-[#4a5565] underline hover:text-red-600 disabled:opacity-50"
                  :disabled="removingRecommendationItemId === item.productId"
                  @click="handleRemoveCheckoutRecommendation(item.productId)"
                >
                  {{ $t('9864a2ba.2f4aad') }}
                </button>
              </div>
              <div
                v-if="item.specName"
                class="flex flex-col gap-0.5 text-xs text-[#364153] leading-4"
              >
                <p v-for="(spec, index) in formatSpec(item.specName)" :key="index">{{ spec }}</p>
              </div>
              <div class="flex items-center justify-between mt-auto">
                <span class="text-xs text-[#364153] leading-4"
                  >{{ $t('ee3264ed.0bf60b') }}: {{ item.quantity }}</span
                >
                <span class="text-sm font-medium text-[#191a1d] leading-5">
                  {{ item.subtotalDisplay }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col gap-4">
          <div
            v-for="i in 2"
            :key="`checkout-summary-desktop-skeleton-${i}`"
            class="flex gap-4 animate-pulse"
          >
            <div class="h-24 w-24 shrink-0 bg-[#f3f4f6]" />
            <div class="flex-1 flex flex-col gap-3 py-1">
              <div class="h-4 w-4/5 bg-[#f3f4f6]" />
              <div class="h-3 w-3/5 bg-[#f3f4f6]" />
              <div class="mt-auto flex items-center justify-between">
                <div class="h-3 w-16 bg-[#f3f4f6]" />
                <div class="h-4 w-20 bg-[#f3f4f6]" />
              </div>
            </div>
          </div>
        </div>

        <!-- 商品模块下边框 -->
        <div class="h-px bg-[rgba(0,0,0,0.1)]"></div>

        <!-- 价格明细 -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#4a5565] leading-5">{{ $t('ee3264ed.de8e9a') }}</span>
            <span class="text-sm text-[#191a1d] leading-5">{{ itemTotalDisplay }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#4a5565] leading-5">{{ $t('ee3264ed.9a935b') }}</span>
            <span class="text-sm text-[#191a1d] leading-5">{{ freightDisplayText }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#4a5565] leading-5">{{ $t('ee3264ed.f06ebf') }}</span>
            <span class="text-sm text-[#191a1d] leading-5">{{ discountDisplay }}</span>
          </div>
          <div class="h-px bg-[rgba(0,0,0,0.1)]"></div>
          <div class="flex items-center justify-between">
            <span class="text-base font-bold text-[#191a1d] leading-6">{{
              $t('ee3264ed.599b5a')
            }}</span>
            <span class="text-2xl font-medium text-[#191a1d] leading-9">{{ totalDisplay }}</span>
          </div>
        </div>

        <!-- 协议和支付按钮 -->
        <div class="flex flex-col gap-4">
          <ECCheckbox v-model="agreeTerms" size="sm">
            <span class="text-xs text-[#4a5565] leading-4">
              {{ $t('ee3264ed.6a9b1b') }}
              <NuxtLink
                :to="`${localePath('/protocol' as any)}?type=privacy`"
                class="underline"
                target="_blank"
                >{{ $t('ee3264ed.cc953a') }}</NuxtLink
              >
              {{ $t('ee3264ed.271965') }}
              <NuxtLink
                :to="`${localePath('/protocol' as any)}?type=member_register`"
                class="underline"
                target="_blank"
                >{{ $t('ee3264ed.970337') }}</NuxtLink
              >
            </span>
          </ECCheckbox>

          <button
            :disabled="!canSubmit || loading"
            @click="handleSubmit"
            class="bg-[#0f0f10] text-white py-4 px-0 text-sm font-medium leading-5 hover:bg-[#191a1d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? $t('ee3264ed.abe2c5') : $t('ee3264ed.747349') }}
          </button>
        </div>
      </div>

      <!-- H5 端：订单摘要（显示在信息区下方） -->
      <div class="lg:hidden w-full bg-white flex flex-col gap-6 p-4">
        <!-- 商品数量 -->
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4 text-[#4a5565]" />
          <span class="text-sm text-[#4a5565] leading-5">{{
            $t('ee3264ed.26b6eb', { count: itemCount })
          }}</span>
        </div>

        <!-- 商品列表 -->
        <div v-if="isCheckoutSummaryReady" class="flex flex-col gap-4">
          <div v-for="item in selectedItems" :key="item.id" class="flex gap-4">
            <div class="w-20 h-20 shrink-0 bg-[#f9fafb] relative overflow-hidden">
              <img
                :src="item.productImage || '/images/placeholder.png'"
                :alt="item.productName"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 flex flex-col gap-1 min-w-0">
              <BCProductMarketingTags :tags="item.marketingTags" placement="inline" />
              <div class="flex items-center gap-2 min-w-0">
                <h4 class="flex-1 min-w-0 text-sm font-medium text-[#101828] leading-5 truncate">
                  {{ item.productName }}
                </h4>
                <button
                  v-if="item.isCheckoutRecommendation"
                  type="button"
                  class="shrink-0 text-xs leading-4 text-[#4a5565] underline hover:text-red-600 disabled:opacity-50"
                  :disabled="removingRecommendationItemId === item.productId"
                  @click="handleRemoveCheckoutRecommendation(item.productId)"
                >
                  {{ $t('9864a2ba.2f4aad') }}
                </button>
              </div>
              <div
                v-if="item.specName"
                class="flex flex-col gap-0.5 text-xs text-[#364153] leading-4"
              >
                <p v-for="(spec, index) in formatSpec(item.specName)" :key="index">{{ spec }}</p>
              </div>
              <div class="flex items-center justify-between mt-auto">
                <span class="text-xs text-[#364153] leading-4"
                  >{{ $t('ee3264ed.0bf60b') }}: {{ item.quantity }}</span
                >
                <span class="text-sm font-medium text-[#191a1d] leading-5">
                  {{ item.subtotalDisplay }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col gap-4">
          <div
            v-for="i in 2"
            :key="`checkout-summary-mobile-skeleton-${i}`"
            class="flex gap-4 animate-pulse"
          >
            <div class="h-20 w-20 shrink-0 bg-[#f3f4f6]" />
            <div class="flex-1 flex flex-col gap-3 py-1">
              <div class="h-4 w-4/5 bg-[#f3f4f6]" />
              <div class="h-3 w-3/5 bg-[#f3f4f6]" />
              <div class="mt-auto flex items-center justify-between">
                <div class="h-3 w-16 bg-[#f3f4f6]" />
                <div class="h-4 w-20 bg-[#f3f4f6]" />
              </div>
            </div>
          </div>
        </div>

        <!-- 价格明细 -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#4a5565] leading-5">{{ $t('ee3264ed.de8e9a') }}</span>
            <span class="text-sm text-[#191a1d] leading-5">{{ itemTotalDisplay }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#4a5565] leading-5">{{ $t('ee3264ed.9a935b') }}</span>
            <span class="text-sm text-[#191a1d] leading-5">{{ freightDisplayText }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#4a5565] leading-5">{{ $t('ee3264ed.f06ebf') }}</span>
            <span class="text-sm text-[#191a1d] leading-5">{{ discountDisplay }}</span>
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

    <!-- H5 端：底部固定支付栏 -->
    <div class="lg:hidden fixed bottom-0 start-0 end-0 bg-white border-t border-[#e5e7eb] p-4 z-50">
      <div class="flex flex-col gap-3">
        <!-- 协议 -->
        <ECCheckbox v-model="agreeTerms" size="sm">
          <span class="text-xs text-[#4a5565] leading-4">
            {{ $t('ee3264ed.6a9b1b') }}
            <NuxtLink
              :to="localePath('/protocol?type=privacy')"
              class="underline"
              target="_blank"
              >{{ $t('ee3264ed.cc953a') }}</NuxtLink
            >
            {{ $t('ee3264ed.271965') }}
            <NuxtLink
              :to="localePath('/protocol?type=member_register')"
              class="underline"
              target="_blank"
              >{{ $t('ee3264ed.970337') }}</NuxtLink
            >
          </span>
        </ECCheckbox>

        <!-- 总计和支付按钮 -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-sm text-[#4a5565]">{{ $t('ee3264ed.599b5a') }}</span>
            <span class="text-2xl font-medium text-[#191a1d]">{{ totalDisplay }}</span>
          </div>
          <button
            :disabled="!canSubmit || loading"
            @click="handleSubmit"
            class="bg-[#0f0f10] text-white py-3 px-8 text-sm font-medium leading-5 hover:bg-[#191a1d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? $t('ee3264ed.abe2c5') : $t('ee3264ed.747349') }}
          </button>
        </div>
      </div>
    </div>

    <BCCheckoutErrorModal v-model="showErrorModal" :error-message="errorMessage" />

    <!-- 地址弹窗 -->
    <BCAddressModal
      v-model="showAddressModal"
      :address-id="editingAddressId"
      :initial-data="editingAddressData"
      @success="handleAddressSuccess"
    />

    <!-- 优惠券选择抽屉 -->
    <USlideover v-model:open="showCouponSelector" side="right">
      <template #content>
        <BCCouponSelector
          v-model="showCouponSelector"
          :coupons="[...coupons]"
          :selected-coupon="selectedCoupon"
          :loading="loading"
          @close="showCouponSelector = false"
          @select="handleSelectCoupon"
          @unselect="handleUnselectCoupon"
        />
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useCheckout } from '~/composables/useCheckout'
import { useRegion } from '~/composables/useRegion'
import BCAddressModal from '~/components/BCAddressModal/BCAddressModal.vue'
import BCCouponSelector from '~/components/BCCouponSelector/BCCouponSelector.vue'
import BCCheckoutErrorModal from '~/components/BCCheckoutErrorModal/BCCheckoutErrorModal.vue'
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'
import BCProductRecommendations from '~/components/BCProductRecommendations/BCProductRecommendations.vue'
import { useRecommendationAddToCart } from '~/composables/useRecommendationAddToCart'
import type { IAddressFormData } from '~/composables/useAddress'
import { ECCheckbox } from '~/components/ECCheckbox'
import { ECSelect } from '~/components/ECSelect'
import { paymentApiClient } from '~/infrastructure/http/clients'
definePageMeta({
  layout: 'default',
  keepalive: false,
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()
const showPointsRules = ref(false)

const popoverWrapperRef = ref<HTMLElement | null>(null)
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (
      showPointsRules.value &&
      popoverWrapperRef.value &&
      !popoverWrapperRef.value.contains(e.target as Node)
    ) {
      showPointsRules.value = false
    }
  })
})

const {
  loading,
  initialAddressesLoading,
  calculating,
  error,
  addresses,
  selectedAddress,
  coupons,
  selectedCoupon,
  stores,
  selectedStore,
  storesLoading,
  calculateResult,
  checkoutItems,
  checkoutError,
  form,
  itemTotalDisplay,
  freightDisplay,
  discountDisplay,
  totalDisplay,
  itemCount,
  loadAddresses,
  selectAddress,
  loadCoupons,
  selectCoupon,
  unselectCoupon,
  searchStores,
  selectStore,
  toggleUsePoint,
  toggleUseFullPoint,
  calculateOrderAmount,
  addRecommendationToCheckout,
  removeRecommendationFromCheckout,
  checkoutRecommendationMainItemIds,
  removingRecommendationItemId,
  createOrder,
} = useCheckout()

const { addingProductId: recommendationAddingId, handleRecommendationAdd } =
  useRecommendationAddToCart({
    mode: 'checkout',
    onCheckoutAdd: (product, payload) => addRecommendationToCheckout(product, payload),
  })

// 区域数据（用于门店查询的省/市选择）
const { regionData, loadRegionData } = useRegion()

const pickupProvinces = computed(() =>
  regionData.value.map((item) => ({ value: String(item.id), label: item.label }))
)

const pickupCities = computed(() => {
  if (!form.value.pickupProvince) return []
  const province = regionData.value.find(
    (item) => String(item.id) === String(form.value.pickupProvince)
  )
  return (
    province?.children?.map((item) => ({ value: String(item.id), label: item.label })) || []
  )
})

function handlePickupProvinceChange(value: string | number) {
  form.value.pickupProvince = String(value ?? '')
  form.value.pickupCity = ''
}

const hasSearched = ref(false)

async function handleSearchStores() {
  await searchStores()
  hasSearched.value = true
}

// 协议同意状态
const agreeTerms = ref(false)

// 地址弹窗状态
const showAddressModal = ref(false)
const editingAddressId = ref<string>()
const editingAddressData = ref<IAddressFormData>()

// 优惠券选择抽屉状态
const showCouponSelector = ref(false)

// 结算错误弹窗
const showErrorModal = computed({
  get: () => !!checkoutError.value,
  set: () => {},
})
const errorMessage = computed(() => checkoutError.value?.message)

// 选中的商品列表：优先使用后端结算返回，兜底使用购物车勾选项
const selectedItems = computed(() => {
  return checkoutItems.value
})

const checkoutInitialized = ref(false)

const {
  products: recommendedProducts,
  visible: recommendationsVisible,
  reload: reloadRecommendations,
} = useProductRecommendations({
  scene: 'checkout',
  mainItemIds: checkoutRecommendationMainItemIds,
  enabled: computed(
    () => checkoutInitialized.value && checkoutRecommendationMainItemIds.value.length > 0
  ),
})

const isCheckoutSummaryReady = computed(() => checkoutItems.value.length > 0)

function getPaymentPlatform() {
  if (import.meta.client && typeof window !== 'undefined') {
    return window.innerWidth < 1024 ? 'h5' : 'pc'
  }
  return 'pc'
}

function normalizePaymentMethodCode(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
}

function isDoumenIntlPaymentMethod(method: { code?: string; id?: string; pay_type_code?: string }) {
  return (
    normalizePaymentMethodCode(method.pay_type_code ?? method.code ?? method.id) === 'doumenintl'
  )
}

async function loadCheckoutPaymentMethods() {
  try {
    const response = await paymentApiClient.getPaymentMethodList({ platform: getPaymentPlatform() })
    const list = Array.isArray(response) ? response : (response?.data ?? [])
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function getCheckoutPaymentReturnUrl() {
  if (import.meta.client && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

function extractPaymentRedirectUrl(data: Record<string, any>) {
  const candidates = [
    data?.pay_url,
    data?.mweb_url,
    data?.h5_url,
    data?.redirect_url,
    data?.code_url,
  ]
  return candidates.find((value) => typeof value === 'string' && /^https?:\/\//i.test(value)) || ''
}

async function redirectToDoumenPayment(orderId: string, payType: string) {
  try {
    const response = await paymentApiClient.getOrderPaymentInfo({
      order_id: orderId,
      pay_type: payType,
      return_url: getCheckoutPaymentReturnUrl(),
      pay_channel: payType,
    })
    const data = (response?.data ?? response ?? {}) as Record<string, any>
    const payUrl = data?.pay_url || extractPaymentRedirectUrl(data)

    if (!payUrl || !import.meta.client || typeof window === 'undefined') return false

    window.location.replace(payUrl)
    return true
  } catch {
    return false
  }
}

function formatSpec(specString: string): string[] {
  if (!specString) return []
  return specString
    .split(/[,，]/)
    .map((s) => s.trim().replace(/([:：])\s*/g, '$1 '))
    .filter(Boolean)
}

async function handleRemoveCheckoutRecommendation(productId: string) {
  const success = await removeRecommendationFromCheckout(productId)
  if (success) {
    await reloadRecommendations()
  }
}

// 运费显示文本（useCheckout 已在运费为 0 时返回翻译文案）
const freightDisplayText = computed(() => freightDisplay.value)

// 是否可以提交
const canSubmit = computed(() => {
  if (!agreeTerms.value) return false
  if (form.value.receiptType === 'logistics' && !selectedAddress.value) return false
  if (form.value.receiptType === 'ziti' && !selectedStore.value) return false
  if (form.value.receiptType === 'ziti' && !form.value.pickupName.trim()) return false
  if (form.value.receiptType === 'ziti' && !form.value.pickupPhone.trim()) return false
  if (selectedItems.value.length === 0) return false
  return true
})

// 监听配送方式变化
watch(
  () => form.value.receiptType,
  () => {
    calculateOrderAmount()
  }
)

// 监听地址变化
watch(
  () => form.value.selectedAddressId,
  () => {
    if (form.value.receiptType === 'logistics') {
      calculateOrderAmount()
    }
  }
)

// 初始化
async function refreshCheckoutPageData() {
  await loadAddresses()
  await calculateOrderAmount()
  await loadCoupons()
}

onMounted(async () => {
  await refreshCheckoutPageData()
  checkoutInitialized.value = true
  loadRegionData()
})

watch(
  () => calculating.value,
  (isCalculating, wasCalculating) => {
    if (checkoutInitialized.value && wasCalculating && !isCalculating) {
      void reloadRecommendations()
    }
  }
)

watch(
  () => route.query.t,
  async (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      await refreshCheckoutPageData()
    }
  }
)

function handleAddAddress() {
  editingAddressId.value = undefined
  editingAddressData.value = undefined
  showAddressModal.value = true
}

function handleEditAddress(addressId: string) {
  const address = addresses.value.find((addr) => addr.id === addressId)
  if (address) {
    editingAddressId.value = addressId
    editingAddressData.value = {
      name: address.name,
      phone: address.phone,
      countryCode: '+86',
      province: address.province,
      city: address.city,
      district: address.district,
      tmp_code: [],
      detail: address.detail,
      isDefault: address.isDefault,
    }
    showAddressModal.value = true
  }
}

async function handleAddressSuccess(data: IAddressFormData) {
  showAddressModal.value = false
  await loadAddresses()
}

async function handleOpenCouponSelector() {
  await loadCoupons()
  showCouponSelector.value = true
}

function handleSelectCoupon(coupon: any) {
  selectCoupon(coupon)
}

function handleUnselectCoupon() {
  unselectCoupon()
}

/**
 * 提交订单
 */
async function handleSubmit() {
  if (!canSubmit.value) return

  form.value.needInvoice = false
  form.value.invoiceType = undefined
  form.value.invoiceContent = undefined

  const paymentMethods = await loadCheckoutPaymentMethods()
  const onlyPaymentMethod = paymentMethods.length === 1 ? paymentMethods[0] : null
  const shouldRedirectToDoumen = !!onlyPaymentMethod && isDoumenIntlPaymentMethod(onlyPaymentMethod)
  const payType = shouldRedirectToDoumen
    ? (onlyPaymentMethod.pay_type_code ??
      onlyPaymentMethod.code ??
      onlyPaymentMethod.id ??
      'doumen_intl')
    : 'wxpaypc'

  const result = await createOrder(payType)

  if (result.success && result.orderId) {
    if (shouldRedirectToDoumen && (await redirectToDoumenPayment(result.orderId, payType))) {
      return
    }

    router.replace(localePath({ path: '/payment', query: { orderId: result.orderId } }))
  }
}
</script>
