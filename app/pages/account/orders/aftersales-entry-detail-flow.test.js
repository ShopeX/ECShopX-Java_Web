import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/orders/[id].vue'),
  'utf8'
)

test('order detail reuses local detail data and loads only reason options before opening aftersales panel', () => {
  const openAftersalesBlock =
    source.match(/async function openAftersales\(\)[\s\S]*?\n}\n\nonMounted/)?.[0] ?? ''

  assert.match(source, /loadReasonOptions\(\)/)
  assert.match(source, /const items = \(order\.value\?\.items \?\? \[\]\)\.map/)
  assert.equal(openAftersalesBlock.includes('fetchOrderDetail(orderId)'), false)
})
