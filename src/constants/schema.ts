/**
 * 著录字段模板与筛选常量
 * 完整取自原型 detail.html 的 BOOK_FIELD_SCHEMA / VIDEO_FIELD_SCHEMA
 * 以及 categories.html 的 PINNED_TITLES
 */
import type { DocCategory, DocType, FieldGroupSchema } from '@/types'

/** 图书模板：3 组 14 字段 */
export const BOOK_FIELD_SCHEMA: FieldGroupSchema[] = [
  {
    group: '基本信息',
    fields: [
      { key: 'sysId', label: '记录标识号' },
      { key: 'title', label: '正题名' },
      { key: 'author', label: '责任者' },
      { key: 'classNo', label: '分类号' },
      { key: 'language', label: '语种' },
      { key: 'isbn', label: 'ISBN' },
    ],
  },
  {
    group: '内容描述',
    fields: [
      { key: 'keywords', label: '关键词' },
      { key: 'summary', label: '摘要' },
      { key: 'note', label: '附注' },
    ],
  },
  {
    group: '出版信息',
    fields: [
      { key: 'publisher', label: '出版者' },
      { key: 'publishPlace', label: '出版地' },
      { key: 'publishDate', label: '出版日期' },
      { key: 'format', label: '格式' },
      { key: 'pageCount', label: '页数' },
    ],
  },
]

/** 视频模板：4 组 17 字段 */
export const VIDEO_FIELD_SCHEMA: FieldGroupSchema[] = [
  {
    group: '基本信息',
    fields: [
      { key: 'sysId', label: '记录标识号' },
      { key: 'title', label: '正题名' },
      { key: 'author', label: '责任者' },
      { key: 'respType', label: '责任方式' },
      { key: 'classNo', label: '分类号' },
      { key: 'duration', label: '时长' },
      { key: 'audioLang', label: '声道语种' },
      { key: 'subLang', label: '字幕语种' },
    ],
  },
  {
    group: '内容描述',
    fields: [
      { key: 'keywords', label: '关键词' },
      { key: 'note', label: '附注' },
      { key: 'summary', label: '简介' },
    ],
  },
  {
    group: '资源格式 · MPG主文件',
    full: true,
    fields: [
      { key: 'mpgFormat', label: '格式' },
      { key: 'mpgSize', label: '文件大小' },
      { key: 'mpgDetail', label: '技术细节', full: true },
    ],
  },
  {
    group: '资源格式 · MP4衍生文件',
    full: true,
    fields: [
      { key: 'mp4Format', label: '格式' },
      { key: 'mp4Size', label: '文件大小' },
      { key: 'mp4Detail', label: '技术细节', full: true },
    ],
  },
]

/** 按文献类型取字段模板：折页/期刊/宣传册/地图复用图书模板 */
export function getFieldSchema(type: DocType): FieldGroupSchema[] {
  return type === '视频' ? VIDEO_FIELD_SCHEMA : BOOK_FIELD_SCHEMA
}

/** 详情页字段卡标题 */
export function getSchemaTitle(type: DocType): string {
  return type === '视频'
    ? '视频资源 · 元数据著录（17 字段）'
    : `${type} · 元数据著录（14 字段）`
}

/** 全部文献类型（侧栏筛选项） */
export const DOC_TYPES: DocType[] = ['图书', '折页', '期刊', '宣传册', '地图', '视频']

/** 全部一级分类 */
export const DOC_CATEGORIES: DocCategory[] = ['饮食文化', '自然景观', '非遗传承', '人文历史']

/** 分类空筛选时置顶的题名（按此顺序） */
export const PINNED_TITLES = [
  '台州古村落',
  '温岭生态',
  '温岭老桥',
  '大陈岛志',
  '样例：宁波大学图书馆',
]

/** 分类导航列表页每页条数 */
export const CATEGORY_PAGE_SIZE = 10

/** 无值占位符判定 */
const EMPTY_TOKENS = ['', '测试', '暂无', '=RANDBETWEEN(150,560)']

/** 判断著录值是否为空 */
export function isEmptyMetaValue(value: unknown): boolean {
  if (value === null || value === undefined) return true
  return EMPTY_TOKENS.includes(String(value).trim())
}

/** 关键词拆分 */
export function splitKeywords(keywords: string): string[] {
  return String(keywords || '')
    .split(/[\s,，、;；/]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
