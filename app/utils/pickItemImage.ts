export function pickItemImage(item: Record<string, unknown>): string {
  const pics = item.pics

  if (Array.isArray(pics) && pics.length > 0) {
    return String(pics[0] ?? '')
  }

  if (typeof pics === 'string' && pics.length > 0) {
    return pics
  }

  return String(
    item.image ??
    item.image_url ??
    item.item_image ??
    item.item_pic ??
    item.pic ??
    item.cover ??
    item.goods_image ??
    item.img ??
    ''
  )
}
