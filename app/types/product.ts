// 商品基础类型 - 基于 ItemDetailTransformer 映射结果
export interface IProduct {
  // 基础标识信息
  itemId: string
  itemBn: string
  itemName: string
  brief: string
  stock: number
  // 图片信息
  img: string // 主图
  imgs: string[] // 图片列表

  // 价格信息（已转换为元）
  price: number
  activityPrice: number
  marketPrice: number
  memberPrice: number
  vipPrice: number
  svipPrice: number
  packagePrice: number

  // 销售信息
  sales: number
  salesSetting: any

  // 库存和限制信息
  limitNum: number
  purlimitByCart: number
  purlimitByFastbuy: number
  startNum: number

  // 商品状态和类型
  isNew: boolean
  isGift: boolean
  isPoint: boolean
  nospec: boolean
  orderItemType: string
  approveStatus: string

  // 商品规格和参数
  itemSpecDesc: string
  itemParams: any[] // 转换后的参数列表
  itemUnit: string

  // 促销活动信息
  promotionActivity: any // 转换后的促销活动
  activityInfo: any
  activityType: string

  // 店铺信息
  store: any
  store_setting: any
  companyId: string

  // 其他信息
  point: number
  vipgradeGuideTitle: string
  couponList: any[]
  groupsList: any[]
  regions: any[]

  // 固定值字段
  specText: string
}

// 商品卡片组件Props类型
export interface IProductCardProps {
  product: IProduct
  showMemberPrice?: boolean
}

// 商品列表请求参数类型
export interface IProductListParams {
  page?: number
  pageSize?: number
  categoryId?: string
  keyword?: string
  sort?: EProductSort
  order?: EOrder
}

// 商品排序枚举
export enum EProductSort {
  PRICE = 'price',
  SALES = 'sales',
  CREATED_TIME = 'created_time',
}

// 排序方向枚举
export enum EOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface Category {
  id: number
  name: string
  path: string
  icon?: string
  children?: Category[]
}
