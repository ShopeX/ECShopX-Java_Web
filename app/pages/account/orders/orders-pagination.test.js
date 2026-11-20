import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const orderClientSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/http/clients/OrderApiClient.ts'),
  'utf8'
)
const ordersComposableSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useOrders.ts'),
  'utf8'
)
const orderTransformerSource = readFileSync(
  path.resolve(process.cwd(), 'app/infrastructure/transformers/orderTransformer.ts'),
  'utf8'
)
const orderListPageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/orders/index.vue'),
  'utf8'
)

test('order list pagination sends page query params with pageSize field', () => {
  assert.match(orderClientSource, /async getOrderList\(params\?: \{/)
  assert.match(orderClientSource, /query:\s*\{/)
  assert.doesNotMatch(orderClientSource, /params:\s*\{/)
  assert.match(orderClientSource, /page:\s*params\?\.page \|\| 1/)
  assert.match(orderClientSource, /pageSize:\s*params\?\.pageSize \|\| 10/)
  assert.match(ordersComposableSource, /pageSize:\s*pageSize\.value/)
  assert.doesNotMatch(ordersComposableSource, /page_size:\s*pageSize\.value/)
})

test('order list page renders pagination component instead of mobile load more button', () => {
  assert.match(orderListPageSource, /<ECPagination/)
  assert.doesNotMatch(
    orderListPageSource,
    /<div v-if="totalPages > 1 && !loading" class="hidden lg:flex justify-end mt-10">/
  )
  assert.doesNotMatch(orderListPageSource, /v-if="hasMore && !loading" class="lg:hidden/)
  assert.doesNotMatch(orderListPageSource, /@click="loadMore"/)
})

test('order list transformer reads pagination from pager payload', () => {
  assert.match(orderTransformerSource, /const pager = data\?\.pager \|\| response\?\.pager \|\| \{\}/)
  assert.match(
    orderTransformerSource,
    /total:\s*Number\(\(pager\?\.count \?\? data\?\.total_count \?\? data\?\.total\) \|\| 0\)/
  )
  assert.match(
    orderTransformerSource,
    /page:\s*Number\(\(pager\?\.page_no \?\? data\?\.page \?\? data\?\.current_page\) \|\| 1\)/
  )
  assert.match(
    orderTransformerSource,
    /pageSize:\s*Number\(\(pager\?\.page_size \?\? data\?\.pageSize \?\? data\?\.page_size\) \|\| 10\)/
  )
})
