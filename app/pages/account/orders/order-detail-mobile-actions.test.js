import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/OrderDetailActions.vue'),
  'utf8'
)

test('order detail actions use figma-aligned mobile action bar layout', () => {
  assert.match(source, /getMobilePrimaryAction/)
  assert.match(source, /mobileVisibleActions/)
  assert.match(source, /mobileMoreActions/)
  assert.match(source, /data-testid="btn-order-detail-more"/)
  assert.match(source, /lg:hidden/)
  assert.match(source, /hidden lg:flex/)
})
