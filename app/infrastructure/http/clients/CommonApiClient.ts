import type { IFrontendCommonSetting } from '~/types/api/common'

/**
 * 后台通用配置 HTTP 客户端
 */
export class CommonApiClient {
  private $api: any

  constructor() {}

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 获取 PC/H5 前端通用配置（含默认币种）
   */
  async getFrontendSetting(): Promise<IFrontendCommonSetting> {
    return this.http('/wxapp/common/setting', {
      method: 'GET',
      query: { type: 'frontend' },
      cache: 'default',
    })
  }

  /**
   * 站点已启用语言列表（语言切换 UI 数据源）
   * GET /api/v1/h5app/wxapp/setting/language
   */
  async getLanguageSetting(): Promise<{
    defaultLanguage?: string
    enabledLanguages?: Array<{ code: string; name?: string; sort?: number }>
    updatedAt?: number
  }> {
    return this.http('/wxapp/setting/language', {
      method: 'GET',
      // 失败时由调用方回落默认中文，不弹全局错误
      skipErrorCodes: [401, 403, 404, 422, 500, 502, 503],
    })
  }
}

export const commonApiClient = new CommonApiClient()
