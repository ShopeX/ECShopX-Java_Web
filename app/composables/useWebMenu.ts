import type { WebMenuItem } from '~/decoration-engine/components/webMenuTypes'

export interface NormalizedWebMenuSelection {
  id?: string | number
  key?: string | number
  name?: string
}

export function normalizeSelectedWebMenu(menu: unknown): NormalizedWebMenuSelection | null {
  if (!menu) return null
  if (typeof menu === 'object') return menu as NormalizedWebMenuSelection

  const value = String(menu).trim()
  if (!value) return null

  if (/^\d+$/.test(value)) {
    return { id: value, key: value, name: value }
  }

  return { key: value, name: value }
}

export function resolveWebMenuId(menu: unknown): string {
  const normalized = normalizeSelectedWebMenu(menu)
  return String(normalized?.id || '').trim()
}

export function resolveWebMenuRequestValue(menu: unknown): string {
  const normalized = normalizeSelectedWebMenu(menu)
  return String(normalized?.id || normalized?.key || '').trim()
}

export function resolveWebMenuItemLink(item: WebMenuItem): string {
  switch (item.link_type) {
    // 管理分类 / 销售分类：同一商品列表页，query.link_type 区分接口传参
    // - category      → main_category
    // - sale_category → category_id
    case 'category':
    case 'sale_category': {
      const value = String(item.link_value ?? '').trim()
      const basePath = value ? `/collections/${encodeURIComponent(value)}` : '/collections/all'
      const separator = basePath.includes('?') ? '&' : '?'
      return `${basePath}${separator}link_type=${encodeURIComponent(item.link_type)}`
    }
    case 'custom_page':
      return `/custom/${item.link_value ?? ''}`
    case 'list_page':
      return `/list?${item.link_value ?? ''}`
    case 'article':
      return `/article/${item.link_value ?? ''}`
    case 'goods':
      return `/products/${item.link_value ?? ''}`
    case 'url':
      return item.link_value || '#'
    default:
      return '#'
  }
}

export function isExternalWebMenuLink(link: string): boolean {
  const value = String(link || '').trim()
  return /^https?:\/\//i.test(value) || value.startsWith('//')
}

/**
 * 按菜单 id 拉取 Web 端导航树。
 * 后端：`GET …/wxapp/web/menus/id/{id}` → `{ data: { id, name, key, items } }`
 */
export function useWebMenu(menuId: unknown) {
  const nuxtApp = useNuxtApp()
  const normalizedMenu = normalizeSelectedWebMenu(menuId)
  const normalizedMenuId = String(normalizedMenu?.id || '').trim()
  const normalizedMenuKey = String(normalizedMenu?.key || '').trim()
  const requestValue = normalizedMenuId || normalizedMenuKey

  return useAsyncData(
    `web-menu-${requestValue}`,
    () => {
      if (!requestValue) {
        return null
      }

      return nuxtApp.$api(
        normalizedMenuId
          ? `/wxapp/web/menus/id/${encodeURIComponent(normalizedMenuId)}`
          : `/web/menus/${encodeURIComponent(normalizedMenuKey)}`,
        {
          method: 'GET',
        }
      )
    },
    {
      server: true,
      lazy: false,
      default: () => null,
    }
  )
}
