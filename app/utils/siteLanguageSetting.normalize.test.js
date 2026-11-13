import assert from 'node:assert/strict'
import test from 'node:test'

// 轻量镜像 normalize 规则，避免拉起 Nuxt 运行时
const API_CODE_TO_LOCALE = {
  'zh-CN': 'zh',
  'en-CN': 'en',
  'en-US': 'en',
  'ar-SA': 'ar',
  'zh-TW': 'zhtw',
  'ja-JP': 'ja',
  'ru-RU': 'ru',
}

function normalize(raw) {
  const payload = raw || {}
  const enabledRaw = payload.enabledLanguages || []
  const enabled = enabledRaw
    .map((item, index) => {
      const locale = API_CODE_TO_LOCALE[item.code]
      if (!locale) return null
      return { locale, name: item.name || locale, sort: item.sort || index + 1 }
    })
    .filter(Boolean)
  const fallback =
    enabled.length > 0 ? enabled : [{ locale: 'zh', name: '简体中文', sort: 1 }]
  const defaultLanguage = API_CODE_TO_LOCALE[payload.defaultLanguage] || fallback[0].locale
  const defaultInEnabled = fallback.some((el) => el.locale === defaultLanguage)
    ? defaultLanguage
    : fallback[0].locale
  return { defaultLanguage: defaultInEnabled, enabledLanguages: fallback }
}

test('normalize keeps only enabled languages and maps API codes', () => {
  const result = normalize({
    defaultLanguage: 'en-CN',
    enabledLanguages: [
      { code: 'zh-CN', name: '中文', sort: 1 },
      { code: 'en-CN', name: 'English', sort: 2 },
    ],
  })
  assert.equal(result.defaultLanguage, 'en')
  assert.deepEqual(
    result.enabledLanguages.map((i) => i.locale),
    ['zh', 'en']
  )
})

test('normalize falls back to zh when empty', () => {
  const result = normalize(null)
  assert.equal(result.defaultLanguage, 'zh')
  assert.equal(result.enabledLanguages.length, 1)
  assert.equal(result.enabledLanguages[0].locale, 'zh')
})

test('normalize maps ja-JP and ru-RU api codes', () => {
  const result = normalize({
    defaultLanguage: 'ja-JP',
    enabledLanguages: [
      { code: 'zh-CN', name: '中文', sort: 1 },
      { code: 'ja-JP', name: '日本語', sort: 2 },
      { code: 'ru-RU', name: 'Русский', sort: 3 },
    ],
  })
  assert.equal(result.defaultLanguage, 'ja')
  assert.deepEqual(
    result.enabledLanguages.map((i) => i.locale),
    ['zh', 'ja', 'ru']
  )
})
