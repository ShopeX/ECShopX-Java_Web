import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const readSource = (file) => readFileSync(path.resolve(process.cwd(), file), 'utf8')

test('template api client exposes login page setting endpoint', () => {
  const source = readSource('app/infrastructure/http/clients/TemplateApiClient.ts')

  assert.match(source, /getLoginPageSetting/)
  assert.match(source, /\/wxapp\/pctemplate\/loginPage\/setting/)
})

test('mall global setting composable fetches once and exposes logo/background fallbacks', () => {
  const file = 'app/composables/useMallGlobalSetting.ts'
  assert.equal(existsSync(path.resolve(process.cwd(), file)), true)

  const source = readSource(file)
  assert.match(source, /useAsyncData\(/)
  assert.match(source, /server:\s*false/)
  assert.match(source, /watch\(\s*data/)
  assert.match(source, /useCookie<.*mall-global-setting-cache/)
  assert.match(source, /settingCache\.value\s*=\s*val/)
  assert.match(source, /useState<IMallGlobalSetting>\(/)
  assert.match(source, /'mall-global-setting'/)
  assert.match(source, /templateApiClient\.getLoginPageSetting\(\)/)
  assert.match(source, /logo_light/)
  assert.match(source, /logo_dark/)
  assert.match(source, /background/)
  assert.match(source, /\/images\/logo\/logo\.png/)
  assert.match(source, /import\s+defaultLoginBackgroundUrl\s+from\s+['"]~\/assets\/images\/login-bg\.png['"]/)
  assert.doesNotMatch(source, /DEFAULT_LOGIN_BACKGROUND_URL\s*=\s*['"]\/assets\/images\/login-bg\.png['"]/)
})

test('login page consumes cached login background setting', () => {
  const source = readSource('app/pages/account/login.vue')

  assert.match(source, /await useMallGlobalSetting\(\)/)
  assert.match(source, /loginBackgroundUrl/)
  assert.match(source, /:src="loginBackgroundUrl"/)
  assert.doesNotMatch(source, /src="\/assets\/images\/login-bg\.png"/)
})

test('common headers consume cached mall logo setting', () => {
  const files = [
    'app/components/BCHeaderBar/BCHeaderBar.vue',
    'app/components/BCHeaderBar/BCHeaderBarSimple.vue',
    'app/components/BCHeaderBar/BCHeaderBarDefault.vue',
    'app/components/Header.vue',
    'app/components/SpNavbar.vue',
  ]

  for (const file of files) {
    const source = readSource(file)
    assert.match(source, /await useMallGlobalSetting\(\)/, `${file} should fetch shared mall setting`)
    assert.match(source, /mallLogoDarkUrl/, `${file} should use dark logo on white header`)
    assert.match(source, /:src="mallLogoDarkUrl"/, `${file} should bind logo src`)
    assert.doesNotMatch(source, /src="\/images\/logo\/logo\.png"/, `${file} should not hardcode logo`)
  }
})

test('decoration header falls back to cached mall logo without overriding dsl logo', () => {
  const source = readSource('app/decoration-engine/components/sections/DecorationHeaderSection.vue')

  assert.match(source, /await useMallGlobalSetting\(\)/)
  assert.match(source, /mallLogoDarkUrl/)
  assert.match(
    source,
    /props\.section\.settings\.logoUrl \|\| mallLogoDarkUrl\.value/,
    'dsl logoUrl should stay higher priority than global logo'
  )
})
