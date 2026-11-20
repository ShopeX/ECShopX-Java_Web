import type {
  IMerchantCategoryNode,
  IMerchantMainCategorySelection,
} from '~/types/api/merchant'

function readId(raw: Record<string, unknown>): number {
  const id = Number(raw.category_id ?? raw.id ?? 0)
  return Number.isFinite(id) && id > 0 ? id : 0
}

function readName(raw: Record<string, unknown>): string {
  return String(raw.category_name ?? raw.name ?? '').trim()
}

function readLevel(raw: Record<string, unknown>, fallback: number): number {
  const level = Number(raw.category_level ?? raw.level ?? fallback)
  return Number.isFinite(level) && level > 0 ? level : fallback
}

function readChildren(raw: Record<string, unknown>): unknown[] {
  if (Array.isArray(raw.children)) return raw.children
  if (Array.isArray(raw.child)) return raw.child
  return []
}

/** 将接口分类树规范为可遍历节点 */
export function normalizeMerchantCategoryTree(
  raw: unknown,
  level = 1,
  parentId = 0
): IMerchantCategoryNode[] {
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as any)?.list)
      ? (raw as any).list
      : Array.isArray((raw as any)?.data)
        ? (raw as any).data
        : []

  return list
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const categoryId = readId(row)
      const name = readName(row)
      if (!categoryId || !name) return null
      const currentLevel = readLevel(row, level)
      const resolvedParentId = Number(row.parent_id ?? parentId) || parentId
      return {
        category_id: categoryId,
        category_name: name,
        category_level: currentLevel,
        parent_id: resolvedParentId,
        path: row.path != null ? String(row.path) : undefined,
        children: normalizeMerchantCategoryTree(readChildren(row), currentLevel + 1, categoryId),
      } satisfies IMerchantCategoryNode
    })
    .filter(Boolean) as IMerchantCategoryNode[]
}

export function selectionKey(item: Pick<IMerchantMainCategorySelection, 'category_id' | 'level'>) {
  return `${item.category_id}:${item.level}`
}

function hasSelection(
  current: IMerchantMainCategorySelection[],
  categoryId: number,
  level: 2 | 3
): boolean {
  return current.some((item) => item.category_id === categoryId && item.level === level)
}

function removeKeys(
  current: IMerchantMainCategorySelection[],
  keys: Set<string>
): IMerchantMainCategorySelection[] {
  return current.filter((item) => !keys.has(selectionKey(item)))
}

/** 选中二级：有三级则默认写入全部三级；无三级则写入二级本身 */
export function selectionsForLevel2Node(node: IMerchantCategoryNode): IMerchantMainCategorySelection[] {
  const children = (node.children || []).filter((child) => child.category_level === 3)
  if (children.length) {
    return children.map((child) => ({
      category_id: child.category_id,
      level: 3 as const,
      name: child.category_name,
      parent_id: node.category_id,
    }))
  }
  return [
    {
      category_id: node.category_id,
      level: 2,
      name: node.category_name,
      parent_id: node.parent_id,
    },
  ]
}

export function isLevel2FullySelected(
  current: IMerchantMainCategorySelection[],
  node: IMerchantCategoryNode
): boolean {
  const expected = selectionsForLevel2Node(node)
  if (!expected.length) return false
  return expected.every((item) => hasSelection(current, item.category_id, item.level))
}

export function isLevel2PartiallySelected(
  current: IMerchantMainCategorySelection[],
  node: IMerchantCategoryNode
): boolean {
  const children = (node.children || []).filter((child) => child.category_level === 3)
  if (!children.length) return false
  const selectedCount = children.filter((child) =>
    hasSelection(current, child.category_id, 3)
  ).length
  return selectedCount > 0 && selectedCount < children.length
}

export function isLevel3Selected(
  current: IMerchantMainCategorySelection[],
  node: IMerchantCategoryNode
): boolean {
  return hasSelection(current, node.category_id, 3)
}

/** 切换二级：选中则默认带上全部三级；取消则清掉对应项 */
export function toggleLevel2Selection(
  current: IMerchantMainCategorySelection[],
  node: IMerchantCategoryNode
): IMerchantMainCategorySelection[] {
  const expected = selectionsForLevel2Node(node)
  const keys = new Set(expected.map(selectionKey))
  if (isLevel2FullySelected(current, node)) {
    return removeKeys(current, keys)
  }
  const next = removeKeys(current, keys)
  return [...next, ...expected]
}

/** 切换单个三级 */
export function toggleLevel3Selection(
  current: IMerchantMainCategorySelection[],
  node: IMerchantCategoryNode
): IMerchantMainCategorySelection[] {
  const item: IMerchantMainCategorySelection = {
    category_id: node.category_id,
    level: 3,
    name: node.category_name,
    parent_id: node.parent_id,
  }
  const key = selectionKey(item)
  if (hasSelection(current, item.category_id, 3)) {
    return current.filter((row) => selectionKey(row) !== key)
  }
  return [...current, item]
}

function findNodePath(
  tree: IMerchantCategoryNode[],
  categoryId: number,
  level: number,
  ancestors: IMerchantCategoryNode[] = []
): IMerchantCategoryNode[] | null {
  for (const node of tree) {
    const path = [...ancestors, node]
    if (node.category_id === categoryId && node.category_level === level) return path
    if (node.children?.length) {
      const found = findNodePath(node.children, categoryId, level, path)
      if (found) return found
    }
  }
  return null
}

