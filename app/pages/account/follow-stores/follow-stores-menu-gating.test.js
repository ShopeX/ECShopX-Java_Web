import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const accountMenuSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AccountMenu.vue'),
  'utf8'
)
const accountFilterBarSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AccountH5FilterBar.vue'),
  'utf8'
)

test('account menu gates follow stores entry to bbc mode only', () => {
  assert.match(accountMenuSource, /getBusinessMode/)
  assert.match(accountMenuSource, /===\s*'bbc'/)
  assert.match(accountMenuSource, /key:\s*'followStores'/)
  assert.match(accountMenuSource, /localePath\('\/account\/follow-stores'\)/)
})

test('account h5 filter bar gates follow stores entry to bbc mode only', () => {
  assert.match(accountFilterBarSource, /getBusinessMode/)
  assert.match(accountFilterBarSource, /===\s*'bbc'/)
  assert.match(accountFilterBarSource, /key:\s*'followStores'/)
  assert.match(accountFilterBarSource, /localePath\('\/account\/follow-stores'\)/)
})
