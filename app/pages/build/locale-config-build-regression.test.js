import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = process.cwd()

const nuxtConfigSource = readFileSync(path.resolve(repoRoot, 'nuxt.config.ts'), 'utf8')
const httpPluginSource = readFileSync(path.resolve(repoRoot, 'app/plugins/http.ts'), 'utf8')
const localeRouteSource = readFileSync(path.resolve(repoRoot, 'app/utils/localeRoute.ts'), 'utf8')
const headerBarSource = readFileSync(
  path.resolve(repoRoot, 'app/components/BCHeaderBar/BCHeaderBar.vue'),
  'utf8'
)

test('locale config lives under app so Nitro can bundle it from srcDir imports', () => {
  assert.equal(existsSync(path.resolve(repoRoot, 'app/shared/localeConfig.ts')), true)
  assert.match(nuxtConfigSource, /from '\.\/app\/shared\/localeConfig'/)
})

test('app runtime imports locale config through srcDir aliases', () => {
  assert.match(httpPluginSource, /from '~\/shared\/localeConfig'/)
  assert.match(localeRouteSource, /from '\.\.\/shared\/localeConfig'/)
  assert.match(headerBarSource, /from '~\/shared\/localeConfig'/)
})

test('http plugin does not override explicit country_code query or body values', () => {
  assert.match(
    httpPluginSource,
    /if \(!\(options as any\)\.skipCountryCode && !bodyData\.country_code\) \{\s*bodyData\.country_code = getCountryCode\(\)\s*\}/
  )
  assert.match(
    httpPluginSource,
    /if \(!\(options as any\)\.skipCountryCode && !query\.country_code\) \{\s*query\.country_code = getCountryCode\(\)\s*\}/
  )
})
