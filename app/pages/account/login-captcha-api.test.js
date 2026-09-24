import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const apiClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/AuthApiClient.ts'),
  'utf8'
)

test('login captcha api supports member image code endpoint', () => {
  assert.match(apiClientSource, /getCaptcha/)
  assert.match(apiClientSource, /\/wxapp\/member\/image\/code/)
  assert.match(apiClientSource, /\/wxapp\/distributor\/image\/code/)
})

test('phone password login uses unified new login endpoint payload', () => {
  assert.match(apiClientSource, /\/wxapp\/new_login/)
  assert.match(apiClientSource, /auth_type:\s*'local'/)
  assert.match(apiClientSource, /username:\s*params\.phone/)
  assert.match(apiClientSource, /password:\s*params\.password/)
  assert.match(apiClientSource, /check_type:\s*'password'/)
  assert.match(apiClientSource, /silent:\s*1/)
  assert.match(apiClientSource, /auto_register:\s*0/)
  assert.match(apiClientSource, /trustlogin_tag:\s*'weixin'/)
  assert.match(apiClientSource, /version_tag:\s*'touch'/)
  assert.doesNotMatch(apiClientSource, /vcode:\s*params\.password/)
  assert.doesNotMatch(apiClientSource, /\/wxapp\/auth\/login\/phone/)
})

test('email password login uses unified new login endpoint payload', () => {
  assert.match(apiClientSource, /async login\(params: ILoginRequest\)/)
  assert.match(apiClientSource, /\/wxapp\/new_login/)
  assert.match(apiClientSource, /username:\s*params\.username/)
  assert.match(apiClientSource, /password:\s*params\.password/)
  assert.match(apiClientSource, /check_type:\s*'password'/)
  assert.match(apiClientSource, /silent:\s*1/)
  assert.match(apiClientSource, /auto_register:\s*0/)
  assert.match(apiClientSource, /auth_type:\s*'local'/)
  assert.match(apiClientSource, /showError:\s*false/)
  assert.match(apiClientSource, /trustlogin_tag:\s*'weixin'/)
  assert.match(apiClientSource, /version_tag:\s*'touch'/)
  assert.doesNotMatch(apiClientSource, /\/wxapp\/login/)
})

test('login client converts new_login business failure into api error message', () => {
  assert.match(apiClientSource, /assertNewLoginSuccess/)
  assert.match(apiClientSource, /error_message/)
  assert.match(apiClientSource, /throw new Error\(message\)/)
  assert.match(apiClientSource, /const response = await this\.http\('\/wxapp\/new_login'/)
  assert.match(apiClientSource, /assertNewLoginSuccess\(response\)/)
})
