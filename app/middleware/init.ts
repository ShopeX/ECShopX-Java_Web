// 命名中间件 - 需要在页面中手动指定使用
export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('页面初始化中间件执行')

  // 页面级别的初始化逻辑
  const { initializeApp } = useApp()

  // 确保应用已初始化
  await initializeApp()

  // 可以在这里进行页面特定的数据预加载
  console.log(`页面 ${to.path} 初始化完成`)
})
