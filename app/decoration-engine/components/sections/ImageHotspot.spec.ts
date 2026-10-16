import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const filePath = path.resolve(process.cwd(), 'app/decoration-engine/components/sections/ImageHotspot.vue')
const source = fs.readFileSync(filePath, 'utf8')

describe('ImageHotspot', () => {
  it('uses pc/mobile hotspot aliases and legacy hotspot fallback', () => {
    expect(source).toContain("pc_image")
    expect(source).toContain("mobile_image")
    expect(source).toContain("pc_hotspots")
    expect(source).toContain("mobile_hotspots")
    expect(source).toContain("legacyHotspots")
  })

  it('keeps hotspot visual layer transparent in preview mode', () => {
    expect(source).toContain("props.isPreview")
    expect(source).toContain('class="block h-full w-full"')
    expect(source).not.toContain("border border-white/80")
    expect(source).not.toContain("bg-black/10")
    expect(source).not.toContain("shadow-sm")
  })

  it('resolves both external and internal hotspot links', () => {
    expect(source).toContain('linkType')
    expect(source).toContain('linkUrl')
    expect(source).toContain('linkPage')
    expect(source).toContain('resolveDecorationLink')
    expect(source).toContain('decorationLink.resolveHref')
  })

  it('renders poster self-adaptively without JS aspect-ratio', () => {
    expect(source).toContain('class="block w-full h-auto"')
    expect(source).not.toContain('aspectRatioStyle')
    expect(source).not.toContain('handleImageLoad')
    expect(source).not.toContain('loadedImageDimensions')
    expect(source).not.toContain('naturalWidth')
    expect(source).not.toContain('object-contain')
    expect(source).not.toContain("object-cover")
  })

  it('keeps the no-image placeholder in normal flow with a minimum height', () => {
    expect(source).toContain(
      'class="flex min-h-[200px] items-center justify-center bg-neutral-100 text-sm text-neutral-400"'
    )
    expect(source).not.toContain('absolute inset-0 flex min-h-[200px]')
  })

  it('does not wrap hotspots as standalone selectable blocks', () => {
    expect(source).toContain('v-for="hotspot in activeHotspots"')
    expect(source).toContain('class="group absolute z-[1] flex items-center justify-center"')
    expect(source).toContain(':style="hotspot.style"')
    expect(source).not.toContain(':block-id="hotspot.id"')
    expect(source).not.toContain('focusBlock')
  })
})
