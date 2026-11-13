import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'vitest'

const source = readFileSync(path.resolve(process.cwd(), 'app/pages/ai-assistant.vue'), 'utf8')

test('ai assistant page renders iframe with shared embed context', () => {
  assert.match(source, /<iframe/)
  assert.match(source, /useUserStore\(\)/)
  assert.match(source, /getApiCountryCodeByLocale/)
  assert.match(source, /resolveCompanyId\(\)/)
  assert.match(source, /resolveDistributorIdFromRoute\(/)
  assert.match(source, /locale:\s*getApiCountryCodeByLocale\(locale\.value\)/)
  assert.match(source, /buildAiEmbedPageUrl\(/)
  assert.match(source, /resolveAiAssistantBackendUrl\(/)
  assert.match(source, /buildAiAssistantAuthPayload\(/)
  assert.match(source, /buildAiAssistantIframeSrc\(/)
})

test('ai assistant page handles widget messages and auth sync safely', () => {
  assert.match(source, /ai-assistant-widget-close/)
  assert.match(source, /AI_ASSISTANT_MINIPROGRAM_NAV/)
  assert.match(source, /addEventListener\('message'/)
  assert.match(source, /removeEventListener\('message'/)
  assert.match(source, /postAiAssistantAuthToEmbed\(/)
  assert.match(source, /new URL\(iframeSrc\.value, window\.location\.origin\)\.origin/)
  assert.doesNotMatch(source, /postAiAssistantAuthToEmbed\([^)]*,\s*['"]\*['"]/)
  assert.doesNotMatch(source, /postMessage\([^)]*,\s*['"]\*['"]/)
})
