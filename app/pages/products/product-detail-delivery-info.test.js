import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()
const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('product detail page does not render delivery info accordions', () => {
  const source = read('app/pages/products/[id].vue')

  assert.doesNotMatch(source, /toggleAccordion\('info1'\)/)
  assert.doesNotMatch(source, /toggleAccordion\('info2'\)/)
  assert.doesNotMatch(source, /Additional Info Accordion 1/)
  assert.doesNotMatch(source, /Additional Info Accordion 2/)
  assert.doesNotMatch(source, /openAccordion === 'info1'/)
  assert.doesNotMatch(source, /openAccordion === 'info2'/)
})
