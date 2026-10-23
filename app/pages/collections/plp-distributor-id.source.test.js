import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/pages/collections/[id].vue'),
  'utf8'
)

test('PLP list request includes resolved distributor_id only in B2C', () => {
  assert.match(source, /import \{ resolveDistributorId \} from ['"]~\/utils\/resolveDistributorId['"]/)
  assert.match(source, /getBusinessMode\(\) === 'b2c'/)
  assert.match(source, /distributor_id:\s*resolveDistributorId\(/)
  assert.match(source, /fetchDefaultDistributor/)
})
