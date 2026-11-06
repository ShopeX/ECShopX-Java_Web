import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/login.vue'),
  'utf8'
)

test('login close falls back through browser history state, document referrer, and home', () => {
  assert.match(pageSource, /function getSafeRedirectPath\(/)
  assert.match(pageSource, /function getSafeCloseTargetPath\(/)
  assert.match(pageSource, /router\.currentRoute\.value\.query\.redirect/)
  assert.match(pageSource, /window\.history\.state\?\.back/)
  assert.match(pageSource, /document\.referrer/)
  assert.match(pageSource, /isSafeClosePath\(/)
  assert.match(pageSource, /router\.replace\(closeTargetPath\)/)
  assert.match(pageSource, /router\.replace\(localePath\('\/'\)\)/)
  assert.doesNotMatch(pageSource, /router\.back\(\)/)
  assert.doesNotMatch(sourceHandleClose(pageSource), /getSafeRedirectPath\(\)/)
})

test('login close does not use unsafe external redirect values', () => {
  assert.match(pageSource, /redirect\.startsWith\('\/'\)/)
  assert.match(pageSource, /!redirect\.startsWith\('\/\/'\)/)
})

test('login close avoids login and protected account pages that would redirect back to login', () => {
  assert.match(pageSource, /function isLoginPath\(/)
  assert.match(pageSource, /function isProtectedClosePath\(/)
  assert.match(pageSource, /normalizedPath\.startsWith\('\/account'\)/)
  assert.match(pageSource, /normalizedPath\.startsWith\('\/member'\)/)
  assert.match(pageSource, /normalizedPath\.startsWith\('\/cart'\)/)
  assert.match(pageSource, /normalizedPath\.startsWith\('\/order'\)/)
}
)

function sourceHandleClose(source) {
  const match = source.match(/function handleClose\(\) \{[\s\S]*?\n\}/)
  return match?.[0] || ''
}
