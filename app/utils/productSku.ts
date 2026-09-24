export interface ProductSpecValue {
  spec_value_id: number
  spec_value_name: string
  spec_custom_value_name?: string
  spec_image_url?: string
}

export interface ProductSpec {
  spec_name: string
  spec_values: ProductSpecValue[]
}

export interface ProductSpecItem {
  custom_spec_id?: string
  item_id?: string | number
  store?: number
  start_num?: number
  price?: number
  market_price?: number
  member_price?: number
}

/** 商品 SKU 抽屉 / 加购流程使用的详情数据结构 */
export interface ProductSkuData {
  item_id?: string | number
  itemId?: string | number
  item_name?: string
  itemName?: string
  item_spec_desc?: unknown
  nospec?: number | boolean
  spec_items?: ProductSpecItem[]
  store?: number
  start_num?: number
  price?: number
  market_price?: number
  member_price?: number
  distributor_id?: string | number
  distributorId?: string | number
  [key: string]: unknown
}

function isValidProductSpec(spec: unknown): spec is ProductSpec {
  if (!spec || typeof spec !== 'object') return false

  const candidate = spec as Record<string, unknown>
  return typeof candidate.spec_name === 'string' && Array.isArray(candidate.spec_values)
}

export function parseProductSpecs(itemSpecDesc: unknown): ProductSpec[] {
  if (!itemSpecDesc) return []

  try {
    const specDesc =
      typeof itemSpecDesc === 'string' ? JSON.parse(itemSpecDesc) : itemSpecDesc

    if (!specDesc || typeof specDesc !== 'object') return []

    const specList = Array.isArray(specDesc) ? specDesc : Object.values(specDesc)

    return specList.filter(isValidProductSpec)
  } catch {
    return []
  }
}

function normalizeSpecValueIds(ids: Array<string | number>): string {
  return ids.map(String).sort().join(',')
}

/** 按 custom_spec_id 匹配 SKU；规格值顺序与 item_spec_desc 不一致时也能命中 */
export function findMatchedSpecItem(specItems: any[], specIdString: string): any | undefined {
  if (!specItems?.length || specIdString === 'default') return undefined

  const exactMatch = specItems.find((item) => item.custom_spec_id === specIdString)
  if (exactMatch) return exactMatch

  const selectedIds = specIdString.split('-').filter(Boolean)
  if (!selectedIds.length) return undefined

  const selectedKey = normalizeSpecValueIds(selectedIds)

  return specItems.find((item) => {
    const customIds = String(item.custom_spec_id ?? '')
      .split('-')
      .filter(Boolean)

    if (customIds.length !== selectedIds.length) return false

    return normalizeSpecValueIds(customIds) === selectedKey
  })
}

export function getInitialSelectedSpecs(specs: ProductSpec[]): Record<string, number> {
  const initialSpecs: Record<string, number> = {}

  specs.forEach((spec) => {
    const firstValue = spec.spec_values?.[0]
    if (firstValue?.spec_value_id) {
      initialSpecs[spec.spec_name] = firstValue.spec_value_id
    }
  })

  return initialSpecs
}

export function buildSpecIdString(
  specs: ProductSpec[],
  selectedSpecs: Record<string, number>
): string {
  if (!specs.length) return 'default'

  const specValueIds = specs
    .map((spec) => selectedSpecs[spec.spec_name])
    .filter((value) => value !== undefined)

  return specValueIds.length > 0 ? specValueIds.join('-') : 'default'
}

export function isMultiSpecProduct(data: ProductSkuData | null | undefined): boolean {
  if (!data) return false
  if (Number(data.nospec) === 1) return false
  if (Array.isArray(data.spec_items) && data.spec_items.length > 0) return true
  return parseProductSpecs(data.item_spec_desc).length > 0
}

/** 商品仅有一个可售 SKU（多维度各一选项时仍视为单 SKU） */
export function isSingleSkuProduct(data: ProductSkuData | null | undefined): boolean {
  if (!data || Number(data.nospec) === 1) return false

  if (Array.isArray(data.spec_items) && data.spec_items.length === 1) {
    return true
  }

  const specs = parseProductSpecs(data.item_spec_desc)
  return specs.length > 0 && specs.every((spec) => spec.spec_values?.length === 1)
}

