/**
 * 文本校验工具
 *
 * 职责：
 * - 提供与业务无关的纯文本判定
 * - 保持无副作用，便于单元测试与跨表单复用
 *
 * 使用场景：
 * - 收货地址详细地址禁止表情符号
 * - 其它需要限制表情输入的文本字段
 */

/**
 * 表情符号匹配规则
 *
 * 覆盖：
 * - 普通表情与符号类表情（\p{Extended_Pictographic}）
 * - 旗帜类地区指示符（U+1F1E6–U+1F1FF）
 * - 肤色修饰符（U+1F3FB–U+1F3FF）
 * - 组合序列连接符 ZWJ（U+200D）与变体选择符（U+FE0F）
 * - 键帽表情基字符（U+20E3）
 */
const EMOJI_PATTERN =
  /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|[\u{1F3FB}-\u{1F3FF}]|\uFE0F|\u200D|\u{20E3}/u

/**
 * 判断文本是否包含表情符号
 *
 * @param value - 待校验文本，允许 undefined / null
 * @returns 含表情符号返回 true，否则返回 false
 */
export function containsEmoji(value?: string | null): boolean {
  if (!value) {
    return false
  }
  return EMOJI_PATTERN.test(value)
}
