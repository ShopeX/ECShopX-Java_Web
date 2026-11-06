// 服务端入口文件
export default defineNuxtPlugin(() => {
  console.log('服务端应用启动')

  // 服务端初始化逻辑
  if (process.server) {
    console.log('服务端渲染中')
  }
})
