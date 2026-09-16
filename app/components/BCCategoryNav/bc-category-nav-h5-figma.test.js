import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const navSource = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCCategoryNav/BCCategoryNav.vue'),
  'utf8'
)
const layoutSource = readFileSync(path.resolve(process.cwd(), 'app/layouts/default.vue'), 'utf8')

test('category slideover uses full-width h5 drawer and desktop 720px drawer', () => {
  assert.match(layoutSource, /width: 'min\(100vw, 720px\)'/)
  assert.match(layoutSource, /!w-screen md:!w-\[720px\]/)
})

test('h5 category nav follows figma multi-level menu states', () => {
  assert.match(navSource, /mobileMenuLevel = ref<'primary' \| 'secondary' \| 'tertiary'>\('primary'\)/)
  assert.match(navSource, /mobileSecondaryTitle/)
  assert.match(navSource, /mobileTertiaryTitle/)
  assert.match(navSource, /openMobilePrimary/)
  assert.match(navSource, /openMobileSecondary/)
  assert.match(navSource, /goMobileBack/)
})

test('h5 category nav renders simple close header, text list and cards', () => {
  assert.match(navSource, /data-testid="category-nav-mobile-header"/)
  assert.match(navSource, /i-heroicons-x-mark/)
  assert.match(navSource, /data-testid="category-nav-mobile-primary"/)
  assert.match(navSource, /data-testid="category-nav-mobile-secondary"/)
  assert.match(navSource, /data-testid="category-nav-mobile-tertiary"/)
  assert.match(navSource, /h-\[150px\]/)
  assert.doesNotMatch(navSource, /LOGO/)
  assert.doesNotMatch(navSource, /购物车/)
  assert.doesNotMatch(navSource, /客户服务/)
  assert.doesNotMatch(navSource, /400-333-2222/)
  assert.doesNotMatch(navSource, /配送至：中国大陆/)
})
