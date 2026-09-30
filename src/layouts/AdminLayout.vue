<script setup lang="ts">
/**
 * 后台布局：顶栏 + 侧边菜单 + 内容区
 * 后台自成一套配色（墨绿主色），变量在此根节点声明并向后代继承
 */
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { setAdminLoggedIn } from '@/utils/auth'
import { SYSTEM_SETTINGS } from '@/mock/admin'

const route = useRoute()
const router = useRouter()

const MENU_SECTIONS = [
  { title: '系统管理', items: [{ name: 'admin-dashboard', label: '控制台' }] },
  {
    title: '内容管理',
    items: [
      { name: 'admin-data', label: '数据管理' },
      { name: 'admin-module', label: '模块设置' },
      { name: 'admin-layout', label: '布局调整' },
      { name: 'admin-field', label: '字段管理' },
    ],
  },
  {
    title: '系统设置',
    items: [
      { name: 'admin-user', label: '用户管理' },
      { name: 'admin-stats', label: '访问统计' },
      { name: 'admin-perm', label: '权限设置' },
      { name: 'admin-system', label: '系统设置' },
    ],
  },
]

const currentLabel = computed(() => (route.meta.title as string) || '管理系统')

function handleLogout() {
  setAdminLoggedIn(false)
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="admin-layout">
    <header class="topbar">
      <div class="topbar-left">
        <span class="topbar-logo">{{ SYSTEM_SETTINGS.siteName }}</span>
      </div>
      <div class="topbar-center">
        <div class="topbar-title">{{ currentLabel }}</div>
      </div>
      <div class="topbar-right">
        <div class="topbar-user">
          <el-icon><User /></el-icon>
          <span>管理员 admin</span>
        </div>
        <el-button text class="topbar-site" @click="router.push({ name: 'home' })">前台首页</el-button>
        <button class="topbar-logout" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <div class="app-body">
      <aside class="sidebar">
        <nav class="sidebar-menu">
          <div v-for="section in MENU_SECTIONS" :key="section.title" class="sidebar-section">
            <div class="sidebar-section-title">{{ section.title }}</div>
            <RouterLink
              v-for="item in section.items"
              :key="item.name"
              class="menu-item"
              :class="{ active: route.name === item.name }"
              :to="{ name: item.name }"
            >
              <span>{{ item.label }}</span>
            </RouterLink>
          </div>
        </nav>
        <div class="sidebar-footer">{{ SYSTEM_SETTINGS.version }} · © 2026 台州文旅</div>
      </aside>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  /* 后台专用变量：与原型 admin.html 的 :root 一致 */
  --primary: #5b8a7f;
  --primary-dark: #2c4a45;
  --primary-light: #e8f0ee;
  --accent: #c9a96e;
  --danger: #b85450;
  --info: #4a7c8c;
  --bg: #f5f3ef;
  --card: #fff;
  --border: #e5e3df;
  --text: #1a1a1a;
  --text-secondary: #6a6a6a;
  --text-light: #9a9a9a;
  --sidebar-w: 220px;

  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text);
}

/* ---------- 顶栏 ---------- */
.topbar {
  height: 56px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
}

.topbar-logo {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--primary-dark);
}

.topbar-center {
  flex: 1;
  text-align: center;
}

.topbar-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 280px;
  justify-content: flex-end;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.topbar-site {
  color: var(--primary);
  font-size: 13px;
}

.topbar-logout {
  padding: 6px 16px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.topbar-logout:hover {
  border-color: var(--danger);
  color: var(--danger);
}

/* ---------- 主体 ---------- */
.app-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.sidebar {
  width: var(--sidebar-w);
  background: var(--card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar-menu {
  flex: 1;
  padding: 12px 0;
}

.sidebar-section {
  margin-bottom: 8px;
}

.sidebar-section-title {
  padding: 10px 20px 4px;
  font-size: 11px;
  color: var(--text-light);
  letter-spacing: 1px;
  font-weight: 600;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 20px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  border-left: 3px solid transparent;
  white-space: nowrap;
  text-decoration: none;
}

.menu-item:hover {
  background: var(--primary-light);
  color: var(--primary-dark);
}

.menu-item.active {
  background: var(--primary-light);
  color: var(--primary-dark);
  border-left-color: var(--primary-dark);
  font-weight: 600;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-light);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}

.content::-webkit-scrollbar,
.sidebar::-webkit-scrollbar {
  width: 5px;
}

.content::-webkit-scrollbar-thumb,
.sidebar::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

@media (max-width: 1024px) {
  .topbar-left,
  .topbar-right {
    min-width: auto;
  }
  .topbar-logo {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  .sidebar-section-title,
  .sidebar-footer {
    display: none;
  }
  .menu-item {
    justify-content: center;
    padding: 12px 0;
  }
  .menu-item span {
    font-size: 12px;
  }
  .content {
    padding: 16px;
  }
}
</style>
