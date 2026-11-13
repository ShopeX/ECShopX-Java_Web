/**
 * 商家入驻 HTTP 客户端
 * 鉴权：与商场一致，使用站点会员 Bearer（http 插件自动附加）；不再使用独立商家 JWT
 */

import type {
  IMerchantBaseSetting,
  IMerchantCategoryNode,
  IMerchantMainCategorySelection,
  IMerchantSettlementDetail,
  IMerchantSettlementForm,
  MerchantSettledType,
} from '~/types/api/merchant'
import { normalizeMerchantCategoryTree } from '~/utils/merchantMainCategory'

export class MerchantSettlementApiClient {
  private $api: any

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  private jsonOptions(extra: Record<string, unknown> = {}) {
    return {
      useJson: true,
      ...extra,
    }
  }

  async getBaseSetting(): Promise<IMerchantBaseSetting> {
    const res = await this.http('/wxapp/merchant/basesetting', {
      method: 'GET',
      ...this.jsonOptions({ skipAuth: true }),
    })
    return ((res as any)?.data ?? res ?? {}) as IMerchantBaseSetting
  }

  /**
   * 商户类目：管理分类树
   * `is_main_category=true` + 平台 `distributor_id=0`；前端树选 2/3 级
   */
  async getMerchantCategoryTree(): Promise<IMerchantCategoryNode[]> {
    const res = await this.http('/wxapp/goods/category', {
      method: 'GET',
      ...this.jsonOptions({
        skipAuth: true,
        skipDistributorId: true,
        query: {
          is_main_category: true,
          distributor_id: 0,
        },
      }),
    })
    const raw = (res as any)?.data ?? res
    return normalizeMerchantCategoryTree(raw)
  }

  async getSettlementStep(): Promise<number> {
    const res = await this.http('/wxapp/merchant/settlementapply/step', {
      method: 'GET',
      ...this.jsonOptions(),
    })
    const step = Number((res as any)?.data?.step ?? (res as any)?.step ?? 1)
    return Number.isFinite(step) ? step : 1
  }

  async getSettlementDetail(): Promise<IMerchantSettlementDetail | null> {
    const res = await this.http('/wxapp/merchant/settlementapply/detail', {
      method: 'GET',
      ...this.jsonOptions(),
    })
    const data = (res as any)?.data ?? res
    if (!data || typeof data !== 'object') return null
    return data as IMerchantSettlementDetail
  }

  async saveSettlementStep(step: 1 | 2 | 3, body: Record<string, unknown>): Promise<void> {
    await this.http(`/wxapp/merchant/settlementapply/${step}`, {
      method: 'POST',
      ...this.jsonOptions(),
      body,
    })
  }

  async getAuditStatus(): Promise<Record<string, unknown>> {
    const res = await this.http('/wxapp/merchant/settlementapply/auditstatus', {
      method: 'GET',
      ...this.jsonOptions(),
    })
    return ((res as any)?.data ?? res ?? {}) as Record<string, unknown>
  }

  /** 与 Vshop `POST /merchant/password/reset` 一致：重新获取商户后台密码 */
  async resetMerchantPassword(): Promise<Record<string, unknown>> {
    const res = await this.http('/wxapp/merchant/password/reset', {
      method: 'POST',
      ...this.jsonOptions(),
    })
    return ((res as any)?.data ?? res ?? {}) as Record<string, unknown>
  }

  buildStep1Body(
    settledType: MerchantSettledType,
    selection: IMerchantMainCategorySelection[]
  ) {
    return {
      settled_type: settledType,
      main_category_selection: selection.map((item) => ({
        category_id: item.category_id,
        level: item.level,
      })),
    }
  }

  /**
   * POST /wxapp/merchant/settlementapply/2
   * 资料、证照、结算账户一次带齐；不提交审核。
   * bank_acct_type：1 对公（必填 bank_name），2 对私（必填 bank_mobile）。
   */
  buildStep2Body(
    form: Pick<
      IMerchantSettlementForm,
      | 'license_url'
      | 'merchant_name'
      | 'social_credit_code_id'
      | 'registered_address'
      | 'legal_name'
      | 'legal_cert_id'
      | 'legal_certid_front_url'
      | 'legal_cert_id_back_url'
      | 'contact_name'
      | 'contact_mobile'
      | 'bank_card_front_url'
      | 'bank_account_type'
      | 'bank_name'
      | 'bank_account'
      | 'bank_mobile'
    >
  ) {
    const bankAcctType = form.bank_account_type === 'public' ? '1' : '2'
    const body: Record<string, string> = {
      license_url: form.license_url,
      merchant_name: form.merchant_name.trim(),
      social_credit_code_id: form.social_credit_code_id.trim(),
      license_registered_address: form.registered_address.trim(),
      license_legal_representative: form.legal_name.trim(),
      legal_cert_id: form.legal_cert_id.trim(),
      legal_certid_front_url: form.legal_certid_front_url,
      legal_cert_id_back_url: form.legal_cert_id_back_url,
      contact_name: form.contact_name.trim(),
      contact_mobile: form.contact_mobile.trim(),
      bank_acct_type: bankAcctType,
      card_id_mask: form.bank_account.trim(),
    }
    if (form.bank_card_front_url) {
      body.bank_card_front_url = form.bank_card_front_url
    }
    if (bankAcctType === '1') {
      body.bank_name = form.bank_name.trim()
    } else {
      body.bank_mobile = form.bank_mobile.trim()
    }
    return body
  }

  /** POST /wxapp/merchant/settlementapply/3：核对页只提交审核 */
  buildStep3Body() {
    return { submit: true }
  }
}

export const merchantSettlementApiClient = new MerchantSettlementApiClient()
