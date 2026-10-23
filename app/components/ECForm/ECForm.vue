<template>
  <form class="w-full" @submit.prevent="handleSubmit">
    <template v-for="item in schema" :key="item.name">
      <ECFormItem
        v-if="!item.hidden"
        :type="item.type"
        :label="item.label"
        :name="item.name"
        :rules="item.rules"
        :props="item.props"
        :required="isRequired(item)"
        :disabled="item.disabled || disabled"
        :error="errors[item.name]"
        :model-value="modelValue[item.name]"
        @update:model-value="updateField(item.name, $event)"
        @validate="handleValidate(item.name, $event)"
      >
        <!-- 自定义插槽：允许父组件自定义表单项内容 -->
        <template v-if="item.type === 'custom'" #default>
          <slot :name="item.name" :value="modelValue[item.name]" />
        </template>
      </ECFormItem>
    </template>

    <!-- 表单操作区域插槽 -->
    <slot name="actions" />
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, provide } from 'vue'
import type { IFormSchema, IFormValidation } from './types'
import { useFormValidation } from './composables/useFormValidation'
import ECFormItem from './ECFormItem.vue'
import { logger } from '~/utils/log'

interface Props {
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

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  labelWidth: '100px',
  labelPosition: 'left',
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  validate: [result: IFormValidation]
  submit: [value: Record<string, any>]
}>()

// 使用表单验证 composable
const { validateField } = useFormValidation()

// 表单验证错误信息
const errors = reactive<Record<string, string>>({})

// 初始值（用于重置）
const initialValues = ref<Record<string, any>>({})

// 保存初始值
watch(
  () => props.modelValue,
  (val) => {
    if (Object.keys(initialValues.value).length === 0) {
      initialValues.value = { ...val }
    }
  },
  { immediate: true, deep: true }
)

// 提供给子组件的上下文
provide('formContext', {
  labelWidth: props.labelWidth,
  labelPosition: props.labelPosition,
  disabled: props.disabled,
})

/**
 * 判断字段是否必填
 */
function isRequired(item: IFormSchema): boolean {
  return item.rules?.some((rule) => rule.required) ?? false
}

/**
 * 更新字段值
 */
function updateField(name: string, value: any) {
  logger.info(`Form updateField: ${name} = ${value}`)
  const newValue = { ...props.modelValue, [name]: value }
  emit('update:modelValue', newValue)

  // 清除该字段的错误信息
  if (errors[name]) {
    delete errors[name]
  }
}

/**
 * 处理字段验证
 */
function handleValidate(name: string, error: string) {
  if (error) {
    errors[name] = error
  } else {
    delete errors[name]
  }
}

/**
 * 验证整个表单
 */
async function validate(): Promise<boolean> {
  const newErrors: Record<string, string> = {}

  for (const item of props.schema) {
    if (item.hidden) continue

    const error = await validateField(props.modelValue[item.name], item.rules)

    if (error) {
      newErrors[item.name] = error
    }
  }

  // 更新错误信息
  Object.keys(errors).forEach((key) => delete errors[key])
  Object.assign(errors, newErrors)

  const valid = Object.keys(newErrors).length === 0

  emit('validate', { valid, errors: newErrors })

  return valid
}

/**
 * 重置表单
 */
function resetFields() {
  // 重置为初始值
  emit('update:modelValue', { ...initialValues.value })

  // 清除所有错误信息
  Object.keys(errors).forEach((key) => delete errors[key])
}

/**
 * 清除验证结果
 */
function clearValidate(name?: string) {
  if (name) {
    delete errors[name]
  } else {
    Object.keys(errors).forEach((key) => delete errors[key])
  }
}

/**
 * 处理表单提交
 */
async function handleSubmit() {
  logger.info('Form handleSubmit 被调用')
  logger.info(`表单数据: ${props.modelValue}`)
  const valid = await validate()
  logger.info(`表单验证结果: ${valid}`)
  logger.info(`验证错误: ${errors}`)
  if (valid) {
    logger.info('表单验证通过，触发 submit 事件')
    emit('submit', props.modelValue)
  } else {
    logger.info('表单验证失败，不触发 submit 事件')
  }
}

// 暴露方法给父组件
defineExpose({
  validate,
  resetFields,
  clearValidate,
})
</script>
