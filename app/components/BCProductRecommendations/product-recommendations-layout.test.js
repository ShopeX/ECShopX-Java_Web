import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const source = readFileSync(
  path.resolve(process.cwd(), 'app/components/BCProductRecommendations/BCProductRecommendations.vue'),
  'utf8'
)

const cardSource = readFileSync(
  path.resolve(
    process.cwd(),
    'app/components/BCProductRecommendations/BCProductRecommendationCard.vue'
  ),
  'utf8'
)

test('pc recommendations use carousel layout with five-column grid', () => {
  assert.match(source, /grid-cols-5/)
  assert.match(source, /i-heroicons-chevron-left/)
  assert.match(source, /i-heroicons-chevron-right/)
  assert.match(source, /currentBatch/)
})

test('mobile recommendations remain horizontal scroll cards', () => {
  assert.match(source, /lg:hidden.*overflow-x-auto.*scrollbar-hide/)
  assert.match(source, /w-\[165px\]/)
})

test('recommendation card matches figma price and add-to-cart styles', () => {
  assert.match(cardSource, /text-\[#8f99aa\] line-through/)
  assert.match(cardSource, /h-\[38px\] w-\[106px\]/)
  assert.match(cardSource, /border-\[#e5e5e5\]/)
  assert.match(cardSource, /c23b194b\.addToCart/)
})
