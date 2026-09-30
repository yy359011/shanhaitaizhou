/**
 * 首页展示数据接口：推荐导读 / 山海十景 / 舌尖山海
 */
import { FOOD_ITEMS, SCENERY_SPOTS } from '@/mock/scenery'
import type { FoodItem, ScenerySpot } from '@/types'
import { http, mockDelay, USE_MOCK } from './request'

export function getScenerySpots(): Promise<ScenerySpot[]> {
  if (USE_MOCK) return mockDelay(SCENERY_SPOTS)
  return http<ScenerySpot[]>({ url: '/home/scenery', method: 'get' })
}

export function getFoodItems(): Promise<FoodItem[]> {
  if (USE_MOCK) return mockDelay(FOOD_ITEMS)
  return http<FoodItem[]>({ url: '/home/food', method: 'get' })
}
