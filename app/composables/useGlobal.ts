// 全局工具函数
export const useGlobal = () => {
  // 全局加载状态
  const isLoading = ref(false)

  // 全局错误处理
  const handleError = (error: Error) => {
    console.error('全局错误:', error)
    // 这里可以添加错误上报逻辑
  }

  // 全局成功提示
  const showSuccess = (message: string) => {
    console.log('成功:', message)
    // 这里可以添加 Toast 提示
  }

  // 全局工具方法
  const utils = {
    formatDate: (date: Date) => date.toLocaleDateString('zh-CN'),
    formatPrice: (price: number) => `¥${price.toFixed(2)}`,
    debounce: <T extends (...args: any[]) => any>(fn: T, delay: number) => {
      let timeoutId: ReturnType<typeof setTimeout>
      return (...args: Parameters<T>) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), delay)
      }
    },
  }

  return {
    isLoading,
    handleError,
    showSuccess,
    utils,
  }
}
