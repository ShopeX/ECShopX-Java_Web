import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from 'vitest'

const source = readFileSync(path.resolve(process.cwd(), 'app/layouts/default.vue'), 'utf8')

test('default layout mounts AI assistant FAB only for normal storefront browsing', () => {
  expect(source).toMatch(/<BCAiAssistantFab v-if="shouldRenderAiAssistantFab" @open="handleOpenAiAssistant"/)
  expect(source).toMatch(/<BCAiAssistantDrawer/)
  expect(source).toMatch(/v-model="showAiAssistantDrawer"/)
  expect(source).toMatch(/:title="aiAssistantTitle"/)
  expect(source).toMatch(/:description="aiAssistantDescription"/)
  expect(source).toMatch(/aiAssistantTitle = computed\(\(\) => t\('b4039f35\.354274'\)\)/)
  expect(source).toMatch(/aiAssistantDescription = computed\(\(\) => t\('b4039f35\.4aaf06'\)\)/)
  expect(source).toMatch(/side="right"/)
  expect(source).toMatch(/!w-screen md:!w-\[560px\]/)
  expect(source).toMatch(/shouldRenderAiAssistantFab/)
  expect(source).toMatch(/isAiAssistantFeatureEnabled/)
  expect(source).toMatch(/isAiAssistantEnabled/)
  expect(source).toMatch(/v-if="isAiAssistantFeatureEnabled"/)
  expect(source).toMatch(/showAiAssistantDrawer = ref\(false\)/)
  expect(source).toMatch(/handleOpenAiAssistant/)
  expect(source).toMatch(/!isDecorationPreview\.value/)
  expect(source).toMatch(/!isDecorationRouteDesignMode\.value/)
  expect(source).toMatch(/route\.query\.designMode/)
  expect(source).toMatch(/includes\('\/ai-assistant'\)/)
})
