/**
 * 搜索历史记录管理 Composable
 *
 * 功能：
 * - 从 localStorage 读取/存储搜索历史
 * - 最多保留 10 条记录
 * - 支持添加、清空历史
 */

const STORAGE_KEY = 'search_history'
const MAX_HISTORY_COUNT = 10

export function useSearchHistory() {
  const historyKeywords = ref<string[]>([])

  // 从 localStorage 加载历史记录
  function loadHistory() {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          historyKeywords.value = JSON.parse(stored)
        }
      } catch {
        historyKeywords.value = []
      }
    }
  }

  // 保存到 localStorage
  function saveHistory() {
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(historyKeywords.value))
      } catch {
        // Storage full or disabled, ignore
      }
    }
  }

  // 添加搜索记录
  function addHistory(keyword: string) {
    const trimmed = keyword.trim()
    if (!trimmed) return

    // 移除已存在的相同关键词（去重）
    const index = historyKeywords.value.indexOf(trimmed)
    if (index > -1) {
      historyKeywords.value.splice(index, 1)
    }

    // 添加到开头
    historyKeywords.value.unshift(trimmed)

    // 限制数量
    if (historyKeywords.value.length > MAX_HISTORY_COUNT) {
      historyKeywords.value = historyKeywords.value.slice(0, MAX_HISTORY_COUNT)
    }

    saveHistory()
  }

  // 清空历史记录
  function clearHistory() {
    historyKeywords.value = []
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // 初始化加载
  onMounted(() => {
    loadHistory()
  })

  return {
    historyKeywords: readonly(historyKeywords),
    addHistory,
    clearHistory,
  }
}
