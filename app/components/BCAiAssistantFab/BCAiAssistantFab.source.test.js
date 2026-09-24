import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from 'vitest'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCAiAssistantFab/BCAiAssistantFab.vue'),
  'utf8'
)

test('AI assistant FAB follows enabled, client-only, and drawer-open contracts', () => {
  expect(source).toMatch(/defineOptions\(\{\s*name:\s*'BCAiAssistantFab'/)
  expect(source).toMatch(/defineEmits<\{\s*open:\s*\[\]\s*\}>/)
  expect(source).toMatch(/isAiAssistantEnabled/)
  expect(source).toMatch(/resolveAiAssistantBackendUrl/)
  expect(source).toMatch(/resolveAiAssistantFabDisplay/)
  expect(source).toMatch(/fabText\.value = display\.text/)
  expect(source).toMatch(/data-testid="ai-assistant-fab"/)
  expect(source).toMatch(/<ClientOnly>/)
  expect(source).toMatch(/mounted\.value/)
  expect(source).toMatch(/if \(!enabled\.value \|\| !backend\.value\) return/)
  expect(source).toMatch(/if \(enabled\.value\) \{\s*void loadFabConfig\(\)/)
  expect(source).toMatch(/emit\('open'\)/)
  expect(source).not.toMatch(/router\.push\(localePath\('\/ai-assistant'\)\)/)
  expect(source).not.toMatch(/openAiAssistantInNewWindow/)
  expect(source).not.toMatch(/window\.location\.href\s*=\s*assistantUrl\.value/)
  expect(source).toMatch(/catch/)
})
