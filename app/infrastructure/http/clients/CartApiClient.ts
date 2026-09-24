import type { IAddCartRequest, IUpdateCartRequest, IBatchRemoveCartRequest } from '~/types/api/cart'

/**
 * 购物车 HTTP 客户端
 *
 * 职责：
 * - 封装购物车相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 *
 * 设计原则：
 * - 纯粹的 HTTP 调用层
 * - 不包含业务逻辑
 * - 不包含数据转换
 * - 职责单一，易于测试
 *
 * @example
 * ```typescript
 * const client = new CartApiClient()
 * const response = await client.getCartList()
 * // response 是原始 API 响应，需要在 Repository 层转换
 * ```
 */
export class CartApiClient {
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
   * 获取购物车列表
   *
   * @returns 原始 API 响应
   */
  async getCartList(): Promise<any> {
    return this.http('/wxapp/cart/list', {
      method: 'GET',
      cache: 'default',
    })
  }

  /**
   * 添加商品到购物车
   *
   * @param params - 添加购物车请求参数
   * @returns 添加结果
   *
   * @example
   * ```typescript
   * await client.addToCart({
   *   item_id: '123',
   *   num: 1,
   *   distributor_id: '0'
   * })
   * ```
   */
  async addToCart(params: IAddCartRequest): Promise<any> {
    return this.http('/wxapp/cart', {
      method: 'POST',
      body: params,
    })
  }

  /**
   * 更新购物车商品数量
   *
   * @param cartId - 购物车项 ID
   * @param num - 数量
   * @returns 更新结果
   */
  async updateCartItem(cartId: string, num: number): Promise<void> {
    return this.http('/wxapp/cartupdate/num', {
      method: 'PUT',
      query: {
        cart_id: cartId,
        num: String(num),
      },
    })
  }

  /**
   * 删除购物车商品
   *
   * @param itemId - 购物车项 ID
   * @returns 删除结果
   *
   * @example
   * ```typescript
   * await client.removeCartItem('cart-item-123')
   * ```
   */
  async removeCartItem(itemId: string): Promise<void> {
    return this.http('/wxapp/cartdel', {
      method: 'DELETE',
      query: {
        cart_id: itemId,
      },
    })
  }

  /**
   * 批量删除购物车商品
   *
   * @param params - 批量删除参数
   * @returns 删除结果
   *
   * @example
   * ```typescript
   * await client.batchRemoveItems({
   *   item_ids: ['item-1', 'item-2']
   * })
   * ```
   */
  async batchRemoveItems(params: IBatchRemoveCartRequest): Promise<void> {
    return this.http('/wxapp/api/cart/batch-remove', {
      method: 'POST',
      body: params,
    })
  }

  /**
   * 删除选中的商品
   *
   * @returns 删除结果
   */
  async removeSelectedItems(): Promise<void> {
    return this.http('/wxapp/api/cart/selected', {
      method: 'DELETE',
    })
  }

  /**
   * 更新购物车商品选中状态
   *
   * @param cartId - 购物车项 ID
   * @param isChecked - 是否选中
   * @returns 更新结果
   */
  async updateCartItemChecked(cartId: string, isChecked: boolean): Promise<void> {
    return this.http('/wxapp/cartupdate/checkstatus', {
      method: 'PUT',
      query: {
        cart_id: cartId,
        is_checked: isChecked ? 'true' : 'false',
      },
    })
  }

  /**
   * 批量更新购物车商品选中状态（全选/取消全选）
   *
   * @param cartIds - 购物车项 ID 数组
   * @param isChecked - 是否选中
   * @returns 更新结果
   */
  async batchUpdateCartItemChecked(cartIds: string[], isChecked: boolean): Promise<void> {
    // 批量更新：一次调用，手动构建 query 参数
    // 使用 cart_id[] 格式：cart_id[]=2650&cart_id[]=2465
    const queryParams = new URLSearchParams()
    cartIds.forEach((id) => {
      queryParams.append('cart_id[]', id) // 使用 cart_id[] 格式
    })
    queryParams.append('is_checked', isChecked ? 'true' : 'false')

    return this.http(`/wxapp/cartupdate/checkstatus?${queryParams.toString()}`, {
      method: 'PUT',
    })
  }

  /**
   * 清空购物车
   *
   * @returns 清空结果
   *
   * @example
   * ```typescript
   * await client.clearCart()
   * ```
   */
  async clearCart(): Promise<void> {
    return this.http('/wxapp/api/cart/clear', {
      method: 'DELETE',
    })
  }

  /**
   * 验证购物车结算
   *
   * @returns 验证结果
   */
  async validateCheckout(): Promise<{
    valid: boolean
    errors: string[]
  }> {
    return this.http('/wxapp/api/cart/validate', {
      method: 'POST',
    })
  }
}

/**
 * 导出单例实例
 * 在整个应用中共享同一个实例，减少内存开销
 */
export const cartApiClient = new CartApiClient()
