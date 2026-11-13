import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()
const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('collections page renders product_list decoration as one DSL with native product list slot', () => {
  const source = read('app/pages/collections/[id].vue')

  assert.match(source, /DECORATION_PAGE_TYPE = 'product_list'/)
  assert.match(source, /<DefaultLayout[\s\S]*:header-decoration-dsl="layoutHeaderDecorationDsl"/)
  assert.match(source, /:footer-decoration-dsl="layoutFooterDecorationDsl"/)
  assert.match(source, /:decoration-preview-session-key="DECORATION_PAGE_TYPE"/)
  assert.match(source, /useDecorationPageDslFetch\(\{[\s\S]*pageType:\s*DECORATION_PAGE_TYPE/)
  assert.match(source, /useHomeDecorationSplit/)
  assert.match(source, /ensureProductListNativeSection/)
  assert.match(source, /productListRenderDsl/)
  assert.match(source, /layout:\s*false/)
  assert.match(source, /layoutHeaderDecorationDsl/)
  assert.match(source, /layoutFooterDecorationDsl/)
  assert.match(source, /data-testid="collections-decoration-renderer-page"/)
  assert.match(source, /#product_list/)
  assert.match(source, /data-testid="collections-native-product-list"/)
  assert.match(source, /data-testid="collections-product-grid"/)
  assert.doesNotMatch(source, /collections-default-banner/)
  assert.doesNotMatch(source, /banners\/banner\.png/)
  assert.doesNotMatch(source, /productListTopRenderDsl/)
  assert.doesNotMatch(source, /productListBottomRenderDsl/)
  assert.doesNotMatch(source, /splitDecorationDslByPlacement/)
})

test('product_list preview uses its own preview session key and locks native sections', () => {
  const renderer = read('app/decoration-engine/components/DecorationRenderer.vue')
  const overlay = read('app/decoration-engine/components/DecorationPreviewSelectionOverlay.vue')
  const preview = read('app/decoration-engine/composables/useDecorationPreview.ts')
  const layout = read('app/composables/useShopLayoutDecoration.ts')

  assert.match(renderer, /key === 'product_list'/)
  assert.match(overlay, /k === 'product_list'/)
  assert.match(layout, /k === 'product_list'/)
  assert.match(preview, /type DecorationPreviewArea = 'header' \| 'template' \| 'footer'/)
  assert.match(overlay, /isLockedNativeSection/)
  assert.match(overlay, /canDuplicate:\s*area === 'template' && !locked/)
  assert.match(overlay, /canRemove:\s*sectionOrder\.length > 1 && !locked/)
  assert.doesNotMatch(overlay, /template-top/)
  assert.doesNotMatch(overlay, /template-bottom/)
})
