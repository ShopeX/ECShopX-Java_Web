import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/aftersales/index.vue'),
  'utf8'
)
const accountMenuSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AccountMenu.vue'),
  'utf8'
)
const accountFilterBarSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AccountH5FilterBar.vue'),
  'utf8'
)
const apiClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/AftersalesApiClient.ts'),
  'utf8'
)

test('aftersales page uses dedicated composable and account shell', () => {
  assert.match(pageSource, /useAftersalesOrders/)
  assert.match(pageSource, /AccountMenu/)
  assert.match(pageSource, /AccountH5FilterBar/)
  assert.match(pageSource, /AftersalesOrderCard/)
})

test('account navigation exposes aftersales entry', () => {
  assert.match(accountMenuSource, /path: localePath\('\/account\/aftersales'\)/)
  assert.match(accountFilterBarSource, /path: localePath\('\/account\/aftersales'\)/)
})

test('aftersales api client loads list from dedicated endpoint', () => {
  assert.match(apiClientSource, /getAftersalesList/)
  assert.match(apiClientSource, /\/wxapp\/aftersales/)
})
