/**
 * 主题模块统一导出
 *
 * 提供：
 * - 颜色定义
 * - 尺寸定义
 * - 变体定义
 */

// 颜色导出
export * from './colors'

// 尺寸导出
export * from './sizes'

// 变体导出
export * from './variants'

// 工具函数：生成 Tailwind CSS 类名
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
