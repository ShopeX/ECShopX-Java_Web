<template>
  <div v-if="pending" class="flex justify-center p-8">
    <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl text-gray-400" />
  </div>
  <!-- 优先渲染模板，即使有 error（因为可能使用了默认模板） -->
  <div v-else-if="template">
    <template v-for="sectionKey in template.order" :key="sectionKey">
      <template v-if="namedSlotKeys.includes(sectionKey)">
        <slot :name="sectionKey" />
      </template>
      <template v-else>
        <component
          v-if="getSectionComponent(sectionKey)"
          :is="getSectionComponent(sectionKey)"
          v-bind="getSectionProps(sectionKey)"
        />
      </template>
    </template>
  </div>
  <!-- 只有在没有可用模板时才显示错误（API 和默认模板都失败） -->
  <div v-else-if="error" class="p-4 text-center text-red-500">
    {{ t('ef0d380c.40d1ac') }} {{ error.message }}
  </div>
  <!-- 没有模板也没有错误时显示空状态 -->
  <div v-else class="p-4 text-center text-gray-400">{{ t('ef0d380c.86ab9b') }}</div>
</template>

<script setup lang="ts">
import { logger } from '~/utils/log'
import { defineAsyncComponent, type Component } from 'vue'

// 获取所有具名插槽
const slots = useSlots()
const namedSlotKeys = computed(() => {
  // 默认插槽为 'default'，只返回具名插槽 key 列表
  return Object.keys(slots).filter((slotName) => slotName !== 'default')
})

logger.info('namedSlotKeys', namedSlotKeys.value)

const props = defineProps<{
  template: string
}>()
const { t } = useI18n()

const emit = defineEmits<{
  (e: 'loaded', template: any): void
}>()

// 使用模板配置（包含 API 和默认模板的完整逻辑）
const { template, pending, error } = await useTemplateWithFallback(props.template)

// 日志输出
logger.info('[TemplateEngine] Template loaded:', template.value)

// 动态组件映射 - 自动扫描 sections 目录下的所有 .vue 文件
const sectionModules = import.meta.glob('./sections/*.vue')

// 构建组件映射：从文件名提取组件类型
// 例如：./sections/carousel.vue → carousel
//      ./sections/featured-product.vue → featured-product
const sectionComponents: Record<string, () => Promise<Component>> = {}

Object.keys(sectionModules).forEach((path) => {
  // 提取文件名（不含扩展名）作为组件类型
  // ./sections/carousel.vue → carousel
  const match = path.match(/\.\/sections\/(.+)\.vue$/)
  if (match && match[1]) {
    const componentType = match[1]
    sectionComponents[componentType] = sectionModules[path] as () => Promise<Component>
    logger.info(`[TemplateEngine] Registered section component: ${componentType}`)
  }
})

logger.info('[TemplateEngine] Available section components:', Object.keys(sectionComponents))

// 获取 section 组件
const getSectionComponent = (sectionKey: string): Component | null => {
  if (!template.value) return null

  const section = template.value.sections[sectionKey]
  if (!section) {
    logger.warn(`Section "${sectionKey}" not found in template`)
    return null
  }

  const componentLoader = sectionComponents[section.type]
  if (!componentLoader) {
    logger.warn(`Component for section type "${section.type}" not found`)
    return null
  }

  // logger.info(sectionKey, section) // Reduced log noise

  return defineAsyncComponent(componentLoader)
}

// 获取 section 的 props（排除 type 字段）
const getSectionProps = (sectionKey: string): Record<string, unknown> => {
  if (!template.value) return {}

  const section = template.value.sections[sectionKey]
  if (!section) {
    return {}
  }

  const { type, ...props } = section
  return props
}

watch(template, (newVal) => {
  if (newVal) {
    logger.info('Template loaded:', newVal)
    emit('loaded', newVal)
  }
})
</script>
