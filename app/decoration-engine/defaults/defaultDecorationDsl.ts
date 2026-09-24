import type {
  DecorationBlock,
  DecorationDSL,
  DecorationSection,
} from '~/decoration-engine/types/decoration'

type DefaultBlockInput = {
  type: string
  settings?: Record<string, unknown>
}

function createSection(
  id: string,
  type: string,
  options: {
    title?: string
    settings?: Record<string, unknown>
    blocks?: DefaultBlockInput[]
  } = {}
): DecorationSection {
  const blocks: Record<string, DecorationBlock> = {}
  const block_order: string[] = []

  ;(options.blocks || []).forEach((block, index) => {
    const blockId = `${id}-block-${index + 1}`
    blocks[blockId] = {
      type: block.type,
      disabled: false,
      settings: block.settings || {},
    }
    block_order.push(blockId)
  })

  return {
    type,
    title: options.title || '',
    disabled: false,
    settings: options.settings || {},
    blocks,
    block_order,
  }
}

function createDsl(
  pageType: DecorationDSL['pageType'],
  pageId: string,
  sections: Record<string, DecorationSection>
): DecorationDSL {
  return {
    pageType,
    pageId,
    sections,
    order: Object.keys(sections),
  }
}

export function createDefaultHeaderDecorationDsl(): DecorationDSL {
  return createDsl('header', 'header', {
    header: createSection('header', 'header', {
      settings: {
        logo_position: 'center',
        full_width: false,
        enable_language_selector: true,
        padding_top: 'xs',
        padding_bottom: 'xs',
        color_scheme: 'scheme-1',
      },
    }),
  })
}

export function createDefaultFooterDecorationDsl(): DecorationDSL {
  return createDsl('footer', 'footer', {
    footer: createSection('footer', 'footer', {
      settings: {
        full_width: false,
        padding_top: 'm',
        padding_bottom: 'm',
        color_scheme: 'scheme-3',
      },
      blocks: [
        {
          type: 'footer-text',
          settings: {
            title: 'a2f77aaa.add0b7',
            content: 'a2f77aaa.2da9ae',
            column_span: 4,
          },
        },
        {
          type: 'footer-menu',
          settings: {
            title: 'a2f77aaa.4d9b19',
            menu: null,
            menu_items: [
              { label: 'a2f77aaa.5e2186', url: '#' },
              { label: 'a2f77aaa.34cb57', url: '#' },
              { label: 'a2f77aaa.81af76', url: '#' },
              { label: 'a2f77aaa.cd5666', url: '#' },
            ],
            column_span: 2,
          },
        },
        {
          type: 'footer-menu',
          settings: {
            title: 'a2f77aaa.3b2e36',
            menu: null,
            menu_items: [
              { label: 'a2f77aaa.c0af65', url: '#' },
              { label: 'a2f77aaa.aee49a', url: '#' },
              { label: 'a2f77aaa.1df098', url: '#' },
              { label: 'a2f77aaa.5e2872', url: '#' },
            ],
            column_span: 2,
          },
        },
        {
          type: 'footer-menu',
          settings: {
            title: 'a2f77aaa.2039ae',
            menu: null,
            menu_items: [
              { label: 'a2f77aaa.0cbf83', url: '#' },
              { label: 'a2f77aaa.9a10f4', url: '#' },
              { label: 'a2f77aaa.e38f72', url: '#' },
              { label: 'a2f77aaa.72801f', url: '#' },
            ],
            column_span: 2,
          },
        },
        {
          type: 'footer-text',
          settings: {
            title: 'a2f77aaa.3b4325',
            content: 'a2f77aaa.ee372a',
            column_span: 4,
          },
        },
        {
          type: 'footer-image',
          settings: {
            image: '',
            link: '',
            alt: 'a2f77aaa.32e83c',
            column_span: 12,
          },
        },
      ],
    }),
  })
}

export function createDefaultHomeDecorationDsl(
  options: { pageId?: string; scene?: string } = {}
): DecorationDSL {
  return {
    ...createDsl('home', String(options.pageId || 'home'), {
      'main-carousel': createSection('main-carousel', 'main-carousel', {
        title: 'a2f77aaa.af052e',
        settings: {
          image_height: 'medium',
          enable_auto_play: true,
          interval: 3000,
          showDots: true,
          enable_arrow: true,
          full_width: true,
          padding_top: 'none',
          padding_bottom: 'none',
          color_scheme: 'scheme-1',
        },
        blocks: [{ type: 'image' }, { type: 'image' }, { type: 'image' }],
      }),
      'image-hotspot': createSection('image-hotspot', 'image-hotspot', {
        title: 'a2f77aaa.db70f7',
        settings: {
          imageWidth: 1200,
          imageHeight: 520,
          full_width: false,
          padding_top: 'm',
          padding_bottom: 'm',
          color_scheme: 'scheme-2',
        },
      }),
      'product-tab-shelf': createSection('product-tab-shelf', 'product-tab-shelf', {
        title: 'a2f77aaa.620734',
        settings: {
          title: 'a2f77aaa.a0a9b9',
          intro: 'a2f77aaa.6d83c3',
          columns: 4,
          size: 'medium',
          alignment: 'center',
          spacing: 'medium',
          show_price: true,
          show_add_cart: true,
          padding_top: 'm',
          padding_bottom: 'm',
          color_scheme: 'scheme-1',
        },
        blocks: [
          {
            type: 'product-tab',
            settings: {
              tab_label: 'a2f77aaa.343921',
              product_ids: [],
              limit: 8,
            },
          },
        ],
      }),
    }),
    meta: {
      version: 1,
      scene: options.scene || '1001',
    },
  } as DecorationDSL
}
