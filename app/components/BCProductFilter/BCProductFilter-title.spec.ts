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
  it('shows keyword, then series title, otherwise all products', () => {
    expect(filterSource).toContain('listTitle')
    expect(filterSource).toContain("props.keyword?.trim()")
    expect(filterSource).toContain('props.collectionTitle?.trim()')
    expect(filterSource).toContain("t('9e569ba6.794a4e')")
    expect(filterSource).toContain("t('9e569ba6.7c1e90', { count: props.total ?? 0 })")
  })

  it('receives keyword, collection title and total from collections page', () => {
    expect(pageSource).toContain(':keyword="filterParams.keyword"')
    expect(pageSource).toContain(':collection-title="filterParams.collectionTitle"')
    expect(pageSource).toContain(':total="pagination.total"')
    expect(pageSource).toContain('query.title')
  })

  it('defines Chinese copy for product total', () => {
    expect(zhSource).toContain('"9e569ba6.7c1e90": "共 {count} 个商品"')
  })
})
