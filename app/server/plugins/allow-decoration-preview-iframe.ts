import { getRequestURL, removeResponseHeader } from 'h3'

function allowsDecorationPreviewFrame(url: URL): boolean {
  const q = url.search
  // 兼容异常拼接的 query；正常解析失败时仍可按子串放行
  return q.includes('designMode=1')
}

/**
 * 装修后台在 iframe 中嵌入商城预览时，Nitro 可能为 HTML/错误页附加 `X-Frame-Options: DENY`，
 * 导致父页面无法展示子页面（控制台：Refused to display ... in a frame）。
 *
 * 仅在「预览 / 设计模式」查询参数下放宽：删除 X-Frame-Options；若配置了管理端来源则写入
 * CSP frame-ancestors（比单纯 SAMEORIGIN 更适合跨端口嵌入）。
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    const url = getRequestURL(event)
    if (!allowsDecorationPreviewFrame(url)) {
      return
    }
    removeResponseHeader(event, 'x-frame-options')
    removeResponseHeader(event, 'X-Frame-Options')
  })

  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const url = getRequestURL(event)
    if (!allowsDecorationPreviewFrame(url)) {
      return
    }

    const headers = response.headers
    if (!headers || typeof headers !== 'object') {
      return
    }

    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === 'x-frame-options') {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (headers as Record<string, unknown>)[key]
      }
    }

    const rawOrigins =
      (process.env.NUXT_PUBLIC_DECORATION_ADMIN_ORIGINS || '') as string
    const origins = rawOrigins
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)

    if (origins.length > 0) {
      ;(headers as Record<string, string>)['content-security-policy'] =
        `frame-ancestors ${origins.join(' ')}`
    }
  })
})
