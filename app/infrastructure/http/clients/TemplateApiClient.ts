import type { IMallGlobalSetting } from '~/types/api/template'

/**
 * 模板配置 HTTP 客户端
 *
 * 职责：
 * - 封装模板配置相关的 HTTP 请求
 * - 返回原始 API 响应
 */
export class TemplateApiClient {
  private $api: any

  constructor() {
    // 延迟初始化
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
   * 获取模板配置
   *
   * @param name - 模板名称 (如 'index', 'cart')
   * @returns 模板配置数据
   */
  async getTemplateConfig(name: string): Promise<any> {
    return this.http('/wxapp/getPageConfig', {
      method: 'GET',
      query: { name },
      cache: 'default',
    })
  }

  /**
   * 获取商城登录页和全局 Logo 设置
   */
  async getLoginPageSetting(): Promise<IMallGlobalSetting> {
    return this.http('/wxapp/pctemplate/loginPage/setting', {
      method: 'GET',
      cache: 'default',
    })
  }
}

/**
 * 导出单例实例
 */
export const templateApiClient = new TemplateApiClient()
