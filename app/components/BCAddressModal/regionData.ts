/**
 * 省市区数据（简化版本）
 *
 * 注意：这是一个简化的示例数据，实际项目中应该：
 * 1. 从后端 API 获取完整的省市区数据
 * 2. 或者使用完整的中国省市区 JSON 数据库
 */

export interface IRegionItem {
  id: string
  label: string
  children?: IRegionItem[]
}
