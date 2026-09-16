/**
 * Input 模块类型定义
 */

import type { inputVariants, inputSizes } from '../ECTheme'

export interface IInputProps {
  /** 输入框值 */
  modelValue?: string | number
  /** 输入框类型 */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  /** 输入框变体 */
  variant?: keyof typeof inputVariants
  /** 输入框尺寸 */
  size?: keyof typeof inputSizes
  /** 占位符 */
  placeholder?: string
  /** 最大长度 */
  maxlength?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否可清除 */
  clearable?: boolean
  /** 是否显示密码切换按钮 */
  showPasswordToggle?: boolean
  /** 自定义类名 */
  className?: string
}
