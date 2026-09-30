/**
 * axios 实例与统一请求封装
 *
 * 数据源切换：
 *   VITE_USE_MOCK=true  → 走 src/mock 下的本地数据（默认，可脱离后端独立运行）
 *   VITE_USE_MOCK=false → 走 /api 前缀，由 vite proxy 转发至 SpringBoot3（VITE_API_BASE_URL）
 *
 * 后端约定响应体：{ code, message, data }，code === 0 / 200 视为成功。
 */
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { ApiResult } from '@/types'

/** 是否使用本地 mock 数据 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const apiPrefix = import.meta.env.VITE_API_PREFIX || '/api'

const instance: AxiosInstance = axios.create({
  baseURL: apiPrefix,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('st_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

/** 发起真实后端请求，并解包 ApiResult */
export async function http<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await instance.request<ApiResult<T>>(config)
  const body = res.data
  if (body && typeof body.code === 'number' && body.code !== 0 && body.code !== 200) {
    throw new Error(body.message || '请求失败')
  }
  return body?.data as T
}

/** mock 场景下模拟网络延迟，避免页面数据瞬时闪烁 */
export function mockDelay<T>(data: T, delay = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay))
}
