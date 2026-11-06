import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()
const middlewarePath = 'app/middleware/locale-preference.client.global.ts'
const absoluteMiddlewarePath = path.resolve(cwd, middlewarePath)

test('locale preference middleware is global client middleware', () => {
  assert.equal(path.basename(middlewarePath), 'locale-preference.client.global.ts')
  assert.match(path.basename(middlewarePath, '.ts'), /\.global$/)
  assert.equal(existsSync(absoluteMiddlewarePath), true)

  const source = readFileSync(absoluteMiddlewarePath, 'utf8')
  assert.match(source, /defineNuxtRouteMiddleware/)
  assert.match(source, /import\.meta\.client/)
})

test('locale preference middleware preserves query and hash while replacing route', () => {
  const source = readFileSync(absoluteMiddlewarePath, 'utf8')

  assert.match(source, /query:\s*to\.query/)
  assert.match(source, /hash:\s*to\.hash/)
  assert.match(source, /navigateTo\([\s\S]*\{\s*replace:\s*true\s*\}/)
})

test('locale preference middleware uses site language setting instead of writing path locale as preference', () => {
  const source = readFileSync(absoluteMiddlewarePath, 'utf8')

  assert.match(source, /fetchSiteLanguageSetting/)
  assert.match(source, /resolveActiveLocale/)
  assert.doesNotMatch(
    source,
    /if \(!preferredLocale\) \{[\s\S]*setPreferredLocale\(currentPathLocale\)/
  )
})
