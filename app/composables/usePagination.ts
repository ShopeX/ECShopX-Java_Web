/**
 * 通用分页 Composable
 *
 * 提供分页状态管理和加载更多功能，适用于商品列表、订单列表等场景
 *
 * @example
 * ```ts
 * const {
 *   items,
 *   pagination,
 *   pending,
 *   error,
 *   hasMore,
 *   loadingMore,
 *   loadMore,
 *   refresh,
 *   reset,
 * } = usePagination({
 *   pageSize: 20,
 *   fetchFn: async (page, pageSize) => {
 *     const data = await api.getList({ page, pageSize })
 *     return {
 *       items: data.list,
 *       total: data.total_count,
 *     }
 *   },
 * })
 * ```
 */

export interface IPaginationOptions<T> {
  /**
   * 每页大小，默认 20
   */
  pageSize?: number

  /**
   * 初始页码，默认 1
   */
  initialPage?: number

  /**
   * 数据获取函数
   * @param page 当前页码
   * @param pageSize 每页大小
   * @returns 返回数据列表和总数
   */
  fetchFn: (
    page: number,
    pageSize: number
  ) => Promise<{
    items: T[]
    total: number
  }>

  /**
   * 是否自动加载首页数据，默认 false
   */
  immediate?: boolean
}

export interface IPaginationResult<T> {
  /**
   * 数据列表
   */
  items: Ref<T[]>

  /**
   * 分页信息
   */
  pagination: Ref<{
    total: number
    current: number
    hasMore: boolean
  }>

  /**
   * 是否正在加载（首次加载或刷新）
   */
  pending: Ref<boolean>

  /**
   * 错误信息
   */
  error: Ref<Error | null>

  /**
   * 是否正在加载更多
   */
  loadingMore: Ref<boolean>

  /**
   * 是否有更多数据
   */
  hasMore: ComputedRef<boolean>

  /**
   * 加载更多数据
   */
  loadMore: () => Promise<void>

  /**
   * 刷新数据（重置到第一页）
   */
  refresh: () => Promise<void>

  /**
   * 重置状态
   */
  reset: () => void

  /**
   * 加载指定页的数据
   * @param page 页码
   * @param append 是否追加到现有数据
   */
  loadPage: (page: number, append?: boolean) => Promise<void>
}

/**
 * 通用分页 Hook
 */
export function usePagination<T>(options: IPaginationOptions<T>): IPaginationResult<T> {
  const { pageSize = 20, initialPage = 1, fetchFn, immediate = false } = options

  // ========== 响应式状态 ==========
  const items = ref<T[]>([]) as Ref<T[]>
  const pagination = ref({
    total: 0,
    current: initialPage,
    hasMore: false,
  })
  const pending = ref(false)
  const error = ref<Error | null>(null)
  const loadingMore = ref(false)

  // ========== 计算属性 ==========
  const hasMore = computed(() => pagination.value.hasMore)

  // ========== 核心方法 ==========

  /**
   * 加载指定页的数据
   */
  const loadPage = async (page: number, append = false) => {
    try {
      // 设置加载状态
      if (append) {
        loadingMore.value = true
      } else {
        pending.value = true
        error.value = null
      }

      // 调用数据获取函数
      const result = await fetchFn(page, pageSize)

      // 更新数据
      if (append) {
        items.value.push(...result.items)
      } else {
        items.value = result.items
      }

      // 更新分页信息
      pagination.value = {
        total: result.total,
        current: page,
        hasMore: page * pageSize < result.total,
      }
    } catch (err) {
      error.value = err as Error
      console.error('加载数据失败:', err)
      throw err
    } finally {
      pending.value = false
      loadingMore.value = false
    }
  }

  /**
   * 加载更多数据
   */
  const loadMore = async () => {
    if (!hasMore.value || loadingMore.value || pending.value) {
      return
    }

    const nextPage = pagination.value.current + 1
    await loadPage(nextPage, true)
  }

  /**
   * 刷新数据（重置到第一页）
   */
  const refresh = async () => {
    pagination.value.current = initialPage
    await loadPage(initialPage, false)
  }

  /**
   * 重置所有状态
   */
  const reset = () => {
    items.value = []
    pagination.value = {
      total: 0,
      current: initialPage,
      hasMore: false,
    }
    pending.value = false
    error.value = null
    loadingMore.value = false
  }

  // ========== 初始化 ==========
  if (immediate) {
    loadPage(initialPage)
  }

  return {
    items,
    pagination,
    pending,
    error,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    reset,
    loadPage,
  }
}
