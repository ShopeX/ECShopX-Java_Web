/**
 * 商品筛选组件类型定义
 */

/**
 * 筛选项接口
 */
export interface IFilterOption {
  id: string | number
  label: string
  value: string | number
}

/**
 * 筛选组接口
 */
export interface IFilterGroup {
  key: string
  label: string
  options: IFilterOption[]
  multiple?: boolean // 是否支持多选，默认为 true
}

/**
 * 排序选项枚举
 */
export enum ESortOption {
  DEFAULT = 'default',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  SALES = 'sales',
  NEW = 'new',
}

/**
 * 排序选项配置
 */
export interface ISortOption {
  value: ESortOption
  label: string
}

/**
 * 筛选值接口
 */
export interface IProductFilterValue {
  /** 分类 - 单选 */
  category?: string | number
  /** 系列 - 多选 */
  series?: (string | number)[]
  /** 颜色 - 多选 */
  colors?: (string | number)[]
  /** 材质 - 多选 */
  materials?: (string | number)[]
  /** 尺寸 - 多选 */
  sizes?: (string | number)[]
  /** 价格区间 - 单选 */
  priceRange?: string | number
  /** 排序方式 */
  sort?: ESortOption
}

/**
 * 组件 Props 接口
 */
export interface IProductFilterProps {
  /** 筛选值 */
  modelValue: IProductFilterValue
  /** 筛选组列表 */
  filterGroups: IFilterGroup[]
  /** 是否显示筛选面板 */
  showFilterPanel?: boolean
}

/**
 * 组件 Emits 接口
 */
export interface IProductFilterEmits {
  'update:modelValue': [value: IProductFilterValue]
  'update:showFilterPanel': [show: boolean]
  change: []
}
