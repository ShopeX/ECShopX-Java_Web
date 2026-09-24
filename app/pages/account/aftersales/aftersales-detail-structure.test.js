import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pagePath = path.resolve(process.cwd(), 'app/pages/account/aftersales/[id].vue')
const progressPath = path.resolve(
  process.cwd(),
  'app/pages/account/components/AftersalesDetailProgress.vue'
)
const itemsPath = path.resolve(
  process.cwd(),
  'app/pages/account/components/AftersalesDetailItems.vue'
)
const infoPath = path.resolve(
  process.cwd(),
  'app/pages/account/components/AftersalesDetailInfoSection.vue'
)
const summaryPath = path.resolve(
  process.cwd(),
  'app/pages/account/components/AftersalesDetailSummary.vue'
)

const pageSource = existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : ''
const progressSource = existsSync(progressPath) ? readFileSync(progressPath, 'utf8') : ''
const itemsSource = existsSync(itemsPath) ? readFileSync(itemsPath, 'utf8') : ''
const infoSource = existsSync(infoPath) ? readFileSync(infoPath, 'utf8') : ''
const summarySource = existsSync(summaryPath) ? readFileSync(summaryPath, 'utf8') : ''

test('aftersales detail page composes dedicated data flow and sections', () => {
  assert.ok(existsSync(pagePath))
  assert.match(pageSource, /useAftersalesDetail/)
  assert.match(pageSource, /onMounted\(\(\) => \{\s*fetchAftersalesDetail\(\)/)
  assert.match(pageSource, /<AftersalesDetailProgress/)
  assert.match(pageSource, /<AftersalesDetailItems/)
  assert.match(pageSource, /<AftersalesDetailInfoSection/)
  assert.match(pageSource, /<AftersalesDetailSummary/)
  assert.match(pageSource, /navigateTo\(localePath\('\/account\/aftersales'\)\)/)
  assert.match(pageSource, /联系客户|处理售后/)
})

test('aftersales detail progress component renders figma-style step rail', () => {
  assert.ok(existsSync(progressPath))
  assert.match(progressSource, /progressSteps/)
  assert.match(progressSource, /提交申请/)
  assert.match(progressSource, /等待审核/)
  assert.match(progressSource, /等待寄回/)
})

test('aftersales detail item and info components render dedicated sections', () => {
  assert.ok(existsSync(itemsPath))
  assert.ok(existsSync(infoPath))
  assert.ok(existsSync(summaryPath))
  assert.match(itemsSource, /storeName/)
  assert.match(itemsSource, /refundAmount|summaryLabel/)
  assert.match(infoSource, /title/)
  assert.match(infoSource, /rows/)
  assert.match(summarySource, /itemCount/)
  assert.match(summarySource, /paidAmount|summaryAmount/)
})
