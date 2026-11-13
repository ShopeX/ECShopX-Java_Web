import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const checkoutSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useCheckout.ts'),
  'utf8'
)
const pluginSource = readFileSync(
  path.resolve(process.cwd(), 'app/plugins/member-task-share.client.ts'),
  'utf8'
)
const userStoreSource = readFileSync(path.resolve(process.cwd(), 'app/stores/user.ts'), 'utf8')

test('create order submits cached member task share fields and keeps them', () => {
  assert.match(checkoutSource, /getMemberTaskShareParams\(\)/)
  assert.match(checkoutSource, /params\.member_task_id = memberTaskShare\.member_task_id/)
  assert.match(
    checkoutSource,
    /params\.member_task_sharer_user_id = memberTaskShare\.member_task_sharer_user_id/
  )
  assert.doesNotMatch(checkoutSource, /clearMemberTaskShareParams/)
})

test('logout clears the cached member task share attribution', () => {
  assert.match(userStoreSource, /async logout\(\) \{[\s\S]*clearMemberTaskShareParams\(\)/)
})

test('client plugin caches share query from the current route and later navigations', () => {
  assert.match(
    pluginSource,
    /captureMemberTaskShareFromQuery\(router\.currentRoute\.value\.query\)/
  )
  assert.match(pluginSource, /router\.afterEach/)
  assert.match(pluginSource, /captureMemberTaskShareFromQuery\(to\.query\)/)
})
