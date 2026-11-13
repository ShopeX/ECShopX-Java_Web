// 排序类型枚举
export enum EFilterSort {
  COMPREHENSIVE = 'comprehensive', // 综合
  SALES = 'sales', // 销量
  NEW = 'new', // 上新
  PRICE = 'price', // 价格
}

// 排序方向枚举
export enum EFilterOrder {
  ASC = 'asc', // 升序
  DESC = 'desc', // 降序
}

// 过滤器参数接口
export interface IFilterParams {
  sort: EFilterSort
  order?: EFilterOrder
  minPrice?: number
  maxPrice?: number
}

// 过滤器组件Props接口
export interface IFilterProps {
  total: number // 商品总数
  params: IFilterParams // 当前过滤参数
  onChange: (params: IFilterParams) => void // 参数变化回调
}
