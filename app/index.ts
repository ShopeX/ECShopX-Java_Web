import { logger } from '~/utils/log'
// import '~/assets/css/tailwind.scss'

// ECSHOPX 应用主入口文件
// 这个文件可以用来导出应用的核心配置和工具

// 导出应用配置
export const APP_CONFIG = {
  name: 'ECSHOPX',
  version: '1.0.0',
  description: '电商平台前端应用',
  author: 'ECSHOPX Team',
} as const

// 导出应用常量
export const CONSTANTS = {
  API_ENDPOINTS: {
    ITEMS: '/api/item',
    PRODUCTS: '/api/products',
    USERS: '/api/users',
  },
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    USER: 'user_info',
    CART: 'shopping_cart',
  },
} as const

// 导出工具类型
export interface AppUser {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface AppError {
  code: string
  message: string
  details?: any
}

// 导出应用初始化函数
export const initializeEcshopx = async () => {
  logger.info('🚀 ECSHOPX 应用启动中...')

  // 在这里可以进行应用级别的初始化
  // 例如：主题设置、全局配置等

  logger.info('✅ ECSHOPX 应用启动完成')
}

// 默认导出应用配置
export default APP_CONFIG
