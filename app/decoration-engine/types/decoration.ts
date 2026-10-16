export interface DecorationBlock {
  type: string
  disabled?: boolean
  settings: Record<string, unknown>
}

export interface DecorationSection {
  type: string
  title: string
  disabled: boolean
  settings: Record<string, unknown>
  blocks: Record<string, DecorationBlock>
  block_order: string[]
}

export type PageType =
  | 'home'
  | 'list'
  | 'product_list'
  | 'detail'
  | 'custom'
  | 'header'
  | 'footer'
  | 'global'

export interface DecorationDSL {
  pageType: PageType
  pageId: string
  sections: Record<string, DecorationSection>
  order: string[]
}

export type DecorationMessageType =
  | 'DECORATION_INIT'
  | 'DECORATION_UPDATE'
  | 'PREVIEW_READY'
  | 'PREVIEW_READY_ACK'
  | 'SECTION_FOCUSED'
  | 'SECTION_HOVERED'
  | 'SECTION_RECT'
  | 'PREVIEW_SCROLL'
  | 'BLOCK_FOCUSED'
  | 'BLOCK_HOVERED'
  | 'BLOCK_HIGHLIGHT'
  | 'BLOCK_RECT'
  | 'ADD_BLOCK_REQUESTED'
  | 'ADD_SECTION_REQUESTED'
  | 'MOVE_SECTION_REQUESTED'
  | 'DUPLICATE_SECTION_REQUESTED'
  | 'REMOVE_SECTION_REQUESTED'
  | 'MOVE_BLOCK_REQUESTED'
  | 'DUPLICATE_BLOCK_REQUESTED'
  | 'REMOVE_BLOCK_REQUESTED'

export interface DecorationMessage {
  type: DecorationMessageType
  payload: Record<string, unknown>
}

/** blockId 为空字符串表示仅选中分区（无具体 block），预览端用分区描边而非 block 描边 */
export interface DecorationHighlightedBlock {
  sectionId: string
  blockId: string
}

export interface DecorationBlockRect {
  top: number
  left: number
  width: number
  height: number
}

export const EMPTY_DECORATION_DSL: DecorationDSL = {
  pageType: 'home',
  pageId: 'home',
  sections: {},
  order: [],
}

export function isDecorationDSL(value: unknown): value is DecorationDSL {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<DecorationDSL>

  // pageId 允许空字符串：后台 decoration store 默认 `pageId: ''`，用 truthy 判断会误判为非法 DSL
  return Boolean(
    candidate.pageType &&
      typeof candidate.pageId === 'string' &&
      candidate.sections &&
      typeof candidate.sections === 'object' &&
      Array.isArray(candidate.order)
  )
}

export function normalizeDecorationDSL(
  value: unknown,
  fallback: DecorationDSL | null = null
): DecorationDSL | null {
  if (!isDecorationDSL(value)) {
    return fallback
  }

  const sections: Record<string, DecorationSection> = {}
  Object.keys(value.sections || {}).forEach((sectionId) => {
    const raw = value.sections[sectionId] as unknown as Record<string, unknown>
    const blockOrderFromSnake = Array.isArray(raw.block_order) ? (raw.block_order as string[]) : []
    const blockOrderFromCamel = Array.isArray(raw.blockOrder) ? (raw.blockOrder as string[]) : []
    const block_order = blockOrderFromSnake.length ? blockOrderFromSnake : blockOrderFromCamel

    const next = { ...(raw as any) } as Record<string, unknown>
    delete next.block_order
    delete next.blockOrder

    sections[sectionId] = {
      ...(next as unknown as DecorationSection),
      block_order,
    }
  })

  return {
    pageType: value.pageType,
    pageId: value.pageId,
    sections,
    order: value.order,
  }
}

export function hasDecorationSections(value: DecorationDSL | null | undefined): boolean {
  return Boolean(value?.order?.length)
}
