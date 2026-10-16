import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = process.cwd()

const useTemplateSource = readFileSync(
  path.resolve(repoRoot, 'app/composables/useTemplate.ts'),
  'utf8'
)
const accountMenuSource = readFileSync(
  path.resolve(repoRoot, 'app/pages/account/components/AccountMenu.vue'),
  'utf8'
)
const accountFilterBarSource = readFileSync(
  path.resolve(repoRoot, 'app/pages/account/components/AccountH5FilterBar.vue'),
  'utf8'
)
const bcProductCardSource = readFileSync(
  path.resolve(repoRoot, 'app/components/BCProductCard/BCProductCard.vue'),
  'utf8'
)
const nuxtConfigSource = readFileSync(path.resolve(repoRoot, 'nuxt.config.ts'), 'utf8')

test('business mode runtime config and helpers align on bbc instead of b2b', () => {
  assert.match(nuxtConfigSource, /businessMode: process\.env\.NUXT_PUBLIC_BUSINESS_MODE \|\| 'b2c'/)
  assert.match(useTemplateSource, /'bbc' \| 'b2c'/)
  assert.match(useTemplateSource, /mode === 'b2b' \? 'bbc' : mode/)
})

test('bbc-specific UI gates check for bbc business mode', () => {
  assert.match(accountMenuSource, /===\s*'bbc'/)
  assert.match(accountFilterBarSource, /===\s*'bbc'/)
  assert.match(bcProductCardSource, /===\s*'bbc'/)
})
