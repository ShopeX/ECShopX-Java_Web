import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const read = (relativePath) => readFileSync(path.resolve(process.cwd(), relativePath), 'utf8')

const defaultHeaderSource = read('app/components/BCHeaderBar/BCHeaderBar.vue')
const simpleHeaderSource = read('app/components/BCHeaderBar/BCHeaderBarSimple.vue')
const headerUserSource = read('app/composables/useHeaderUser.ts')

test('default header delegates user routing to shared header user composable', () => {
  assert.match(defaultHeaderSource, /useHeaderUser\(\)/)
  assert.match(defaultHeaderSource, /openUserCenter/)
})

test('simple header delegates user routing to shared header user composable', () => {
  assert.match(simpleHeaderSource, /useHeaderUser\('/)
  assert.match(simpleHeaderSource, /openUserCenter/)
})

test('shared header user composable validates auth before routing user center', () => {
  assert.match(headerUserSource, /userStore\.fetchUserInfo\(\)/)
  assert.match(headerUserSource, /!result\.success/)
  assert.match(headerUserSource, /path:\s*localePath\('\/account\/login'\)/)
})
