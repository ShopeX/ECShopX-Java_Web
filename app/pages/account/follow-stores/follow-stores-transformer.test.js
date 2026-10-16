import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const transformerSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/transformers/collectDistributionTransformer.ts'),
  'utf8'
)

test('follow store transformer maps store fields with tolerant fallbacks', () => {
  assert.match(transformerSource, /distribution_id\s*\|\|\s*record\.distributor_id\s*\|\|\s*record\.id/)
  assert.match(
    transformerSource,
    /record\.store_name\s*\|\|\s*record\.shop_name\s*\|\|\s*record\.distributor_name\s*\|\|\s*record\.name/
  )
  assert.match(
    transformerSource,
    /record\.logo\s*\|\|\s*record\.store_logo\s*\|\|\s*record\.logo_image\s*\|\|\s*record\.shop_logo/
  )
  assert.match(
    transformerSource,
    /record\.slogan\s*\|\|\s*record\.description\s*\|\|\s*record\.subtitle\s*\|\|\s*record\.intro/
  )
})

test('follow store transformer limits preview goods and maps item fallbacks', () => {
  assert.match(
    transformerSource,
    /record\.items\s*\|\|\s*record\.item_infos\s*\|\|\s*record\.goods_list\s*\|\|\s*record\.list/
  )
  assert.match(transformerSource, /\.slice\(0,\s*4\)/)
  assert.match(transformerSource, /item\.item_id\s*\|\|\s*item\.goods_id\s*\|\|\s*item\.id/)
  assert.match(transformerSource, /item\.item_name\s*\|\|\s*item\.name\s*\|\|\s*item\.title/)
})
