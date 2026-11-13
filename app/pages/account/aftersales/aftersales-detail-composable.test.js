import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useAftersalesDetail.ts'),
  'utf8'
)

test('aftersales detail composable reads route context and exposes fetch method', () => {
  assert.match(source, /useRoute\(\)/)
  assert.match(source, /const aftersalesId = computed\(\(\) => String\(route\.params\.id \|\| ''\)\)/)
  assert.match(source, /const itemId = computed\(\(\) => String\(route\.query\.itemId \|\| ''\)\)/)
  assert.match(source, /async function fetchAftersalesDetail\(/)
  assert.match(source, /const detail = ref/)
  assert.match(source, /const loading = ref\(false\)/)
  assert.match(source, /const error = ref<string \| null>\(null\)/)
})

test('aftersales detail composable loads api data through transformer', () => {
  assert.match(source, /aftersalesApiClient\.getAftersalesDetail\(/)
  assert.match(source, /aftersales_bn:\s*aftersalesId\.value/)
  assert.match(source, /item_id:\s*itemId\.value/)
  assert.match(source, /AftersalesTransformer\.toAftersalesDetailModel/)
  assert.match(source, /toast\.show/)
})
