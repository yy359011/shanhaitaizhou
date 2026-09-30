/**
 * 登录态工具（仅后台管理）
 * 原型凭证：后台 admin / 123456（admin.html）
 */

const ADMIN_KEY = 'st_admin_logged_in'

/** 后台账号 */
export const ADMIN_ACCOUNT = { username: 'admin', password: '123456' } as const

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem(ADMIN_KEY) === 'true'
}

export function setAdminLoggedIn(value: boolean): void {
  if (value) sessionStorage.setItem(ADMIN_KEY, 'true')
  else sessionStorage.removeItem(ADMIN_KEY)
}
