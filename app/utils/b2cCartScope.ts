/** 与 CartTransformer.resolveStoreId 保持同一字段顺序 */
function resolveCartStoreId(source: Record<string, any> | null | undefined): string {
  if (!source) return ''
  const raw =
    source.distributor_id ??
    source.shop_id ??
    source.store_id ??
    source.distributor_info?.distributor_id ??
    source.shop_info?.shop_id ??
    source.shopInfo?.shop_id ??
    ''
  if (raw === '' || raw == null) return ''
  return String(raw)
}

export function normalizeB2cDistributorId(value?: string | number | null): string {
  const normalized = Number(value ?? 0)
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return '0'
  }
  return String(normalized)
}

/**
 * B2C 只保留 is_valid 返回的店铺分组；BBC 保持跨店列表。
 * 店铺 ID 未就绪时返回空，避免先闪出其他店。
 */
export function scopeCartGroupsToDistributor<T extends Record<string, any>>(
  groups: T[] | null | undefined,
  options: { businessMode: 'bbc' | 'b2c'; distributorId?: string | number | null }
): T[] {
  const list = Array.isArray(groups) ? groups : []
  if (options.businessMode !== 'b2c') {
    return list
  }

  const target = normalizeB2cDistributorId(options.distributorId)
  if (target === '0') {
    return []
  }

  return list.flatMap((group) => {
    const groupId = resolveCartStoreId(group)
    if (groupId && groupId !== '0') {
      return groupId === target ? [group] : []
    }

    const items = Array.isArray(group.list) ? group.list : null
    if (!items) {
      return []
    }

    const matched = items.filter((item: Record<string, any>) => resolveCartStoreId(item) === target)
    if (matched.length === 0) {
      return []
    }

    return [{ ...group, list: matched }]
  })
}

export function scopeCachedCartState<
  T extends { distributorId?: string },
  G extends { id: string },
>(
  state: { items: T[]; invalidItems: T[]; storeGroups: G[] },
  options: { businessMode: 'bbc' | 'b2c'; distributorId?: string | number | null }
): { items: T[]; invalidItems: T[]; storeGroups: G[] } {
  if (options.businessMode !== 'b2c') {
    return state
  }

  const target = normalizeB2cDistributorId(options.distributorId)
  if (target === '0') {
    return { items: [], invalidItems: [], storeGroups: [] }
  }

  return {
    items: state.items.filter((item) => String(item.distributorId || '') === target),
    invalidItems: state.invalidItems.filter((item) => String(item.distributorId || '') === target),
    storeGroups: state.storeGroups.filter((group) => group.id === target),
  }
}
