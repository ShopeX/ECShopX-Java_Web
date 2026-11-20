import { describe, expect, it } from 'vitest'
import { resolveItemListCategoryParams } from './resolveItemListCategoryParams'

describe('resolveItemListCategoryParams', () => {
  it('uses category_id only for sale category', () => {
    expect(resolveItemListCategoryParams('6539', 'sale_category')).toEqual({
      category_id: '6539',
    })
  })

  it('uses main_category for management category', () => {
    expect(resolveItemListCategoryParams('1902', 'category')).toEqual({
      main_category: '1902',
    })
  })

  it('defaults to main_category when link_type is absent', () => {
    expect(resolveItemListCategoryParams('1902')).toEqual({
      main_category: '1902',
    })
  })

  it('uses main_category 0 for all-products slug', () => {
    expect(resolveItemListCategoryParams('all', 'sale_category')).toEqual({
      main_category: '0',
    })
  })
})
