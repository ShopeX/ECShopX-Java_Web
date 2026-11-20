import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()

const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('decoration DSL types define page and message contracts', () => {
  const filePath = path.resolve(cwd, 'app/decoration-engine/types/decoration.ts')
  assert.ok(existsSync(filePath), 'app/decoration-engine/types/decoration.ts should exist')

  const source = read('app/decoration-engine/types/decoration.ts')
  assert.match(source, /export interface DecorationBlock/)
  assert.match(source, /export interface DecorationSection/)
  assert.match(source, /\| 'product_list'/)
  assert.match(source, /export interface DecorationDSL/)
  assert.match(source, /export type DecorationMessageType =/)
  assert.match(source, /'DECORATION_INIT'/)
  assert.match(source, /'DECORATION_UPDATE'/)
  assert.match(source, /'PREVIEW_READY'/)
  assert.match(source, /'PREVIEW_READY_ACK'/)
  assert.match(source, /'SECTION_FOCUSED'/)
  assert.match(source, /'BLOCK_FOCUSED'/)
  assert.match(source, /'BLOCK_HIGHLIGHT'/)
  assert.match(source, /'BLOCK_RECT'/)
  assert.match(source, /'MOVE_BLOCK_REQUESTED'/)
  assert.match(source, /'DUPLICATE_BLOCK_REQUESTED'/)
  assert.match(source, /'REMOVE_BLOCK_REQUESTED'/)
})

test('normalizeDecorationDSL maps admin blockOrder into renderer block_order', () => {
  const source = read('app/decoration-engine/types/decoration.ts')
  assert.match(source, /blockOrder/)
  assert.match(source, /block_order/)
  assert.match(source, /typeof candidate\.pageId === 'string'/)
})

test('useDecorationPreview validates origins and handles init update ready focus and block highlight messages', () => {
  const filePath = path.resolve(cwd, 'app/decoration-engine/composables/useDecorationPreview.ts')
  assert.ok(
    existsSync(filePath),
    'app/decoration-engine/composables/useDecorationPreview.ts should exist'
  )

  const source = read('app/decoration-engine/composables/useDecorationPreview.ts')
  assert.match(source, /window\.addEventListener\('message'/)
  assert.match(source, /event\.origin/)
  assert.match(source, /DECORATION_INIT/)
  assert.match(source, /DECORATION_UPDATE/)
  assert.match(source, /PREVIEW_READY/)
  assert.match(source, /SECTION_FOCUSED/)
  assert.match(source, /BLOCK_HIGHLIGHT/)
  assert.match(source, /BLOCK_RECT/)
  assert.match(source, /PREVIEW_READY_ACK/)
  assert.match(source, /headerDsl/)
  assert.match(source, /footerDsl/)
  assert.match(source, /payload\.sections/)
  assert.match(source, /postMessage/)
  assert.match(source, /requestMoveBlock/)
  assert.match(source, /requestDuplicateBlock/)
  assert.match(source, /requestRemoveBlock/)
})

test('decoration registry provides known section components to Nuxt app', () => {
  const filePath = path.resolve(cwd, 'app/plugins/decoration-registry.ts')
  assert.ok(existsSync(filePath), 'app/plugins/decoration-registry.ts should exist')

  const source = read('app/plugins/decoration-registry.ts')
  assert.match(source, /header/)
  assert.match(source, /footer/)
  assert.match(source, /main-carousel/)
  assert.match(source, /carousel/)
  assert.match(source, /image-hotspot/)
  assert.match(source, /product-shelf/)
  assert.match(source, /nuxtApp\.provide\('decorationRegistry'/)
})

test('DecorationRenderer iterates ordered sections, skips disabled ones, and resolves via registry', () => {
  const filePath = path.resolve(cwd, 'app/decoration-engine/components/DecorationRenderer.vue')
  assert.ok(
    existsSync(filePath),
    'app/decoration-engine/components/DecorationRenderer.vue should exist'
  )

  const source = read('app/decoration-engine/components/DecorationRenderer.vue')
  const hostSource = read('app/decoration-engine/components/DecorationSectionHost.vue')
  assert.match(source, /dsl\.order/)
  assert.match(source, /disabled/)
  assert.match(source, /decorationRegistry|sectionRegistry/)
  assert.match(source, /@activate="onSectionActivate"/)
  assert.match(hostSource, /emit\('activate'/)
  assert.match(source, /<component/)
  assert.match(source, /useSlots/)
})

test('DecorationRenderer scrolls highlighted section or block into view', () => {
  const source = read('app/decoration-engine/components/DecorationRenderer.vue')
  assert.match(source, /function scrollDecorationElementIntoView/)
  assert.match(source, /data-decoration-section/)
  assert.match(source, /data-decoration-block/)
  assert.match(source, /scrollIntoView/)
  assert.match(source, /block: 'center'/)
  assert.match(source, /inline: 'nearest'/)
})

for (const sectionName of [
  'Carousel',
  'ImageHotspot',
  'ProductShelf',
  'DecorationHeaderSection',
  'DecorationFooterSection',
]) {
  test(`${sectionName} decoration section component exists`, () => {
    const relativePath = `app/decoration-engine/components/sections/${sectionName}.vue`
    assert.ok(existsSync(path.resolve(cwd, relativePath)), `${relativePath} should exist`)
  })
}
