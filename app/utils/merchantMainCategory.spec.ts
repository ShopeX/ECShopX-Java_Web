import { describe, expect, it } from 'vitest'
import {
  formatSelectedCategoryLabels,
  isLevel2FullySelected,
  isLevel3Selected,
  normalizeMerchantCategoryTree,
  selectionFromTreeItems,
  selectionsForLevel2Node,
  toMerchantCategoryTreeItems,
  toggleLevel2Selection,
  toggleLevel3Selection,
  treeItemsFromSelection,
} from './merchantMainCategory'

describe('merchantMainCategory tree mapping', () => {
  const tree = normalizeMerchantCategoryTree([
    {
      category_id: 1,
      category_name: '一级',
      category_level: 1,
      children: [
        {
          category_id: 2,
          category_name: '二级A',
          category_level: 2,
          children: [
            { category_id: 3, category_name: '三级A1', category_level: 3 },
            { category_id: 5, category_name: '三级A2', category_level: 3 },
          ],
        },
        { category_id: 4, category_name: '二级B', category_level: 2 },
      ],
    },
  ])

  const level2WithChildren = tree[0]!.children![0]!
  const level2Leaf = tree[0]!.children![1]!
  const items = toMerchantCategoryTreeItems(tree)

  it('keeps every category node collapsed by default', () => {
    const walk = (nodes: ReturnType<typeof toMerchantCategoryTreeItems>) => {
      for (const node of nodes) {
        expect(node.defaultExpanded).toBeUndefined()
        if (node.children?.length) walk(node.children)
      }
    }
    walk(items)
  })

  it('selecting level2 with children defaults to all level3', () => {
    expect(selectionsForLevel2Node(level2WithChildren)).toEqual([
      { category_id: 3, level: 3, name: '三级A1', parent_id: 2 },
      { category_id: 5, level: 3, name: '三级A2', parent_id: 2 },
    ])
    const selected = toggleLevel2Selection([], level2WithChildren)
    expect(isLevel2FullySelected(selected, level2WithChildren)).toBe(true)
    expect(isLevel3Selected(selected, level2WithChildren.children![0]!)).toBe(true)
  })

  it('selecting level2 without children stores level2 itself', () => {
    const selected = toggleLevel2Selection([], level2Leaf)
    expect(selected).toEqual([
      { category_id: 4, level: 2, name: '二级B', parent_id: 1 },
    ])
  })

  it('can toggle single level3 and format labels', () => {
    let selected = toggleLevel3Selection([], level2WithChildren.children![0]!)
    expect(selected).toHaveLength(1)
    selected = toggleLevel2Selection(selected, level2WithChildren)
    expect(selected).toHaveLength(2)
    expect(formatSelectedCategoryLabels(selected, tree)).toContain('一级 / 二级A / 三级A1')
  })

  it('maps UTree propagate selection (level2+level3) to payload level3 only', () => {
    const l2 = items[0]!.children![0]!
    const selected = selectionFromTreeItems([l2, ...(l2.children || [])])
    expect(selected).toEqual([
      { category_id: 3, level: 3, name: '三级A1', parent_id: 2 },
      { category_id: 5, level: 3, name: '三级A2', parent_id: 2 },
    ])
  })

  it('maps UTree leaf level2 selection to payload level2', () => {
    const l2LeafItem = items[0]!.children![1]!
    expect(selectionFromTreeItems([l2LeafItem])).toEqual([
      { category_id: 4, level: 2, name: '二级B', parent_id: 1 },
    ])
  })

  it('round-trips selection into UTree model leaves', () => {
    const selection = [
      { category_id: 3, level: 3 as const, name: '三级A1', parent_id: 2 },
      { category_id: 4, level: 2 as const, name: '二级B', parent_id: 1 },
    ]
    const model = treeItemsFromSelection(selection, items)
    expect(model.map((item) => item.category_id).sort()).toEqual([3, 4])
    expect(selectionFromTreeItems(model)).toEqual(selection)
  })

  it('includes level2 in UTree model when all level3 are selected', () => {
    const selection = [
      { category_id: 3, level: 3 as const, name: '三级A1', parent_id: 2 },
      { category_id: 5, level: 3 as const, name: '三级A2', parent_id: 2 },
    ]
    const model = treeItemsFromSelection(selection, items)
    expect(model.map((item) => item.category_id).sort()).toEqual([2, 3, 5])
    expect(selectionFromTreeItems(model)).toEqual(selection)
  })

  it('includes level1 in UTree model when entire subtree is selected', () => {
    const selection = [
      { category_id: 3, level: 3 as const, name: '三级A1', parent_id: 2 },
      { category_id: 5, level: 3 as const, name: '三级A2', parent_id: 2 },
      { category_id: 4, level: 2 as const, name: '二级B', parent_id: 1 },
    ]
    const model = treeItemsFromSelection(selection, items)
    expect(model.map((item) => item.category_id).sort()).toEqual([1, 2, 3, 4, 5])
    expect(selectionFromTreeItems(model)).toEqual(selection)
  })
})
