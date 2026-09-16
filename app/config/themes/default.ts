/**
 * 默认主题配置
 *
 * 这是系统的默认主题，包含完整的样式配置
 */

import type { IThemeConfig } from './types'

export const defaultTheme: IThemeConfig = {
  id: 'default',
  name: '默认主题',
  description: 'ECSHOPX 默认商城主题',
  version: '1.0.0',
  supportsDarkMode: true,

  colors: {
    primary: '#3B82F6', // 蓝色
    secondary: '#8B5CF6', // 紫色
    success: '#10B981', // 绿色
    warning: '#F59E0B', // 橙色
    danger: '#EF4444', // 红色
    info: '#06B6D4', // 青色
    textPrimary: '#1F2937', // 深灰
    textSecondary: '#6B7280', // 中灰
    background: '#FFFFFF', // 白色
    border: '#E5E7EB', // 浅灰
  },

  layout: {
    header: {
      height: '64px',
      background: '#FFFFFF',
      fixed: true,
    },
    navigation: {
      width: '250px',
      background: '#F9FAFB',
    },
    footer: {
      height: '200px',
      background: '#1F2937',
    },
    containerMaxWidth: '1280px',
    spacing: {
      xs: '0.25rem', // 4px
      sm: '0.5rem', // 8px
      md: '1rem', // 16px
      lg: '1.5rem', // 24px
      xl: '2rem', // 32px
    },
  },

  components: {
    button: {
      borderRadius: '0.375rem', // 6px
      heights: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
    },
    card: {
      borderRadius: '0.5rem', // 8px
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      background: '#FFFFFF',
    },
    input: {
      borderRadius: '0.375rem', // 6px
      height: '40px',
      borderColor: '#D1D5DB',
    },
  },
}
