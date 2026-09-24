/**
 * 地址相关 API 客户端
 *
 * 职责：
 * - 封装地址相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 *
 * 设计原则：
 * - 纯粹的 HTTP 调用层
 * - 不包含业务逻辑
 * - 不包含数据转换
 * - 延迟初始化，SSR 安全
 */

export interface ICreateAddressRequest {
  username: string // 收货人姓名
  telephone: string // 收货人手机号
  province: string // 省份
  city: string // 城市
  county: string // 区县
  tmp_code: Array<string> // 省市区编码
  adrdetail: string // 详细地址
  is_def?: 0 | 1 // 是否设为默认地址：0-否，1-是
  receiver_zip?: string // 邮编
}

export interface IUpdateAddressRequest {
  username: string // 收货人姓名
  telephone: string // 收货人手机号
  province: string // 省份
  city: string // 城市
  county: string // 区县
  adrdetail: string // 详细地址
  is_def?: 0 | 1 // 是否设为默认地址：0-否，1-是
  receiver_zip?: string // 邮编
}

export class AddressApiClient {
  private $api: any

  constructor() {
    // 不在构造函数中初始化，延迟到第一次使用时
  }

  /**
   * 获取 HTTP 实例（延迟初始化，SSR 安全）
   */
  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 获取地址列表
   *
   * @returns 原始 API 响应
   */
  async getAddressList() {
    return this.http('/wxapp/member/addresslist', {
      method: 'GET',
    })
  }

  /**
   * 获取地址详情
   *
   * @param addressId - 地址 ID
   * @returns 原始 API 响应
   */
  async getAddressDetail(addressId: string) {
    return this.http(`/wxapp/member/address/${addressId}`, {
      method: 'GET',
    })
  }

  /**
   * 获取省市区列表
   *
   * @returns 原始 API 响应
   */
  async getRegionList() {
    return this.http('/wxapp/espier/address', {
      method: 'GET',
    })
  }

  /**
   * 新增收货地址
   *
   * @param data - 地址数据
   * @returns 原始 API 响应
   */
  async createAddress(data: ICreateAddressRequest) {
    return this.http('/wxapp/member/address', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * 更新收货地址
   *
   * @param addressId - 地址 ID
   * @param data - 地址数据
   * @returns 原始 API 响应
   */
  async updateAddress(addressId: string, data: IUpdateAddressRequest) {
    return this.http(`/wxapp/member/address/${addressId}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * 删除收货地址
   *
   * @param addressId - 地址 ID
   * @returns 原始 API 响应
   */
  async deleteAddress(addressId: string) {
    return this.http(`/wxapp/member/address/${addressId}`, {
      method: 'DELETE',
    })
  }
}

/**
 * 导出单例实例
 * 在整个应用中共享同一个实例
 */
export const addressApiClient = new AddressApiClient()
