import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = readFileSync(resolve(process.cwd(), 'app/components/ECToast/ECToast.vue'), 'utf8')

test('toast stays above drawer and bottom sheet overlays', () => {
  assert.match(source, /z-\[120\]/)
  assert.doesNotMatch(source, /z-50/)
})
