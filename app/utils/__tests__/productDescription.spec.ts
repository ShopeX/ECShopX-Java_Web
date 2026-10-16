import { describe, test, expect } from 'vitest'
import { resolveItemDescription } from '../productDescription'

describe('resolveItemDescription', () => {
  const fallback = '暂无描述'

  test('testIntroPriority', () => {
    const data = { intro: '<p>图文</p>', brief: '简介' }
    expect(resolveItemDescription(data, fallback)).toBe('<p>图文</p>')
  })

  test('testFallbackToBrief', () => {
    const data = { intro: '', brief: '简介' }
    expect(resolveItemDescription(data, fallback)).toBe('简介')
    
    const data2 = { intro: null, brief: '简介' }
    expect(resolveItemDescription(data2, fallback)).toBe('简介')
  })

  test('testFallbackToPlaceholder', () => {
    const data = { intro: '', brief: '' }
    expect(resolveItemDescription(data, '暂无')).toBe('暂无')
  })

  test('testNullData', () => {
    expect(resolveItemDescription(null, '暂无')).toBe('暂无')
    expect(resolveItemDescription(undefined, '暂无')).toBe('暂无')
  })

  test('testWhitespaceIntro', () => {
    const data = { intro: '   ', brief: '简介' }
    expect(resolveItemDescription(data, fallback)).toBe('简介')
  })
})
