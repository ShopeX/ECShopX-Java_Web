import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const read = (relativePath) => readFileSync(path.resolve(process.cwd(), relativePath), 'utf8')

function resolveUserLoginDisplay(userInfo) {
  if (!userInfo) return ''

  const mobile = String(userInfo.mobile || '').trim()
  if (mobile) return mobile

  const email = String(userInfo.email || '').trim()
  if (email) return email

  const username = String(userInfo.username || '').trim()
  if (username) return username

  return ''
}

test('resolveUserLoginDisplay prefers mobile then email then username', () => {
  assert.equal(
    resolveUserLoginDisplay({ mobile: '13800138000', email: 'a@b.com', username: 'nick' }),
    '13800138000'
  )
  assert.equal(
    resolveUserLoginDisplay({ mobile: '', email: 'user@example.com', username: 'nick' }),
    'user@example.com'
  )
  assert.equal(resolveUserLoginDisplay({ mobile: '', email: '', username: 'nick' }), 'nick')
})

test('decoration header shows login phone or email when user is logged in', () => {
  const source = read('app/decoration-engine/components/sections/DecorationHeaderSection.vue')
  const entrySource = read('app/components/BCHeaderBar/HeaderUserEntry.vue')
  const identitySource = read('app/components/BCHeaderBar/HeaderUserIdentity.vue')

  assert.match(source, /HeaderUserEntry/)
  assert.match(source, /variant="decoration"/)
  assert.match(entrySource, /useHeaderUser\(\)/)
  assert.match(entrySource, /loginDisplayLabel/)
  assert.match(entrySource, /userAvatarUrl/)
  assert.match(entrySource, /data-testid="header-user-login-entry"/)
  assert.match(identitySource, /data-testid="header-user-login-label"/)
  assert.match(entrySource, /v-if="!isLoggedIn"/)
  assert.match(entrySource, /i-heroicons-user/)
})

test('default header bar shows login phone or email when user is logged in', () => {
  const source = read('app/components/BCHeaderBar/BCHeaderBar.vue')
  const entrySource = read('app/components/BCHeaderBar/HeaderUserEntry.vue')
  const identitySource = read('app/components/BCHeaderBar/HeaderUserIdentity.vue')

  assert.match(source, /HeaderUserEntry/)
  assert.match(entrySource, /useHeaderUser\(\)/)
  assert.match(entrySource, /loginDisplayLabel/)
  assert.match(entrySource, /userAvatarUrl/)
  assert.match(entrySource, /data-testid="header-user-login-entry"/)
  assert.match(identitySource, /data-testid="header-user-login-label"/)
})

test('layout user entry validates auth before routing account center', () => {
  const source = read('app/layouts/default.vue')
  const headerUserSource = read('app/composables/useHeaderUser.ts')

  assert.match(source, /useHeaderUser\(\)/)
  assert.match(source, /openUserCenter/)
  assert.match(headerUserSource, /userStore\.fetchUserInfo\(\)/)
  assert.match(headerUserSource, /localePath\('\/account\/login'\)/)
})

test('auth transformer maps member profile fields into user info', () => {
  const source = read('app/infrastructure/transformers/authTransformer.ts')

  assert.match(source, /email:\s*String\(member\.email/)
  assert.match(source, /member\.avatar/)
  assert.doesNotMatch(source, /headimgurl/)
})

test('header user composable reads normalized userInfo fields', () => {
  const source = read('app/composables/useHeaderUser.ts')

  assert.match(source, /info\.mobile/)
  assert.match(source, /info\.email/)
  assert.match(source, /userStore\.userInfo\?\.avatar/)
})
