import type { WebMenuItem } from '~/decoration-engine/components/webMenuTypes'

export type ItemListCategoryLinkType = Extract<WebMenuItem['link_type'], 'category' | 'sale_category'>

/**
 * 导航分类 → 商品列表接口参数映射（`GET /wxapp/goods/items`，同一接口按 link_type 区分）：
 *
 * | 后台类型 | link_type       | 说明           | 列表接口参数        |
 * |----------|-----------------|----------------|---------------------|
 * | 管理分类 | `category`      | 商品管理分类   | `main_category={id}` |
 * | 销售分类 | `sale_category` | 前台销售/营销分类 | `category_id={id}`（不传 main_category） |
 *
 * 前台路由统一为 `/collections/{id}?link_type=...`，由列表页读取 link_type 后调用本函数。
 */
export function resolveItemListCategoryParams(
  categoryId: string,
  linkType?: string | null
) {
  const id = String(categoryId || '').trim()
  const normalizedLinkType = String(linkType || '').trim() as ItemListCategoryLinkType | ''

  if (!id || id === 'all') {
    return { main_category: '0' }
  }

  // 销售分类：仅传 category_id
  if (normalizedLinkType === 'sale_category') {
    return { category_id: id }
  }

  // 管理分类（及未带 link_type 的兼容场景）：传 main_category
  return { main_category: id }
}
