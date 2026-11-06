import { describe, expect, it } from 'vitest'
import decorationSchema from '../schema/decoration-schema.json'
import {
  resolveBlockSettings,
  resolveSectionSettings,
} from './resolveSettings'

describe('decoration schema resolver', () => {
  it('exports every section and block type required by the decoration contract', () => {
    expect(Object.keys(decorationSchema.sections).sort()).toEqual(
      [
        'announcement-bar',
        'footer',
        'header',
        'image-hotspot',
        'main-carousel',
        'native-product-list',
        'product-shelf',
        'product-tab-shelf',
      ].sort()
    )
    expect(Object.keys(decorationSchema.blocks).sort()).toEqual(
      [
        'announcement',
        'footer-image',
        'footer-link',
        'footer-menu',
        'footer-text',
        'header_collection_product_list',
        'header_product_list',
        'hotspot',
        'image',
        'mega_menu',
        'product-tab',
        'video',
      ].sort()
    )
  })

  it('resolves product shelf sourceMode as displayMode without leaking the alias', () => {
    const settings = resolveSectionSettings('product-shelf', {
      sourceMode: 'manual',
      itemIds: ['1001', '', '1002'],
    })

    expect(settings.displayMode).toBe('manual')
    expect(settings.sourceMode).toBeUndefined()
    expect(settings.itemIds).toEqual(['1001', '', '1002'])
    expect(settings.limit).toBe(8)
  })

  it('resolves image block imageUrl into pc and mobile canonical image fields', () => {
    const settings = resolveBlockSettings('image', {
      imageUrl: 'https://cdn.example.test/banner.jpg',
    })

    expect(settings.pc_image).toBe('https://cdn.example.test/banner.jpg')
    expect(settings.mobile_image).toBe('https://cdn.example.test/banner.jpg')
    expect(settings.imageUrl).toBeUndefined()
  })

  it('keeps carousel image CompPickerLink settings instead of stripping link', () => {
    const link = {
      linkType: 0,
      linkUrl: '',
      linkPage: 'goods',
      id: '100234',
      title: '示例商品',
    }
    const settings = resolveBlockSettings('image', {
      pc_image: 'https://cdn.example.test/banner.jpg',
      link,
    })

    expect(settings.link).toEqual(link)
  })

  it('keeps footer menu selection and static menu_items as separate settings', () => {
    const settings = resolveBlockSettings('footer-menu', {
      menu: null,
      menu_items: [{ label: 'Help', url: '/help' }],
    })

    expect(settings.menu).toBeNull()
    expect(settings.menu_items).toEqual([{ label: 'Help', url: '/help' }])
  })
})