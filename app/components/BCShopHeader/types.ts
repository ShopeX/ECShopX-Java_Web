/**
 * BCShopHeader — BBC 店铺首页 Header 组件类型定义
 */

export interface BCShopHeaderProps {
  /** 店铺 ID，用于搜索路由跳转 */
  distributorId: string
  /** 店铺 Logo 图片 URL */
  logo: string
  /** 店铺名称 */
  name: string
  /** 店铺描述文案 */
  tagline: string
  /** 分类导航列表 */
  categories: string[]
  /** 初始关注状态，默认 false */
  followed?: boolean
}

export interface BCShopHeaderEmits {
  /** 关注/取消关注，携带最新布尔状态 */
  follow: [isFollowed: boolean]
  /** 联系客服点击 */
  contact: []
}
