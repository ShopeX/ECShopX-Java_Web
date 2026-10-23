/** 解析请求 body 为 plain object（GET 不适用） */
export function parseFormBody(data: unknown): Record<string, unknown> {
  if (data instanceof URLSearchParams) {
    return Object.fromEntries(data.entries())
  }
  if (typeof data === 'string') {
    return Object.fromEntries(new URLSearchParams(data).entries())
  }
  if (data && typeof data === 'object') {
    return { ...(data as Record<string, unknown>) }
  }
  return {}
}

/**
 * 非 GET 默认 form body（URLSearchParams）。
 * 嵌套/数组请像 vshop 一样在 ApiClient 里展平键名，如 voucher_pic[0]。
 */
export function stringifyFormBody(data: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  }
  return params.toString()
}
