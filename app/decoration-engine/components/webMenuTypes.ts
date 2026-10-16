/** Web 导航菜单项（与 ThemeBundle 前台 transformFront 一致） */
export interface WebMenuItem {
  id: number
  name: string
  image_url?: string | null
  link_type:
    | 'category' // 管理分类（后台商品 taxonomy，CMS 显示「管理分类: xxx」）
    | 'sale_category' // 销售分类（前台营销/导航分类，CMS 显示「销售分类: xxx」）
    | 'goods'
    | 'custom_page'
    | 'list_page'
    | 'article'
    | 'url'
    | 'none'
  link_value: string | null
  link_extra?: Record<string, unknown>
  children: WebMenuItem[]
}

export interface WebMenuPayload {
  id: number
  name: string
  key: string
  items: WebMenuItem[]
}
