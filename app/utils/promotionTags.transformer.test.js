import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const read = (relativePath) =>
  readFileSync(path.resolve(process.cwd(), relativePath), 'utf8')

test('ProductTransformer maps promotion_activity via mapPromotionTags', () => {
  const source = read('app/infrastructure/transformers/productTransformer.ts')
  assert.match(source, /import \{ mapPromotionTags \} from '~\/utils\/promotionTags'/)
  assert.match(source, /marketingTags:\s*mapPromotionTags\(apiProduct\)/)
})

test('CartTransformer maps cart promotions via mapPromotionTags', () => {
  const source = read('app/infrastructure/transformers/cartTransformer.ts')
  assert.match(source, /import \{ mapPromotionTags \} from '~\/utils\/promotionTags'/)
  assert.match(source, /marketingTags:\s*mapPromotionTags\(apiItem\)/)
})

test('OrderTransformer maps order and checkout marketingTags', () => {
  const source = read('app/infrastructure/transformers/orderTransformer.ts')
  assert.match(source, /marketingTags:\s*mapPromotionTags\(apiItem\)/)
  assert.match(source, /marketingTags\?: IMarketingTag\[\]/)
  assert.match(source, /items_promotion/)
  assert.match(source, /cusActivity/)
})

test('Collect and recommend transformers expose marketingTags', () => {
  const collect = read('app/infrastructure/transformers/collectItemTransformer.ts')
  const recommend = read('app/infrastructure/transformers/recommendLikeTransformer.ts')
  assert.match(collect, /marketingTags:\s*mapPromotionTags\(item\)/)
  assert.match(recommend, /marketingTags:\s*mapPromotionTags\(item\)/)
})

test('BCProductMarketingTags component supports solid/outline and empty tags', () => {
  const source = read('app/components/BCProductMarketingTags/BCProductMarketingTags.vue')
  assert.match(source, /placement\?: 'inline' \| 'overlay'/)
  assert.match(source, /bg-\[#191a1d\] text-white/)
  assert.match(source, /border border-\[#191a1d\]/)
  assert.match(source, /v-if="resolvedTags\.length > 0"/)
  assert.match(source, /absolute left-3 top-3 z-10/)
})
