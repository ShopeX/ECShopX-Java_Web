import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()
const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('account logout redirects to home instead of login page', () => {
  const accountMenu = read('app/pages/account/components/AccountMenu.vue')
  const h5Filter = read('app/pages/account/components/AccountH5FilterBar.vue')
  const header = read('app/components/BCHeaderBar/BCHeaderBarDefault.vue')

  assert.match(accountMenu, /await logout\(\)[\s\S]*router\.push\(localePath\('\/'\)\)/)
  assert.match(h5Filter, /await logout\(\)[\s\S]*router\.push\(localePath\('\/'\)\)/)
  assert.match(header, /await userStore\.logout\(\)[\s\S]*navigateTo\(localePath\('\/'\)\)/)
  assert.doesNotMatch(accountMenu, /router\.push\(localePath\('\/account\/login'\)\)/)
  assert.doesNotMatch(h5Filter, /router\.push\(localePath\('\/account\/login'\)\)/)
  assert.doesNotMatch(header, /localePath\('\/auth\/login'\)/)
})
