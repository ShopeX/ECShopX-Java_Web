import { describe, expect, it } from 'vitest'
import { containsEmoji } from './textValidation'

describe('containsEmoji', () => {
  it('returns false for empty values', () => {
    expect(containsEmoji('')).toBe(false)
    expect(containsEmoji(undefined)).toBe(false)
    expect(containsEmoji(null)).toBe(false)
  })

  it('returns false for plain addresses', () => {
    expect(containsEmoji('北京市朝阳区建国路 88 号 3 单元 501')).toBe(false)
    expect(containsEmoji('B-12号 #3 单元（东门）')).toBe(false)
    expect(containsEmoji('Flat 5, 12 Baker Street, London NW1 6XE')).toBe(false)
    expect(containsEmoji('شارع الملك فهد، الرياض')).toBe(false)
  })

  it('detects common emoji', () => {
    expect(containsEmoji('建国路88号😀')).toBe(true)
    expect(containsEmoji('😀')).toBe(true)
    expect(containsEmoji('❤️')).toBe(true)
  })

  it('detects emoji sequences and modifiers', () => {
    expect(containsEmoji('👨‍👩‍👧 一家')).toBe(true)
    expect(containsEmoji('👍🏽')).toBe(true)
    expect(containsEmoji('🇨🇳')).toBe(true)
    expect(containsEmoji('1️⃣')).toBe(true)
  })

  it('detects standalone skin tone modifiers', () => {
    expect(containsEmoji('\u{1F3FB}')).toBe(true)
  })
})
