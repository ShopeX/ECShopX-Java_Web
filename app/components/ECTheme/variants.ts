/**
 * 主题变体定义
 *
 * 职责：
 * - 定义组件的不同样式变体
 * - 保持样式变体的一致性
 */

/**
 * 按钮变体
 */
export const buttonVariants: Record<string, string> = {
  solid: 'bg-[#b22420] text-white hover:opacity-90',
  ghost: 'bg-transparent hover:bg-gray-50',
  outline: 'border border-[#ddd] hover:border-[#b22420] hover:text-[#b22420]',
  link: 'text-[#b22420] hover:underline',
}

/**
 * 输入框变体
 */
export const inputVariants: Record<string, string> = {
  default: 'border border-[#ddd] rounded focus:outline-none focus:border-[#b22420]',
  error: 'border border-red-500 rounded focus:outline-none focus:border-red-600',
  success: 'border border-green-500 rounded focus:outline-none focus:border-green-600',
}

/**
 * 卡片变体
 */
export const cardVariants: Record<string, string> = {
  default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
  elevated: 'bg-white rounded-lg shadow-lg',
  outlined: 'bg-white border-2 border-gray-300 rounded-lg',
}

/**
 * 徽章变体
 */
export const badgeVariants: Record<string, string> = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-[#b22420] text-white',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
}

/**
 * 警告框变体
 */
export const alertVariants: Record<string, string> = {
  default: 'bg-gray-50 text-gray-900 border-gray-200',
  success: 'bg-green-50 text-green-900 border-green-200',
  error: 'bg-red-50 text-red-900 border-red-200',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  info: 'bg-blue-50 text-blue-900 border-blue-200',
}
