import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const apiClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/CollectDistributionApiClient.ts'),
  'utf8'
)

test('follow store api client targets collect distribution endpoints', () => {
  assert.match(apiClientSource, /getCollectDistributionList/)
  assert.match(apiClientSource, /removeCollectDistributions/)
  assert.match(apiClientSource, /\/wxapp\/member\/collect\/distribution/)
  assert.match(apiClientSource, /method:\s*'GET'/)
  assert.match(apiClientSource, /method:\s*'DELETE'/)
})
