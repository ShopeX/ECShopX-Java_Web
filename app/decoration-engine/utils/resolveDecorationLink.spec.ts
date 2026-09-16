import { describe, expect, it } from 'vitest'
import {
  createDecorationLinkResolver,
  normalizeDecorationLink,
} from './resolveDecorationLink'

const localePath = (path: string) => `/zh-CN${path}`
const resolver = createDecorationLinkResolver(localePath)

describe('resolveDecorationLink', () => {
  it('keeps object links as-is', () => {
    const link = {
      linkType: 0,
      linkPage: 'product',
      id: '1001',
    }
    expect(normalizeDecorationLink(link)).toEqual(link)
  })

  it('maps legacy external string links', () => {
    expect(normalizeDecorationLink('https://example.com')).toEqual({
      linkType: 1,
      linkUrl: 'https://example.com',
      linkPage: '',
      id: '',
      title: '',
    })
  })

  it('maps admin goods CompPickerLink to product detail', () => {
    expect(
      resolver.resolveHref({
        linkType: 0,
        linkPage: 'goods',
        id: '100234',
        title: '示例商品',
      })
    ).toBe('/zh-CN/products/100234')
  })

  it('maps product linkPage to product detail', () => {
    expect(
      resolver.resolveHref({
        linkType: 0,
        linkPage: 'product',
        id: '1001',
      })
    ).toBe('/zh-CN/products/1001')
  })

  it('maps store linkPage to shop page like vshop', () => {
    expect(
      resolver.resolveHref({
        linkType: 0,
        linkPage: 'store',
        id: '88',
      })
    ).toBe('/zh-CN/shop/88')
  })

  it('maps sale_category and category like vshop list params', () => {
    expect(
      resolver.resolveHref({
        linkType: 0,
        linkPage: 'sale_category',
        id: '12',
      })
    ).toBe('/zh-CN/collections/12?link_type=sale_category')
    expect(
      resolver.resolveHref({
        linkType: 0,
        linkPage: 'category',
        id: '34',
      })
    ).toBe('/zh-CN/collections/34?link_type=category')
  })

  it('maps regactivity linkPage to registration page', () => {
    expect(
      resolver.resolveHref({
        linkType: 0,
        linkPage: 'regactivity',
        id: '56',
        title: '示例活动',
      })
    ).toBe('/zh-CN/registration/56')
  })

  it('supports external links', () => {
    expect(
      resolver.resolveHref({
        linkType: 1,
        linkUrl: 'https://example.com/page',
      })
    ).toBe('https://example.com/page')
  })

  it('disables href in preview mode', () => {
    expect(
      resolver.resolveHref(
        {
          linkType: 1,
          linkUrl: 'https://example.com/page',
        },
        { preview: true }
      )
    ).toBeUndefined()
  })
})
