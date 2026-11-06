import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/register.vue'),
  'utf8'
)

test('register page exposes phone and email registration tabs', () => {
  assert.match(pageSource, /registerMode = ref<'phone' \| 'email'>\('phone'\)/)
  assert.match(pageSource, /registerMode === 'phone'/)
  assert.match(pageSource, /registerMode === 'email'/)
  assert.match(pageSource, /t\('5a21f3db\.de46a3'\)/)
  assert.match(pageSource, /t\('5a21f3db\.921b9f'\)/)
})

test('email registration form matches figma fields and agreement flow', () => {
  assert.match(pageSource, /emailForm = reactive\(\{[\s\S]*email:\s*''/)
  assert.match(pageSource, /emailForm = reactive\(\{[\s\S]*captchaCode:\s*''/)
  assert.match(pageSource, /emailForm = reactive\(\{[\s\S]*password:\s*''/)
  assert.match(pageSource, /emailForm = reactive\(\{[\s\S]*confirmPassword:\s*''/)
  assert.match(pageSource, /agreedToTerms/)
  assert.match(pageSource, /t\('5a21f3db\.b457cd'\)/)
  assert.match(pageSource, /t\('5a21f3db\.e70066'\)/)
  assert.match(pageSource, /t\('5a21f3db\.209f2b'\)/)
  assert.match(pageSource, /t\('5a21f3db\.8562a6'\)/)
  assert.match(pageSource, /t\('5a21f3db\.3179ba'\)/)
  assert.match(pageSource, /t\('5a21f3db\.df410b'\)/)
  assert.match(pageSource, /t\('5a21f3db\.be8324'\)/)
})

test('phone registration matches figma captcha and sms fields', () => {
  assert.match(pageSource, /phoneForm = reactive\(\{[\s\S]*phone:\s*''/)
  assert.match(pageSource, /phoneForm = reactive\(\{[\s\S]*captchaCode:\s*''/)
  assert.match(pageSource, /phoneForm = reactive\(\{[\s\S]*code:\s*''/)
  assert.match(
    pageSource,
    /v-model="phoneForm\.phone"[\s\S]*v-model="phoneForm\.captchaCode"[\s\S]*v-model="phoneForm\.code"[\s\S]*v-model="phoneForm\.password"[\s\S]*v-model="phoneForm\.confirmPassword"/
  )
  assert.match(pageSource, /:placeholder="t\('5a21f3db\.fcbe6f'\)"/)
  assert.match(pageSource, /:placeholder="t\('5a21f3db\.eb76c0'\)"/)
  assert.match(
    pageSource,
    /function switchRegisterMode\(mode: 'phone' \| 'email'\) \{[\s\S]*if \(mode === 'phone'\) \{[\s\S]*getCaptcha\('sign', 'member'\)/
  )
  assert.match(pageSource, /if \(!phoneForm\.captchaCode\)/)
  assert.match(
    pageSource,
    /phoneForm\.captchaCode,\s*captcha\.value\?\.imageToken \|\| '',\s*'sign'/
  )
})

test('register submit buttons are disabled until agreement is checked', () => {
  const disabledByAgreementCount = pageSource.match(
    /:disabled="isLoading \|\| !agreedToTerms"/g
  )?.length

  assert.equal(disabledByAgreementCount, 2)
  assert.match(pageSource, /function validateAgreement\(\)/)
})

test('email registration uses captcha and validates email before submit', () => {
  assert.match(pageSource, /useAuth\(\)/)
  assert.match(pageSource, /captcha\?\.imageData/)
  assert.match(pageSource, /handleRefreshCaptcha/)
  assert.match(
    pageSource,
    /function switchRegisterMode\(mode: 'phone' \| 'email'\) \{[\s\S]*if \(mode === 'email'\) \{[\s\S]*getCaptcha\('sign', 'member'\)/
  )
  assert.doesNotMatch(
    pageSource,
    /function switchRegisterMode\(mode: 'phone' \| 'email'\) \{[\s\S]*if \(mode === 'email' && !captcha\.value\)/
  )
  assert.match(
    pageSource,
    /onMounted\(\(\) => \{[\s\S]*if \(registerMode\.value === 'phone' && !captcha\.value\) \{[\s\S]*getCaptcha\('sign', 'member'\)/
  )
  assert.match(pageSource, /refreshCaptcha\('sign', 'member'\)/)
  assert.match(pageSource, /handleEmailRegister/)
  assert.match(pageSource, /AuthTransformer\.validateEmail\(emailForm\.email\)/)
  assert.match(pageSource, /emailForm\.captchaCode/)
  assert.match(pageSource, /captcha\.value\?\.imageToken/)
})

test('register captcha uses member sign endpoints instead of login sms flow', () => {
  const authSource = readFileSync(path.resolve(process.cwd(), 'app/composables/useAuth.ts'), 'utf8')
  const smsSource = readFileSync(
    path.resolve(process.cwd(), 'app/composables/useSmsCode.ts'),
    'utf8'
  )
  const clientSource = readFileSync(
    path.resolve(process.cwd(), 'app/infrastructure/http/clients/AuthApiClient.ts'),
    'utf8'
  )

  assert.match(clientSource, /\/wxapp\/member\/image\/code/)
  assert.match(
    authSource,
    /getCaptcha\(\s*type: string = 'login',\s*scope: 'distributor' \| 'member' = 'distributor'\s*\)/
  )
  assert.match(
    authSource,
    /refreshCaptcha\(\s*type: string = 'login',\s*scope: 'distributor' \| 'member' = 'distributor'\s*\)/
  )
  assert.match(
    smsSource,
    /sendCode\(\s*phone: string,\s*captcha: string,\s*captchaToken: string,\s*type: string = 'login'\s*\)/
  )
  assert.match(smsSource, /type,\s*mobile: phone/)
  assert.doesNotMatch(pageSource, /sendSmsCode\([\s\S]*captcha\.value\?\.imageToken \|\| ''\s*\)/)
})

test('register submit calls member registration api instead of local mock', () => {
  const clientSource = readFileSync(
    path.resolve(process.cwd(), 'app/infrastructure/http/clients/AuthApiClient.ts'),
    'utf8'
  )

  assert.match(clientSource, /registerMember/)
  assert.match(clientSource, /\/wxapp\/member/)
  assert.match(clientSource, /auth_type:\s*'local'/)
  assert.match(clientSource, /check_type:\s*'sign'/)
  assert.match(clientSource, /sex:\s*0/)
  assert.match(clientSource, /user_type:\s*'local'/)
  assert.match(pageSource, /authApiClient\.registerMember/)
  assert.match(pageSource, /mobile:\s*phoneForm\.phone/)
  assert.match(pageSource, /password:\s*phoneForm\.password/)
  assert.match(pageSource, /vcode:\s*phoneForm\.code/)
  assert.doesNotMatch(pageSource, /TODO: 后端注册 API/)
  assert.doesNotMatch(pageSource, /new Promise\(\(resolve\) => setTimeout/)
})

test('email register submit uses dedicated email register endpoint payload', () => {
  const clientSource = readFileSync(
    path.resolve(process.cwd(), 'app/infrastructure/http/clients/AuthApiClient.ts'),
    'utf8'
  )

  assert.match(clientSource, /registerEmailMember/)
  assert.match(clientSource, /\/wxapp\/member\/email\/register/)
  assert.match(clientSource, /email:\s*params\.email/)
  assert.match(clientSource, /password:\s*params\.password/)
  assert.match(clientSource, /password_confirmation:\s*params\.passwordConfirmation/)
  assert.match(clientSource, /token:\s*params\.token/)
  assert.match(clientSource, /yzm:\s*params\.yzm/)
  assert.match(clientSource, /grade_id:\s*17/)
  assert.match(pageSource, /authApiClient\.registerEmailMember/)
  assert.match(pageSource, /passwordConfirmation:\s*emailForm\.confirmPassword/)
  assert.match(pageSource, /token:\s*captcha\.value\.imageToken/)
  assert.match(pageSource, /yzm:\s*emailForm\.captchaCode/)
})

test('phone registration refreshes captcha when image captcha is rejected', () => {
  assert.match(pageSource, /function isImageCaptchaError\(message: string\)/)
  assert.match(pageSource, /message\.includes\('图片验证码错误'\)/)
  assert.match(
    pageSource,
    /if \(isImageCaptchaError\(error\.value\)\) \{[\s\S]*await handleRefreshCaptcha\(\)/
  )
})

test('email registration refreshes captcha whenever register request fails', () => {
  assert.match(
    pageSource,
    /async function completeEmailRegister[\s\S]*catch \(err: any\) \{[\s\S]*error\.value = err\.message \|\| t\('5a21f3db\.bd5372'\)[\s\S]*await handleRefreshCaptcha\(\)/
  )
})

test('register layout is responsive for pc and h5 figma variants', () => {
  assert.match(pageSource, /min-h-screen/)
  assert.match(pageSource, /hidden flex-1 overflow-hidden lg:block/)
  assert.match(pageSource, /w-full flex-col bg-white lg:w-\[560px\]/)
})

test('pc register layout follows figma spacing and visual treatment', () => {
  assert.match(pageSource, /bg-\[rgba\(0,0,0,0\.7\)\]/)
  assert.match(pageSource, /lg:w-\[560px\]/)
  assert.match(pageSource, /lg:p-8/)
  assert.match(pageSource, /py-8/)
  assert.match(pageSource, /gap-8/)
  assert.match(pageSource, /w-\[101px\]/)
  assert.match(pageSource, /h-10/)
  assert.doesNotMatch(pageSource, /<script lang="ts">/)
  assert.doesNotMatch(pageSource, /defineComponent/)
  assert.doesNotMatch(pageSource, /<RegisterMessages/)
  assert.doesNotMatch(pageSource, /<RegisterActions/)
  assert.doesNotMatch(pageSource, /<PasswordFields/)
  assert.doesNotMatch(pageSource, /<AgreementCheckbox/)
})
