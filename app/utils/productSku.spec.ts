import { describe, expect, it } from 'vitest'
import {
  buildSpecIdString,
  findMatchedSpecItem,
  isMultiSpecProduct,
  parseProductSpecs,
  resolveSkuItemId,
} from './productSku'

describe('productSku', () => {
  it('filters invalid entries when parsing object-shaped spec description', () => {
    const specs = parseProductSpecs({
      颜色: {
        spec_name: '颜色',
        spec_values: [{ spec_value_id: 1, spec_value_name: '黑色' }],
      },
      meta: { version: 1 },
      invalid: { spec_name: '尺码' },
    })

    expect(specs).toHaveLength(1)
    expect(specs[0]?.spec_name).toBe('颜色')
  })

  it('parses spec description object into spec list', () => {
    const specs = parseProductSpecs({
      颜色: {
        spec_name: '颜色',
        spec_values: [{ spec_value_id: 1, spec_value_name: '黑色' }],
      },
    })

    expect(specs).toHaveLength(1)
    expect(specs[0]?.spec_name).toBe('颜色')
  })

  it('detects multi-spec products', () => {
    expect(
      isMultiSpecProduct({
        nospec: 0,
        spec_items: [{ custom_spec_id: '1-2', item_id: 9001 }],
      })
    ).toBe(true)

    expect(isMultiSpecProduct({ nospec: 1, item_id: 100 })).toBe(false)
  })

  it('parses array-shaped item_spec_desc', () => {
    const specs = parseProductSpecs([
      {
        spec_name: '尺码',
        spec_values: [{ spec_value_id: 1592, spec_value_name: 'S' }],
      },
      {
        spec_name: '颜色',
        spec_values: [{ spec_value_id: 1616, spec_value_name: '绿色' }],
      },
    ])

    expect(specs).toHaveLength(2)
    expect(specs[0]?.spec_name).toBe('尺码')
  })

  it('resolves sku item id from selected specs', () => {
    const data = {
      item_id: 100,
      nospec: 0,
      spec_items: [
        { custom_spec_id: '1-2', item_id: 9001 },
        { custom_spec_id: '1-3', item_id: 9002 },
      ],
    }

    expect(resolveSkuItemId(data, '1-2')).toBe('9001')
    expect(buildSpecIdString([{ spec_name: '颜色', spec_values: [] }], { 颜色: 1 })).toBe('1')
  })

  it('does not fall back to parent item id when spec_items exist but specs are missing', () => {
    const data = {
      item_id: 100,
      nospec: 0,
      spec_items: [{ custom_spec_id: '1-2', item_id: 9001 }],
    }

    expect(resolveSkuItemId(data, 'default')).toBe('')
  })

  it('matches sku when spec value order differs from custom_spec_id', () => {
    const specItems = [
      { custom_spec_id: '1616-1592', item_id: 6768 },
      { custom_spec_id: '1616-1596', item_id: 6772 },
    ]

    // item_spec_desc 顺序为 尺码-颜色，拼接结果为 1592-1616
    expect(findMatchedSpecItem(specItems, '1592-1616')?.item_id).toBe(6768)
    expect(findMatchedSpecItem(specItems, '1596-1616')?.item_id).toBe(6772)
    expect(resolveSkuItemId({ item_id: 6768, nospec: 0, spec_items: specItems }, '1596-1616')).toBe(
      '6772'
    )
  })
})