export function resolveSkuItemId(
  data: ProductSkuData | null | undefined,
  specIdString: string
): string {
  if (!data) return ''

  if (Number(data.nospec) === 1 || !data.spec_items?.length) {
    return String(data.item_id ?? data.itemId ?? '')
  }

  const matchedSpecItem = findMatchedSpecItem(data.spec_items, specIdString)

  if (!matchedSpecItem) {
    return ''
  }

  return String(matchedSpecItem.item_id ?? '')
}

function resolveSpecItemStore(item: ProductSpecItem | null | undefined): number {
  if (!item) return 0

  const record = item as Record<string, unknown>
  const store = item.store ?? record.stock ?? record.goods_store

  return Number(store) || 0
}

function specItemContainsValue(item: ProductSpecItem, specValueId: number): boolean {
  const customIds = String(item.custom_spec_id ?? '')
    .split('-')
    .filter(Boolean)

  return customIds.includes(String(specValueId))
}

/**
 * 判断规格值在当前选中组合下是否可售。
 * 会结合其它维度已选规格，仅当存在包含「候选值 + 已选值」且 store > 0 的 SKU 时视为有货。
 */
export function isSpecValueInStock(
  data: ProductSkuData | null | undefined,
  specs: ProductSpec[],
  selectedSpecs: Record<string, number>,
  specName: string,
  specValueId: number
): boolean {
  if (!data) return false

  if (Number(data.nospec) === 1) {
    return resolveSpecItemStore({ store: data.store }) > 0
  }

  const specItems = data.spec_items
  if (!specItems?.length) {
    return resolveSpecItemStore({ store: data.store }) > 0
  }

  const requiredValueIds = [specValueId]

  specs.forEach((spec) => {
    if (spec.spec_name === specName) return

    const selectedId = selectedSpecs[spec.spec_name]
    if (selectedId !== undefined) {
      requiredValueIds.push(selectedId)
    }
  })

  return specItems.some((item) => {
    if (resolveSpecItemStore(item) <= 0) return false

    return requiredValueIds.every((valueId) => specItemContainsValue(item, valueId))
  })
}

export function resolveProductStock(
  data: ProductSkuData | null | undefined,
  specIdString: string
): number {
  if (!data) return 0

  if (Number(data.nospec) === 1 || !data.spec_items?.length) {
    return Number(data.store) || 0
  }

  const matchedSpecItem = findMatchedSpecItem(data.spec_items, specIdString)

  if (matchedSpecItem) {
    return resolveSpecItemStore(matchedSpecItem)
  }

  return resolveSpecItemStore({ store: data.store })
}

export function resolveProductStartNum(data: ProductSkuData | null | undefined): number {
  return Number(data?.start_num) || 0
}

export function resolveQuantityMin(
  data: ProductSkuData | null | undefined,
  specIdString: string
): number {
  const productStartNum = resolveProductStartNum(data)
  if (productStartNum <= 0) return 1

  const specItems = data?.spec_items
  if (Number(data?.nospec) !== 1 && specItems?.length) {
    const matchedSpecItem = findMatchedSpecItem(specItems, specIdString)
    if (matchedSpecItem) {
      const skuStart = Number(matchedSpecItem.start_num)
      return skuStart > 0 ? skuStart : productStartNum
    }
  }

  return productStartNum
}

export function resolvePriceCents(
  data: ProductSkuData | null | undefined,
  specIdString: string,
  field: 'price' | 'market_price' | 'member_price'
): number {
  if (!data) return 0

  if (Number(data.nospec) === 1 || !data.spec_items?.length) {
    return Number(data[field]) || 0
  }

  const matchedSpecItem = findMatchedSpecItem(data.spec_items, specIdString)

  return Number(matchedSpecItem?.[field] ?? data[field]) || 0
}
