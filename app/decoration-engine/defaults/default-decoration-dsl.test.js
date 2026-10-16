import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()
const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('web ships admin-aligned default decoration DSL factories', () => {
  const source = read('app/decoration-engine/defaults/defaultDecorationDsl.ts')

  assert.match(source, /createDefaultHeaderDecorationDsl/)
  assert.match(source, /createDefaultFooterDecorationDsl/)
  assert.match(source, /createDefaultHomeDecorationDsl/)
  assert.match(source, /createDsl\('header',\s*'header'/)
  assert.match(source, /createDsl\('footer',\s*'footer'/)
  assert.match(source, /createDsl\('home'/)
  assert.match(source, /createSection\('main-carousel',\s*'main-carousel'/)
  assert.match(source, /createSection\('image-hotspot',\s*'image-hotspot'/)
  assert.match(source, /createSection\('product-tab-shelf',\s*'product-tab-shelf'/)
  assert.match(source, /type:\s*'footer-text'/)
  assert.match(source, /type:\s*'footer-menu'/)
  assert.match(source, /type:\s*'footer-image'/)
  assert.match(source, /品牌介绍/)
})

test('layout and homepage use defaults when fetched decoration is empty', () => {
  const layoutComposable = read('app/composables/useShopLayoutDecoration.ts')
  const layout = read('app/layouts/default.vue')
  const homepage = read('app/pages/index.vue')

  assert.match(layoutComposable, /createDefaultHeaderDecorationDsl/)
  assert.match(layoutComposable, /createDefaultFooterDecorationDsl/)
  assert.match(layoutComposable, /withDecorationDefault/)
  assert.match(layout, /defaultHeaderDecorationDsl/)
  assert.match(layout, /defaultFooterDecorationDsl/)
  assert.match(homepage, /createDefaultHomeDecorationDsl/)
  assert.match(homepage, /defaultHomeDecorationDsl/)
  assert.match(homepage, /pageRenderDslWithDefault/)
  assert.match(homepage, /:dsl="pageRenderDslWithDefault"/)
})
