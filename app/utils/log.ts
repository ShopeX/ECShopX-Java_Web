/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * 日志配置接口
 */
export interface ILogConfig {
  /**
   * 是否启用日志
   */
  enabled: boolean
  /**
   * 最小日志级别
   */
  level: LogLevel
  /**
   * 是否显示时间戳
   */
  showTimestamp: boolean
  /**
   * 是否显示调用位置
   */
  showCaller: boolean
  /**
   * 前缀标签
   */
  prefix?: string
}

/**
 * 默认日志配置
 */
const defaultConfig: ILogConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  level: process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
  showTimestamp: true,
  showCaller: true,
  prefix: '[ECSHOPX-WEB]',
}

/**
 * 当前日志配置
 */
let currentConfig: ILogConfig = { ...defaultConfig }

/**
 * 日志样式配置
 */
const logStyles = {
  debug: 'color: #6b7280; font-weight: normal',
  info: 'color: #3b82f6; font-weight: normal',
  warn: 'color: #f59e0b; font-weight: bold',
  error: 'color: #ef4444; font-weight: bold',
  timestamp: 'color: #9ca3af; font-size: 0.85em',
  caller: 'color: #10b981; font-size: 0.85em',
  prefix: 'color: #6366f1; font-weight: bold',
}

/**
 * 获取时间戳字符串
 */
function getTimestamp(): string {
  return new Date().toISOString()
}

/**
 * 获取调用位置信息
 */
function getCallerInfo(): string {
  try {
    const stack = new Error().stack
    if (!stack) return ''

    const stackLines = stack.split('\n')

    // 查找第一个不在 log.ts 文件中的调用栈
    // 跳过: Error、getCallerInfo、formatMessage、log、logger.debug/info/warn/error
    for (let i = 3; i < stackLines.length; i++) {
      const line = stackLines[i]
      if (!line) continue

      // 匹配多种调用栈格式：
      // 1. at functionName (file:line:column)
      // 2. at file:line:column
      // 3. at Object.functionName (file:line:column)
      let match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/)

      if (!match) {
        // 尝试匹配没有函数名的格式: at file:line:column
        match = line.match(/at\s+(.+?):(\d+):(\d+)/)
        if (match && match.length >= 3) {
          const file = match[1]
          const line = match[2]
          if (file && line && !file.includes('log.ts')) {
            const fileName = getFileName(file)
            return `${fileName}:${line}`
          }
        }
        continue
      }

      if (match.length >= 4) {
        const file = match[2]
        const line = match[3]
        if (file && line && !file.includes('log.ts')) {
          const fileName = getFileName(file)
          return `${fileName}:${line}`
        }
      }
    }

    return ''
  } catch {
    return ''
  }
}

/**
 * 从完整路径中提取文件名
 */
function getFileName(filePath: string): string {
  // 处理不同操作系统的路径分隔符
  const parts = filePath.split(/[/\\]/)
  const fileName = parts[parts.length - 1] || filePath

  // 如果是相对路径，尝试保留一些路径信息以便识别
  if (filePath.includes('app/')) {
    const appIndex = filePath.indexOf('app/')
    const relativePath = filePath.substring(appIndex + 4) // 跳过 'app/'
    return relativePath.replace(/[/\\]/g, '/')
  }

  return fileName
}

/**
 * 格式化日志消息
 */
