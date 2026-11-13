import { defineStore } from 'pinia'

/**
 * 购物车 UI 状态接口
 */
interface CartUIState {
  /** 全局加载状态 */
  loading: boolean
  /** 操作加载状态映射 (操作key -> loading状态) */
  actionLoading: Record<string, boolean>
  /** 最后更新时间 */
  lastUpdateTime: number | null
  /** 是否已初始化 */
  initialized: boolean
  /** 购物车抽屉是否打开 */
  isOpen: boolean
}

/**
 * 购物车 UI 状态管理 Store (DDD 架构版本)
 *
 * 职责：
 * - 管理 UI 加载状态
 * - 管理操作加载状态
 * - 不包含任何业务逻辑
 * - 业务逻辑全部在领域层处理
 *
 * @example
 * ```typescript
 * const cartUIStore = useCartUIStore()
 *
 * // 设置加载状态
 * cartUIStore.setLoading(true)
 *
 * // 设置操作加载状态
 * cartUIStore.setActionLoading('add-to-cart', true)
 * ```
 */
export const useCartUIStore = defineStore('cart-ui', {
  state: (): CartUIState => ({
    loading: false,
    actionLoading: {},
    lastUpdateTime: null,
    initialized: false,
    isOpen: false,
  }),

  getters: {
    /**
     * 检查是否正在加载
     */
    isLoading: (state): boolean => state.loading,

    /**
     * 检查特定操作是否正在加载
     */
    isActionLoading:
      (state) =>
      (key: string): boolean => {
        return state.actionLoading[key] || false
      },

    /**
     * 获取所有正在进行的操作
     */
    activeActions: (state): string[] => {
      return Object.keys(state.actionLoading).filter((key) => state.actionLoading[key])
    },
  },

  actions: {
    /**
     * 设置全局加载状态
     */
    setLoading(loading: boolean) {
      this.loading = loading
    },

    /**
     * 设置操作加载状态
     */
    setActionLoading(key: string, loading: boolean) {
      if (loading) {
        this.actionLoading[key] = true
      } else {
        delete this.actionLoading[key]
      }
    },

    /**
     * 批量设置操作加载状态
     */
    setMultipleActionLoading(keys: string[], loading: boolean) {
      keys.forEach((key) => this.setActionLoading(key, loading))
    },

    /**
     * 清除所有操作加载状态
     */
    clearAllActionLoading() {
      this.actionLoading = {}
    },

    /**
     * 更新最后更新时间
     */
    updateLastUpdateTime() {
      this.lastUpdateTime = Date.now()
    },

    /**
     * 标记为已初始化
     */
    markAsInitialized() {
      this.initialized = true
    },

    /**
     * 重置状态
     */
    reset() {
      this.loading = false
      this.actionLoading = {}
      this.lastUpdateTime = null
      this.initialized = false
      this.isOpen = false
    },

    open() {
      this.isOpen = true
    },

    close() {
      this.isOpen = false
    },

    toggle() {
      this.isOpen = !this.isOpen
    },
  },
})
