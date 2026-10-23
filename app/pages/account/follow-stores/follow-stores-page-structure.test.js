import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/follow-stores.vue'),
  'utf8'
)
const cardSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/FollowedStoreCard.vue'),
  'utf8'
)

test('follow stores page uses account shell and dedicated composable', () => {
  assert.match(pageSource, /data-testid="account-follow-stores-page"/)
  assert.match(pageSource, /AccountMenu/)
  assert.match(pageSource, /AccountH5FilterBar/)
  assert.match(pageSource, /FollowedStoreCard/)
  assert.match(pageSource, /useFollowedStores/)
  assert.match(pageSource, /loadFollowedStores/)
})

test('followed store card exposes enter store and contact affordances', () => {
  assert.match(cardSource, /data-testid="follow-store-card"/)
  assert.match(cardSource, /data-testid="follow-store-enter-button"/)
  assert.match(cardSource, /data-testid="follow-store-contact-button"/)
  assert.match(cardSource, /data-testid="follow-store-item"/)
})
