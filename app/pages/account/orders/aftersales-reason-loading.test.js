import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const apiClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/AftersalesApiClient.ts'),
  'utf8'
)
const reasonComposablePath = path.resolve(
  process.cwd(),
  'app/composables/useAftersalesReasonOptions.ts'
)
const reasonComposableSource = existsSync(reasonComposablePath)
  ? readFileSync(reasonComposablePath, 'utf8')
  : ''

test('aftersales api client exposes reason list endpoint', () => {
  assert.match(apiClientSource, /async getAftersalesReasonList\(/)
  assert.match(apiClientSource, /\/aftersales\/reason\/list/)
})

test('shared aftersales reason composable caches normalized options', () => {
  assert.match(reasonComposableSource, /useState(?:<[^>]+>)?\('aftersales-reason-options'/)
  assert.match(reasonComposableSource, /function normalizeReasonOption/)
  assert.match(reasonComposableSource, /async function loadReasonOptions\(/)
})
