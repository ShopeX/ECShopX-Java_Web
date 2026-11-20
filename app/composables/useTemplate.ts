import { templateApiClient } from '~/infrastructure/http/clients'
import type { ITemplateConfig } from '~/types/api/template'
import { logger } from '~/utils/log'

/**
 * 获取业务模式（bbc 或 b2c）
 * 兼容历史上的 b2b 旧值，统一归一化为 bbc。
 */
export function getBusinessMode(): 'bbc' | 'b2c' {
  const runtimeConfig = useRuntimeConfig()
  const mode = runtimeConfig.public.businessMode || 'b2c'
  return (mode === 'b2b' ? 'bbc' : mode) as 'bbc' | 'b2c'
}

/**
 * 加载本地默认模板配置
 * @param templateName - 模板名称（如 'header', 'footer', 'index' 等）
 * @returns 模板配置对象
 */
export async function loadDefaultTemplate(templateName: string): Promise<ITemplateConfig | null> {
  try {
    const businessMode = getBusinessMode()

    // 动态导入对应的模板配置
    // 例如：b2c/header.ts, b2c/index.ts
    const templates = import.meta.glob('../templateEngines/templates/*/*.ts', { eager: false })
    const templatePath = `../templateEngines/templates/${businessMode}/${templateName}.ts`

    // 查找匹配的模板路径
    const matchedPath = Object.keys(templates).find((path) => path === templatePath)

    if (!matchedPath) {
      logger.warn(`[useTemplate] Default template not found: ${templatePath}`)
      return null
    }

    // 加载模板
    const loader = templates[matchedPath]
    if (!loader) {
      logger.warn(`[useTemplate] Template loader not found: ${matchedPath}`)
      return null
    }
    const module = await loader()
    const templateConfig = (module as any).default

    if (!templateConfig) {
      logger.warn(`[useTemplate] Default template is empty: ${templatePath}`)
      return null
    }

    logger.info(`[useTemplate] Loaded default template: ${templatePath}`)
    return templateConfig
  } catch (error) {
    logger.error(`[useTemplate] Failed to load default template for "${templateName}":`, error)
    return null
  }
}

/**
 * 获取默认模板配置（同步版本，用于已经加载的模板）
 */
export function getDefaultTemplateSync(templateName: string): ITemplateConfig | null {
  try {
    const businessMode = getBusinessMode()

    // 使用 eager 模式同步导入
    const templates = import.meta.glob('../templateEngines/templates/*/*.ts', { eager: true })
    const templatePath = `../templateEngines/templates/${businessMode}/${templateName}.ts`

    const matchedPath = Object.keys(templates).find((path) => path === templatePath)

    if (!matchedPath) {
      return null
    }

    const module = templates[matchedPath]
    return (module as any).default || null
  } catch (error) {
    logger.error(`[useTemplate] Failed to get default template sync for "${templateName}":`, error)
    return null
  }
}

/**
 * 从 API 获取模板配置
 * @param name - 模板名称
 */
export const useTemplate = (name: string) => {
  const {
    data: template,
    pending,
    error,
    refresh,
  } = useAsyncData<ITemplateConfig>(
    `template-${name}`,
    async () => {
      try {
        const response = await templateApiClient.getTemplateConfig(name)
        // 根据 API 响应结构，数据可能在 data 字段中
        // 如果后端直接返回配置对象，则直接返回 response
        // 这里假设遵循标准的 ApiResponse 结构
        return response.data || response
      } catch (err: any) {
        // 模板接口失败时不抛出错误，返回 null 让 fallback 机制接管
        // 这样可以避免在控制台显示刺眼的错误信息
        logger.warn(`[useTemplate] Failed to fetch template "${name}" from API:`, err.message)
        return null
      }
    },
    {
      lazy: false, // 页面关键数据，建议非懒加载，或者根据需求调整
      server: true, // 支持 SSR
    }
  )

  return {
    template,
    pending,
    error,
    refresh,
  }
}

/**
 * 检查模板配置是否有效
 * @param template - 模板配置对象
 * @returns 是否为有效的模板配置
 */
function isValidTemplate(template: any): boolean {
  if (!template) return false
  if (Array.isArray(template) && template.length === 0) return false
  // 检查是否有 sections 和 order 字段
  if (!template.sections || !template.order) return false
  // 检查 order 是否为非空数组
  if (!Array.isArray(template.order) || template.order.length === 0) return false
  return true
}

/**
 * 使用模板配置（包含 API 和默认模板的完整逻辑）
 * @param name - 模板名称
 * @returns 包含模板数据、加载状态和错误信息
 */
export const useTemplateWithFallback = async (name: string) => {
  // 1. 从 API 获取模板配置
  const { template: apiTemplate, pending, error } = useTemplate(name)

  // 2. 加载默认模板作为后备
  const { data: defaultTemplate } = await useAsyncData(
    `default-template-${name}`,
    () => loadDefaultTemplate(name),
    {
      lazy: false,
      server: true,
    }
  )

  // 3. 统一返回 template 字段
  //    优先使用 API 配置，以下情况使用默认配置：
  //    - 接口请求失败（error）
  //    - template 返回 null
  //    - template 返回空数组 []
  //    - template 缺少必要字段（sections, order）
  const template = computed(() => {
    // 检查 API 模板是否有效
    const hasValidApiTemplate = isValidTemplate(apiTemplate.value)

    if (hasValidApiTemplate) {
      logger.info(`[useTemplate] ✓ Using API template: ${name}`)
      return apiTemplate.value
    }

    // API 模板无效，使用默认模板
    if (defaultTemplate.value) {
      // 记录使用默认模板的原因（使用 info 级别，因为这是正常的降级行为）
      if (error.value) {
        logger.info(
          `[useTemplate] ⚠ API request failed (${error.value.message}), using default template: ${name}`
        )
      } else if (!apiTemplate.value) {
        logger.info(`[useTemplate] ⚠ API returned null, using default template: ${name}`)
      } else if (Array.isArray(apiTemplate.value) && apiTemplate.value.length === 0) {
        logger.info(`[useTemplate] ⚠ API returned empty array, using default template: ${name}`)
      } else {
        logger.info(`[useTemplate] ⚠ API template invalid, using default template: ${name}`)
      }

      return defaultTemplate.value
    }

    // 没有可用的模板
    logger.error(`[useTemplate] ✗ No valid template available for: ${name}`)
    return null
  })

  return {
    template,
    pending,
    error,
  }
}