export function formatSelectedCategoryLabels(
  selection: IMerchantMainCategorySelection[],
  tree: IMerchantCategoryNode[],
  fallbackNames: string[] = []
): string {
  if (!selection.length) return fallbackNames.filter(Boolean).join('、')
  const labels = selection.map((item) => {
    if (item.name) {
      const path = findNodePath(tree, item.category_id, item.level)
      if (path?.length) return path.map((node) => node.category_name).join(' / ')
      return item.name
    }
    const path = findNodePath(tree, item.category_id, item.level)
    if (path?.length) return path.map((node) => node.category_name).join(' / ')
    return String(item.category_id)
  })
  return labels.join('、')
}

/** UTree 节点：挂载 category 字段供 get-key / 提交映射 */
export type MerchantCategoryTreeItem = {
  label: string
  category_id: number
  category_level: number
  parent_id?: number
  defaultExpanded?: boolean
  children?: MerchantCategoryTreeItem[]
}

export function categoryTreeItemKey(
  item: Pick<MerchantCategoryTreeItem, 'category_id' | 'category_level'>
) {
  return `${item.category_id}:${item.category_level}`
}

/** 分类树 → UTree items（默认全部收起，由用户自行展开） */
export function toMerchantCategoryTreeItems(
  tree: IMerchantCategoryNode[]
): MerchantCategoryTreeItem[] {
  return tree.map((node) => {
    const children = node.children?.length
      ? toMerchantCategoryTreeItems(node.children)
      : undefined
    return {
      label: node.category_name,
      category_id: node.category_id,
      category_level: node.category_level,
      parent_id: node.parent_id,
      children,
    }
  })
}

/**
 * UTree 选中项 → 入驻提交用 selection。
 * 一级不提交；有三级的二级只提交已选三级；无三级的二级提交自身。
 */
export function selectionFromTreeItems(
  selected: MerchantCategoryTreeItem[]
): IMerchantMainCategorySelection[] {
  const result: IMerchantMainCategorySelection[] = []
  const seen = new Set<string>()

  for (const item of selected) {
    if (item.category_level === 1) continue

    if (item.category_level === 3) {
      const row: IMerchantMainCategorySelection = {
        category_id: item.category_id,
        level: 3,
        name: item.label,
        parent_id: item.parent_id,
      }
      const key = selectionKey(row)
      if (!seen.has(key)) {
        seen.add(key)
        result.push(row)
      }
      continue
    }

    if (item.category_level === 2) {
      const hasLevel3 = (item.children || []).some((child) => child.category_level === 3)
      if (hasLevel3) continue
      const row: IMerchantMainCategorySelection = {
        category_id: item.category_id,
        level: 2,
        name: item.label,
        parent_id: item.parent_id,
      }
      const key = selectionKey(row)
      if (!seen.has(key)) {
        seen.add(key)
        result.push(row)
      }
    }
  }

  return result
}

/**
 * selection → UTree v-model。
 * 受控模式下父节点必须出现在 modelValue 里才会显示勾选；
 * 仅有全部子节点时 Reka 不会把父级标成 selected（indeterminate 也为 false → 空框）。
 * 因此：子级全选时把对应父级一并写入；提交时仍由 selectionFromTreeItems 去掉一级。
 */
export function treeItemsFromSelection(
  selection: IMerchantMainCategorySelection[],
  items: MerchantCategoryTreeItem[]
): MerchantCategoryTreeItem[] {
  if (!selection.length || !items.length) return []
  const want = new Set(selection.map((item) => selectionKey(item)))
  const picked: MerchantCategoryTreeItem[] = []
  const pickedKeys = new Set<string>()

  const add = (node: MerchantCategoryTreeItem) => {
    const key = categoryTreeItemKey(node)
    if (pickedKeys.has(key)) return
    pickedKeys.add(key)
    picked.push(node)
  }

  const isLevel3Wanted = (node: MerchantCategoryTreeItem) =>
    want.has(selectionKey({ category_id: node.category_id, level: 3 }))

  const isLevel2LeafWanted = (node: MerchantCategoryTreeItem) =>
    want.has(selectionKey({ category_id: node.category_id, level: 2 }))

  /** 二级是否视为「全选」（有三级则三级全在；无三级则二级自身在 selection） */
  const isLevel2FullyWanted = (node: MerchantCategoryTreeItem) => {
    const level3 = (node.children || []).filter((child) => child.category_level === 3)
    if (level3.length) return level3.every(isLevel3Wanted)
    return isLevel2LeafWanted(node)
  }

  const walk = (nodes: MerchantCategoryTreeItem[]) => {
    for (const node of nodes) {
      if (node.category_level === 3) {
        if (isLevel3Wanted(node)) add(node)
        continue
      }

      if (node.category_level === 2) {
        const level3 = (node.children || []).filter((child) => child.category_level === 3)
        if (level3.length) {
          const selectedLevel3 = level3.filter(isLevel3Wanted)
          for (const child of selectedLevel3) add(child)
          if (selectedLevel3.length === level3.length) add(node)
        } else if (isLevel2LeafWanted(node)) {
          add(node)
        }
        continue
      }

      // 一级：先处理子树，再在二级全选时把一级写入 model
      if (node.children?.length) {
        walk(node.children)
        const level2 = (node.children || []).filter((child) => child.category_level === 2)
        if (level2.length && level2.every(isLevel2FullyWanted)) add(node)
      }
    }
  }

  walk(items)
  return picked
}
