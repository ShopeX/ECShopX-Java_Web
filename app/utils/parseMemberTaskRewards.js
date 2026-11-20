/**
 * 将列表接口 reward_summary 拆成多条展示项（对齐 Figma 积分 / 券分开展示）。
 * 接口暂无结构化 rewards，仅做展示层拆分。
 */

/**
 * @param {string} label
 * @returns {'point' | 'coupon'}
 */
function classifyRewardLabel(label) {
  const hasPoint = /积分/.test(label)
  const hasCoupon = /券|优惠/.test(label)
  if (hasCoupon && !hasPoint) return 'coupon'
  if (hasPoint) return 'point'
  if (hasCoupon) return 'coupon'
  return 'point'
}

/** 「100积分+优惠券」→ 两项；「积分+20」保持一项 */
/**
 * @param {string} part
 * @returns {string[]}
 */
function splitCompositePart(part) {
  const m = part.match(/^(.+?积分)\+(.+)$/)
  if (m && /券|优惠/.test(m[2])) {
    return [m[1].trim(), m[2].trim()].filter(Boolean)
  }
  return [part]
}

/**
 * @param {string | null | undefined} summary
 * @returns {{ kind: 'point' | 'coupon', label: string }[]}
 */
export function parseMemberTaskRewards(summary) {
  const raw = summary?.trim()
  if (!raw) return []

  const parts = raw
    .split(/[，,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap(splitCompositePart)

  return parts.map((label) => ({
    kind: classifyRewardLabel(label),
    label,
  }))
}
