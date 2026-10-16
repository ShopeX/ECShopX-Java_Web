/**
 * useAddress Composable
 *
 * 职责：
 * - 封装地址相关的业务逻辑
 * - 处理字段映射和数据转换
 * - 调用 AddressApiClient
 * - 提供统一的错误处理
 *
 * 使用场景：
 * - AddressModal 组件
 * - Checkout 页面
 * - 用户中心地址管理
 */

import { ref } from 'vue'
import { addressApiClient } from '~/infrastructure/http/clients/AddressApiClient'
import type {
  ICreateAddressRequest,
  IUpdateAddressRequest,
} from '~/infrastructure/http/clients/AddressApiClient'

/**
 * 表单数据结构（UI 层使用）
 */
export interface IAddressFormData {
  name: string
  phone: string
  countryCode: string
  province: string
  city: string
  // tmpCode: Array<string>
  district: string
  tmp_code: string[]
  detail: string
  isDefault: boolean
  receiver_zip?: string
}

/**
 * 地址列表项（从 API 返回）
 */
export interface IAddressItem {
  address_id: string
  username: string
  telephone: string
  province: string
  city: string
  county: string
  adrdetail: string
  is_def: 0 | 1 | '0' | '1' | boolean
  is_default?: 0 | 1 | '0' | '1' | boolean
  receiver_zip?: string
}

export function useAddress() {
  const { t } = useI18n()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 将表单数据转换为 API 请求格式
   */
  function transformToApiFormat(formData: IAddressFormData): ICreateAddressRequest {
    return {
      username: formData.name,
      telephone: `${formData.phone}`,
      province: formData.province || '',
      city: formData.city || '',
      county: formData.district || '',
      tmp_code: formData.tmp_code || [],
      adrdetail: formData.detail,
      is_def: (formData.isDefault ? 1 : 0) as 0 | 1,
      receiver_zip: formData.receiver_zip,
    }
  }

  /**
   * 将 API 数据转换为表单格式
   */
  function transformFromApiFormat(apiData: IAddressItem): IAddressFormData {
    // 分离区号和手机号
    const telephone = apiData.telephone
    let countryCode = '+86'
    let phone = telephone

    // 简单的区号分离逻辑
    if (telephone.startsWith('+')) {
      const match = telephone.match(/^(\+\d{2,3})(.+)$/)
      if (match) {
        countryCode = match[1] || '+86'
        phone = match[2] || telephone
      }
    }

    return {
      name: apiData.username,
      phone,
      countryCode,
      province: apiData.province,
      city: apiData.city,
      district: apiData.county,
      tmp_code: [], // API doesn't return this in IAddressItem, so we use empty array
      detail: apiData.adrdetail,
      isDefault:
        Number((apiData.is_def ?? apiData.is_default) || 0) === 1
        || apiData.is_def === true
        || apiData.is_default === true,
      receiver_zip: apiData.receiver_zip,
    }
  }

  /**
   * 新增地址
   */
  async function createAddress(formData: IAddressFormData) {
    try {
      loading.value = true
      error.value = null

      const requestData = transformToApiFormat(formData)
      const response = await addressApiClient.createAddress(requestData)

      return {
        success: true,
        data: response,
      }
    } catch (err: any) {
      error.value = err.message || t('fa9beefa.38f43d')
      console.error('新增地址失败:', err)
      return {
        success: false,
        error: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新地址
   */
  async function updateAddress(addressId: string, formData: IAddressFormData) {
    try {
      loading.value = true
      error.value = null

      const requestData = transformToApiFormat(formData)
      const response = await addressApiClient.updateAddress(addressId, requestData)

      return {
        success: true,
        data: response,
      }
    } catch (err: any) {
      error.value = err.message || t('fa9beefa.edae2b')
      console.error('更新地址失败:', err)
      return {
        success: false,
        error: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 保存地址（自动判断新增还是更新）
   */
  async function saveAddress(formData: IAddressFormData, addressId?: string) {
    if (addressId) {
      return await updateAddress(addressId, formData)
    } else {
      return await createAddress(formData)
    }
  }

  /**
   * 删除地址
   */
  async function deleteAddress(addressId: string) {
    try {
      loading.value = true
      error.value = null

      const response = await addressApiClient.deleteAddress(addressId)

      return {
        success: true,
        data: response,
      }
    } catch (err: any) {
      error.value = err.message || t('fa9beefa.25b23e')
      console.error('删除地址失败:', err)
      return {
        success: false,
        error: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取地址列表
   */
  async function getAddressList() {
    try {
      loading.value = true
      error.value = null

      const response = await addressApiClient.getAddressList()

      return {
        success: true,
        data: response,
      }
    } catch (err: any) {
      error.value = err.message || t('fa9beefa.2f5ba4')
      console.error('获取地址列表失败:', err)
      return {
        success: false,
        error: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取地址详情（供编辑回填）
   */
  async function getAddressDetail(addressId: string) {
    try {
      loading.value = true
      error.value = null

      const response = await addressApiClient.getAddressDetail(addressId)
      const formData = transformFromApiFormat(response as IAddressItem)

      return {
        success: true,
        data: formData,
      }
    } catch (err: any) {
      error.value = err.message || t('fa9beefa.b5c976')
      console.error('获取地址详情失败:', err)
      return {
        success: false,
        error: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    loading,
    error,

    // 方法
    createAddress,
    updateAddress,
    saveAddress,
    deleteAddress,
    getAddressList,
    getAddressDetail,

    // 转换方法（暴露给外部使用）
    transformToApiFormat,
    transformFromApiFormat,
  }
}
