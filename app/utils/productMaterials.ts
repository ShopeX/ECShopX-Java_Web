export interface ProductMaterialLink {
  name: string
  url: string
}

function readHttpUrl(value: unknown): string {
  const url = String(value ?? '').trim()
  return /^https?:\/\//i.test(url) ? url : ''
}

/** 商品详情「其他产品资料」：只取可打开的 url，忽略 size */
export function resolveProductMaterials(raw: unknown): ProductMaterialLink[] {
  if (!Array.isArray(raw)) return []

  const materials: ProductMaterialLink[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const url = readHttpUrl(record.url)
    if (!url) continue
    const name = String(record.name ?? '').trim() || url
    materials.push({ name, url })
  }
  return materials
}
