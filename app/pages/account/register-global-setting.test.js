import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/register.vue'),
  'utf8'
)

test('register page uses cached mall login background setting like login page', () => {
  assert.match(pageSource, /await useMallGlobalSetting\(\)/)
  assert.match(pageSource, /loginBackgroundUrl/)
  assert.match(pageSource, /:src="loginBackgroundUrl"/)
  assert.doesNotMatch(pageSource, /src="\/assets\/images\/login-bg\.png"/)
})

