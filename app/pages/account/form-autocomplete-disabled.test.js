import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const loginSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/login.vue'),
  'utf8'
)
const registerSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/register.vue'),
  'utf8'
)

const inputPattern = (model, autocomplete = 'new-password') =>
  new RegExp(`v-model="${model}"[\\s\\S]*?autocomplete="${autocomplete}"`)

test('login form disables browser autofill for credentials', () => {
  assert.match(loginSource, inputPattern('phoneForm.phone'))
  assert.match(loginSource, inputPattern('phoneForm.password'))
  assert.match(loginSource, inputPattern('emailForm.email'))
  assert.match(loginSource, inputPattern('emailForm.password'))
  assert.doesNotMatch(loginSource, /autocomplete="current-password"/)
  assert.doesNotMatch(loginSource, /autocomplete="email"/)
})

test('register form disables browser autofill for phone mode', () => {
  assert.match(registerSource, /<form[\s\S]*?autocomplete="off"[\s\S]*?@submit\.prevent="handlePhoneRegister"/)
  assert.match(registerSource, inputPattern('phoneForm.phone'))
  assert.match(registerSource, inputPattern('phoneForm.captchaCode'))
  assert.match(registerSource, inputPattern('phoneForm.code'))
  assert.match(registerSource, inputPattern('phoneForm.password'))
  assert.match(registerSource, inputPattern('phoneForm.confirmPassword'))
})

test('register form disables browser autofill for email mode', () => {
  assert.match(registerSource, /<form[\s\S]*?autocomplete="off"[\s\S]*?@submit\.prevent="handleEmailRegister"/)
  assert.match(registerSource, inputPattern('emailForm.email'))
  assert.match(registerSource, inputPattern('emailForm.captchaCode'))
  assert.match(registerSource, inputPattern('emailForm.password'))
  assert.match(registerSource, inputPattern('emailForm.confirmPassword'))
})
