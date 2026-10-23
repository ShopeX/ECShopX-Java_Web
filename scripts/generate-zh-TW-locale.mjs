#!/usr/bin/env node
/**
 * Generate app/locales/zh-TW.json from zh-CN.json via OpenCC (Simplified → Traditional).
 * Only message values are converted; i18n keys stay unchanged.
 *
 * Usage: node scripts/generate-zh-TW-locale.mjs
 * Or:    pnpm run i18n:zh-tw
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as OpenCC from 'opencc-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const sourcePath = path.join(repoRoot, 'app/locales/zh-CN.json')
const targetPath = path.join(repoRoot, 'app/locales/zh-TW.json')

const converter = OpenCC.Converter({ from: 'cn', to: 'tw' })

function convertValue(value) {
  if (typeof value === 'string') {
    return converter(value)
  }
  if (Array.isArray(value)) {
    return value.map(convertValue)
  }
  if (value && typeof value === 'object') {
    const result = {}
    for (const [key, nested] of Object.entries(value)) {
      result[key] = convertValue(nested)
    }
    return result
  }
  return value
}

const source = JSON.parse(readFileSync(sourcePath, 'utf8'))
const traditional = convertValue(source)
writeFileSync(targetPath, `${JSON.stringify(traditional, null, 2)}\n`, 'utf8')

const keyCount = Object.keys(traditional).length
console.log(`Generated ${targetPath} (${keyCount} keys) from ${sourcePath}`)
