import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const apiClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/AftersalesApiClient.ts'),
  'utf8'
)
const typesSource = readFileSync(
  path.resolve(process.cwd(), 'app/types/api/aftersales.ts'),
  'utf8'
)

test('aftersales api client exposes detail endpoint contract', () => {
  assert.match(apiClientSource, /async getAftersalesDetail\(/)
  assert.match(apiClientSource, /\/wxapp\/aftersales\/info/)
  assert.match(apiClientSource, /aftersales_bn:\s*params\.aftersales_bn/)
  assert.match(apiClientSource, /item_id:\s*params\.item_id/)
})

test('aftersales shared types expose detail request and page model contracts', () => {
  assert.match(typesSource, /export interface IAftersalesDetailRequest/)
  assert.match(typesSource, /aftersales_bn:\s*string/)
  assert.match(typesSource, /item_id:\s*string/)
  assert.match(typesSource, /export interface IAftersalesDetailModel/)
  assert.match(typesSource, /progressSteps:\s*Array<\{/)
})
