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

export function createDecorationLinkResolver(localePath: LocalePath) {
  function normalizeLinkPath(path: string) {
    const value = String(path || '').trim()
    if (!value) return undefined
    if (/^(https?:)?\/\//i.test(value)) return value
    if (value.startsWith('/')) return localePath(value)
    return localePath(`/${value}`)
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
      case 'collection':
        return rawId
          ? localePath(`/collections/${rawId}?link_type=sale_category`)
          : localePath('/collections/all?link_type=sale_category')
      case 'category':
      case 'management_category':
        return rawId
          ? localePath(`/collections/${rawId}?link_type=category`)
          : localePath('/collections/all?link_type=category')
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
      default:
        return rawId ? normalizeLinkPath(rawId) : undefined
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
