import { describe, expect, it } from 'vitest'
import { resolveProductMaterials } from './productMaterials'

describe('resolveProductMaterials', () => {
  it('keeps every http url and ignores size', () => {
    expect(
      resolveProductMaterials([
        { name: '未命名1.pdf', size: 1243, url: 'https://cdn.example.com/a.pdf' },
        { name: '说明.pdf', size: 99, url: 'https://cdn.example.com/b.pdf' },
      ])
    ).toEqual([
      { name: '未命名1.pdf', url: 'https://cdn.example.com/a.pdf' },
      { name: '说明.pdf', url: 'https://cdn.example.com/b.pdf' },
    ])
  })

  it('drops entries without an http url', () => {
    expect(
      resolveProductMaterials([
        { name: '坏链接', url: '/local.pdf' },
        { name: '空', url: '' },
        null,
      ])
    ).toEqual([])
  })

  it('falls back to the url when name is missing', () => {
    expect(resolveProductMaterials([{ url: 'http://cdn.example.com/c.pdf' }])).toEqual([
      { name: 'http://cdn.example.com/c.pdf', url: 'http://cdn.example.com/c.pdf' },
    ])
  })
})
