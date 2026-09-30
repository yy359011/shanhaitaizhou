/**
 * 文献相关接口：列表 / 检索 / 详情元数据
 */
import { LITERATURE_DATA, RECOMMEND_ITEMS } from '@/mock/literature'
import { getRawMeta } from '@/mock/meta'
import { getFieldSchema, isEmptyMetaValue, CATEGORY_PAGE_SIZE } from '@/constants/schema'
import { coverOf, getDisplayOrder } from '@/utils/cover'
import type { DetailMeta, DocCategory, DocType, LiteratureItem, PageQuery, PageResult } from '@/types'
import { http, mockDelay, USE_MOCK } from './request'

export interface LiteratureFilter {
  /** 主题分类（支持多选：数组 = OR，单值/空串/空数组等价于不筛） */
  category?: DocCategory | '' | DocCategory[]
  /** 文献类型（支持多选：数组 = OR，单值/空串/空数组等价于不筛） */
  type?: DocType | '' | DocType[]
  keyword?: string
  /** 高级检索字段（可选；全部为空时与原 filter 等价） */
  title?: string
  authorExact?: string
  classNo?: string
  publisher?: string
  isbn?: string
  publishYear?: string
  publishPlace?: string
  /** 高级关键词（多词 AND，空格分隔） */
  keywords?: string
  matchMode?: '模糊' | '精确'
}

/** 字符串匹配（模糊=子串，精确=全等） */
function matchText(haystack: string, needle: string, mode: '模糊' | '精确' = '模糊'): boolean {
  if (!needle.trim()) return true
  if (mode === '精确') return haystack.trim().toLowerCase() === needle.trim().toLowerCase()
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

/** 出版年匹配（元数据 publishDate 形如 "2021年6月" 或 "2021-06"） */
function matchPublishYear(dateStr: string, year: string): boolean {
  if (!year.trim()) return true
  return String(dateStr).includes(year.trim())
}

/** 关键词多词 AND 匹配（空格分隔） */
function matchKeywords(source: string, query: string, mode: '模糊' | '精确' = '模糊'): boolean {
  const terms = query.split(/\s+/).filter(Boolean)
  if (!terms.length) return true
  return terms.every((t) => matchText(source, t, mode))
}

/** 按条件过滤：分类（多选 OR） / 类型 / 关键词 / 高级字段；未启用任何筛选时置顶 PINNED_TITLES */
export function filterLiterature(source: LiteratureItem[], filter: LiteratureFilter): LiteratureItem[] {
  const keyword = (filter.keyword || '').trim().toLowerCase()
  const mode: '模糊' | '精确' = filter.matchMode || '模糊'
  const cats = Array.isArray(filter.category)
    ? filter.category.filter(Boolean) as DocCategory[]
    : filter.category
      ? [filter.category as DocCategory]
      : []
  const types = Array.isArray(filter.type)
    ? filter.type.filter(Boolean) as DocType[]
    : filter.type
      ? [filter.type as DocType]
      : []
  const hasAdvanced = Boolean(
    filter.title || filter.authorExact || filter.classNo || filter.publisher || filter.isbn || filter.publishYear || filter.publishPlace
  )
  let list = source.filter((item) => {
    if (cats.length && !cats.includes(item.category)) return false
    if (types.length && !types.includes(item.type)) return false
    if (keyword) {
      const haystack = `${item.title}${item.author}${item.keywords}${item.sysId}`.toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    // ---- 高级字段过滤（著录表） ----
    if (hasAdvanced) {
      const raw = getRawMeta(item) as Record<string, any>
      if (filter.title && !matchText(item.title, filter.title, mode)) return false
      if (filter.authorExact && !matchText(item.author, filter.authorExact, mode)) return false
      if (filter.classNo && !matchText(String(raw.classNo || ''), filter.classNo, mode)) return false
      if (filter.publisher && !matchText(String(raw.publisher || ''), filter.publisher, mode)) return false
      if (filter.isbn && !matchText(String(raw.isbn || ''), filter.isbn, mode)) return false
      if (filter.publishYear && !matchPublishYear(String(raw.publishDate || item.publishDate || ''), filter.publishYear)) return false
      if (filter.publishPlace && !matchText(String(raw.publishPlace || ''), filter.publishPlace, mode)) return false
      if (filter.keywords && !matchKeywords(item.keywords, filter.keywords, mode)) return false
    }
    return true
  })
  const noFilter = !cats.length && !types.length && !keyword && !hasAdvanced && !filter.keywords
  if (noFilter) list = getDisplayOrder(list)
  return list
}

/** 分类导航 / 检索共用的分页查询 */
export function queryLiterature(filter: LiteratureFilter, query: PageQuery = {}): PageResult<LiteratureItem> {
  const page = query.page && query.page > 0 ? query.page : 1
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : CATEGORY_PAGE_SIZE
  const merged: LiteratureFilter = {
    category: filter.category ?? query.category ?? '',
    type: filter.type ?? query.type ?? '',
    keyword: filter.keyword ?? query.keyword ?? '',
  }
  const all = filterLiterature(LITERATURE_DATA, merged)
  const start = (page - 1) * pageSize
  return {
    list: all.slice(start, start + pageSize),
    total: all.length,
    page,
    pageSize,
  }
}

export function getLiteratureList(filter: LiteratureFilter, query: PageQuery = {}): Promise<PageResult<LiteratureItem>> {
  if (USE_MOCK) return mockDelay(queryLiterature(filter, query))
  return http<PageResult<LiteratureItem>>({
    url: '/literature/list',
    method: 'get',
    params: { ...query, ...filter },
  })
}

/** 各一级分类的文献数量（分类导航页按钮角标） */
export function countByCategory(source: LiteratureItem[] = LITERATURE_DATA): Record<string, number> {
  return source.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})
}

