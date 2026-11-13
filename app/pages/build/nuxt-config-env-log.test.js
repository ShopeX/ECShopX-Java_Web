import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const nuxtConfigSource = readFileSync(path.resolve(process.cwd(), 'nuxt.config.ts'), 'utf8')

test('nuxt config prints selected public env vars for build diagnostics', () => {
  assert.match(nuxtConfigSource, /Object\.entries\(process\.env\)/)
  assert.match(nuxtConfigSource, /\.filter\(\(\[key\]\) => key\.startsWith\('NUXT_'\)\)/)
  assert.match(nuxtConfigSource, /Object\.fromEntries\(/)
  assert.match(nuxtConfigSource, /\[Nuxt Config\] Build env:/)
  assert.match(nuxtConfigSource, /console\.log\(/)
})
