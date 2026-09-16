import { ref, onMounted } from 'vue'
import { usePostMessage } from './usePostMessage'
import { logger } from '~/utils/log'

/**
 * Composable for managing Design Mode logic and communication
 * Used by the child page (Nuxt 4 preview)
 */
export function useDesignMode() {
  // Initialize communication channel
  const { post, on } = usePostMessage('ecshopx-bridge', {
    isParent: false, // This is running in the child iframe
  })

  // Reactive schema state
  // In a real app, this would likely feed into a Store or defineProps
  const pageSchema = ref<any>(null)

  /**
   * Notify parent when a widget is selected
   */
  const notifySelection = (
    id: string | null,
    rect?: DOMRect | { top: number; left: number; width: number; height: number },
    schema?: any
  ) => {
    post('WIDGET_SELECTED', {
      id,
      rect,
      schema,
    })
  }

  /**
   * Notify parent that the child iframe is ready to receive data
   */
  const notifyReady = () => {
    post('CHILD_READY', {
      timestamp: Date.now(),
      url: window.location.href,
    })
  }

  // Setup listeners
  on('UPDATE_SCHEMA', (payload: any) => {
    logger.info('[DesignMode] Received schema update:', payload)
    pageSchema.value = payload
    // TODO: Update global store or trigger re-render logic here
  })

  on('SCROLL_TO_WIDGET', (payload: { id: string }) => {
    const el = document.querySelector(`[data-widget-id="${payload.id}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })

  onMounted(() => {
    // Tell parent we are ready
    notifyReady()
  })

  return {
    pageSchema,
    notifySelection,
    notifyReady,
  }
}
