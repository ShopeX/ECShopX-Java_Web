import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'vitest'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCAiAssistantDrawer/BCAiAssistantDrawer.vue'),
  'utf8'
)

test('AI assistant drawer renders the embed iframe with shared auth context', () => {
  assert.match(source, /defineOptions\(\{\s*name:\s*'BCAiAssistantDrawer'/)
  assert.match(source, /defineModel<boolean>/)
  assert.match(source, /useI18n\(\)/)
  assert.match(source, /getApiCountryCodeByLocale/)
  assert.match(source, /assistantTitle = computed\(\(\) => t\('b4039f35\.354274'\)\)/)
  assert.match(source, /:aria-label="t\('b4039f35\.38d7ea'\)"/)
  assert.match(source, /<iframe/)
  assert.match(source, /:title="assistantTitle"/)
  assert.match(source, /class="min-h-0 flex-1 w-full border-0"/)
  assert.match(source, /useUserStore\(\)/)
  assert.match(source, /resolveCompanyId\(\)/)
  assert.match(source, /resolveDistributorIdFromRoute\(/)
  assert.match(source, /locale:\s*getApiCountryCodeByLocale\(locale\.value\)/)
  assert.match(source, /buildAiEmbedPageUrl\(/)
  assert.match(source, /resolveAiAssistantBackendUrl\(/)
  assert.match(source, /buildAiAssistantAuthPayload\(/)
  assert.match(source, /buildAiAssistantIframeSrc\(/)
})

test('AI assistant drawer handles mobile-safe closing and internal navigation', () => {
  assert.match(source, /ai-assistant-widget-close/)
  assert.match(source, /model\.value = false/)
  assert.match(source, /AI_ASSISTANT_MINIPROGRAM_NAV/)
  assert.match(source, /addEventListener\('message'/)
  assert.match(source, /removeEventListener\('message'/)
  assert.match(source, /postAiAssistantAuthToEmbed\(/)
  assert.match(source, /new URL\(iframeSrc\.value, window\.location\.origin\)\.origin/)
  assert.doesNotMatch(source, /postAiAssistantAuthToEmbed\([^)]*,\s*['"]\*['"]/)
  assert.doesNotMatch(source, /postMessage\([^)]*,\s*['"]\*['"]/)
})
