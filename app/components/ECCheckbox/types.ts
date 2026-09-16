/**
 * Checkbox 组件类型定义
 */

export interface ICheckboxProps {
  /** 绑定值（v-model） */
  modelValue?: boolean
  /** 是否选中（受控模式） */
  checked?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 变体 */
  variant?: 'default' | 'primary' | 'secondary'
  /** 标签文本 */
  label?: string
}

export interface ICheckboxEmits {
  /** 更新 modelValue */
  'update:modelValue': [value: boolean]
  /** 变化事件 */
  change: [value: boolean]
}
