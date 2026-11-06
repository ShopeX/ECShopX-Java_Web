import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const typesSource = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCShopHeader/types.ts'),
  'utf8'
)

const vuePath = path.resolve(process.cwd(), 'app/components/BCShopHeader/BCShopHeader.vue')
const vueSource = existsSync(vuePath) ? readFileSync(vuePath, 'utf8') : ''

const homeDataSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useHomeData.ts'),
  'utf8'
)

const shopPagePath = path.resolve(process.cwd(), 'app/pages/shop/[id].vue')
const shopPageSource = existsSync(shopPagePath) ? readFileSync(shopPagePath, 'utf8') : ''

test('BCShopHeaderProps defines required fields', () => {
  assert.match(typesSource, /distributorId:\s*string/)
  assert.match(typesSource, /logo:\s*string/)
  assert.match(typesSource, /name:\s*string/)
  assert.match(typesSource, /tagline:\s*string/)
  assert.match(typesSource, /categories:\s*string\[\]/)
  assert.match(typesSource, /followed\?:\s*boolean/)
})

test('BCShopHeader declares correct emits', () => {
  assert.match(vueSource, /emit\(['"]follow['"]/)
  assert.match(vueSource, /emit\(['"]contact['"]/)
})

test('BCShopHeader has required data-testid attributes', () => {
  assert.match(vueSource, /data-testid="shop-header"/)
  assert.match(vueSource, /data-testid="shop-header-search"/)
  assert.match(vueSource, /data-testid="shop-header-follow"/)
  assert.match(vueSource, /data-testid="shop-header-contact"/)
})

test('BCShopHeader follow button toggles isFollowed and emits', () => {
  assert.match(vueSource, /isFollowed\.value\s*=\s*!isFollowed\.value/)
  assert.match(vueSource, /emit\(['"]follow['"],\s*isFollowed\.value\)/)
})

test('BCShopHeader search navigates to shop page with q param', () => {
  assert.match(vueSource, /router\.replace/)
  assert.match(vueSource, /router\.push/)
  assert.match(vueSource, /props\.distributorId/)
})

test('useHomeData accepts optional keywords parameter', () => {
  assert.match(homeDataSource, /function useHomeData\s*\(\s*distributorId\?[^)]*keywords\?/)
})

test('useHomeData passes keywords to loadProducts', () => {
  assert.match(homeDataSource, /keywords:\s*keywords/)
})

test('shop/[id].vue includes BCShopHeader component', () => {
  assert.match(shopPageSource, /BCShopHeader/)
  assert.match(shopPageSource, /:distributor-id="distributorId"/)
})

test('shop/[id].vue passes q query param as keywords to useHomeData', () => {
  assert.match(shopPageSource, /route\.query\.q/)
  assert.match(shopPageSource, /useHomeData\(distributorId,/)
})
