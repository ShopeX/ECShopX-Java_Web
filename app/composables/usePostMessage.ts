import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

interface PostMessageOptions {
  targetOrigin?: string
  isParent?: boolean
  iframeRef?: Ref<HTMLIFrameElement | null>
}

export interface MessagePayload<T = any> {
  channel: string
  type: string
  payload: T
}

/**
 * Generic composable for iframe communication using postMessage
 *
 * @param channel - Unique channel namespace to filter messages
 * @param options - Configuration options
 */
export function usePostMessage(channel: string, options: PostMessageOptions = {}) {
  const { targetOrigin = '*', isParent = false, iframeRef } = options

  // Reactive state for the latest received message payload
  const data = ref<any>(null)

  /**
   * Post a message to the target window
   */
  const post = <T = any>(type: string, payload: T) => {
    const message: MessagePayload<T> = {
      channel,
      type,
      payload,
    }

    // Vue 3 uses Proxy, deep clone to ensure data is transferable
    const cleanMessage = JSON.parse(JSON.stringify(message))

    if (isParent) {
      // Parent sending to child iframe
      if (iframeRef?.value?.contentWindow) {
        iframeRef.value.contentWindow.postMessage(cleanMessage, targetOrigin)
      } else {
        console.warn(`[usePostMessage] iframeRef is not ready or missing contentWindow`)
      }
    } else {
      // Child sending to parent window
      if (window.parent) {
        window.parent.postMessage(cleanMessage, targetOrigin)
      }
    }
  }

  /**
   * Register a listener for a specific message type
   */
  const on = <T = any>(type: string, callback: (payload: T) => void) => {
    useEventListener(window, 'message', (event: MessageEvent) => {
      // 1. Origin check (optional)
      // if (targetOrigin !== '*' && event.origin !== targetOrigin) return

      // 2. Data structure check
      const msg = event.data
      if (!msg || typeof msg !== 'object' || msg.channel !== channel) {
        return
      }

      // 3. Type check and callback execution
      if (msg.type === type) {
        callback(msg.payload)
      }
    })
  }

  // Global listener to update the generic `data` ref
  useEventListener(window, 'message', (event: MessageEvent) => {
    const msg = event.data
    if (!msg || typeof msg !== 'object' || msg.channel !== channel) {
      return
    }
    // Update reactive state
    data.value = msg
  })

  return {
    data,
    post,
    on,
  }
}
