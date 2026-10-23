export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand', // 品牌色 (Purple)
      secondary: 'blue', // 辅助色
      success: 'green', // 成功色
      warning: 'orange', // 警告色
      error: 'red', // 错误色
      info: 'blue', // 信息色
      neutral: 'gray', // 中性色
    },
    button: {
      default: {
        color: 'primary',
        variant: 'solid',
      },
    },
    // 通过主题系统设置背景色
    app: {
      background: 'bg-white dark:bg-gray-900',
    },
  },
})
