/**
 * 后台管理接口
 *
 * mock 模式下所有写操作作用于内存副本，刷新页面即恢复初始状态。
 */
import {
  ADMIN_USERS,
  BOOK_FIELD_CONFIGS,
  CATEGORY_CONFIG,
  IMPORT_LIMIT_MB,
  LAYOUT_BLOCKS,
  MODULE_CONFIGS,
  PAGE_RANK,
  PERM_ITEMS,
  PERM_ROLES,
  SYSTEM_SETTINGS,
  TODAY_VISITS,
  TYPE_CONFIG,
  UPLOAD_LIMIT_MB,
  VIDEO_FIELD_CONFIGS,
  VISIT_TREND,
} from '@/mock/admin'
import { LITERATURE_DATA } from '@/mock/literature'
import { GRAPH_CATEGORY_META, GRAPH_CATEGORY_ORDER, getGraphsByCategory } from '@/mock/graph'
import { DOC_CATEGORIES } from '@/constants/schema'
import type { AdminUser, DocCategory, DocType, FieldConfig, LiteratureItem } from '@/types'
import { http, mockDelay, USE_MOCK } from './request'

/* ==================== 控制台 ==================== */

export interface AdminStats {
  literatureTotal: number
  graphTotal: number
  userTotal: number
  todayVisits: number
}

export function getAdminStats(): Promise<AdminStats> {
  const graphTotal = GRAPH_CATEGORY_ORDER.reduce((sum, c) => sum + getGraphsByCategory(c).length, 0)
  const data: AdminStats = {
    // 原型控制台显示「文献总量 128」，其数据源为 127 条 + 1 条导入中的记录
    literatureTotal: LITERATURE_DATA.length + 1,
    graphTotal,
    userTotal: ADMIN_USERS.length,
    todayVisits: TODAY_VISITS,
  }
  if (USE_MOCK) return mockDelay(data)
  return http<AdminStats>({ url: '/admin/stats/overview', method: 'get' })
}

/** 分类文献数量统计 */
export function getCategoryStats(): Promise<Array<{ name: DocCategory; count: number }>> {
  const data = DOC_CATEGORIES.map((name) => ({
    name,
    count: LITERATURE_DATA.filter((it) => it.category === name).length,
  }))
  if (USE_MOCK) return mockDelay(data)
  return http({ url: '/admin/stats/category', method: 'get' })
}

/** 图谱分布统计 */
export function getGraphStats(): Promise<Array<{ name: string; count: number; color: string }>> {
  const data = GRAPH_CATEGORY_ORDER.map((c) => ({
    name: GRAPH_CATEGORY_META[c].name,
    count: getGraphsByCategory(c).length,
    color: GRAPH_CATEGORY_META[c].color,
  }))
  if (USE_MOCK) return mockDelay(data)
  return http({ url: '/admin/stats/graph', method: 'get' })
}

export function getVisitStats(): Promise<{
  trend: typeof VISIT_TREND
  today: number
  rank: typeof PAGE_RANK
}> {
  const data = { trend: VISIT_TREND, today: TODAY_VISITS, rank: PAGE_RANK }
  if (USE_MOCK) return mockDelay(data)
  return http({ url: '/admin/stats/visit', method: 'get' })
}

/* ==================== 数据管理（文献） ==================== */

const dataRows: LiteratureItem[] = LITERATURE_DATA.map((it) => ({ ...it }))

export function getDataRows(): Promise<LiteratureItem[]> {
  if (USE_MOCK) return mockDelay(dataRows.map((it) => ({ ...it })))
  return http<LiteratureItem[]>({ url: '/admin/literature/list', method: 'get' })
}

export function updateDataRow(sysId: string, patch: Partial<LiteratureItem>): Promise<void> {
  const index = dataRows.findIndex((it) => it.sysId === sysId)
  if (index >= 0) dataRows[index] = { ...dataRows[index], ...patch }
  if (USE_MOCK) return mockDelay(undefined)
  return http({ url: `/admin/literature/${sysId}`, method: 'put', data: patch })
}

