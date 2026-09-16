import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const drawerSource = readFileSync(
  path.resolve(process.cwd(), 'app/components/ECDrawer/ECDrawer.vue'),
  'utf8'
)
const bottomSheetSource = readFileSync(
  path.resolve(process.cwd(), 'app/components/ECBottomSheet/ECBottomSheet.vue'),
  'utf8'
)
const aftersalesPanelSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AftersalesPanel.vue'),
  'utf8'
)
const aftersalesContentSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AftersalesFormContent.vue'),
  'utf8'
)
const orderListSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/orders/index.vue'),
  'utf8'
)
const orderDetailSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/orders/[id].vue'),
  'utf8'
)

test('base drawer components provide overlay shells for desktop and mobile', () => {
  assert.match(drawerSource, /<Teleport to="body">/)
  assert.match(drawerSource, /data-testid="ec-drawer-overlay"/)
  assert.match(drawerSource, /emit\('update:modelValue', false\)/)
  assert.match(bottomSheetSource, /<Teleport to="body">/)
  assert.match(bottomSheetSource, /data-testid="ec-bottom-sheet-overlay"/)
  assert.match(bottomSheetSource, /emit\('update:modelValue', false\)/)
})

test('aftersales panel composes responsive shell and shared content component', () => {
  assert.match(
    aftersalesPanelSource,
    /import ECDrawer from '~\/components\/ECDrawer\/ECDrawer\.vue'/
  )
  assert.match(
    aftersalesPanelSource,
    /import ECBottomSheet from '~\/components\/ECBottomSheet\/ECBottomSheet\.vue'/
  )
  assert.match(
    aftersalesPanelSource,
    /import AftersalesFormContent(?:,\s*\{\s*type AftersalesPanelItem\s*\})? from '\.\/AftersalesFormContent\.vue'/
  )
  assert.match(aftersalesPanelSource, /<ECDrawer/)
  assert.match(aftersalesPanelSource, /<ECBottomSheet/)
  assert.match(aftersalesPanelSource, /<AftersalesFormContent/)
  assert.match(aftersalesPanelSource, /reasonOptions: AftersalesReasonOption\[\]/)
  assert.match(aftersalesPanelSource, /:reason-options="props\.reasonOptions"/)
  assert.doesNotMatch(aftersalesPanelSource, /const reasonOptions = computed/)
})

test('aftersales content exposes figma-aligned form sections', () => {
  assert.match(aftersalesContentSource, /data-testid="aftersales-item-list"/)
  assert.match(aftersalesContentSource, /data-testid="aftersales-refund-reason"/)
  assert.match(aftersalesContentSource, /data-testid="aftersales-refund-amount"/)
  assert.match(aftersalesContentSource, /data-testid="aftersales-refund-points"/)
  assert.match(aftersalesContentSource, /data-testid="aftersales-description"/)
  assert.match(aftersalesContentSource, /data-testid="aftersales-image-upload"/)
})

test('order pages use aftersales panel instead of legacy modal wrapper', () => {
  assert.match(
    orderListSource,
    /import AftersalesPanel from '\.\.\/components\/AftersalesPanel\.vue'/
  )
  assert.match(orderListSource, /<AftersalesPanel/)
  assert.doesNotMatch(orderListSource, /import AftersalesModal/)
  assert.match(
    orderDetailSource,
    /import AftersalesPanel from '\.\.\/components\/AftersalesPanel\.vue'/
  )
  assert.match(orderDetailSource, /<AftersalesPanel/)
  assert.doesNotMatch(orderDetailSource, /import AftersalesModal/)
})
