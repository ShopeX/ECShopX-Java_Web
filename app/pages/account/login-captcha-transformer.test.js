import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const transformerSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/transformers/authTransformer.ts'),
  'utf8'
)

test('captcha transformer supports already-unwrapped http responses', () => {
  assert.match(transformerSource, /'data'\s+in\s+apiResponse/)
  assert.match(transformerSource, /apiResponse\.data\s*:\s*apiResponse/)
  assert.match(transformerSource, /imageData:\s*data\.imageData/)
  assert.match(transformerSource, /imageToken:\s*data\.imageToken/)
})