/** 各资源类型的文献数量（侧栏角标） */
export function countByType(source: LiteratureItem[] = LITERATURE_DATA): Record<string, number> {
  return source.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {})
}

export function findLiterature(sysId: string): LiteratureItem | undefined {
  return LITERATURE_DATA.find((it) => it.sysId === sysId)
}

export function findLiteratureById(id: string): LiteratureItem | undefined {
  return LITERATURE_DATA.find((it) => it.id === id)
}

/** 按题名查找（舌尖山海卡片 → 视频文献关联） */
export function findLiteratureByTitle(title: string): LiteratureItem | undefined {
  return LITERATURE_DATA.find((it) => it.title === title)
}

/** 详情页定位：sysId 优先，id 兜底 */
export function resolveLiterature(sysId?: string, id?: string): LiteratureItem | undefined {
  if (sysId) {
    const hit = findLiterature(sysId)
    if (hit) return hit
  }
  if (id) return findLiteratureById(id)
  return undefined
}

export function getLiteratureDetail(query: { sysId?: string; id?: string }): Promise<LiteratureItem | null> {
  if (USE_MOCK) return mockDelay(resolveLiterature(query.sysId, query.id) || null)
  return http<LiteratureItem | null>({ url: '/literature/detail', method: 'get', params: query })
}

/** 推荐导读（首页 4 张卡片） */
export function getRecommendList(): Promise<Array<{ sysId: string; title: string; tag: string; cover: string }>> {
  const data = RECOMMEND_ITEMS.map((rec) => {
    const item = findLiterature(rec.sysId)
    return {
      sysId: rec.sysId,
      title: rec.title,
      tag: rec.tag,
      cover: item ? coverOf(item, LITERATURE_DATA) : '',
    }
  })
  if (USE_MOCK) return mockDelay(data)
  return http({ url: '/literature/recommend', method: 'get' })
}

/** 详情页元数据：按著录模板补全缺失值，并附加渲染所需上下文 */
export function buildDetailMeta(item: LiteratureItem): DetailMeta {
  const raw = getRawMeta(item) as Record<string, string | number | undefined>
  const schema = getFieldSchema(item.type)
  const meta: DetailMeta = {
    ...raw,
    _type: item.type,
    _category: item.category,
    _cover: coverOf(item, LITERATURE_DATA),
    _sysId: item.sysId,
  }
  schema.forEach((group) => {
    group.fields.forEach((field) => {
      if (isEmptyMetaValue(meta[field.key])) {
        if (field.key === 'sysId') meta[field.key] = item.sysId
        else if (field.key === 'title') meta[field.key] = item.title
        else if (field.key === 'author') meta[field.key] = item.author
        else if (field.key === 'keywords') meta[field.key] = item.keywords
        else if (field.key === 'publishDate') meta[field.key] = item.publishDate || ''
      }
    })
  })
  return meta
}

export function getDetailMeta(sysId: string): DetailMeta | null {
  const item = findLiterature(sysId)
  return item ? buildDetailMeta(item) : null
}
