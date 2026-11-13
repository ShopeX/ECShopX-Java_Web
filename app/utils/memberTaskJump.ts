/**
 * 会员任务「去完成」链接映射。
 * Admin 选择器实际保存为 { linkPage, id }。
 * 当前 PC 站有对应页面则跳转，没有则复制原始配置。
 */

export type MemberTaskGoAction =
  | { type: 'navigate'; href: string }
  | { type: 'copy'; text: string }

type LocalePath = (path: string) => string

const SIGN_IN_PAGE_IDS = new Set(['membersSign', 'memberSign'])
const ACTIVITY_LIST_PAGE_IDS = new Set(['registActivity'])
const BALANCE_PAGE_IDS = new Set(['recharge'])

const NAVIGABLE_PATH_PREFIXES = [
  '/products/',
  '/collections',
  '/registration/',
  '/custom/',
  '/shop/',
  '/account/sign-in',
  '/account/activity-booking',
  '/account/balance',
  '/account/favorites',
  '/account/registrations',
]

function asLinkRecord(raw: unknown): Record<string, unknown> | null {
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>
  const text = String(raw ?? '').trim()
  if (!text.startsWith('{')) return null
  try {
    const parsed = JSON.parse(text) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function readId(link: Record<string, unknown>): string {
  return String(link.id ?? link.linkValue ?? link.value ?? '').trim()
}

function localize(localePath: LocalePath, path: string): string {
  return localePath(path)
}

function resolvePlainWebPath(path: string, localePath: LocalePath): string | null {
  const value = path.trim()
  if (!value || value.startsWith('/pages') || value.startsWith('pages/')) return null
  if (/^https?:\/\//i.test(value)) return value
  const normalized = value.startsWith('/') ? value : `/${value}`
  const [pathname] = normalized.split('?')
  const matched = NAVIGABLE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  )
  if (!matched) return null
  return localize(localePath, normalized)
}

function resolveLinkHref(link: Record<string, unknown>, localePath: LocalePath): string | null {
  const explicitPath = String(link.path || link.url || '').trim()
  if (explicitPath) {
    const fromPath = resolvePlainWebPath(explicitPath, localePath)
    if (fromPath) return fromPath
  }

  const linkPage = String(link.linkPage || link.page || '').trim()
  const id = readId(link)

  switch (linkPage) {
    case 'goods':
    case 'product':
      return id ? localize(localePath, `/products/${id}`) : null
    case 'sale_category':
    case 'collection':
      return id
        ? localize(localePath, `/collections/${id}?link_type=sale_category`)
        : null
    case 'category':
    case 'management_category':
      return id ? localize(localePath, `/collections/${id}?link_type=category`) : null
    case 'regactivity':
      return id ? localize(localePath, `/registration/${id}`) : null
    case 'custom_page':
      return id ? localize(localePath, `/custom/${id}`) : null
    case 'store':
    case 'shop':
      return id ? localize(localePath, `/shop/${id}`) : null
    case 'link':
      if (SIGN_IN_PAGE_IDS.has(id)) return localize(localePath, '/account/sign-in')
      if (ACTIVITY_LIST_PAGE_IDS.has(id)) return localize(localePath, '/account/activity-booking')
      if (BALANCE_PAGE_IDS.has(id)) return localize(localePath, '/account/balance')
      return null
    case 'membersSign':
    case 'memberSign':
      return localize(localePath, '/account/sign-in')
    case 'registActivity':
      return localize(localePath, '/account/activity-booking')
    case 'recharge':
      return localize(localePath, '/account/balance')
    default:
      return null
  }
}

/**
 * 分享任务复制链接：当前站点域名 + 落地路径 + 任务 id + 分享人 user_id。
 * 参数名与小程序分享归因一致（member_task_id / member_task_sharer_user_id）。
 */
export function buildMemberTaskShareUrl(input: {
  origin: string
  path: string
  taskId: string | number
  userId: string | number
}): string | null {
  const origin = input.origin.trim().replace(/\/$/, '')
  const path = input.path.trim()
  const taskId = String(input.taskId ?? '').trim()
  const userId = String(input.userId ?? '').trim()
  if (!origin || !path || path.startsWith('{') || !taskId || !userId) return null

  let url: URL
  try {
    url = /^https?:\/\//i.test(path)
      ? new URL(path)
      : new URL(path.startsWith('/') ? path : `/${path}`, origin)
  } catch {
    return null
  }

  url.searchParams.set('member_task_id', taskId)
  url.searchParams.set('member_task_sharer_user_id', userId)
  return url.toString()
}

/** 有页面返回跳转地址；没有页面返回待复制原文。空配置返回 null。 */
export function resolveMemberTaskGoAction(
  raw: unknown,
  localePath: LocalePath
): MemberTaskGoAction | null {
  if (raw && typeof raw === 'object') {
    const href = resolveLinkHref(raw as Record<string, unknown>, localePath)
    if (href) return { type: 'navigate', href }
    try {
      const text = JSON.stringify(raw)
      return text && text !== '{}' ? { type: 'copy', text } : null
    } catch {
      return null
    }
  }

  const text = String(raw ?? '').trim()
  if (!text) return null
  if (/^https?:\/\//i.test(text)) return { type: 'navigate', href: text }

  const link = asLinkRecord(text)
  if (link) {
    const href = resolveLinkHref(link, localePath)
    if (href) return { type: 'navigate', href }
    return { type: 'copy', text }
  }

  const webHref = resolvePlainWebPath(text, localePath)
  if (webHref) return { type: 'navigate', href: webHref }
  return { type: 'copy', text }
}
