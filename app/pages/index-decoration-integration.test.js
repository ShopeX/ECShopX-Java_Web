import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()

const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('homepage integrates preview mode and SSR decoration fetch without legacy page-config fallback', () => {
  const source = read('app/pages/index.vue')
  const renderer = read('app/decoration-engine/components/DecorationRenderer.vue')
  const layout = read('app/layouts/default.vue')

  assert.match(source, /useDecorationRouteContext/)
  assert.match(source, /useDecorationPageDslFetch/)
  assert.match(source, /useDecorationPreview/)
  assert.match(source, /DECORATION_PAGE_TYPE/)
  assert.match(source, /DecorationRenderer/)
  assert.match(source, /DefaultLayout/)
  assert.doesNotMatch(source, /useHomeData/)
  assert.doesNotMatch(source, /HomePageDecorationFallback/)
  assert.match(source, /pageRenderDsl|headerRenderDsl|footerRenderDsl/)
  assert.match(renderer, /onSectionActivate/)
  assert.match(renderer, /focusSection/)
  assert.match(renderer, /useDecorationRouteContext/)
  assert.match(layout, /v-if="shouldRenderFooterDecoration"/)
  assert.match(layout, /useDecorationDslFetch/)
  assert.match(layout, /pageType:\s*'header'/)
  assert.match(layout, /pageType:\s*'footer'/)
  assert.doesNotMatch(
    layout,
    /<template v-if="!isDecorationRouteDesignMode">\s*<DecorationRenderer/
  )
})

test('homepage only passes split header/footer DSL into layout during preview mode', () => {
  const source = read('app/pages/index.vue')

  assert.match(source, /const layoutHeaderDecorationDsl = computed\(/)
  assert.match(source, /const layoutFooterDecorationDsl = computed\(/)
  assert.match(source, /:header-decoration-dsl="layoutHeaderDecorationDsl"/)
  assert.match(source, /:footer-decoration-dsl="layoutFooterDecorationDsl"/)
  assert.doesNotMatch(source, /:header-decoration-dsl="headerRenderDsl"/)
  assert.doesNotMatch(source, /:footer-decoration-dsl="footerRenderDsl"/)
})

test('custom page renders custom decoration by route id', () => {
  const source = read('app/pages/custom/[id].vue')
  const menu = read('app/composables/useWebMenu.ts')

  assert.match(source, /DECORATION_PAGE_TYPE = 'custom'/)
  assert.match(source, /route\.params\.id/)
  assert.match(source, /useDecorationPageDslFetch/)
  assert.match(source, /pageType:\s*DECORATION_PAGE_TYPE/)
  assert.match(source, /pageId:\s*customPageId/)
  assert.match(source, /data-testid="custom-decoration-renderer-page"/)
  assert.match(menu, /case 'custom_page':/)
  assert.match(menu, /\/custom\/\$\{item\.link_value/)
  assert.doesNotMatch(menu, /\/page\/\$\{item\.link_value/)
})

test('decoration route + DSL fetch composables exist for page and layout reuse', () => {
  const routeCtx = read('app/decoration-engine/composables/useDecorationRouteContext.ts')
  const genericDslFetch = read('app/decoration-engine/composables/useDecorationDslFetch.ts')
  const dslFetch = read('app/decoration-engine/composables/useDecorationPageDslFetch.ts')

  assert.match(routeCtx, /useDecorationRouteContext/)
  assert.match(routeCtx, /isDecorationPreviewRouteQuery/)
  assert.match(routeCtx, /isDecorationPreviewActiveOnRoute/)
  assert.match(routeCtx, /isEmbeddedDecorPreview/)
  assert.match(genericDslFetch, /useDecorationDslFetch/)
  assert.match(genericDslFetch, /pageType/)
  assert.match(genericDslFetch, /\/wxapp\/pctemplate\/getTemplateContent/)
  assert.doesNotMatch(genericDslFetch, /\/h5app\/wxapp\/pctemplate\/getTemplateContent/)
  assert.doesNotMatch(genericDslFetch, /\/api\/decoration\//)
  assert.match(dslFetch, /useDecorationPageDslFetch/)
  assert.match(dslFetch, /useDecorationDslFetch/)
})

test('decoration DSL async data is scoped by current API country code', () => {
  const source = read('app/decoration-engine/composables/useDecorationDslFetch.ts')

  assert.match(source, /getApiCountryCodeByLocale/)
  assert.match(source, /const \{ locale \} = useI18n\(\)/)
  assert.match(
    source,
    /const countryCode = computed\(\(\) => getApiCountryCodeByLocale\(locale\.value\)\)/
  )
  assert.match(
    source,
    /`decoration-dsl-\$\{countryCode\.value\}-\$\{pageType\.value\}-\$\{pageId\.value\}`/
  )
  assert.match(source, /country_code:\s*countryCode\.value/)
  assert.match(source, /watch:\s*\[pageType,\s*pageId,\s*shouldFetch,\s*countryCode\]/)
})

test('ProductTabShelf async data is scoped by current API country code', () => {
  const source = read('app/decoration-engine/components/sections/ProductTabShelf.vue')

  assert.match(source, /getApiCountryCodeByLocale/)
  assert.match(source, /const \{ locale,\s*t \} = useI18n\(\)/)
  assert.match(
    source,
    /const countryCode = computed\(\(\) => getApiCountryCodeByLocale\(locale\.value\)\)/
  )
  assert.match(source, /`product-tab-shelf-\$\{countryCode\.value\}-\$\{queryKey\.value\}`/)
  assert.match(source, /watch:\s*\[queryKey,\s*countryCode\]/)
})

test('ProductShelf async data is scoped by current API country code', () => {
  const source = read('app/decoration-engine/components/sections/ProductShelf.vue')

  assert.match(source, /getApiCountryCodeByLocale/)
  assert.match(source, /const \{ locale,\s*t \} = useI18n\(\)/)
  assert.match(
    source,
    /const countryCode = computed\(\(\) => getApiCountryCodeByLocale\(locale\.value\)\)/
  )
  assert.match(source, /`decoration-product-shelf-\$\{countryCode\.value\}-\$\{queryKey\.value\}`/)
  assert.match(source, /watch:\s*\[queryKey,\s*countryCode\]/)
})

test('nuxt config exposes decoration env and decoration preview route rules', () => {
  const source = read('nuxt.config.ts')

  assert.match(source, /decorationAdminOrigins/)
  assert.doesNotMatch(source, /VITE_DECORATION_ADMIN_ORIGINS/)
  assert.match(source, /routeRules/)
  assert.match(source, /designMode=1/)
})

test('preview postMessage target origin follows embedding admin referrer', () => {
  const source = read('app/decoration-engine/composables/useDecorationPreview.ts')

  assert.match(source, /new URL\(document\.referrer\)\.origin/)
  assert.match(source, /origins\.includes\(referrerOrigin\)/)
  assert.match(source, /if \(origins\.length === 1\)/)
  assert.doesNotMatch(source, /const fromList = allowedOrigins\.value\[0\]/)
})

test('web no longer ships local decoration proxy routes after direct H5 integration', () => {
  assert.ok(
    !existsSync(path.resolve(cwd, 'app/server/api/decoration/[pageType].get.ts')),
    'app/server/api/decoration/[pageType].get.ts should be removed after direct H5 integration'
  )
  assert.ok(
    !existsSync(path.resolve(cwd, 'app/server/api/decoration/global.get.ts')),
    'app/server/api/decoration/global.get.ts should be removed after direct H5 integration'
  )
})
