import type { IApiResponse } from './auth'
import type { IProduct } from '~/types/product'
import type { IItem } from '~/types/api/item'

/**
 * 转换器接口
 */
export interface ITransformer<From, To> {
  transform(from: From): To
}

/**
 * 转换分页数据
 */
export function transformPagination<T, R>(
  response: IApiResponse<{ list: T[]; total_count: number }>,
  transformer: ITransformer<T, R>
): { list: R[]; total: number } {
  return {
    list: response.data.list.map((item) => transformer.transform(item)),
    total: response.data.total_count,
  }
}
