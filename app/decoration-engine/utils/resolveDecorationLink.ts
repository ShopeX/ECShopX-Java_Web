export type DecorationLinkValue = Record<string, unknown> | string | null | undefined

type LocalePath = (path: string) => string

export function normalizeDecorationLink(raw: DecorationLinkValue): Record<string, unknown> {
  if (raw && typeof raw === 'object') {
    return raw as Record<string, unknown>
  }

  const value = String(raw || '').trim()
  if (!value) {
    return {}
  }

  if (/^https?:\/\//i.test(value)) {
    return {
      linkType: 1,
      linkUrl: value,
      linkPage: '',
      id: '',
      title: '',
    }
  }

  return {
    linkType: 0,
    linkUrl: '',
    linkPage: '',
    id: '',
    title: '',
    path: value,
  }
}

/** admin CompPickerLink「页面」类：linkPage=link + id=页面标识（对齐 vshop memberSetting） */
const INTERNAL_LINK_PAGES: Record<string, string> = {
  memberSign: '/account/sign-in',
}

export function createDecorationLinkResolver(localePath: LocalePath) {
  function normalizeLinkPath(path: string) {
    const value = String(path || '').trim()
    if (!value) return undefined
    if (/^(https?:)?\/\//i.test(value)) return value
    if (value.startsWith('/')) return localePath(value)
    return localePath(`/${value}`)
  }

  function resolveInternalPageHref(pageId: string) {
    const path = INTERNAL_LINK_PAGES[pageId]
    return path ? localePath(path) : undefined
  }

  function resolveInternalHref(link: Record<string, unknown>) {
    const linkPage = String(link?.linkPage || link?.page || '').trim()
    const explicitPath = String(link?.path || link?.url || '').trim()
    const rawId = String(link?.id || link?.linkValue || link?.value || '').trim()

    if (explicitPath) {
      return normalizeLinkPath(explicitPath)
    }

    switch (linkPage) {
      case 'custom_page':
        return rawId ? localePath(`/custom/${rawId}`) : undefined
      case 'goods':
      case 'product':
        return rawId ? localePath(`/products/${rawId}`) : undefined
      // 销售分类 sale_category → category_id；管理分类 category → main_category
      case 'sale_category':
      case 'collection': {
        const title = String(link?.title || '').trim()
        const titleQuery = title ? `&title=${encodeURIComponent(title)}` : ''
        return rawId
          ? localePath(`/collections/${rawId}?link_type=sale_category${titleQuery}`)
          : localePath(`/collections/all?link_type=sale_category${titleQuery}`)
      }
      case 'category':
      case 'management_category': {
        const title = String(link?.title || '').trim()
        const titleQuery = title ? `&title=${encodeURIComponent(title)}` : ''
        return rawId
          ? localePath(`/collections/${rawId}?link_type=category${titleQuery}`)
          : localePath(`/collections/all?link_type=category${titleQuery}`)
      }
      case 'tag':
        return rawId
          ? localePath(`/collections/all?tag_id=${encodeURIComponent(rawId)}`)
          : localePath('/collections/all')
      // admin / vshop 用 store；历史 web 配置可能用 shop
      case 'store':
      case 'shop':
        return rawId ? localePath(`/shop/${rawId}`) : undefined
      case 'regactivity':
        return rawId ? localePath(`/registration/${rawId}`) : undefined
      // 页面类：admin 存 linkPage=link + id=memberSign 等
      case 'link':
        return rawId
          ? resolveInternalPageHref(rawId) || normalizeLinkPath(rawId)
          : undefined
      case 'memberSign':
        return resolveInternalPageHref('memberSign')
      default:
        return (
          resolveInternalPageHref(linkPage) ||
          (rawId ? resolveInternalPageHref(rawId) || normalizeLinkPath(rawId) : undefined)
        )
    }
  }

  function resolveHref(link: DecorationLinkValue, options?: { preview?: boolean }) {
    if (options?.preview) {
      return undefined
    }

    const normalized = normalizeDecorationLink(link)
    if (Number(normalized.linkType) === 1) {
      return String(normalized.linkUrl || '').trim() || undefined
    }

    return resolveInternalHref(normalized)
  }

  function isExternalHref(link: DecorationLinkValue, options?: { preview?: boolean }) {
    const href = resolveHref(link, options)
    return Boolean(href && /^(https?:)?\/\//i.test(href))
  }

  return {
    normalizeDecorationLink,
    resolveHref,
    isExternalHref,
  }
}
