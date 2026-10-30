import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/login.vue'),
  'utf8'
)

test('login page hides the remember-me section', () => {
  assert.doesNotMatch(pageSource, /bbf44084\.f6a729/)
  assert.doesNotMatch(pageSource, /id="remember"/)
})
