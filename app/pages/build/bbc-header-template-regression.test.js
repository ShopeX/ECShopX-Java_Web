import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repoRoot = process.cwd()
const bbcHeaderTemplatePath = path.resolve(
  repoRoot,
  'app/templateEngines/templates/bbc/header.ts'
)

test('bbc mode ships a local default header template for fallback rendering', () => {
  assert.equal(existsSync(bbcHeaderTemplatePath), true)

  const source = readFileSync(bbcHeaderTemplatePath, 'utf8')

  assert.match(source, /sections:\s*\{/)
  assert.match(source, /header:\s*\{/)
  assert.match(source, /type:\s*'header'/)
  assert.match(source, /order:\s*\[\s*'header'\s*\]/)
})
