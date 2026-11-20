/**
 * 弹窗按钮配置
 */
export interface IModalButton {
  /** 按钮文本 */
  text: string
  /** 按钮类型 */
  type?: 'primary' | 'default'
  /** 点击回调 */
  onClick?: () => void | Promise<void>
  /** 是否加载中 */
  loading?: boolean
}

/**
 * 弹窗配置
 */
export interface IModalOptions {
  /** 弹窗标题 */
  title?: string
  /** 弹窗内容 */
  content?: string
  /** 宽度 */
  width?: string | number
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否可以点击遮罩关闭 */
  maskClosable?: boolean
  /** 确认按钮配置 */
  confirmButton?: IModalButton | false
  /** 取消按钮配置 */
  cancelButton?: IModalButton | false
  /** 确认回调 */
  onConfirm?: () => void | Promise<void>
  /** 取消回调 */
  onCancel?: () => void | Promise<void>
  /** 关闭回调 */
  onClose?: () => void
}

/**
 * 弹窗实例
 */
export interface IModalInstance {
  /** 显示弹窗 */
  show: () => void
  /** 隐藏弹窗 */
  hide: () => void
  /** 更新配置 */
  update: (options: Partial<IModalOptions>) => void
  /** 销毁弹窗 */
  destroy: () => void
}

/**
 * 弹窗状态
 */
export interface IModalState extends IModalOptions {
  /** 是否显示 */
  visible: boolean
  /** 确认按钮加载状态 */
  confirmLoading: boolean
  /** 取消按钮加载状态 */
  cancelLoading: boolean
}
