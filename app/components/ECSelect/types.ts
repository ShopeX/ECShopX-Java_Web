/**
 * Select 组件类型定义
 */

export interface ISelectOption {
  /** 选项值 */
  value: string | number
  /** 选项标签 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
}

export interface ISelectProps {
  /** 绑定值（v-model） */
  modelValue?: string | number
  /** 选项列表 */
  options?: ISelectOption[]
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 变体 */
  variant?: 'default' | 'outlined' | 'filled'
  /** 是否显示错误状态 */
  error?: boolean
}

export interface ISelectEmits {
  /** 更新 modelValue */
  'update:modelValue': [value: string | number]
  /** 值变化事件 */
  change: [value: string | number]
  /** 失焦事件 */
  blur: []
  /** 聚焦事件 */
  focus: []
}
