/**
 * 表单类型定义
 * 基于 Schema 驱动的表单系统类型定义
 */

/**
 * 表单项类型
 */
export type FormItemType = 'input' | 'select' | 'radio' | 'checkbox' | 'custom'

/**
 * 表单验证规则
 */
export interface IFormRule {
  /** 是否必填 */
  required?: boolean
  /** 最小长度/值 */
  min?: number
  /** 最大长度/值 */
  max?: number
  /** 正则表达式验证 */
  pattern?: RegExp
  /** 错误提示信息 */
  message: string
  /** 自定义验证函数 */
  validator?: (value: any) => boolean | Promise<boolean>
  /** 触发验证的时机 */
  trigger?: 'blur' | 'change' | 'submit'
}

/**
 * 表单配置项（Schema）
 */
export interface IFormSchema {
  /** 表单项类型 */
  type: FormItemType
  /** 字段名（对应表单数据的 key） */
  name: string
  /** 表单项标签 */
  label?: string
  /** 传递给内部组件的属性 */
  props?: Record<string, any>
  /** 验证规则 */
  rules?: IFormRule[]
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 表单项配置（已废弃，使用 IFormSchema）
 * @deprecated 使用 IFormSchema 代替
 */
export type IFormItem = IFormSchema

/**
 * Form 组件 Props
 */
export interface IFormProps {
  /** 表单配置 Schema */
  schema: IFormSchema[]
  /** 表单数据对象 */
  modelValue: Record<string, any>
  /** 是否禁用整个表单 */
  disabled?: boolean
  /** 标签宽度 */
  labelWidth?: string
  /** 标签位置 */
  labelPosition?: 'left' | 'right' | 'top'
}

/**
 * FormItem 组件 Props
 */
export interface IFormItemProps {
  /** 表单项类型 */
  type: FormItemType
  /** 表单项标签 */
  label?: string
  /** 字段名 */
  name: string
  /** 验证规则 */
  rules?: IFormRule[]
  /** 传递给内部组件的属性 */
  props?: Record<string, any>
  /** 是否必填（显示星号） */
  required?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 错误提示信息 */
  error?: string
}

/**
 * 表单验证结果
 */
export interface IFormValidation {
  /** 是否验证通过 */
  valid: boolean
  /** 错误信息（key: 字段名, value: 错误信息） */
  errors: Record<string, string>
}

/**
 * FormItem 选项（用于 select、radio、checkbox）
 */
export interface IFormOption {
  /** 选项标签 */
  label: string
  /** 选项值 */
  value: string | number | boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 其他属性 */
  [key: string]: any
}
