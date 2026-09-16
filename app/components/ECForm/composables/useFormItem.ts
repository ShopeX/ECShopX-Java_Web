import { computed, inject } from 'vue'
import type { FormItemType } from '../types'

/**
 * 表单项 Composable
 *
 * 职责：
 * - 提供表单项共享逻辑
 * - 处理表单上下文
 * - 提供样式计算
 */
export function useFormItem(props: {
  type: FormItemType
  error?: string
  disabled?: boolean
  required?: boolean
}) {
  // 注入表单上下文
  const formContext = inject<any>('formContext', {})

  // 是否有错误
  const hasError = computed(() => !!props.error)

  // 是否禁用
  const isDisabled = computed(() => {
    return props.disabled || formContext.disabled
  })

  // 是否必填
  const isRequired = computed(() => {
    return props.required || false
  })

  // 表单项容器样式
  const itemClasses = computed(() => ['mb-6'])

  // 标签样式
  const labelClasses = computed(() => [
    'block mb-2 text-sm font-medium text-gray-700',
    {
      'before:content-["*"] before:text-red-500 before:mr-1': isRequired.value,
    },
  ])

  return {
    formContext,
    hasError,
    isDisabled,
    isRequired,
    itemClasses,
    labelClasses,
  }
}
