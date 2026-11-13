import { logger } from '~/utils/log'
// 客户端入口文件
export default defineNuxtPlugin(() => {
  logger.info('客户端应用启动')

  // 客户端初始化逻辑
  if (process.client) {
    // DOM 准备就绪后执行
    logger.info('DOM 已加载')

    // 可以在这里初始化第三方库
    // 例如：Google Analytics, 百度统计等
  }
})
