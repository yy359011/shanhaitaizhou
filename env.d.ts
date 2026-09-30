/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

interface ImportMetaEnv {
  /** 是否启用本地 mock 数据（'true' | 'false'） */
  readonly VITE_USE_MOCK: string
  /** SpringBoot3 后端服务地址，仅用于 vite 代理 */
  readonly VITE_API_BASE_URL: string
  /** axios 请求前缀 */
  readonly VITE_API_PREFIX: string
  /** 站点标题 */
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
