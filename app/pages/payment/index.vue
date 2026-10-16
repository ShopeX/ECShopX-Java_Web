<template>
  <div
    class="bg-white min-h-[80dvh] flex flex-col"
    :class="showIdleContent ? 'pb-[140px] lg:pb-0' : ''"
    data-testid="payment-page"
  >
    <template v-if="!hasOrderId">
      <div class="max-w-[800px] mx-auto w-full px-4 lg:px-32 pt-8 flex flex-col gap-4">
        <p class="text-[14px] leading-5 text-[#4a5565]">{{ $t('eab46cc2.941324') }}</p>
        <NuxtLink :to="localePath('/cart')" class="text-sm font-medium text-[#191a1d] underline">
          {{ $t('eab46cc2.5f4112') }} {{ $t('eab46cc2.983adc') }}
        </NuxtLink>
      </div>
    </template>

    <template v-else>
      <template v-if="showIdleContent">
        <div class="w-full max-w-[1440px] mx-auto px-4 lg:px-32 pt-8 lg:pt-10 pb-8 flex-1">
          <div class="flex flex-col gap-8 lg:gap-12">
            <section
              class="border-b border-[#e5e7eb] pb-8 lg:border lg:border-[#e5e7eb] lg:px-6 lg:py-8"
              data-testid="payment-summary"
            >
              <div class="flex flex-col gap-6 lg:gap-8" data-testid="payment-order-info">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2 text-[14px] leading-5 text-[#6a7282]">
                    <span>{{ $t('eab46cc2.4309d1') }}</span>
                    <span class="font-medium text-[#191a1d]">{{ orderIdValue }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[14px] leading-5 text-[#6a7282]">{{
                      $t('eab46cc2.b1862e')
                    }}</span>
                    <span class="text-[24px] font-medium leading-[36px] text-[#191a1d]">
                      {{ orderAmountFormatted || fallbackAmountText }}
                    </span>
                  </div>
                </div>

                <div class="border-t border-[#e5e7eb] pt-6 lg:pt-8">
                  <p class="text-[14px] leading-5 text-[#4a5565]">
                    {{ $t('eab46cc2.a8d60c') }}
                  </p>
                  <div v-if="loadingMethods" class="pt-4 text-sm text-[#4a5565]">
                    {{ $t('eab46cc2.26b5bd') }}
                  </div>
                  <ul
                    v-else
                    class="pt-4 flex flex-col gap-4 lg:flex-row lg:gap-8"
                    data-testid="payment-method-list"
                  >
                    <li
                      v-for="(method, index) in paymentMethods"
                      :key="String(method?.code ?? method?.id ?? index)"
                      class="w-full lg:w-auto"
                    >
                      <button
                        type="button"
                        class="relative flex items-center justify-center gap-[8px] border px-4 py-4 text-center transition-colors w-full lg:w-[170px]"
                        :class="
                          selectedPayType === (method.code ?? method.id)
                            ? 'border-[#0f0f10] bg-white'
                            : 'border-[#e5e7eb] bg-white'
                        "
                        :data-selected="
                          selectedPayType === (method.code ?? method.id) ? 'true' : undefined
                        "
                        data-testid="payment-method-item"
                        @click="selectPaymentMethod(method)"
                      >
                        <span
                          v-if="getPaymentMethodIcon(method)"
                          :class="getPaymentMethodIcon(method)?.wrapperClass"
                          class="shrink-0"
                        >
                          <img
                            :src="getPaymentMethodIcon(method)?.src"
                            :alt="$t(getPaymentMethodIcon(method)?.altKey || '')"
                            :class="getPaymentMethodIcon(method)?.imageClass"
                            class="block max-w-none"
                          />
                        </span>

                        <span class="text-[14px] font-medium leading-5 text-[#101828]">
                          {{ method.name ?? method.code ?? method.id ?? '' }}
                        </span>
                        <span
                          v-if="selectedPayType === (method.code ?? method.id)"
                          class="absolute bottom-[-1px] right-[-1px] h-4 w-4 border border-black bg-black shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex items-center justify-center"
                        >
                          <UIcon name="i-heroicons-check" class="h-[14px] w-[14px] text-white" />
                        </span>
                      </button>
                    </li>
                  </ul>
                  <p
                    v-if="hasDepositMethod && depositBalanceFormatted"
                    class="pt-3 text-[13px] leading-5 text-[#6a7282]"
                    data-testid="payment-deposit-balance"
                  >
                    {{ $t('eab46cc2.depositBalance', { amount: depositBalanceFormatted }) }}
                  </p>
                  <p
                    v-if="isDepositInsufficient"
                    class="pt-3 text-[13px] leading-5 text-[#dc2626]"
                    data-testid="payment-deposit-insufficient"
                  >
                    {{ $t('eab46cc2.depositInsufficient') }}
                  </p>
                  <p
                    v-if="showDepositUnsupportedTip"
                    class="pt-3 text-[13px] leading-5 text-[#dc2626]"
                    data-testid="payment-deposit-unsupported"
                  >
                    {{ $t('eab46cc2.depositUnsupported') }}
                  </p>
                </div>
              </div>
            </section>

            <template v-if="isBankTransferSelected">
              <section class="flex flex-col gap-4" data-testid="payment-bank-list">
                <p class="text-[16px] font-medium leading-5 text-[#101828]">
                  {{ $t('eab46cc2.664336') }}
                </p>
                <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
                  <button
                    v-for="bank in bankAccounts"
                    :key="bank.id"
                    type="button"
                    class="relative flex items-start gap-4 border bg-white p-4 text-left transition-colors"
                    :class="
                      selectedBankAccountId === bank.id ? 'border-[#0f0f10]' : 'border-[#e5e7eb]'
                    "
                    data-testid="payment-bank-item"
                    @click="selectedBankAccountId = bank.id"
                  >
                    <img
                      :src="bank.logo || '/images/payment/bank-account.svg'"
                      :alt="bank.bankName"
                      class="h-12 w-12 shrink-0 rounded-full object-cover bg-[#f3f4f6]"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="text-[14px] leading-5 text-[#101828]">
                        {{ $t('eab46cc2.3cb68f') }}{{ bank.accountName }}
                      </p>
                      <p class="text-[14px] leading-5 text-[#4a5565]">
                        {{ $t('eab46cc2.0f6a5c') }}{{ bank.bankName }}
                      </p>
                      <p class="text-[14px] leading-5 text-[#4a5565] break-all">
                        {{ $t('eab46cc2.52093d') }}{{ bank.accountNumber }}
                      </p>
                      <p v-if="bank.unionNumber" class="text-[14px] leading-5 text-[#4a5565] break-all">
                        银联号：{{ bank.unionNumber }}
                      </p>
                    </div>
                    <span
                      v-if="selectedBankAccountId === bank.id"
                      class="absolute bottom-[-1px] right-[-1px] h-4 w-4 border border-black bg-black shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex items-center justify-center"
                    >
                      <UIcon name="i-heroicons-check" class="h-[14px] w-[14px] text-white" />
                    </span>
                  </button>
                </div>
              </section>

              <section class="flex flex-col gap-6" data-testid="payment-transfer-form">
                <p class="text-[16px] font-medium leading-5 text-[#101828]">
                  {{ $t('eab46cc2.31b0a8') }}
                </p>

                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                  <label class="flex flex-col gap-2">
                    <span class="text-[14px] font-medium leading-5 text-[#101828]">
                      {{ $t('eab46cc2.0fca7f') }}
                    </span>
                    <input
                      v-model="transactionReference"
                      type="text"
                      :placeholder="$t('eab46cc2.93f8d6')"
                      class="h-11 w-full border border-transparent bg-[#f3f4f6] px-3 text-[14px] leading-5 text-[#191a1d] outline-none placeholder:text-[#99a1af] focus:border-[#0f0f10]"
                    />
                  </label>

                  <label class="flex flex-col gap-2">
                    <span class="text-[14px] font-medium leading-5 text-[#101828]">
                      <span class="text-[#d0112f]">*</span>{{ $t('eab46cc2.b1862e') }}:
                    </span>
                    <input
                      :value="orderAmountFormatted || fallbackAmountText"
                      type="text"
                      readonly
                      class="h-11 w-full border border-transparent bg-[#f3f4f6] px-3 text-[14px] leading-5 text-[#99a1af] outline-none"
                    />
                  </label>
                </div>

                <label class="flex flex-col gap-2">
                  <span class="text-[14px] font-medium leading-5 text-[#101828]">
                    {{ $t('eab46cc2.6b2720') }}
                  </span>
                  <div class="relative">
                    <textarea
                      v-model="transferNote"
                      maxlength="200"
                      :placeholder="$t('eab46cc2.1f5a22')"
                      class="h-[100px] w-full resize-none border border-[#e5e7eb] bg-[#f3f3f5] px-3 py-2 text-[14px] leading-5 text-[#191a1d] outline-none placeholder:text-[#99a1af] focus:border-[#0f0f10]"
                    />
                    <span
                      class="pointer-events-none absolute bottom-2 right-3 text-[12px] leading-4 text-[#99a1af]"
                    >
                      {{ transferNote.length }}/200
                    </span>
                  </div>
                </label>

                <div class="flex flex-col gap-2" data-testid="payment-voucher-upload">
                  <p class="text-[14px] leading-5 text-[#99a1af]">
                    <span class="font-medium text-[#101828]">
                      <span class="text-[#d0112f]">*</span>{{ $t('eab46cc2.3f6f9d') }}
                    </span>
                    {{ $t('eab46cc2.635ec0') }}
                  </p>

                  <div class="flex flex-wrap gap-4">
                    <div
                      v-for="(voucher, index) in voucherFiles"
                      :key="voucher.preview"
                      class="relative h-[100px] w-[100px] overflow-hidden border border-[#e5e7eb] bg-[#f9fafb]"
                    >
                      <img
                        :src="voucher.preview"
                        :alt="`${$t('eab46cc2.3f6f9d')}${index + 1}`"
                        class="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
                        @click="removeVoucher(index)"
                      >
                        <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      v-if="voucherFiles.length < 6"
                      type="button"
                      class="flex h-[100px] w-[100px] items-center justify-center border border-dashed border-[#d1d5dc] bg-[#f9fafb]"
                      @click="triggerVoucherUpload"
                    >
                      <img
                        :src="uploadVoucherIconSrc"
                        :alt="$t('eab46cc2.3f6f9d')"
                        class="h-8 w-8"
                      />
                    </button>
                  </div>

                  <input
                    ref="voucherInputRef"
                    type="file"
                    accept="image/png,image/jpg,image/jpeg,image/gif"
                    multiple
                    class="hidden"
                    @change="handleVoucherFileChange"
                  />
                </div>
              </section>
            </template>

            <section
              v-if="error && payResult === 'idle'"
              class="rounded-lg border border-amber-200 bg-amber-50 p-4"
              data-testid="payment-error"
            >
              <p class="text-sm text-amber-800">{{ error }}</p>
              <button
                type="button"
                class="mt-2 text-sm font-medium text-amber-700 underline"
                @click="handleRetryLoad"
              >
                {{ $t('de8076e6.132c5c') }}
              </button>
            </section>
          </div>
        </div>

        <div
          class="hidden border-t border-[#f3f4f6] bg-white lg:block"
          :class="isBankTransferSelected ? 'py-4' : 'py-4'"
        >
          <div
            class="mx-auto flex w-full max-w-[1440px] items-center justify-end gap-8 px-8 lg:px-32"
          >
            <div v-if="!isBankTransferSelected" class="flex items-center gap-2">
              <span class="text-[14px] leading-5 text-[#4a5565]">{{ $t('eab46cc2.9246fe') }}</span>
              <span class="text-[24px] font-medium leading-[36px] text-[#191a1d]">
                {{ orderAmountFormatted || fallbackAmountText }}
              </span>
            </div>

            <button
              type="button"
              class="w-[200px] bg-[#0f0f10] px-8 py-4 text-[14px] font-medium leading-5 text-white disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="payment-pay-now"
              :disabled="primaryActionDisabled"
              @click="handlePrimaryAction"
            >
              {{ primaryActionLoading ? $t('eab46cc2.2fb90b') : primaryActionText }}
            </button>
          </div>
        </div>

        <div
          class="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e5e7eb] bg-white px-4 py-8 lg:hidden"
        >
          <div class="flex flex-col gap-4">
            <div v-if="!isBankTransferSelected" class="flex items-center gap-2">
              <span class="text-[14px] leading-5 text-[#4a5565]">{{ $t('eab46cc2.9246fe') }}</span>
              <span class="text-[24px] font-medium leading-[36px] text-[#191a1d]">
                {{ orderAmountFormatted || fallbackAmountText }}
              </span>
            </div>

            <button
              type="button"
              class="w-full bg-[#0f0f10] py-4 text-[14px] font-medium leading-5 text-white disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="payment-pay-now"
              :disabled="primaryActionDisabled"
              @click="handlePrimaryAction"
            >
              {{ primaryActionLoading ? $t('eab46cc2.2fb90b') : primaryActionText }}
            </button>
          </div>
        </div>
      </template>

      <section
        v-if="showQrcode && paymentCode"
        class="flex-1 flex flex-col items-center justify-center px-4 lg:px-32 py-8"
        :data-testid="'payment-qrcode'"
      >
        <div class="flex flex-col items-center gap-4 max-w-[400px] w-full">
          <div class="flex items-center gap-[10px] w-full justify-center">
            <span
              v-if="selectedPaymentIcon"
              :class="selectedPaymentIcon.wrapperClass"
              class="shrink-0"
            >
              <img
                :src="selectedPaymentIcon.src"
                :alt="$t(selectedPaymentIcon.altKey)"
                :class="selectedPaymentIcon.imageClass"
                class="block max-w-none"
              />
            </span>
            <div class="flex flex-col gap-1 items-start text-[#4a5565]">
              <span class="text-[16px] font-medium leading-5">{{ selectedMethodName }}</span>
              <span class="text-[12px] leading-4">{{ $t('eab46cc2.a841e4') }}</span>
            </div>
          </div>
          <div class="p-2 bg-white rounded-lg shadow-[0px_4px_8px_0px_#e1e7f0]">
            <div
              class="w-[200px] h-[200px] flex items-center justify-center overflow-hidden rounded"
            >
              <img
                v-if="paymentCodeImage"
                :src="paymentCodeImage"
                :alt="$t('eab46cc2.c8d2a2')"
                class="w-full h-full object-contain"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-xs text-[#4a5565] break-all p-2"
              >
                {{ paymentCode.slice(0, 80) }}{{ paymentCode.length > 80 ? '...' : '' }}
              </div>
            </div>
          </div>
          <p class="text-[12px] leading-4 text-[#4a5565] text-center">
            {{ $t('eab46cc2.03d763') }}<br />{{ $t('eab46cc2.d7ce53') }}
          </p>
        </div>
      </section>

      <section
        v-if="isExternalWaiting"
        class="flex-1 flex flex-col items-center justify-center px-4 lg:px-32 py-8"
        data-testid="payment-waiting"
      >
        <div class="flex flex-col items-center gap-4 max-w-[400px] w-full text-center">
          <p class="text-[24px] font-medium leading-[36px] text-[#191a1d]">
            {{ $t('eab46cc2.8f5d9e') }}
          </p>
          <span class="text-[16px] font-medium leading-5 text-[#191a1d]">
            {{ selectedMethodName }}
          </span>
          <p class="text-[14px] leading-5 text-[#4a5565]">
            {{ $t('eab46cc2.e04fae') }}
          </p>
          <p class="text-[14px] leading-5 text-[#4a5565]">
            {{ $t('eab46cc2.b7071d') }} {{ remainingTimeText }}
          </p>
          <button
            type="button"
            class="inline-flex items-center justify-center bg-white border border-[#0f0f10] text-[#191a1d] px-8 py-4 text-[14px] font-medium leading-5"
            @click="reopenExternalPay"
          >
            {{ $t('eab46cc2.970b75') }}
          </button>
        </div>
      </section>

      <section
        v-if="payResult === 'unconfirmed'"
        class="flex-1 flex flex-col items-center px-4 lg:px-32 py-8 w-full"
        data-testid="payment-unconfirmed"
      >
        <div class="w-full max-w-[1440px] flex flex-col gap-4 p-0 lg:p-8 bg-white items-start">
          <p class="text-[24px] font-medium leading-[36px] lg:leading-[48px] text-[#191a1d]">
            {{ $t('eab46cc2.unconfirmedTitle') }}
          </p>
          <p class="text-[14px] leading-5 text-[#4a5565]">
            {{ $t('eab46cc2.unconfirmedDesc') }}
          </p>
          <div class="flex flex-wrap gap-4">
            <button
              type="button"
              class="inline-flex items-center justify-center bg-[#0f0f10] text-white px-8 py-4 text-[14px] font-medium leading-5 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading"
              @click="recheckPaymentResult"
            >
              {{ loading ? $t('eab46cc2.2fb90b') : $t('eab46cc2.recheck') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center bg-white border border-[#0f0f10] text-[#191a1d] px-8 py-4 text-[14px] font-medium leading-5"
              @click="reopenExternalPay"
            >
              {{ $t('eab46cc2.970b75') }}
            </button>
            <NuxtLink
              :to="localePath('/account/orders')"
              class="inline-flex items-center justify-center bg-white border border-[#0f0f10] text-[#191a1d] px-8 py-4 text-[14px] font-medium leading-5"
            >
              {{ $t('eab46cc2.27a3ff') }}
            </NuxtLink>
          </div>
        </div>
      </section>

      <section
        v-if="payResult === 'success'"
        class="flex-1 flex flex-col items-center px-4 lg:px-32 py-8 w-full"
        data-testid="payment-success"
      >
        <div class="w-full max-w-[1440px] flex flex-col gap-8 p-0 lg:p-8 bg-white items-start">
          <p class="text-[24px] font-medium leading-[48px] text-[#191a1d]">
            {{ $t('eab46cc2.eb5dc9') }} {{ orderAmountFormatted }}
          </p>
          <div class="flex gap-4">
            <NuxtLink
              :to="localePath('/account/orders')"
              class="inline-flex items-center justify-center bg-[#0f0f10] text-white px-8 py-4 text-[14px] font-medium leading-5"
            >
              {{ $t('eab46cc2.27a3ff') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/')"
              class="inline-flex items-center justify-center bg-white border border-[#0f0f10] text-[#191a1d] px-8 py-4 text-[14px] font-medium leading-5"
            >
              {{ $t('eab46cc2.3a2c9f') }}
            </NuxtLink>
          </div>
        </div>
      </section>

      <section
        v-if="payResult === 'fail'"
        class="flex-1 flex flex-col items-center px-4 lg:px-32 py-8 w-full"
        data-testid="payment-fail"
      >
        <div class="w-full max-w-[1440px] flex flex-col gap-4 p-0 lg:p-8 bg-white items-start">
          <p class="text-[24px] font-medium leading-[48px] text-[#191a1d]">
            {{ $t('eab46cc2.4548cc') }} {{ orderAmountFormatted }}
          </p>
          <p v-if="error" class="text-[14px] leading-5 text-[#4a5565]">
            {{ error }}
          </p>
          <div class="flex gap-4">
            <button
              type="button"
              class="inline-flex items-center justify-center bg-[#0f0f10] text-white px-8 py-4 text-[14px] font-medium leading-5"
              @click="retry"
            >
              {{ $t('eab46cc2.132c5c') }}
            </button>
            <NuxtLink
              :to="localePath('/')"
              class="inline-flex items-center justify-center bg-white border border-[#0f0f10] text-[#191a1d] px-8 py-4 text-[14px] font-medium leading-5"
            >
              {{ $t('eab46cc2.3a2c9f') }}
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { paymentApiClient, aftersalesApiClient } from '~/infrastructure/http/clients'
import { resolvePaymentMethodIcon } from './paymentMethodIcons'

interface BankAccountOption {
  id: string
  accountName: string
  bankName: string
  accountNumber: string
  unionNumber: string
  logo: string
}

interface VoucherFileItem {
  file: File
  preview: string
  uploadedUrl?: string
  uploading?: boolean
}

definePageMeta({
  layout: 'default',
  keepalive: false,
  hideMobileHeader: true,
  hideMobileFooter: true,
})

const route = useRoute()
const localePath = useLocalePath()
const toast = useToastMessage()
const { t } = useI18n()
const orderIdRef = computed(() => (route.query.orderId as string) ?? '')
const hasCheck = computed(() => {
  const value = route.query.has_check
  return value === 'true' || value === '1'
})
const {
  orderIdValue,
  paymentMethods,
  selectedPayType,
  orderInfo,
  paymentCode,
  paymentCodeImage,
  loading,
  loadingMethods,
  loadingOrder,
  error,
  payResult,
  hasOrderId,
  canPay,
  showQrcode,
  isExternalWaiting,
  orderAmountFormatted,
  remainingTimeText,
  selectedMethodName,
  isDepositInsufficient,
  depositBalanceFormatted,
  showDepositUnsupportedTip,
  loadPaymentMethods,
  loadOrderInfo,
  payNow,
  reopenExternalPay,
  recheckPaymentResult,
  retry,
} = usePayment(orderIdRef)

const { currencySymbol, formatFromYuan } = await useCurrency()

const uploadVoucherIconSrc = '/images/payment/upload-voucher.svg'
const fallbackAmountText = computed(() => {
  void currencySymbol.value
  return loadingOrder.value ? t('eab46cc2.26b5bd') : formatFromYuan(0)
})
const BANK_TRANSFER_METHOD_KEYWORDS = [
  'unionpay',
  'banktransfer',
  'bank_transfer',
  'bank transfer',
  'offline',
  'offlinepay',
  'bankremittance',
  'transfer',
  '银行转账',
]
const showIdleContent = computed(
  () =>
    !showQrcode.value &&
    !isExternalWaiting.value &&
    payResult.value !== 'success' &&
    payResult.value !== 'fail' &&
    payResult.value !== 'unconfirmed'
)

function normalizeMethodValue(value?: string) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
}

function isBankTransferMethod(method: { code?: string; id?: string; name?: string }) {
  const code = normalizeMethodValue(method.code ?? method.id)
  const name = normalizeMethodValue(method.name)
  return BANK_TRANSFER_METHOD_KEYWORDS.some((keyword) => {
    const normalizedKeyword = normalizeMethodValue(keyword)
    return code.includes(normalizedKeyword) || name.includes(normalizedKeyword)
  })
}

function isDepositMethod(method: { code?: string; id?: string }) {
  return normalizeMethodValue(method.code ?? method.id) === 'deposit'
}

const selectedPaymentMethod = computed(() =>
  paymentMethods.value.find((method) => (method.code ?? method.id) === selectedPayType.value)
)

const isBankTransferSelected = computed(() => {
  const method = selectedPaymentMethod.value
  return !!method && isBankTransferMethod(method)
})
const hasDepositMethod = computed(() =>
  paymentMethods.value.some((method) => isDepositMethod(method))
)
const primaryActionText = computed(() =>
  isBankTransferSelected.value ? t('eab46cc2.7c0d8d') : t('eab46cc2.ae94de')
)

const bankAccounts = ref<BankAccountOption[]>([])
const selectedBankAccountId = ref('')
const transactionReference = ref('')
const transferNote = ref('')
const voucherFiles = ref<VoucherFileItem[]>([])
const voucherInputRef = ref<HTMLInputElement | null>(null)
const preferredMethodInitialized = ref(false)
const hasLoadedOfflineBankAccounts = ref(false)
const submittingOffline = ref(false)

const getPaymentMethodIcon = (method: { code?: string; id?: string }) =>
  resolvePaymentMethodIcon(method.code ?? method.id ?? '')

const selectedPaymentIcon = computed(() => resolvePaymentMethodIcon(selectedPayType.value))
const canSubmitVoucher = computed(
  () =>
    Boolean(selectedBankAccountId.value) &&
    voucherFiles.value.length > 0 &&
    !voucherFiles.value.some((item) => item.uploading)
)
const primaryActionDisabled = computed(() =>
  isBankTransferSelected.value
    ? !canSubmitVoucher.value || submittingOffline.value
    : !canPay.value || loading.value
)
const primaryActionLoading = computed(() =>
  isBankTransferSelected.value ? submittingOffline.value : loading.value
)

function mapOfflineBankAccounts(response: any): BankAccountOption[] {
  const rawCandidates = [
    response?.data?.list,
    response?.data?.accounts,
    response?.data?.account_list,
    response?.data?.bank_accounts,
    response?.data?.bankAccounts,
    response?.data?.backaccount,
    response?.data?.backAccount,
    response?.data?.back_account,
    response?.data?.account,
    response?.data?.account_info,
    response?.data?.accountInfo,
    response?.data?.payee,
    response?.data?.payee_info,
    response?.data?.payeeInfo,
    response?.data,
    response?.list,
    response?.accounts,
    response?.account_list,
    response?.bank_accounts,
    response?.bankAccounts,
    response?.backaccount,
    response?.backAccount,
    response?.back_account,
    response?.account,
    response?.account_info,
    response?.accountInfo,
    response?.payee,
    response?.payee_info,
    response?.payeeInfo,
    response,
  ]

  const list = rawCandidates.flatMap((candidate) => {
    if (Array.isArray(candidate)) return candidate
    if (candidate && typeof candidate === 'object') return [candidate]
    return []
  })

  return list
    .map((item: any, index: number) => {
      // 与接口约定一致：bank_account_name=用户名，bank_account_no=账户，bank_name=银行名称
      const accountName = item?.bank_account_name ?? item?.account_name ?? ''
      const bankName = item?.bank_name ?? ''
      const accountNumber = item?.bank_account_no ?? item?.account_number ?? ''
      const unionNumber = item?.china_ums_no ?? ''
      const logo = item?.pic ?? item?.logo ?? item?.bank_logo ?? ''

      if (!accountName && !bankName && !accountNumber && !unionNumber) return null

      return {
        id: String(item?.id ?? item?.account_id ?? item?.bank_account_id ?? index),
        accountName: String(accountName),
        bankName: String(bankName),
        accountNumber: String(accountNumber),
        unionNumber: String(unionNumber),
        logo: String(logo),
      }
    })
    .filter(Boolean) as BankAccountOption[]
}

async function loadOfflineBankAccounts() {
  try {
    const response = await paymentApiClient.getOfflineBankAccounts()
    bankAccounts.value = mapOfflineBankAccounts(response)

    if (bankAccounts.value.length === 0) {
      selectedBankAccountId.value = ''
      return
    }

    const hasSelectedAccount = bankAccounts.value.some(
      (bank) => bank.id === selectedBankAccountId.value
    )
    if (!hasSelectedAccount) {
      selectedBankAccountId.value = bankAccounts.value[0]?.id ?? ''
    }
  } catch {
    bankAccounts.value = []
    selectedBankAccountId.value = ''
  }
}

watch(paymentMethods, (methods) => {
  if (preferredMethodInitialized.value || methods.length === 0) return

  const nextPayType = methods[0]?.code ?? methods[0]?.id

  if (nextPayType) {
    selectedPayType.value = nextPayType
  }

  preferredMethodInitialized.value = true
})

watch(paymentMethods, async (methods) => {
  if (hasLoadedOfflineBankAccounts.value || methods.length === 0) return
  if (methods.some((method) => isBankTransferMethod(method))) {
    hasLoadedOfflineBankAccounts.value = true
    await loadOfflineBankAccounts()
  }
})

function selectPaymentMethod(method: { code?: string; id?: string }) {
  const nextPayType = method.code ?? method.id ?? ''
  if (!nextPayType || selectedPayType.value === nextPayType) return

  selectedPayType.value = nextPayType
}

function triggerVoucherUpload() {
  voucherInputRef.value?.click()
}

function extractUploadedImageUrl(response: any): string {
  const payload = response?.data ?? response
  if (typeof payload === 'string') return payload
  if (Array.isArray(payload)) {
    const first = payload[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object') {
      return String(first.image_url || first.url || first.src || '')
    }
  }
  if (payload && typeof payload === 'object') {
    return String(payload.image_url || payload.url || payload.src || '')
  }
  return ''
}

function resolveOrderPayFeeFen(): number {
  const raw =
    orderInfo.value?.total_fee ??
    orderInfo.value?.total_amount ??
    orderInfo.value?.orderInfo?.total_fee ??
    orderInfo.value?.orderInfo?.total_amount ??
    0
  const amount = Number(raw)
  return Number.isFinite(amount) ? amount : 0
}

async function uploadVoucherImage(item: VoucherFileItem) {
  if (item.uploadedUrl) return item.uploadedUrl
  item.uploading = true
  try {
    const response = await aftersalesApiClient.uploadLocalImage({
      file: item.file,
      filetype: 'image',
      group: 'offline',
      newfilename: item.file.name,
    })
    const url = extractUploadedImageUrl(response)
    if (!url) {
      throw new Error(t('eab46cc2.voucherUploadFailed'))
    }
    item.uploadedUrl = url
    return url
  } finally {
    item.uploading = false
  }
}

function handleVoucherFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length === 0) return

  const availableSlots = 6 - voucherFiles.value.length
  files.slice(0, availableSlots).forEach((file) => {
    if (!file.type.startsWith('image/')) return
    voucherFiles.value.push({
      file,
      preview: URL.createObjectURL(file),
    })
  })

  input.value = ''
}

function removeVoucher(index: number) {
  const file = voucherFiles.value[index]
  if (file) {
    URL.revokeObjectURL(file.preview)
    voucherFiles.value.splice(index, 1)
  }
}

/**
 * 对齐 vshop offlinePay + offline-transfer 提交：
 * 1) POST /payment 登记 offline_pay
 * 2) 上传凭证图
 * 3) POST /order/offline/upload/voucher
 */
async function submitOfflineTransfer() {
  if (!canSubmitVoucher.value || submittingOffline.value) return

  if (!selectedBankAccountId.value) {
    toast.show(t('eab46cc2.selectBankAccount'))
    return
  }
  if (voucherFiles.value.length === 0) {
    toast.show(t('eab46cc2.uploadVoucherRequired'))
    return
  }

  const orderId = orderIdValue.value
  const payType = selectedPayType.value
  if (!orderId || !payType) return

  submittingOffline.value = true
  try {
    // vshop：先 getPayment 再填凭证
    await paymentApiClient.getOrderPaymentInfo({
      order_id: orderId,
      pay_type: payType,
      pay_channel: payType,
      return_url: typeof window !== 'undefined' ? `${window.location.origin}${localePath(`/payment?orderId=${orderId}` as any)}` : '',
    })

    const voucherUrls: string[] = []
    for (const item of voucherFiles.value) {
      voucherUrls.push(await uploadVoucherImage(item))
    }

    const selectedBank = bankAccounts.value.find((bank) => bank.id === selectedBankAccountId.value)

    const voucherPayload = {
      order_id: orderId,
      bank_account_id: selectedBankAccountId.value,
      pay_fee: resolveOrderPayFeeFen(),
      voucher_pic: voucherUrls,
      pay_sn: transactionReference.value.trim(),
      transfer_remark: transferNote.value.trim(),
      bank_account_name: selectedBank?.accountName,
      bank_account_no: selectedBank?.accountNumber,
      bank_name: selectedBank?.bankName,
      china_ums_no: selectedBank?.unionNumber,
    }

    // 对齐 vshop：has_check=true 走 update，否则 upload
    if (hasCheck.value) {
      await paymentApiClient.updateOfflineVoucher(voucherPayload)
    } else {
      await paymentApiClient.uploadOfflineVoucher(voucherPayload)
    }

    toast.show(t('eab46cc2.voucherSubmitSuccess'))
    await navigateTo(localePath(`/account/orders/${orderId}` as any))
  } catch (error: any) {
    toast.show(error?.message || t('eab46cc2.voucherSubmitFailed'))
  } finally {
    submittingOffline.value = false
  }
}

async function handlePrimaryAction() {
  if (isBankTransferSelected.value) {
    await submitOfflineTransfer()
    return
  }

  await payNow()
}

const handleRetryLoad = () => {
  loadPaymentMethods()
  loadOrderInfo()
}

onUnmounted(() => {
  voucherFiles.value.forEach((file) => {
    URL.revokeObjectURL(file.preview)
  })
})
</script>
