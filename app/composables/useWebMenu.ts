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

function appendQueryParam(path: string, key: string, value: string): string {
  const trimmed = String(value || '').trim()
  if (!trimmed) return path
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}${encodeURIComponent(key)}=${encodeURIComponent(trimmed)}`
}

export function resolveWebMenuItemLink(item: WebMenuItem): string {
  const itemName = String(item.name || '').trim()

  switch (item.link_type) {
    // 管理分类 / 销售分类：同一商品列表页，query.link_type 区分接口传参
    // - category      → main_category
    // - sale_category → category_id
    // title 用于列表页展示系列/分类名称
    case 'category':
    case 'sale_category': {
      const value = String(item.link_value ?? '').trim()
      const basePath = value ? `/collections/${encodeURIComponent(value)}` : '/collections/all'
      const withType = appendQueryParam(basePath, 'link_type', item.link_type)
      return appendQueryParam(withType, 'title', itemName)
    }
    case 'custom_page':
      return `/custom/${item.link_value ?? ''}`
    case 'list_page':
      return `/list?${item.link_value ?? ''}`
    case 'article':
      return `/article/${item.link_value ?? ''}`
    case 'goods':
      return `/products/${item.link_value ?? ''}`
    case 'url': {
      const link = item.link_value || '#'
      if (link === '#' || /^https?:\/\//i.test(link) || link.startsWith('//')) {
        return link
      }
      // 系列导航兜底链到 /collections/* 时也带上名称
      if (link.includes('/collections')) {
        return appendQueryParam(link, 'title', itemName)
      }
      return link
    }
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
