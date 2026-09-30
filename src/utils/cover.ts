/**
 * 封面分配与展示顺序
 * 等价还原原型 detail.html / reader.html 中的 buildCoverIndex() 与 getVideoDisplayIndex()
 */
import { BOOK_LIKE_COVERS, DEFAULT_VIDEO_COVER, VIDEO_COVER_SPEC, VIDEO_COVERS } from '@/constants/covers'
import { PINNED_TITLES } from '@/constants/schema'
import type { LiteratureItem } from '@/types'

/** 分类导航默认展示顺序：置顶题名按序靠前，其余保持原序 */
export function getDisplayOrder(items: LiteratureItem[]): LiteratureItem[] {
  const pinned: LiteratureItem[] = []
  PINNED_TITLES.forEach((title) => {
    const hit = items.find((it) => it.title === title)
    if (hit) pinned.push(hit)
  })
  const rest = items.filter((it) => !PINNED_TITLES.includes(it.title))
  return [...pinned, ...rest]
}

/** 视频在展示顺序中的序号（从 1 开始） */
export function getVideoDisplayIndex(items: LiteratureItem[], sysId: string): number {
  const videos = getDisplayOrder(items).filter((it) => it.type === '视频')
  const idx = videos.findIndex((it) => it.sysId === sysId)
  return idx < 0 ? 0 : idx + 1
}

/** 按展示顺序构建「sysId → 封面地址」映射 */
export function buildCoverMap(items: LiteratureItem[]): Record<string, string> {
  const map: Record<string, string> = {}
  let bookLikeSeq = 0
  let videoSeq = 0

  getDisplayOrder(items).forEach((item) => {
    if (item.type === '视频') {
      videoSeq += 1
      const spec = VIDEO_COVER_SPEC.find(
        (s) => item.title.includes(s.title) || item.title.includes(`第${s.idx}集`),
      )
      if (spec) {
        map[item.sysId] = VIDEO_COVERS[spec.idx - 1]
      } else if (videoSeq <= 3) {
        map[item.sysId] = VIDEO_COVERS[videoSeq - 1]
      } else {
        map[item.sysId] = DEFAULT_VIDEO_COVER
      }
    } else {
      map[item.sysId] = BOOK_LIKE_COVERS[bookLikeSeq % BOOK_LIKE_COVERS.length]
      bookLikeSeq += 1
    }
  })

  return map
}

/** 取封面，未命中时回退到默认视频封面 */
export function resolveCover(items: LiteratureItem[], sysId: string): string {
  return buildCoverMap(items)[sysId] || DEFAULT_VIDEO_COVER
}

/** 详情页 / 列表页封面（优先使用条目自带 cover） */
export function coverOf(item: LiteratureItem, items: LiteratureItem[]): string {
  return item.cover || resolveCover(items, item.sysId) || DEFAULT_VIDEO_COVER
}
