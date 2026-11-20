<template>
  <div class="w-full bg-white">
    <div class="mx-auto w-full max-w-[1080px] px-4 pb-2 pt-2 md:px-0 md:pt-8">
      <p
        v-if="loading && !baseSetting"
        class="py-16 text-center text-[14px] leading-5 text-[#4a5565]"
      >
        {{ t('merchantSettlement.loading') }}
      </p>

      <template v-else>
        <MerchantSettlementAuditPanel
          v-if="auditPanelVisible"
          :status="auditPanelStatus"
          :memo="auditMemo"
          :login-url="auditMerchantLoginUrl"
          :login-mobile="auditLoginMobile"
          :login-password="auditLoginPassword"
          :resetting-password="resettingAuditPassword"
          @reapply="startReapply"
          @copy-login="copyAuditLoginInfo"
          @reset-password="resetAuditLoginPassword"
        />

        <template v-else>
          <MerchantStepNav
            :current="uiStep"
            :steps="stepItems"
            :aria-label="t('merchantSettlement.pageTitle')"
          />

          <!-- 步骤一：商户类目 / 商户类型 / 入驻须知 -->
          <div
            v-show="uiStep === 1"
            class="md:border md:border-[#e5e5e5] md:px-[30px] md:py-[20px]"
          >
            <div class="flex flex-col gap-5 py-4 md:max-w-[672px] md:gap-[30px] md:py-0">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-[3px] text-[14px] leading-5">
                  <span class="shrink-0 text-[#d0112f]">*</span>
                  <span class="font-bold text-[#364153]">
                    {{ t('merchantSettlement.categoryLabel') }}
                  </span>
                </div>
                <p class="text-[12px] leading-4 text-[#8f99aa]">
                  {{ t('merchantSettlement.categoryHint') }}
                </p>
                <MerchantCategoryCascader
                  v-if="categoryTree.length"
                  :tree="categoryTree"
                  :selection="form.main_category_selection"
                  :selected-label="selectedCategoryLabel"
                  :empty-text="t('merchantSettlement.categoryEmpty')"
                  :selected-prefix="t('merchantSettlement.categorySelectedPrefix')"
                  @update:selection="setMainCategorySelection"
                />
                <p v-else class="text-[12px] leading-4 text-[#8f99aa]">
                  {{ t('merchantSettlement.categoryEmpty') }}
                </p>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-[3px] text-[14px] leading-5">
                  <span class="shrink-0 text-[#d0112f]">*</span>
                  <span class="font-bold text-[#364153]">
                    {{ t('merchantSettlement.merchantTypeLabel') }}
                  </span>
                </div>
                <div class="flex items-center gap-6 py-1">
                  <MerchantCheckbox
                    v-for="option in settledTypeOptions"
                    :key="option.value"
                    :checked="form.settled_type === option.value"
                    @toggle="form.settled_type = option.value"
                  >
                    {{ option.label }}
                  </MerchantCheckbox>
                </div>
              </div>

              <div class="flex flex-col gap-2 md:w-[396px]">
                <span class="text-[14px] font-bold leading-5 text-[#364153]">
                  {{ t('merchantSettlement.noticeTitle') }}
                </span>
                <p class="text-[12px] leading-5 text-[#364153]">
                  {{ t('merchantSettlement.noticeDesc') }}
                </p>
                <div class="py-1">
                  <MerchantCheckbox
                    :checked="form.agreement_accepted"
                    @toggle="form.agreement_accepted = !form.agreement_accepted"
                  >
                    <!-- prettier-ignore -->
                    <span>{{ t('merchantSettlement.agreementPrefix') }}<button type="button" class="text-[#364153] underline underline-offset-1" @click.stop="agreementVisible = true">{{ t('merchantSettlement.agreementLink') }}</button>{{ t('merchantSettlement.agreementSuffix') }}</span>
                  </MerchantCheckbox>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤二：填写企业信息 -->
          <div
            v-show="uiStep === 2"
            class="md:border md:border-[#e5e5e5] md:px-[30px] md:py-[20px]"
          >
            <MerchantSection :label="t('merchantSettlement.sectionLicense')">
              <MerchantImageUpload
                v-model="form.license_url"
                required
                kind="license"
                :label="t('merchantSettlement.licenseLabel')"
                :hint="t('merchantSettlement.licenseHint')"
                :note="t('merchantSettlement.uploadNote')"
              />
              <div class="merchant-field-grid">
                <MerchantField
                  v-model="form.social_credit_code_id"
                  required
                  :maxlength="18"
                  :label="t('merchantSettlement.socialCreditLabel')"
                  :placeholder="t('merchantSettlement.socialCreditPlaceholder')"
                />
                <MerchantField
                  v-model="form.merchant_name"
                  required
                  :label="t('merchantSettlement.companyNameLabel')"
                  :placeholder="t('merchantSettlement.companyNamePlaceholder')"
                />
                <MerchantField
                  v-model="form.registered_address"
                  required
                  :label="t('merchantSettlement.registeredAddressLabel')"
                  :placeholder="t('merchantSettlement.registeredAddressPlaceholder')"
                />
                <MerchantField
                  v-model="form.legal_name"
                  required
                  :label="t('merchantSettlement.legalNameLabel')"
                  :placeholder="t('merchantSettlement.legalNamePlaceholder')"
                />
              </div>
            </MerchantSection>

            <MerchantSection :label="t('merchantSettlement.sectionLegal')">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-[3px] text-[14px] leading-5">
                  <span class="shrink-0 text-[#d0112f]">*</span>
                  <span class="text-[#4a5565]">{{ t('merchantSettlement.idCardLabel') }}</span>
                </div>
                <div class="flex flex-col gap-4 md:flex-row md:gap-5">
                  <MerchantImageUpload
                    v-model="form.legal_certid_front_url"
                    kind="id-front"
                    :hint="t('merchantSettlement.idFront')"
                  />
                  <MerchantImageUpload
                    v-model="form.legal_cert_id_back_url"
                    kind="id-back"
                    :hint="t('merchantSettlement.idBack')"
                  />
                </div>
                <p class="whitespace-pre-line text-[12px] leading-4 text-[#8f99aa]">
                  {{ t('merchantSettlement.uploadNote') }}
                </p>
              </div>
              <div class="merchant-field-grid">
                <MerchantField
                  v-model="form.legal_cert_id"
                  required
                  :maxlength="18"
                  :label="t('merchantSettlement.legalCertIdLabel')"
                  :placeholder="t('merchantSettlement.legalCertIdPlaceholder')"
                />
              </div>
            </MerchantSection>

            <MerchantSection :label="t('merchantSettlement.sectionContact')">
              <div class="merchant-field-grid">
                <MerchantField
                  v-model="form.contact_name"
                  required
                  :label="t('merchantSettlement.contactNameLabel')"
                  :placeholder="t('merchantSettlement.contactNamePlaceholder')"
                />
                <MerchantField
                  v-model="form.contact_mobile"
                  type="tel"
                  required
                  :label="t('merchantSettlement.contactMobileLabel')"
                  :placeholder="t('merchantSettlement.contactMobilePlaceholder')"
                />
              </div>
            </MerchantSection>

            <MerchantSection :label="t('merchantSettlement.sectionBank')">
              <MerchantImageUpload
                v-model="form.bank_card_front_url"
                required
                kind="bank"
                :label="t('merchantSettlement.bankCardLabel')"
                :hint="t('merchantSettlement.bankCardHint')"
                :note="t('merchantSettlement.uploadNote')"
              />
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-[3px] text-[14px] leading-5">
                  <span class="shrink-0 text-[#d0112f]">*</span>
                  <span class="text-[#4a5565]">{{ t('merchantSettlement.accountTypeLabel') }}</span>
                </div>
                <div class="flex items-center gap-6 py-1">
                  <MerchantCheckbox
                    v-for="option in accountTypeOptions"
                    :key="option.value"
                    :checked="form.bank_account_type === option.value"
                    @toggle="form.bank_account_type = option.value"
                  >
                    {{ option.label }}
                  </MerchantCheckbox>
                </div>
              </div>
              <div class="flex flex-col gap-5 md:flex-row">
                <MerchantField
                  v-if="form.bank_account_type !== 'private'"
                  class="md:!w-[200px]"
                  v-model="form.bank_name"
                  kind="select"
                  required
                  :options="bankSelectOptions"
                  :label="t('merchantSettlement.bankNameLabel')"
                  :placeholder="t('merchantSettlement.bankNamePlaceholder')"
                />
                <MerchantField
                  v-else
                  class="md:!w-[200px]"
                  v-model="form.bank_mobile"
                  type="tel"
                  required
                  :label="t('merchantSettlement.bankMobileLabel')"
                  :placeholder="t('merchantSettlement.bankMobilePlaceholder')"
                />
                <MerchantField
                  class="md:!w-[395px]"
                  v-model="form.bank_account"
                  required
                  :label="t('merchantSettlement.bankAccountLabel')"
                  :placeholder="t('merchantSettlement.bankAccountPlaceholder')"
                />
              </div>
            </MerchantSection>
          </div>

          <!-- 步骤三：预览并提交审核 -->
          <div
            v-show="uiStep === 3"
            class="md:border md:border-[#e5e5e5] md:px-[30px] md:py-[20px]"
          >
            <MerchantSection :label="t('merchantSettlement.categoryLabel')">
              <MerchantPreviewField
                :label="t('merchantSettlement.categoryLabel')"
                :value="selectedCategoryLabel"
              />
              <MerchantPreviewField
                :label="t('merchantSettlement.merchantTypeLabel')"
                :value="
                  settledTypeOptions.find((o) => o.value === form.settled_type)?.label ||
                  form.settled_type
                "
              />
            </MerchantSection>

            <MerchantSection :label="t('merchantSettlement.sectionLicense')">
              <div class="flex flex-col gap-2">
                <span class="text-[14px] leading-5 text-[#4a5565]">
                  {{ t('merchantSettlement.licenseLabel') }}
                </span>
                <MerchantPreviewImage
                  v-if="form.license_url"
                  :src="form.license_url"
                  :label="t('merchantSettlement.licenseLabel')"
                  thumb-class="h-[113px] w-[160px]"
                />
              </div>
              <div class="merchant-field-grid">
                <MerchantPreviewField
                  :label="t('merchantSettlement.socialCreditLabel')"
                  :value="form.social_credit_code_id"
                />
                <MerchantPreviewField
                  :label="t('merchantSettlement.companyNameLabel')"
                  :value="form.merchant_name"
                />
                <MerchantPreviewField
                  :label="t('merchantSettlement.registeredAddressLabel')"
                  :value="form.registered_address"
                />
                <MerchantPreviewField
                  :label="t('merchantSettlement.legalNameLabel')"
                  :value="form.legal_name"
                />
              </div>
            </MerchantSection>

            <MerchantSection :label="t('merchantSettlement.sectionLegal')">
              <div class="flex flex-col gap-2">
                <span class="text-[14px] leading-5 text-[#4a5565]">
                  {{ t('merchantSettlement.idCardLabel') }}
                </span>
                <div class="flex flex-wrap gap-5">
                  <MerchantPreviewImage
                    v-if="form.legal_certid_front_url"
                    :src="form.legal_certid_front_url"
                    :label="t('merchantSettlement.idFront')"
                    thumb-class="h-[113px] w-[160px]"
                  />
                  <MerchantPreviewImage
                    v-if="form.legal_cert_id_back_url"
                    :src="form.legal_cert_id_back_url"
                    :label="t('merchantSettlement.idBack')"
                    thumb-class="h-[113px] w-[160px]"
                  />
                </div>
              </div>
              <div class="merchant-field-grid">
                <MerchantPreviewField
                  :label="t('merchantSettlement.legalCertIdLabel')"
                  :value="form.legal_cert_id"
                />
              </div>
            </MerchantSection>

            <MerchantSection :label="t('merchantSettlement.sectionContact')">
              <div class="merchant-field-grid">
                <MerchantPreviewField
                  :label="t('merchantSettlement.contactNameLabel')"
                  :value="form.contact_name"
                />
                <MerchantPreviewField
                  :label="t('merchantSettlement.contactMobileLabel')"
                  :value="form.contact_mobile"
                />
              </div>
            </MerchantSection>

            <MerchantSection :label="t('merchantSettlement.sectionBank')">
              <div class="flex flex-col gap-2">
                <span class="text-[14px] leading-5 text-[#4a5565]">
                  {{ t('merchantSettlement.bankCardLabel') }}
                </span>
                <MerchantPreviewImage
                  v-if="form.bank_card_front_url"
                  :src="form.bank_card_front_url"
                  :label="t('merchantSettlement.bankCardLabel')"
                  thumb-class="h-[110px] w-[201px]"
                />
              </div>
              <MerchantPreviewField
                :label="t('merchantSettlement.accountTypeLabel')"
                :value="accountTypeLabel"
              />
              <div class="flex flex-col gap-5 md:flex-row">
                <MerchantPreviewField
                  v-if="form.bank_account_type !== 'private'"
                  class="md:!w-[64px]"
                  :label="t('merchantSettlement.bankCardBankLabel')"
                  :value="form.bank_name"
                />
                <MerchantPreviewField
                  v-else
                  class="md:!w-[200px]"
                  :label="t('merchantSettlement.bankMobileLabel')"
                  :value="form.bank_mobile"
                />
                <MerchantPreviewField
                  class="md:!w-[395px]"
                  :label="t('merchantSettlement.bankAccountLabel')"
                  :value="form.bank_account"
                />
              </div>
            </MerchantSection>
          </div>

          <!-- 操作区：移动端吸底 -->
          <div
            class="sticky bottom-0 z-10 -mx-4 mt-3 flex gap-4 border-t border-[#e5e5e5] bg-white px-4 py-4 md:static md:mx-0 md:mt-[10px] md:justify-center md:border-0 md:py-[21px]"
          >
            <button
              v-if="uiStep > 1"
              type="button"
              class="merchant-btn-secondary h-[50px] flex-1 md:w-[126px] md:flex-none"
              :disabled="submitting"
              @click="goBack"
            >
              {{ t('merchantSettlement.prev') }}
            </button>
            <button
              v-if="uiStep < 3"
              type="button"
              class="merchant-btn-primary h-[50px] flex-1 md:w-[100px] md:flex-none"
              :disabled="submitting"
              @click="goNext"
            >
              {{ t('merchantSettlement.next') }}
            </button>
            <button
              v-else
              type="button"
              class="merchant-btn-primary h-[50px] flex-1 md:w-[112px] md:flex-none"
              :disabled="submitting"
              @click="requestSubmit"
            >
              {{ t('merchantSettlement.submit') }}
            </button>
          </div>
        </template>
      </template>
    </div>

    <!-- 提交二次确认 -->
    <ECModal
      v-model="confirmVisible"
      :title="t('merchantSettlement.confirmTitle')"
      :content="t('merchantSettlement.confirmBody')"
      :confirm-text="t('merchantSettlement.confirm')"
      :cancel-text="t('merchantSettlement.cancel')"
      @confirm="submitApplication"
      @cancel="confirmVisible = false"
      @close="confirmVisible = false"
    />

    <!-- 入驻条件及说明 -->
    <ECModal
      v-model="agreementVisible"
      :title="t('merchantSettlement.agreementLink')"
      :show-confirm="false"
      :cancel-text="t('merchantSettlement.close')"
      :width="640"
      @cancel="agreementVisible = false"
      @close="agreementVisible = false"
    >
      <div
        class="merchant-agreement text-[14px] leading-6 text-[#4a5565]"
        v-html="baseSetting?.content || t('merchantSettlement.noticeDesc')"
      />
    </ECModal>
  </div>
