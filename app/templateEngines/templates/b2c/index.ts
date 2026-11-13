export default {
  sections: {
    'carousel-xxxx1': {
      type: 'carousel',
      title: 'f20e01ae.0c0180',
      settings: {
        layout: 'vertical',
      },
      blocks: {
        'image-xxxx1': {
          type: 'image',
          settings: {
            layout: 'vertical',
          },
        },
        'image-xxxx2': {
          type: 'image',
          settings: {
            layout: 'vertical',
          },
        },
      },
      block_order: ['image-xxxx1', 'image-xxxx2'],
    },
    'featured-product': {
      type: 'featured-product',
      title: 'f20e01ae.479ddf',
      description: 'f20e01ae.479ddf',
      items: [
        {
          id: 1,
          name: 'f20e01ae.be95c3',
          price: 100,
          quantity: 1,
        },
      ],
    },
  },
  order: ['featured-product', 'carousel-xxxx1'],
}
