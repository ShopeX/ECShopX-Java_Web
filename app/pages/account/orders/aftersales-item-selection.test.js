import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const panelSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AftersalesPanel.vue'),
  'utf8'
)
const formSource = readFileSync(
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

test('aftersales panel uses remaining aftersales count for selection and quantity cap', () => {
  assert.match(
    panelSource,
    /props\.items\.find\(\(item\) => item\.itemId === selectedItemId\.value && item\.leftAftersalesNum > 0\)/
  )
  assert.match(panelSource, /props\.items\.find\(\(item\) => item\.leftAftersalesNum > 0\)/)
  assert.match(
    panelSource,
    /const maxQuantity = Math\.min\(Math\.max\(item\.leftAftersalesNum, 0\), item\.quantity\)/
  )
  assert.match(formSource, /:disabled="!isItemSelectable\(item\)"/)
  assert.match(formSource, /quantityFor\(item\.itemId\) >= maxQuantityFor\(item\)/)
})

test('order pages forward left_aftersales_num into shared aftersales items', () => {
  assert.match(orderListSource, /leftAftersalesNum: item\.leftAftersalesNum/)
  assert.match(orderDetailSource, /leftAftersalesNum: item\.leftAftersalesNum/)
})
