import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCProductPrice/BCProductPrice.vue'),
  'utf8'
)
const skuSource = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCProductSkuDrawer/BCProductSkuDrawer.vue'),
  'utf8'
)

test('BCProductPrice gates non-member price behind showNonMemberPrice (ECX-10405)', () => {
  assert.match(source, /showNonMemberPrice/)
  assert.match(source, /v-if="showNonMemberPrice"/)
})

test('BCProductSkuDrawer gates non-member price behind showNonMemberPrice (ECX-10405)', () => {
  assert.match(skuSource, /showNonMemberPrice/)
  assert.match(skuSource, /v-if="showNonMemberPrice"/)
})
