import { defineStore } from 'pinia'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
}

export const useProductStore = defineStore('product', {
  state: () => ({
    featuredProducts: [
      {
        id: 1,
        name: '商品 1',
        description: '这是一个很棒的商品',
        price: 199,
        image: 'https://via.placeholder.com/300x300?text=Product1',
      },
      {
        id: 2,
        name: '商品 2',
        description: '这是一个很棒的商品',
        price: 299,
        image: 'https://via.placeholder.com/300x300?text=Product2',
      },
      {
        id: 3,
        name: '商品 3',
        description: '这是一个很棒的商品',
        price: 399,
        image: 'https://via.placeholder.com/300x300?text=Product3',
      },
      {
        id: 4,
        name: '商品 4',
        description: '这是一个很棒的商品',
        price: 499,
        image: 'https://via.placeholder.com/300x300?text=Product4',
      },
    ] as Product[],
    hotProducts: [
      {
        id: 5,
        name: '热销商品 1',
        description: '这是一个很受欢迎的商品',
        price: 599,
        image: 'https://via.placeholder.com/300x300?text=HotProduct1',
      },
      {
        id: 6,
        name: '热销商品 2',
        description: '这是一个很受欢迎的商品',
        price: 699,
        image: 'https://via.placeholder.com/300x300?text=HotProduct2',
      },
      {
        id: 7,
        name: '热销商品 3',
        description: '这是一个很受欢迎的商品',
        price: 799,
        image: 'https://via.placeholder.com/300x300?text=HotProduct3',
      },
      {
        id: 8,
        name: '热销商品 4',
        description: '这是一个很受欢迎的商品',
        price: 899,
        image: 'https://via.placeholder.com/300x300?text=HotProduct4',
      },
    ] as Product[],
  }),
})
