export type MerchantSettledType = 'enterprise' | 'soletrader'

/** 结算银行账号类型：对公 / 对私 */
export type MerchantAccountType = 'public' | 'private'

export interface IMerchantBaseSetting {
  display_on_pc?: string
  settled_type?: MerchantSettledType[]
  content?: string
}

/** 入驻 Step1：用户点选的 2/3 级管理分类 */
export interface IMerchantMainCategorySelection {
  category_id: number
  level: 2 | 3
  name?: string
  parent_id?: number
  path?: string
}

/** 管理分类树节点（GET /wxapp/goods/category） */
export interface IMerchantCategoryNode {
  category_id: number
  category_name: string
  category_level: number
  parent_id?: number
  path?: string
  children?: IMerchantCategoryNode[]
}

export interface IMerchantSettlementForm {
  /** 商户类型：企业 / 个体户 */
  settled_type: MerchantSettledType | ''
  /** 商户类目：管理分类 2/3 级多选 */
  main_category_selection: IMerchantMainCategorySelection[]
  /** 企业营业执照公司名称 */
  merchant_name: string
  /** 营业执照统一社会信用代码 */
  social_credit_code_id: string
  /** 企业营业执照注册地 */
  registered_address: string
  /** 企业营业执照法定代表人 */
  legal_name: string
  /** 法人身份证号码 */
  legal_cert_id: string
  /** 联系人姓名 */
  contact_name: string
  /** 联系人手机号 */
  contact_mobile: string
  /** 入驻须知（《入驻条件及说明》）是否已确认 */
  agreement_accepted: boolean
  /** 营业执照图片 */
  license_url: string
  /** 法人身份证人像面 */
  legal_certid_front_url: string
  /** 法人身份证国徽面 */
  legal_cert_id_back_url: string
  /** 收款账户银行卡正面 */
  bank_card_front_url: string
  /** 结算银行账号类型 */
  bank_account_type: MerchantAccountType | ''
  /** 结算银行（开户银行）；对公时提交为 bank_name */
  bank_name: string
  /** 结算银行账号；提交为 card_id_mask */
  bank_account: string
  /** 对私时的银行预留手机号 */
  bank_mobile: string
}

export interface IMerchantSettlementDetail {
  id?: number
  settled_type?: string
  main_category_selection?: IMerchantMainCategorySelection[]
  main_category_names?: string[]
  merchant_name?: string
  address?: string
  legal_name?: string
  legal_cert_id?: string
  contact_name?: string
  contact_mobile?: string
  license_url?: string
  legal_certid_front_url?: string
  legal_cert_id_back_url?: string
  bank_card_front_url?: string
  bank_account_type?: string
  bank_name?: string
  bank_account?: string
  bank_mobile?: string
  bank_acct_type?: string
  card_id_mask?: string
  audit_status?: string
  audit_memo?: string
  /** false 表示已提交审核，前端应展示审核结果而非编辑表单 */
  disabled?: boolean
  [key: string]: unknown
}
