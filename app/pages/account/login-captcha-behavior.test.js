import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/login.vue'),
  'utf8'
)

test('phone password login validates password before login', () => {
  assert.match(pageSource, /if \(!phoneForm\.password\)/)
  assert.match(pageSource, /password:\s*phoneForm\.password/)
  assert.doesNotMatch(pageSource, /sendSmsCode/)
  assert.doesNotMatch(pageSource, /captcha\.value\?\.imageToken/)
  assert.doesNotMatch(pageSource, /refreshCaptcha\('login', 'member'\)/)
})

test('phone login no longer contains captcha refresh behavior', () => {
  assert.doesNotMatch(pageSource, /phoneForm\.captchaCode = ''/)
  assert.doesNotMatch(pageSource, /handleRefreshCaptcha/)
})

test('phone login no longer handles image captcha rejection', () => {
  assert.doesNotMatch(pageSource, /function isImageCaptchaError\(message: string\)/)
  assert.doesNotMatch(pageSource, /message\.includes\('图片验证码错误'\)/)
})
