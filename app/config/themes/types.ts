/**
 * 主题配置类型定义
 *
 * 支持多套主题切换，每个主题包含：
 * - 基础配置：主题名称、版本等
 * - 颜色配置：品牌色、背景色等
 * - 布局配置：头部、导航等样式
 * - 组件配置：按钮、卡片等样式
 */

/**
 * 颜色配置
 */
export interface IThemeColors {
  /** 主品牌色 */
  primary: string
  /** 次品牌色 */
  secondary: string
  /** 成功色 */
  success: string
  /** 警告色 */
  warning: string
  /** 危险色 */
  danger: string
  /** 信息色 */
  info: string
  /** 文本主色 */
  textPrimary: string
  /** 文本次色 */
  textSecondary: string
  /** 背景色 */
  background: string
  /** 边框色 */
  border: string
}

/**
 * 布局配置
 */
export interface IThemeLayout {
  /** 头部配置 */
  header: {
    /** 高度 */
    height: string
    /** 背景色 */
    background: string
    /** 是否固定 */
    fixed: boolean
  }
  /** 导航配置 */
  navigation: {
    /** 宽度 */
    width: string
    /** 背景色 */
    background: string
  }
  /** 页脚配置 */
  footer: {
    /** 高度 */
    height: string
    /** 背景色 */
    background: string
  }
  /** 容器最大宽度 */
  containerMaxWidth: string
  /** 间距单位 */
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

/**
 * 组件样式配置
 */
export interface IThemeComponents {
  /** 按钮样式 */
  button: {
    /** 圆角 */
    borderRadius: string
    /** 高度 */
    heights: {
      sm: string
      md: string
      lg: string
    }
  }
  /** 卡片样式 */
  card: {
    /** 圆角 */
    borderRadius: string
    /** 阴影 */
    shadow: string
    /** 背景色 */
    background: string
  }
  /** 输入框样式 */
  input: {
    /** 圆角 */
    borderRadius: string
    /** 高度 */
    height: string
    /** 边框色 */
    borderColor: string
  }
}

/**
 * 主题配置接口
 */
export interface IThemeConfig {
  /** 主题 ID */
  id: string
  /** 主题名称 */
  name: string
  /** 主题描述 */
  description?: string
  /** 主题版本 */
  version: string
  /** 颜色配置 */
  colors: IThemeColors
  /** 布局配置 */
  layout: IThemeLayout
  /** 组件配置 */
  components: IThemeComponents
  /** 是否支持暗黑模式 */
  supportsDarkMode: boolean
}
