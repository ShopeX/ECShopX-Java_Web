/**
 * Toast 选项配置
 */
export interface ToastOptions {
  /** 提示消息 */
  message: string
  /** 显示时长（毫秒），0 表示不自动关闭 */
  duration?: number
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Toast 实例方法
 */
export interface ToastInstance {
  /** 显示提示 */
  show: (options: string | ToastOptions) => void
  /** 隐藏提示 */
  hide: () => void
}