export function deleteDataRow(sysId: string): Promise<void> {
  const index = dataRows.findIndex((it) => it.sysId === sysId)
  if (index >= 0) dataRows.splice(index, 1)
  if (USE_MOCK) return mockDelay(undefined)
  return http({ url: `/admin/literature/${sysId}`, method: 'delete' })
}

export interface AddLiteraturePayload {
  sysId?: string
  title: string
  author: string
  type: DocType
  category: DocCategory
  publishDate?: string
}

export function addDataRow(payload: AddLiteraturePayload): Promise<LiteratureItem> {
  const item: LiteratureItem = {
    id: String(dataRows.length + 1),
    sysId: payload.sysId || `NEW${Date.now()}`,
    title: payload.title,
    author: payload.author,
    keywords: '',
    type: payload.type,
    category: payload.category,
    publishDate: payload.publishDate || '',
    status: '已发布',
  }
  dataRows.unshift(item)
  if (USE_MOCK) return mockDelay(item)
  return http<LiteratureItem>({ url: '/admin/literature', method: 'post', data: payload })
}

/* ==================== 模块设置 ==================== */

export function getModuleConfigs() {
  return mockDelay(MODULE_CONFIGS)
}

export function getCategoryConfig(): Promise<DocCategory[]> {
  return mockDelay([...CATEGORY_CONFIG])
}

export function getTypeConfig(): Promise<DocType[]> {
  return mockDelay([...TYPE_CONFIG])
}

/* ==================== 字段管理 ==================== */

export function getFieldConfigs(type: 'book' | 'video'): Promise<FieldConfig[]> {
  const source = type === 'video' ? VIDEO_FIELD_CONFIGS : BOOK_FIELD_CONFIGS
  return mockDelay(source.map((f) => ({ ...f })))
}

export function updateFieldConfig(type: 'book' | 'video', code: string, patch: Partial<FieldConfig>): Promise<void> {
  const source = type === 'video' ? VIDEO_FIELD_CONFIGS : BOOK_FIELD_CONFIGS
  const index = source.findIndex((f) => f.code === code)
  if (index >= 0) source[index] = { ...source[index], ...patch }
  return mockDelay(undefined)
}

/* ==================== 布局调整 ==================== */

export function getLayoutBlocks(): Promise<typeof LAYOUT_BLOCKS> {
  return mockDelay(JSON.parse(JSON.stringify(LAYOUT_BLOCKS)))
}

/* ==================== 用户管理 ==================== */

const users: AdminUser[] = ADMIN_USERS.map((u) => ({ ...u }))

export function getUsers(): Promise<AdminUser[]> {
  if (USE_MOCK) return mockDelay(users.map((u) => ({ ...u })))
  return http<AdminUser[]>({ url: '/admin/users', method: 'get' })
}

export function toggleUserStatus(id: number, status: AdminUser['status']): Promise<void> {
  const index = users.findIndex((u) => u.id === id)
  if (index >= 0) users[index].status = status
  if (USE_MOCK) return mockDelay(undefined)
  return http({ url: `/admin/users/${id}`, method: 'put', data: { status } })
}

export function addUser(payload: Omit<AdminUser, 'id' | 'lastLogin'>): Promise<AdminUser> {
  const user: AdminUser = { ...payload, id: Date.now(), lastLogin: '—' }
  users.unshift(user)
  if (USE_MOCK) return mockDelay(user)
  return http<AdminUser>({ url: '/admin/users', method: 'post', data: payload })
}

/* ==================== 权限设置 ==================== */

export function getPermissionMatrix(): Promise<{
  roles: readonly string[]
  items: Array<{ name: string; values: boolean[] }>
}> {
  return mockDelay({
    roles: PERM_ROLES,
    items: PERM_ITEMS.map((i) => ({ name: i.name, values: [...i.values] })),
  })
}

/* ==================== 系统设置 ==================== */

export function getSystemSettings(): Promise<typeof SYSTEM_SETTINGS> {
  return mockDelay({ ...SYSTEM_SETTINGS })
}

/* ==================== 上传限制 ==================== */

export const LIMITS = { upload: UPLOAD_LIMIT_MB, import: IMPORT_LIMIT_MB }