</template>

<script setup lang="ts">
import MerchantCategoryCascader from '~/pages/merchant/components/MerchantCategoryCascader.vue'
import MerchantCheckbox from '~/pages/merchant/components/MerchantCheckbox.vue'
import MerchantField from '~/pages/merchant/components/MerchantField.vue'
import MerchantImageUpload from '~/pages/merchant/components/MerchantImageUpload.vue'
import MerchantPreviewField from '~/pages/merchant/components/MerchantPreviewField.vue'
import MerchantPreviewImage from '~/pages/merchant/components/MerchantPreviewImage.vue'
import MerchantSection from '~/pages/merchant/components/MerchantSection.vue'
import MerchantSettlementAuditPanel from '~/pages/merchant/components/MerchantSettlementAuditPanel.vue'
import MerchantStepNav from '~/pages/merchant/components/MerchantStepNav.vue'
import { useMerchantSettlement } from '~/composables/useMerchantSettlement'

definePageMeta({ layout: 'default' })

const { t } = useI18n()

const {
  loading,
  submitting,
  uiStep,
  baseSetting,
  categoryTree,
  selectedCategoryLabel,
  form,
  auditPanelVisible,
  auditPanelStatus,
  auditMemo,
  auditLoginMobile,
  auditLoginPassword,
  auditMerchantLoginUrl,
  resettingAuditPassword,
  copyAuditLoginInfo,
  resetAuditLoginPassword,
  startReapply,
  confirmVisible,
  agreementVisible,
  settledTypeOptions,
  accountTypeOptions,
  bankOptions,
  bootstrap,
  setMainCategorySelection,
  goNext,
  goBack,
  requestSubmit,
  submitApplication,
} = useMerchantSettlement()

const stepItems = computed(() => [
  { index: 1, label: t('merchantSettlement.step1') },
  { index: 2, label: t('merchantSettlement.step2') },
  { index: 3, label: t('merchantSettlement.step3') },
])

const bankSelectOptions = computed(() => bankOptions.map((name) => ({ value: name, label: name })))

const accountTypeLabel = computed(
  () => accountTypeOptions.value.find((o) => o.value === form.value.bank_account_type)?.label || ''
)

onMounted(() => {
  bootstrap()
})
</script>

<style scoped>
.merchant-field-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
}

@media (min-width: 768px) {
  .merchant-field-grid {
    grid-template-columns: repeat(2, minmax(0, 395px));
  }
}

.merchant-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #0f0f10;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  padding: 0 24px;
}

.merchant-btn-primary:disabled,
.merchant-btn-secondary:disabled {
  opacity: 0.5;
}

.merchant-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #191a1d;
  border: 1px solid #0f0f10;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  padding: 0 24px;
}

@media (min-width: 768px) {
  .merchant-btn-primary,
  .merchant-btn-secondary {
    font-size: 12px;
    padding: 0 20px;
  }
}

.merchant-agreement :deep(p) {
  margin: 0 0 8px;
}

.merchant-agreement :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
