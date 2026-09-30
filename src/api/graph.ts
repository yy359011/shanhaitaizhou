/**
 * 知识图谱接口：按分类取图谱列表 / 按 id 取单个图谱
 */
import { GRAPH_DATA, getGraphsByCategory } from '@/mock/graph'
import type { GraphCategory, GraphData } from '@/types'
import { http, mockDelay, USE_MOCK } from './request'

/** 左侧分类名称与配色（与原型知识图谱侧栏一致） */
export { GRAPH_CATEGORY_META, GRAPH_CATEGORY_ORDER } from '@/mock/graph'

export function getGraphList(category: GraphCategory): Promise<GraphData[]> {
  if (USE_MOCK) return mockDelay(getGraphsByCategory(category))
  return http<GraphData[]>({ url: '/graph/list', method: 'get', params: { category } })
}

export function getGraphById(id: string): Promise<GraphData | null> {
  if (USE_MOCK) return mockDelay(GRAPH_DATA[id] || null)
  return http<GraphData>({ url: `/graph/${id}`, method: 'get' })
}
