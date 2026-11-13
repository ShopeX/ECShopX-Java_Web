import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(path.resolve(process.cwd(), 'app/composables/useWebMenu.ts'), 'utf8')

describe('resolveWebMenuItemLink title', () => {
  it('appends series name as title for category links', () => {
    expect(source).toContain("appendQueryParam(withType, 'title', itemName)")
    expect(source).toContain("appendQueryParam(basePath, 'link_type', item.link_type)")
  })

  it('appends title for collections url fallback links', () => {
    expect(source).toContain("link.includes('/collections')")
    expect(source).toContain("appendQueryParam(link, 'title', itemName)")
  })
})
