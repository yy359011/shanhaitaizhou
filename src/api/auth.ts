/**
 * 登录接口（后台管理员）
 *
 * 原型凭证：后台 admin / 123456
 */
import { ADMIN_ACCOUNT } from '@/utils/auth'
import type { UserInfo } from '@/types'
import { http, mockDelay, USE_MOCK } from './request'

function buildUser(username: string, role: 'user' | 'admin'): UserInfo {
  return {
    username,
    nickname: role === 'admin' ? '系统管理员' : '台州市图书馆读者',
    role,
    token: `${role}-${Date.now()}`,
  }
}

/** 后台登录 */
export async function adminLogin(username: string, password: string): Promise<UserInfo> {
  if (USE_MOCK) {
    if (username !== ADMIN_ACCOUNT.username || password !== ADMIN_ACCOUNT.password) {
      throw new Error('管理员账号或密码错误')
    }
    return mockDelay(buildUser(username, 'admin'))
  }
  return http<UserInfo>({ url: '/auth/admin/login', method: 'post', data: { username, password } })
}
