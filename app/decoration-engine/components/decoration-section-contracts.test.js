import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()

const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('Carousel section follows decoration plan contract', () => {
  const source = read('app/decoration-engine/components/sections/Carousel.vue')

  assert.match(source, /block_order/)
  assert.match(source, /interval/)
  assert.match(source, /showDots/)
  assert.match(source, /showArrows/)
  assert.match(source, /data-block-id/)
  assert.match(source, /data-section-id/)
  assert.match(source, /focusBlock/)
  assert.match(source, /DecorationBlockHost/)
  assert.match(source, /resolveDecorationLink/)
  assert.match(source, /linkType/)
  assert.match(source, /8cac7342\.cc2e46/)
})

test('Carousel autoplay never starts during server rendering', () => {
  const source = read('app/decoration-engine/components/sections/Carousel.vue')

  assert.match(
    source,
    /const startAutoplay = \(\) => \{[\s\S]*if \(!import\.meta\.client\) \{[\s\S]*return[\s\S]*\}[\s\S]*setInterval/
  )
})

test('ImageHotspot section follows decoration plan contract', () => {
  const source = read('app/decoration-engine/components/sections/ImageHotspot.vue')

  assert.match(source, /block_order/)
  assert.match(source, /shape/)
  assert.match(source, /circle/)
  assert.match(source, /rect/)
  assert.match(source, /label/)
  assert.match(source, /:block-id=/)
  assert.match(source, /:section-id=/)
  assert.match(source, /DecorationBlockHost/)
  assert.match(source, /44646d39\.9bb1a6/)
})

test('ProductShelf section follows decoration plan contract', () => {
  const source = read('app/decoration-engine/components/sections/ProductShelf.vue')

  assert.match(source, /displayMode/)
  assert.match(source, /categoryId/)
  assert.match(source, /itemIds/)
  assert.match(source, /useAsyncData/)
  assert.match(source, /BCProductCard/)
  assert.match(source, /showPrice/)
  assert.match(source, /showAddCart/)
  assert.match(source, /grid-cols-/)
  assert.match(source, /c40a02ee\.c5c5f2|c40a02ee\.8bb820/)
})

test('ProductTabShelf section follows decoration plan contract', () => {
  const source = read('app/decoration-engine/components/sections/ProductTabShelf.vue')
  const registry = read('app/plugins/decoration-registry.ts')

  assert.match(source, /product-tab-shelf/)
  assert.match(source, /product-tab/)
  assert.match(source, /DecorationBlockHost/)
  assert.match(source, /focusBlock/)
  assert.match(source, /itemApiClient/)
  assert.match(source, /ProductTransformer/)
  assert.match(source, /BCProductCard/)
  assert.match(registry, /ProductTabShelf/)
  assert.match(registry, /'product-tab-shelf'/)
})

test('ProductTabShelf keeps products in decoration product_ids order', () => {
  const source = read('app/decoration-engine/components/sections/ProductTabShelf.vue')

  assert.match(source, /sortProductsByTabOrder/)
  assert.match(source, /productOrderMap/)
  assert.match(source, /String\(product\.itemId\)/)
  assert.match(source, /tab\.productIds/)
  assert.match(source, /sortProductsByTabOrder\(ProductTransformer\.toModelList\(validBatchItems\),\s*productIds\)/)
})

test('DecorationFooterSection uses single-column mobile layout and desktop spans', () => {
  const source = read('app/decoration-engine/components/sections/DecorationFooterSection.vue')

  assert.match(source, /grid-cols-1/)
  assert.match(source, /md:grid-cols-12/)
  assert.match(source, /md:col-span-12/)
  assert.match(source, /md:col-span-6/)
})

test('DecorationHeaderSection keeps the locale switcher from the default header', () => {
  const source = read('app/decoration-engine/components/sections/DecorationHeaderSection.vue')

  assert.match(source, /enable_language_selector/)
  assert.match(source, /LOCALE_DEFINITIONS/)
  assert.match(source, /useSwitchLocalePath/)
  assert.match(source, /setPreferredLocale\(localeCode\)/)
  assert.match(source, /navigateTo\(path,\s*\{\s*replace:\s*true\s*\}\)/)
  assert.match(source, /i-heroicons-globe-alt/)
  assert.match(source, /switchLanguage/)
})

test('layout routes decoration header user action through the active locale', () => {
  const source = read('app/layouts/default.vue')

  assert.match(source, /const localePath = useLocalePath\(\)/)
  assert.match(source, /router\.push\(localePath\('\/account'\)\)/)
  assert.doesNotMatch(source, /router\.push\('\/account'\)/)
})
