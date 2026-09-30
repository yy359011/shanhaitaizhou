/**
 * 路由配置
 * 依据原型：index-user / search / categories / detail / reader / knowledge-graph / admin
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { isAdminLoggedIn } from '@/utils/auth'

const routes: RouteRecordRaw[] = [
  /* ---------------- 前台公共布局 ---------------- */
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页', nav: 'home' },
      },
      {
        path: 'search',
        name: 'search',
        component: () => import('@/views/SearchView.vue'),
        meta: { title: '资源检索', nav: 'search' },
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('@/views/CategoriesView.vue'),
        meta: { title: '分类导航', nav: 'categories' },
      },
      {
        path: 'detail',
        name: 'detail',
        component: () => import('@/views/DetailView.vue'),
        meta: { title: '文献详情', nav: 'categories' },
      },
      {
        path: 'reader',
        name: 'reader',
        component: () => import('@/views/ReaderView.vue'),
        meta: { title: '文献细览', nav: 'categories' },
      },
    ],
  },

  /* ---------------- 知识图谱（自带全屏布局，不套公共页眉页脚） ---------------- */
  {
    path: '/knowledge-graph',
    name: 'knowledge-graph',
    component: () => import('@/views/KnowledgeGraphView.vue'),
    meta: { title: '知识图谱', nav: 'graph' },
  },

  /* ---------------- 后台管理 ---------------- */
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/AdminLoginView.vue'),
    meta: { title: '管理后台登录', public: true },
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '控制台' },
      },
      {
        path: 'data',
        name: 'admin-data',
        component: () => import('@/views/admin/DataView.vue'),
        meta: { title: '数据管理' },
      },
      {
        path: 'module',
        name: 'admin-module',
        component: () => import('@/views/admin/ModuleView.vue'),
        meta: { title: '模块设置' },
      },
      {
        path: 'layout',
        name: 'admin-layout',
        component: () => import('@/views/admin/LayoutView.vue'),
        meta: { title: '布局调整' },
      },
      {
        path: 'field',
        name: 'admin-field',
        component: () => import('@/views/admin/FieldView.vue'),
        meta: { title: '字段管理' },
      },
      {
        path: 'user',
        name: 'admin-user',
        component: () => import('@/views/admin/UserView.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'stats',
        name: 'admin-stats',
        component: () => import('@/views/admin/StatsView.vue'),
        meta: { title: '访问统计' },
      },
      {
        path: 'perm',
        name: 'admin-perm',
        component: () => import('@/views/admin/PermView.vue'),
        meta: { title: '权限设置' },
      },
      {
        path: 'system',
        name: 'admin-system',
        component: () => import('@/views/admin/SystemView.vue'),
        meta: { title: '系统设置' },
      },
    ],
  },

  /* ---------------- 兜底 ---------------- */
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} · 山海台州·文旅记忆` : '山海台州·文旅记忆'

  // 后台路由需管理员登录
  if (to.path.startsWith('/admin') && to.name !== 'admin-login') {
    if (!isAdminLoggedIn()) return { name: 'admin-login' }
    return true
  }

  return true
})

export default router
