/**
 * 发票表单数据
 */
export interface IInvoiceFormData {
  /** 发票类型：individual-个人，enterprise-企业 */
  type: 'individual' | 'enterprise'
  /** 发票抬头（个人姓名或企业名称） */
  title: string
  /** 纳税人识别号（企业必填） */
  taxNumber: string
  /** 公司地址 */
  businessAddress: string
  /** 开户银行 */
  bank: string
  /** 银行账号 */
  bankAccount: string
  /** 手机号（接口必填，优先使用用户手机号兜底） */
  telephone: string
}
