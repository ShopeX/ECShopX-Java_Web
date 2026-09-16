<template>
  <div :class="itemClasses">
    <!-- 标签 -->
    <label v-if="label" :class="labelClasses">
      {{ label }}
    </label>

    <!-- 内容区域 -->
    <div class="relative">
      <!-- 动态渲染表单控件 -->
      <component
        :is="formComponent"
        v-if="type !== 'custom'"
        v-bind="componentProps"
        :model-value="modelValue"
        :error="hasError"
        :disabled="isDisabled"
        @update:model-value="handleUpdate"
        @blur="handleBlur"
      />

      <!-- 自定义类型（插槽） -->
      <slot v-else />

      <!-- 错误提示 -->
      <div v-if="error" class="mt-1 text-sm text-red-500">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormItemType, IFormRule } from './types'
import { useFormItem } from './composables/useFormItem'
import { useFormValidation } from './composables/useFormValidation'
import ECFormInput from './ECFormInput.vue'
import ECFormSelect from './ECFormSelect.vue'
import ECFormRadioGroup from './ECFormRadioGroup.vue'
import ECFormCheckboxGroup from './ECFormCheckboxGroup.vue'

interface Props {
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
  /** 字段值 */
  modelValue?: any
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  validate: [error: string]
}>()

// 使用 composables
const { itemClasses, labelClasses, hasError, isDisabled } = useFormItem(props)
const { validateField, filterRulesByTrigger } = useFormValidation()

// 组件映射
const componentMap = {
  input: ECFormInput,
  select: ECFormSelect,
  radio: ECFormRadioGroup,
  checkbox: ECFormCheckboxGroup,
  custom: null,
}

// 计算当前表单控件组件
const formComponent = computed(() => {
  return componentMap[props.type] || null
})

// 组件属性
const componentProps = computed(() => {
  return {
    name: props.name,
    ...props.props,
  }
})

/**
 * 处理值更新
 */
function handleUpdate(value: any) {
  emit('update:modelValue', value)
}

/**
 * 处理失焦验证
 */
async function handleBlur() {
  if (!props.rules || props.rules.length === 0) return

  // 过滤失焦时触发的规则
  const blurRules = filterRulesByTrigger(props.rules, 'blur')
  if (blurRules.length === 0) return

  // 执行验证
  const error = await validateField(props.modelValue, blurRules)
  emit('validate', error)
}
</script>
