import { h, render, type VNode, type AppContext } from 'vue'
import { ECModal } from '~/components/ECModal'
import type { IModalOptions, IModalInstance } from '~/components/ECModal/types'

/**
 * 创建弹窗容器
 */
function createModalContainer() {
  if (typeof document === 'undefined') {
    throw new Error('useModal: document is undefined. Make sure to call this in client-side only.')
  }
  const container = document.createElement('div')
  container.className = 'modal-container'
  document.body.appendChild(container)
  return container
}

/**
 * 创建弹窗实例
 */
function createModalInstance(
  options: IModalOptions,
  defaultTexts: { title: string; confirm: string; cancel: string },
  appContext?: AppContext
): IModalInstance {
  // 如果不在客户端环境，返回空实例
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('useModal: 只能在客户端环境中使用')
    return {
      show: () => {},
      hide: () => {},
      update: () => {},
      destroy: () => {},
    }
  }

  const container = createModalContainer()
  let vnode: VNode | null = null
  let isVisible = false

  // 创建弹窗组件
  const show = () => {
    isVisible = true

    // 创建 VNode
    vnode = h(ECModal, {
      modelValue: true,
      title: options.title || defaultTexts.title,
      content: options.content || '',
      // 不传 width 时由 ECModal 使用 Figma H5 响应式宽度（min(480px, 100vw-2rem)）
      ...(options.width != null && options.width !== '' ? { width: options.width } : {}),
      showClose: options.showClose !== false,
      maskClosable: options.maskClosable !== false,
      confirmText:
        options.confirmButton !== false
          ? options.confirmButton?.text || defaultTexts.confirm
          : undefined,
      cancelText:
        options.cancelButton !== false
          ? options.cancelButton?.text || defaultTexts.cancel
          : undefined,
      showConfirm: options.confirmButton !== false,
      showCancel: options.cancelButton !== false,
      'onUpdate:modelValue': (value: boolean) => {
        if (!value) {
          hide()
        }
      },
      onConfirm: async () => {
        if (options.onConfirm) {
          await options.onConfirm()
        }
        if (
          options.confirmButton &&
          typeof options.confirmButton === 'object' &&
          options.confirmButton.onClick
        ) {
          await options.confirmButton.onClick()
        }
        hide()
      },
      onCancel: async () => {
        if (options.onCancel) {
          await options.onCancel()
        }
        if (
          options.cancelButton &&
          typeof options.cancelButton === 'object' &&
          options.cancelButton.onClick
        ) {
          await options.cancelButton.onClick()
        }
        hide()
      },
      onClose: () => {
        if (options.onClose) {
          options.onClose()
        }
        hide()
      },
    })

    // 如果有应用上下文，设置到 VNode 上
    if (appContext) {
      vnode.appContext = appContext
    }

    // 渲染到容器
    render(vnode, container)
  }

  // 隐藏弹窗
  const hide = () => {
    if (!isVisible) return
    isVisible = false

    // 延迟销毁，等待动画完成
    setTimeout(() => {
      destroy()
    }, 300)
  }

  // 更新配置
  const update = (newOptions: Partial<IModalOptions>) => {
    Object.assign(options, newOptions)
    if (isVisible) {
      show()
    }
  }

  // 销毁弹窗
  const destroy = () => {
    if (vnode) {
      render(null, container)
      vnode = null
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }

  return {
    show,
    hide,
    update,
    destroy,
  }
}

/**
 * 使用弹窗 Composable
 */
export function useModal() {
  const { t } = useI18n()
  const defaultTexts = {
    title: t('96bd48e0.02d981'),
    confirm: t('96bd48e0.38cf16'),
    cancel: t('96bd48e0.625fb2'),
  }

  // 获取当前应用上下文
  let appContext: AppContext | undefined

  if (typeof window !== 'undefined') {
    try {
      // 在客户端环境中获取 Nuxt 应用实例
      const nuxtApp = useNuxtApp()
      appContext = nuxtApp.vueApp._context
    } catch (e) {
      console.warn('无法获取 Nuxt 应用上下文:', e)
    }
  }

  /**
   * 显示确认弹窗
   */
  const confirm = (options: IModalOptions | string): IModalInstance => {
    const modalOptions: IModalOptions = typeof options === 'string' ? { content: options } : options

    const instance = createModalInstance(modalOptions, defaultTexts, appContext)
    instance.show()
    return instance
  }

  /**
   * 显示警告弹窗
   */
  const alert = (options: IModalOptions | string): IModalInstance => {
    const modalOptions: IModalOptions =
      typeof options === 'string'
        ? { content: options, cancelButton: false }
        : { ...options, cancelButton: false }

    const instance = createModalInstance(modalOptions, defaultTexts, appContext)
    instance.show()
    return instance
  }

  /**
   * 显示自定义弹窗
   */
  const show = (options: IModalOptions): IModalInstance => {
    const instance = createModalInstance(options, appContext)
    instance.show()
    return instance
  }

  return {
    confirm,
    alert,
    show,
  }
}

/**
 * 全局弹窗方法（方便在非 setup 中使用）
 */
export const modal = {
  confirm: (options: IModalOptions | string) => {
    const { confirm } = useModal()
    return confirm(options)
  },
  alert: (options: IModalOptions | string) => {
    const { alert } = useModal()
    return alert(options)
  },
  show: (options: IModalOptions) => {
    const { show } = useModal()
    return show(options)
  },
}
