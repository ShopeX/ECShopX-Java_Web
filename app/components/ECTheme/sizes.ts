/**
 * 主题尺寸定义
 *
 * 职责：
 * - 定义所有 UI 组件使用的尺寸规范
 * - 保持尺寸定义的一致性
 */

/**
 * 按钮尺寸
 */
export const buttonSizes: Record<string, string> = {
  sm: 'h-7 px-3 text-sm',
  md: 'h-9 px-4 text-base',
  lg: 'h-11 px-6 text-lg',
}

/**
 * 输入框尺寸
 */
export const inputSizes: Record<string, string> = {
  sm: 'h-7 px-2 text-sm',
  md: 'h-9 px-3 text-base',
  lg: 'h-11 px-4 text-lg',
}

/**
 * 间距
 */
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
}

/**
 * 圆角
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  full: '9999px',
}

/**
 * 阴影
 */
export const shadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
}
