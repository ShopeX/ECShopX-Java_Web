import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const filterSource = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCProductFilter/BCProductFilter.vue'),
  'utf8'
)
const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/collections/[id].vue'),
  'utf8'
)
const zhSource = readFileSync(path.resolve(process.cwd(), 'app/locales/zh-CN.json'), 'utf8')

describe('BCProductFilter list title', () => {
  it('shows keyword search result title, then series title, otherwise all products', () => {
    expect(filterSource).toContain('listTitle')
    expect(filterSource).toContain('listTotalText')
    expect(filterSource).toContain('searchKeyword')
    expect(filterSource).toContain("t('9e569ba6.a8f3c1', { keyword: searchKeyword.value })")
    expect(filterSource).toContain('props.collectionTitle?.trim()')
    expect(filterSource).toContain("t('9e569ba6.794a4e')")
    expect(filterSource).toContain(
      "searchKeyword.value || props.collectionTitle?.trim()"
    )
    expect(filterSource).toContain("t('9e569ba6.b2e7d4', { count })")
    expect(filterSource).toContain("t('9e569ba6.7c1e90', { count })")
  })

  it('receives keyword, collection title and total from collections page', () => {
    expect(pageSource).toContain(':keyword="filterParams.keyword"')
    expect(pageSource).toContain(':collection-title="filterParams.collectionTitle"')
    expect(pageSource).toContain(':total="pagination.total"')
    expect(pageSource).toContain('query.title')
  })

  it('defines Chinese copy for keyword search and category totals', () => {
    expect(zhSource).toContain('"9e569ba6.a8f3c1": "“{keyword}”的搜索结果"')
    expect(zhSource).toContain('"9e569ba6.b2e7d4": "{count}件商品"')
    expect(zhSource).toContain('"9e569ba6.7c1e90": "共 {count} 个商品"')
  })
})