function formatMessage(
  level: LogLevel,
  messages: any[],
  config: ILogConfig
): { formatString: string; styles: string[]; actualMessages: any[] } {
  const formatParts: string[] = []
  const styles: string[] = []

  // 添加前缀
  if (config.prefix) {
    formatParts.push(`%c${config.prefix}`)
    styles.push(logStyles.prefix)
  }

  // 添加时间戳
  if (config.showTimestamp) {
    const timestamp = getTimestamp()
    formatParts.push(`%c[${timestamp}]`)
    styles.push(logStyles.timestamp)
  }

  // 添加调用位置
  if (config.showCaller) {
    const caller = getCallerInfo()
    if (caller) {
      formatParts.push(`%c[${caller}]`)
      styles.push(logStyles.caller)
    }
  }

  // 添加级别标签
  const levelLabels: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: '%c[DEBUG]',
    [LogLevel.INFO]: '%c[INFO]',
    [LogLevel.WARN]: '%c[WARN]',
    [LogLevel.ERROR]: '%c[ERROR]',
    [LogLevel.NONE]: '%c[NONE]',
  }

  if (level in levelLabels) {
    formatParts.push(levelLabels[level])
    const levelKey = LogLevel[level]?.toLowerCase() as keyof typeof logStyles
    if (levelKey && levelKey in logStyles) {
      styles.push(logStyles[levelKey])
    }
  }

  // 合并所有格式化字符串，用空格分隔
  const formatString = formatParts.join(' ')

  return { formatString, styles, actualMessages: messages }
}

/**
 * 核心日志函数
 */
function log(level: LogLevel, ...messages: any[]): void {
  if (!currentConfig.enabled || level < currentConfig.level) {
    return
  }

  const { formatString, styles, actualMessages } = formatMessage(level, messages, currentConfig)

  // 构建 console 参数：格式化字符串 + 样式数组 + 实际消息
  const args: any[] = [formatString, ...styles, ...actualMessages]

  switch (level) {
    case LogLevel.DEBUG:
      console.debug(...args)
      break
    case LogLevel.INFO:
      console.info(...args)
      break
    case LogLevel.WARN:
      console.warn(...args)
      break
    case LogLevel.ERROR:
      console.error(...args)
      break
  }
}

/**
 * 日志工具类
 */
export const logger = {
  /**
   * 配置日志
   */
  config(config: Partial<ILogConfig>): void {
    currentConfig = { ...currentConfig, ...config }
  },

  /**
   * 重置配置为默认值
   */
  reset(): void {
    currentConfig = { ...defaultConfig }
  },

  /**
   * 获取当前配置
   */
  getConfig(): ILogConfig {
    return { ...currentConfig }
  },

  /**
   * Debug 级别日志
   */
  debug(...messages: any[]): void {
    log(LogLevel.DEBUG, ...messages)
  },

  /**
   * Info 级别日志
   */
  info(...messages: any[]): void {
    log(LogLevel.INFO, ...messages)
  },

  /**
   * Warn 级别日志
   */
  warn(...messages: any[]): void {
    log(LogLevel.WARN, ...messages)
  },

  /**
   * Error 级别日志
   */
  error(...messages: any[]): void {
    log(LogLevel.ERROR, ...messages)
  },

  /**
   * 分组日志
   */
  group(label: string, collapsed = false): void {
    if (!currentConfig.enabled) return
    if (collapsed) {
      console.groupCollapsed(label)
    } else {
      console.group(label)
    }
  },

  /**
   * 结束分组
   */
  groupEnd(): void {
    if (!currentConfig.enabled) return
    console.groupEnd()
  },

  /**
   * 表格日志
   */
  table(data: any, columns?: string[]): void {
    if (!currentConfig.enabled || currentConfig.level > LogLevel.DEBUG) return
    console.table(data, columns)
  },

  /**
   * 时间计时开始
   */
  time(label: string): void {
    if (!currentConfig.enabled || currentConfig.level > LogLevel.DEBUG) return
    console.time(label)
  },

  /**
   * 时间计时结束
   */
  timeEnd(label: string): void {
    if (!currentConfig.enabled || currentConfig.level > LogLevel.DEBUG) return
    console.timeEnd(label)
  },

  /**
   * 断言
   */
  assert(condition: boolean, ...messages: any[]): void {
    if (!currentConfig.enabled) return
    console.assert(condition, ...messages)
  },
}

/**
 * 默认导出 logger
 */
export default logger
