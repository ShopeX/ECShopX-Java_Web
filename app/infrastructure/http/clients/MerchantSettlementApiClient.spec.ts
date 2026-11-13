import { describe, expect, it } from 'vitest'
import { MerchantSettlementApiClient } from './MerchantSettlementApiClient'

const client = new MerchantSettlementApiClient()

const form = {
  license_url: 'https://cdn.example/license.jpg',
  merchant_name: ' 示例公司 ',
  social_credit_code_id: '91310000MA1FL2XW3X',
  registered_address: ' 上海市浦东新区 ',
  legal_name: ' 张三 ',
  legal_cert_id: '310101199001011234',
  legal_certid_front_url: 'https://cdn.example/front.jpg',
  legal_cert_id_back_url: 'https://cdn.example/back.jpg',
  contact_name: ' 李四 ',
  contact_mobile: '13800000000',
  bank_card_front_url: 'https://cdn.example/card.jpg',
  bank_name: '招商银行',
  bank_account: ' 6222000000000000 ',
  bank_mobile: '13900000000',
}

describe('settlement apply step2 body', () => {
  it('sends license, company and corporate bank fields with Apifox names', () => {
    expect(
      client.buildStep2Body({
        ...form,
        bank_account_type: 'public',
      })
    ).toEqual({
      license_url: form.license_url,
      merchant_name: '示例公司',
      social_credit_code_id: form.social_credit_code_id,
      license_registered_address: '上海市浦东新区',
      license_legal_representative: '张三',
      legal_cert_id: form.legal_cert_id,
      legal_certid_front_url: form.legal_certid_front_url,
      legal_cert_id_back_url: form.legal_cert_id_back_url,
      contact_name: '李四',
      contact_mobile: form.contact_mobile,
      bank_card_front_url: form.bank_card_front_url,
      bank_acct_type: '1',
      card_id_mask: '6222000000000000',
      bank_name: '招商银行',
    })
  })

  it('sends bank_mobile instead of bank_name for a personal account', () => {
    const body = client.buildStep2Body({
      ...form,
      bank_account_type: 'private',
    })

    expect(body.bank_acct_type).toBe('2')
    expect(body.bank_mobile).toBe('13900000000')
    expect(body).not.toHaveProperty('bank_name')
    expect(body).not.toHaveProperty('legal_mobile')
    expect(body).not.toHaveProperty('address')
  })
})

describe('settlement apply step3 body', () => {
  it('only submits the review flag', () => {
    expect(client.buildStep3Body()).toEqual({ submit: true })
  })
})
