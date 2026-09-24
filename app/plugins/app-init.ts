import { logger } from '~/utils/log'

// 通用入口文件（客户端 + 服务端）
export default defineNuxtPlugin(async (nuxtApp) => {
  logger.info('应用启动 - 通用入口')

  // 应用级别的初始化
  nuxtApp.hook('app:created', (vueApp) => {
    logger.info('Vue 应用已创建')
  })

  nuxtApp.hook('app:mounted', () => {
    logger.info('应用已挂载到 DOM')
  })

  // 可以在这里进行全局配置
  // 例如：设置全局错误处理、API 拦截器等
})
