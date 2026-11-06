import { describe, expect, it } from 'vitest'
import {
  buildSpecIdString,
  findMatchedSpecItem,
  isMultiSpecProduct,
  isSingleSkuProduct,
  isSpecValueInStock,
  parseProductSpecs,
  resolveProductStock,
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

  it('detects single-sku products', () => {
    expect(
      isSingleSkuProduct({
        nospec: 0,
        spec_items: [{ custom_spec_id: '1-2-3', item_id: 9001 }],
      })
    ).toBe(true)

    expect(
      isSingleSkuProduct({
        nospec: 0,
        spec_items: [
          { custom_spec_id: '1-2', item_id: 9001 },
          { custom_spec_id: '1-3', item_id: 9002 },
        ],
      })
    ).toBe(false)

    expect(isSingleSkuProduct({ nospec: 1, item_id: 100 })).toBe(false)

    expect(
      isSingleSkuProduct({
        nospec: 0,
        item_spec_desc: {
          色号: {
            spec_name: '色号',
            spec_values: [{ spec_value_id: 1, spec_value_name: '#128醒春红' }],
          },
          颜色: {
            spec_name: '颜色',
            spec_values: [{ spec_value_id: 2, spec_value_name: '黑色' }],
          },
        },
      })
    ).toBe(true)

    expect(
      isSingleSkuProduct({
        nospec: 0,
        item_spec_desc: {
          颜色: {
            spec_name: '颜色',
            spec_values: [
              { spec_value_id: 1, spec_value_name: '黑' },
              { spec_value_id: 2, spec_value_name: '白' },
            ],
          },
        },
        spec_items: [
          { custom_spec_id: '1', item_id: 9001 },
          { custom_spec_id: '2', item_id: 9002 },
        ],
      })
    ).toBe(false)
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

  it('detects in-stock spec values based on selected specs in other dimensions', () => {
    const specs = parseProductSpecs([
      {
        spec_name: '颜色',
        spec_values: [
          { spec_value_id: 100, spec_value_name: '红' },
          { spec_value_id: 101, spec_value_name: '蓝' },
        ],
      },
      {
        spec_name: '尺码',
        spec_values: [
          { spec_value_id: 37, spec_value_name: 'M' },
          { spec_value_id: 38, spec_value_name: 'L' },
        ],
      },
    ])

    const data = {
      nospec: 0,
      spec_items: [
        { custom_spec_id: '100-37', item_id: 1, store: 0 },
        { custom_spec_id: '100-38', item_id: 2, store: 0 },
        { custom_spec_id: '101-37', item_id: 3, store: 0 },
        { custom_spec_id: '101-38', item_id: 4, store: 5 },
      ],
    }

    // 仅蓝+L 有货；结合其它维度已选规格判断
    expect(isSpecValueInStock(data, specs, { 尺码: 37 }, '颜色', 101)).toBe(false)
    expect(isSpecValueInStock(data, specs, { 颜色: 100 }, '尺码', 38)).toBe(false)
    expect(isSpecValueInStock(data, specs, { 颜色: 101 }, '尺码', 38)).toBe(true)
    expect(isSpecValueInStock(data, specs, { 颜色: 100 }, '尺码', 37)).toBe(false)
    expect(isSpecValueInStock(data, specs, { 颜色: 100 }, '颜色', 100)).toBe(false)
    expect(isSpecValueInStock(data, specs, {}, '尺码', 38)).toBe(true)
  })

  it('marks size as out of stock when selected color combination has no stock', () => {
    const specs = parseProductSpecs([
      {
        spec_name: '颜色',
        spec_values: [
          { spec_value_id: 200, spec_value_name: '橙' },
          { spec_value_id: 201, spec_value_name: '绿' },
        ],
      },
      {
        spec_name: '尺码',
        spec_values: [
          { spec_value_id: 37, spec_value_name: 'M' },
          { spec_value_id: 38, spec_value_name: 'L' },
          { spec_value_id: 39, spec_value_name: 'XL' },
        ],
      },
    ])

    const data = {
      nospec: 0,
      spec_items: [
        { custom_spec_id: '200-37', item_id: 1, store: 0 },
        { custom_spec_id: '200-38', item_id: 2, store: 0 },
        { custom_spec_id: '200-39', item_id: 3, store: 0 },
        { custom_spec_id: '201-38', item_id: 4, store: 8 },
      ],
    }

    expect(isSpecValueInStock(data, specs, { 颜色: 200 }, '尺码', 38)).toBe(false)
    expect(isSpecValueInStock(data, specs, { 颜色: 200 }, '尺码', 37)).toBe(false)
    expect(isSpecValueInStock(data, specs, { 颜色: 201 }, '尺码', 38)).toBe(true)
  })

  it('uses matched sku store even when product-level store is positive', () => {
    const data = {
      store: 99,
      nospec: 0,
      spec_items: [
        { custom_spec_id: '100-37', item_id: 1, store: 0 },
        { custom_spec_id: '101-38', item_id: 2, store: 5 },
      ],
    }

    expect(resolveProductStock(data, '100-37')).toBe(0)
    expect(resolveProductStock(data, '101-38')).toBe(5)
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
