import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/login.vue'),
  'utf8'
)

test('phone login uses password without captcha fields', () => {
  assert.match(pageSource, /phoneForm = reactive\(\{[\s\S]*phone:\s*''[\s\S]*password:\s*''/)
  assert.match(pageSource, /v-model="phoneForm\.password"/)
  assert.match(pageSource, /type="password"/)
  assert.match(pageSource, /password:\s*phoneForm\.password/)
  assert.doesNotMatch(pageSource, /图片验证码/)
  assert.doesNotMatch(pageSource, /短信验证码/)
  assert.doesNotMatch(pageSource, /captchaCode/)
  assert.doesNotMatch(pageSource, /phoneForm\.code/)
  assert.doesNotMatch(pageSource, /handleSendCode/)
  assert.doesNotMatch(pageSource, /useSmsCode/)
  assert.doesNotMatch(pageSource, /getCaptcha\('login', 'member'\)/)
})

test('login page follows figma tabs without generic account password mode', () => {
  assert.match(pageSource, /loginMode = ref<'phone' \| 'email'>\('phone'\)/)
  assert.match(pageSource, /手机号登录/)
  assert.match(pageSource, /邮箱登录/)
  assert.match(pageSource, /switchLoginMode\(mode: 'phone' \| 'email'\)/)
  assert.doesNotMatch(pageSource, /switchToAccountLogin/)
  assert.doesNotMatch(pageSource, /switchToPhoneLogin/)
  assert.doesNotMatch(pageSource, /loginMode === 'account'/)
})

test('email login is email-specific instead of generic username login', () => {
  assert.match(pageSource, /emailForm = reactive\(\{[\s\S]*email:\s*''/)
  assert.match(pageSource, /v-model="emailForm\.email"/)
  assert.match(pageSource, /handleEmailLogin/)
  assert.match(pageSource, /username: emailForm\.email/)
  assert.doesNotMatch(pageSource, /accountForm/)
})
