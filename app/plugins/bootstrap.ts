// 应用启动插件 - 使用 app/index.ts 中的配置
import { initializeEcshopx, APP_CONFIG, CONSTANTS } from '~/index'
import { logger } from '~/utils/log'

export default defineNuxtPlugin(async (nuxtApp) => {
  // 使用应用入口文件中的初始化函数
  await initializeEcshopx()

  // 将配置注入到应用中
  nuxtApp.provide('appConfig', APP_CONFIG)
  nuxtApp.provide('constants', CONSTANTS)

  // 设置全局属性

  logger.info(`📱 ${APP_CONFIG.name} v${APP_CONFIG.version} 已启动`)
})
