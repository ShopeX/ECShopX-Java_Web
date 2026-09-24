import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()
const source = readFileSync(path.resolve(cwd, 'app/components/BCHeaderBar/BCHeaderBar.vue'), 'utf8')

test('default header stores preferred locale and replaces route on language switch', () => {
  assert.match(source, /markUserPreferredLocale/)
  assert.match(source, /markUserPreferredLocale\(localeCode\)/)
  assert.match(source, /navigateTo\(path,\s*\{\s*replace:\s*true\s*\}\)/)
})

test('default header loads enabled locales from site language setting', () => {
  assert.match(source, /fetchSiteLanguageSetting/)
  assert.match(source, /getEnabledLocales/)
})
