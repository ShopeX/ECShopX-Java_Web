import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()

const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('web menu composable requests h5 menu endpoint by menu id', () => {
  const source = read('app/composables/useWebMenu.ts')

  assert.match(source, /export function useWebMenu\(menuId:/)
  assert.match(source, /\/wxapp\/web\/menus\/id\//)
  assert.match(source, /\/web\/menus\//)
  assert.match(source, /resolveWebMenuId/)
  assert.match(source, /resolveWebMenuRequestValue/)
  assert.match(source, /resolveWebMenuItemLink/)
  assert.match(source, /case 'sale_category':/)
  assert.match(source, /case 'category':/)
  assert.match(source, /link_type=/)
  assert.match(source, /\/collections\//)
  assert.match(source, /case 'goods':/)
})

test('resolveWebMenuItemLink routes both category types to collections page with link_type', () => {
  const source = read('app/composables/useWebMenu.ts')

  assert.doesNotMatch(source, /\/category\//)
  assert.match(source, /encodeURIComponent\(item\.link_type\)/)
  assert.match(source, /encodeURIComponent\(value\)/)
})

test('layout passes header menu id into category drawer', () => {
  const source = read('app/layouts/default.vue')

  assert.match(source, /const headerMenuId = computed\(/)
  assert.match(
    source,
    /resolveWebMenuRequestValue\(dsl\.sections\?\.\[sectionId\]\?\.settings\?\.menu\)/
  )
  assert.match(source, /:menu-id="headerMenuId"/)
})

test('category drawer and footer menu block both consume web menus by menu id', () => {
  const categoryNav = read('app/components/BCCategoryNav/BCCategoryNav.vue')
  const footerSection = read(
    'app/decoration-engine/components/sections/DecorationFooterSection.vue'
  )

  assert.match(categoryNav, /menuId\?: string \| number \| null/)
  assert.match(categoryNav, /await useWebMenu\(props\.menuId\)/)
  assert.match(categoryNav, /resolveWebMenuItemLink/)
  assert.match(categoryNav, /@click="handlePrimaryAction\(item\)"/)
  assert.match(categoryNav, /function navigateMenuItem\(item: CategoryItem\)/)
  assert.match(categoryNav, /router\.push\(localePath\(item\.link\)\)/)
  assert.doesNotMatch(categoryNav, /const categories = computed<Category\[\]>\(\(\) => \[/)

  assert.match(footerSection, /const footerMenuIds = computed\(/)
  assert.match(footerSection, /resolveWebMenuRequestValue\(/)
  assert.match(footerSection, /await useWebMenu\(menuId\)/)
  assert.match(footerSection, /resolveWebMenuItemLink/)
})
