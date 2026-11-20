import { h, render } from 'vue'
import type { ToastOptions } from '~/components/ECToast'
import ECToast from '~/components/ECToast/ECToast.vue'

/**
 * Toast 管理器
 * 提供全局的 Toast 提示功能，动态创建和销毁 Toast 组件
 *
 * @example
 * ```vue
 * <script setup>
 * const toast = useToastMessage()
 *
 * function handleClick() {
 *   toast.show('请选择尺码')
 * }
 * </script>
 * ```
 */

// Toast 容器和实例管理
let toastContainer: HTMLElement | null = null
let toastVNode: any = null

/**
 * 创建 Toast 容器
 */
function createToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

/**
 * 创建 Toast 实例
 */
function createToastInstance() {
  const container = createToastContainer()

  // 创建 VNode
  toastVNode = h(ECToast)

  // 渲染到容器
  render(toastVNode, container)

  return toastVNode.component?.exposed
}

/**
 * 使用 Toast 消息提示
 *
 * @example
 * ```ts
 * const toast = useToastMessage()
 * toast.show('请选择尺码')
 * ```
 *
 * @note 不使用 useToast 命名以避免与 Nuxt UI 的 useToast 冲突
 */
export function useToastMessage() {
  // SSR 环境下返回空实现
  if (import.meta.server) {
    return {
      show: () => {},
      hide: () => {},
    }
  }

  const { t } = useI18n()
  const generatedKeyPattern = /^[a-f0-9]{8}\.[a-f0-9]{6}$/

  function translateIfGeneratedKey(value: string) {
    return generatedKeyPattern.test(value) ? t(value) : value
  }

  function normalizeOptions(options: string | ToastOptions): string | ToastOptions {
    if (typeof options === 'string') {
      return translateIfGeneratedKey(options)
    }

    return {
      ...options,
      message: translateIfGeneratedKey(options.message),
    }
  }

  return {
    /**
     * 显示 Toast 提示
     * @param options - 消息内容或完整配置
     */
    show(options: string | ToastOptions) {
      // 如果还没有实例，创建一个
      let instance = toastVNode?.component?.exposed

      if (!instance) {
        instance = createToastInstance()
      }

      if (instance && instance.show) {
        instance.show(normalizeOptions(options))
      }
    },

    /**
     * 隐藏 Toast 提示
     */
    hide() {
      const instance = toastVNode?.component?.exposed
      if (instance && instance.hide) {
        instance.hide()
      }
    },
  }
}
