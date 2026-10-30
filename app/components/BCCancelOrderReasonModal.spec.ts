import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'vitest'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCCancelOrderReasonModal.vue'),
  'utf8'
)

describe('BCCancelOrderReasonModal responsive design contract', () => {
  it('matches the Figma H5 modal shell and typography', () => {
    assert.match(source, /h-\[calc\(100dvh-120px\)\]/)
    assert.match(source, /max-w-\[375px\]/)
    assert.match(source, /rounded-none/)
    assert.match(source, /bg-\[#282828\]/)
    assert.match(source, /px-\[16px\]/)
    assert.match(source, /py-\[32px\]/)
    assert.match(source, /gap-\[32px\]/)
    assert.match(source, /text-\[20px\]/)
    assert.match(source, /leading-\[20px\]/)
    assert.match(source, /text-\[14px\]/)
    assert.match(source, /lg:items-center/)
    assert.match(source, /lg:w-\[600px\]/)
    assert.match(source, /lg:max-w-\[600px\]/)
    assert.match(source, /lg:gap-\[32px\]/)
    assert.match(source, /lg:p-\[32px\]/)
    assert.match(source, /lg:bg-\[rgba\(0,0,0,0\.6\)\]/)
  })

  it('keeps cancel reasons, textarea, radio and footer actions at Figma sizes', () => {
    assert.match(source, /min-h-\[52px\]/)
    assert.match(source, /size-\[16px\]/)
    assert.match(source, /h-\[52px\]/)
    assert.match(source, /h-\[80px\]/)
    assert.match(source, /bg-\[#f3f4f7\]/)
    assert.match(source, /border-\[#e5e7eb\]/)
  })
})
