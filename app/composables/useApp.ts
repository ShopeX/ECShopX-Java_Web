// 应用级别的组合式函数 - 自动全局可用
export const useApp = () => {
  const isInitialized = ref(false)
  const appVersion = ref('1.0.0')

  // 应用初始化
  const initializeApp = async () => {
    console.log('正在初始化应用...')

    // 在这里可以进行应用初始化逻辑
    // 例如：用户认证检查、配置加载等
    await new Promise((resolve) => setTimeout(resolve, 1000))

    isInitialized.value = true
    console.log('应用初始化完成')
  }

  // 应用配置
  const config = computed(() => ({
    version: appVersion.value,
    initialized: isInitialized.value,
    isDev: process.dev,
    isClient: process.client,
    isServer: process.server,
  }))

  return {
    isInitialized: readonly(isInitialized),
    appVersion: readonly(appVersion),
    config,
    initializeApp,
  }
}
