/**
 * 搜索、分类、迷你购物车、AI 助手抽屉的开关。
 * 抽屉本身挂在 app.vue，不跟着页面布局卸载，避免 Teleport Fragment 在路由切换时 nextSibling 为空。
 */
export function useMallOverlays() {
  const showSearchDrawer = useState('mall-overlay-search', () => false)
  const showCategoryNav = useState('mall-overlay-category', () => false)
  const showMiniCart = useState('mall-overlay-cart', () => false)
  const showAiAssistantDrawer = useState('mall-overlay-ai', () => false)
  const headerMenuId = useState('mall-overlay-menu-id', () => '')

  return {
    showSearchDrawer,
    showCategoryNav,
    showMiniCart,
    showAiAssistantDrawer,
    headerMenuId,
  }
}
