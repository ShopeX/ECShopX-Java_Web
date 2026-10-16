import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

const httpPluginSource = readFileSync(path.resolve(process.cwd(), 'app/plugins/http.ts'), 'utf8')
const distributorClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/DistributorApiClient.ts'),
  'utf8'
)
const resolveDistributorSource = readFileSync(
  path.resolve(process.cwd(), 'app/utils/resolveDistributorId.ts'),
  'utf8'
)
const distributorInitSource = readFileSync(
  path.resolve(process.cwd(), 'app/plugins/distributor-init.ts'),
  'utf8'
)
const cartClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/CartApiClient.ts'),
  'utf8'
)
const decorationDslFetchSource = readFileSync(
  path.resolve(
    process.cwd(),
    'app/decoration-engine/composables/useDecorationDslFetch.ts'
  ),
  'utf8'
)

test('http plugin injects distributor_id only in B2C and never auto-sends 0', () => {
  assert.match(httpPluginSource, /resolveDistributorId/)
  assert.match(httpPluginSource, /skipDistributorId/)
  assert.match(httpPluginSource, /applyDistributorId/)
  assert.match(httpPluginSource, /isB2cMode/)
  assert.match(httpPluginSource, /distributorId === '0'/)
  assert.match(httpPluginSource, /applyDistributorId\(bodyData/)
  assert.match(httpPluginSource, /applyDistributorId\(query/)
})

test('resolveDistributorId falls back to default store only in B2C', () => {
  assert.match(resolveDistributorSource, /useDistributorStore\(\)\.distributorId/)
  assert.match(resolveDistributorSource, /isB2cMode/)
  assert.match(resolveDistributorSource, /BBC/)
})

test('distributor-init only bootstraps default store in B2C', () => {
  assert.match(distributorInitSource, /getBusinessMode\(\) !== 'b2c'/)
  assert.match(distributorInitSource, /fetchDefaultDistributor\(true\)/)
  assert.match(distributorInitSource, /hydrateFromCache/)
})

test('default distributor bootstrap skips auto distributor_id injection', () => {
  assert.match(distributorClientSource, /skipDistributorId:\s*true/)
})

test('cart list skips auto distributor_id injection', () => {
  assert.match(
    cartClientSource,
    /\/wxapp\/cart\/list[\s\S]*?skipDistributorId:\s*true/
  )
})

test('decoration template content skips auto distributor_id injection', () => {
  assert.match(
    decorationDslFetchSource,
    /\/wxapp\/pctemplate\/getTemplateContent[\s\S]*?skipDistributorId:\s*true/
  )
})
