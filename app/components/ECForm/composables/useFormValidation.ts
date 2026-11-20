import type { IFormRule } from '../types'

/**
 * 表单验证 Composable
 *
 * 职责：
 * - 提供字段验证逻辑
 * - 支持多种验证规则（必填、长度、正则、自定义）
 * - 返回验证错误信息
 */
export function useFormValidation() {
  /**
   * 验证单个字段
   *
   * @param value - 字段值
   * @param rules - 验证规则数组
   * @returns 错误信息（空字符串表示验证通过）
   */
  async function validateField(value: any, rules?: IFormRule[]): Promise<string> {
    if (!rules || rules.length === 0) {
      return ''
    }

    for (const rule of rules) {
      // 必填验证
      if (rule.required) {
        if (value === undefined || value === null || value === '') {
          return rule.message
        }
        // 数组类型的必填验证
        if (Array.isArray(value) && value.length === 0) {
          return rule.message
        }
      }

      // 跳过空值的非必填验证
      if ((value === undefined || value === null || value === '') && !rule.required) {
        continue
      }

      // 最小长度/值验证
      if (rule.min !== undefined) {
        const len = typeof value === 'string' ? value.length : value
        if (len < rule.min) {
          return rule.message
        }
      }

      // 最大长度/值验证
      if (rule.max !== undefined) {
        const len = typeof value === 'string' ? value.length : value
        if (len > rule.max) {
          return rule.message
        }
      }

      // 正则验证
      if (rule.pattern) {
        if (!rule.pattern.test(String(value))) {
          return rule.message
        }
      }

      // 自定义验证
      if (rule.validator) {
        try {
          const result = await rule.validator(value)
          if (!result) {
            return rule.message
          }
        } catch (error) {
          return rule.message
        }
      }
    }

    // 验证通过
    return ''
  }

  /**
   * 验证多个字段
   *
   * @param fields - 字段数组 { name, value, rules }
   * @returns 错误对象 { fieldName: errorMessage }
   */
  async function validateFields(
    fields: Array<{ name: string; value: any; rules?: IFormRule[] }>
  ): Promise<Record<string, string>> {
    const errors: Record<string, string> = {}

    for (const field of fields) {
      const error = await validateField(field.value, field.rules)
      if (error) {
        errors[field.name] = error
      }
    }

    return errors
  }

  /**
   * 根据触发时机过滤规则
   *
   * @param rules - 规则数组
   * @param trigger - 触发时机
   * @returns 过滤后的规则数组
   */
  function filterRulesByTrigger(
    rules: IFormRule[] | undefined,
    trigger: 'blur' | 'change' | 'submit'
  ): IFormRule[] {
    if (!rules || rules.length === 0) {
      return []
    }

    return rules.filter((rule) => {
      // 如果规则没有指定 trigger，则在所有时机都触发
      if (!rule.trigger) {
        return true
      }
      return rule.trigger === trigger
    })
  }

  return {
    validateField,
    validateFields,
    filterRulesByTrigger,
  }
}
