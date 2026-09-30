/**
 * 山海台州·文旅记忆 —— 全局类型定义
 * 与后台元数据著录表（图书 14 字段 / 视频 17 字段）保持一一对应
 */

/** 文献资源类型 */
export type DocType = '图书' | '折页' | '期刊' | '宣传册' | '地图' | '视频'

/** 一级分类 */
export type DocCategory = '饮食文化' | '自然景观' | '非遗传承' | '人文历史'

/** 文献条目（对应原型 data.js 中的 literatureData） */
export interface LiteratureItem {
  id: string
  sysId: string
  title: string
  author: string
  keywords: string
  type: DocType
  category: DocCategory
  /** 出版日期（列表页「出版日期」列） */
  publishDate?: string
  /** 发布状态（后台数据管理列） */
  status?: string
  /** 推荐导读使用的展示标签，如「历史文献」 */
  tag?: string
  /** 是否推荐到首页推荐导读 */
  recommend?: boolean
  /** 封面图（未提供时由封面池按序分配） */
  cover?: string
}

/** 图书元数据（14 字段） */
export interface BookMeta {
  sysId?: string
  title?: string
  author?: string
  classNo?: string
  language?: string
  isbn?: string
  keywords?: string
  summary?: string
  note?: string
  publisher?: string
  publishPlace?: string
  publishDate?: string
  format?: string
  pageCount?: string | number
}

/** 视频元数据（17 字段） */
export interface VideoMeta {
  sysId?: string
  title?: string
  author?: string
  respType?: string
  classNo?: string
  duration?: string
  audioLang?: string
  subLang?: string
  keywords?: string
  note?: string
  summary?: string
  mpgFormat?: string
  mpgSize?: string
  mpgDetail?: string
  mp4Format?: string
  mp4Size?: string
  mp4Detail?: string
}

/** 元数据键值对（图书 / 视频混合，供模板动态渲染） */
export type MetaRecord = Record<string, string | number | undefined>

/** 详情页渲染用的增强元数据 */
export interface DetailMeta extends MetaRecord {
  _type: DocType
  _category: DocCategory
  _cover: string
  _sysId: string
}

/** 著录字段模板 */
export interface FieldSchema {
  key: string
  label: string
  /** 是否为整行宽字段（长文本） */
  full?: boolean
}

/** 著录字段分组 */
export interface FieldGroupSchema {
  group: string
  fields: FieldSchema[]
  full?: boolean
}

/* ==================== 知识图谱 ==================== */

/** 节点类型 */
export type NodeGroup = 'core' | 'person' | 'institution' | 'event' | 'place'

/** 图谱分类（左侧导航） */
export type GraphCategory = 'persons' | 'institutions' | 'events' | 'places'

export interface GraphNode {
  id: string
  label: string
  /** 副标题（悬停提示） */
  sub?: string
  group: NodeGroup
  /** 描述（悬停提示） */
  desc?: string
}

export interface GraphEdge {
  source: string
  target: string
  label?: string
}

export interface GraphData {
  id: string
  category: GraphCategory
  title: string
  info: string
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/* ==================== 首页展示数据 ==================== */

/** 推荐导读卡片 */
export interface RecommendCard {
  sysId: string
  title: string
  tag: string
  cover: string
}

/** 山海十景 */
export interface ScenerySpot {
  name: string
  short: string
  img: string
  rating: string
  desc: string
  addr: string
  /** 关联知识图谱 id */
  graphId: string
}

/** 舌尖山海 */
export interface FoodItem {
  name: string
  region: string
  tag: string
  img: string
  graphId: string
  desc: string
  /** 关联的视频文献题名（有则点击跳元数据页，无则跳知识图谱） */
  videoTitle?: string
}

/* ==================== 通用 ==================== */

/** 统一响应体（与 SpringBoot3 后端约定） */
export interface ApiResult<T> {
  code: number
  message: string
  data: T
}

/** 分页结果 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 分页查询参数 */
export interface PageQuery {
  page?: number
  pageSize?: number
  keyword?: string
  category?: DocCategory | ''
  type?: DocType | ''
  sort?: string
}

/** 登录用户 */
export interface UserInfo {
  username: string
  nickname: string
  role: 'user' | 'admin'
  token: string
}

/** 后台用户列表项 */
export interface AdminUser {
  id: number
  username: string
  nickname: string
  role: string
  dept: string
  status: '启用' | '停用'
  lastLogin: string
}

/** 后台字段配置项 */
export interface FieldConfig {
  name: string
  code: string
  dataType: string
  required: '必填' | '选填'
  desc: string
  enabled: boolean
}

/** 后台模块开关 */
export interface ModuleConfig {
  name: string
  desc: string
  enabled: boolean
}
