import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const displaySource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useProductPriceDisplay.ts'),
  'utf8'
)
const clientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/CommonApiClient.ts'),
  'utf8'
)
const initSource = readFileSync(
  path.resolve(process.cwd(), 'app/plugins/currency-init.ts'),
  'utf8'
)

test('product price display respects item_page.market_price setting (ECX-10405)', () => {
  assert.match(displaySource, /useItemPriceSettingState/)
  assert.match(displaySource, /shouldShowMarketPrice/)
  assert.match(displaySource, /shouldShowNonMemberPrice/)
  assert.match(displaySource, /allowItemMarketPrice/)
  assert.match(displaySource, /showNonMemberPrice/)
})

test('common client fetches itemPrice setting', () => {
  assert.match(clientSource, /\/wxapp\/setting\/itemPrice/)
  assert.match(clientSource, /getItemPriceSetting/)
})

test('currency-init also boots item price setting', () => {
  assert.match(initSource, /useItemPriceSetting/)
})
