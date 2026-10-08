/**
 * 路由配置
 * 依据原型：index-user / search / categories / detail / reader / knowledge-graph
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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

  return true
})

export default router
