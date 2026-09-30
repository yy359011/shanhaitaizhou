<script setup lang="ts">
/**
 * 公共布局：固定导航栏 + 内容区 + 版权栏
 * 首页（hero 满屏）不预留顶部内边距，其余页面按原型预留 64px
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { SYSTEM_SETTINGS } from '@/mock/admin'
import logoUrl from '@/images/logo.png'

const route = useRoute()
const router = useRouter()
const scrolled = ref(false)
const isHome = computed(() => route.name === 'home')

const navItems = [
  { key: 'home', label: '首页', name: 'home' },
  { key: 'search', label: '资源检索', name: 'search' },
  { key: 'categories', label: '分类导航', name: 'categories' },
  { key: 'graph', label: '知识图谱', name: 'knowledge-graph' },
]

/** 当前导航高亮项：detail/reader 等子页面根据来源模块联动 */
const activeNav = computed(() => {
  if (route.name === 'detail' || route.name === 'reader') {
    const from = route.query.from as string
    if (from === 'search') return 'search'
    if (from === 'home') return 'home'
    return 'categories'
  }
  return (route.meta.nav as string) || ''
})

function onScroll() {
  scrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="public-layout" :class="{ 'is-home': isHome }">
    <nav class="navbar" :class="{ scrolled }">
      <RouterLink class="navbar-brand" :to="{ name: 'home' }">
        <img class="brand-logo" :src="logoUrl" alt="山海台州" />
        <span class="brand-text">
          <span class="brand-name">{{ SYSTEM_SETTINGS.siteName }}</span>
          <span class="brand-sub">TAIZHOU CULTURE &amp; TOURISM MEMORY</span>
        </span>
      </RouterLink>

      <ul class="navbar-nav">
        <li v-for="item in navItems" :key="item.key">
          <RouterLink :to="{ name: item.name }" :class="{ active: activeNav === item.key }">
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>

      <div class="navbar-actions">
        <el-button text class="admin-entry" @click="router.push({ name: 'admin-login' })">后台管理</el-button>
      </div>
    </nav>

    <main class="public-main">
      <RouterView />
    </main>

    <footer class="site-footer">
      <div class="footer-slogan">{{ SYSTEM_SETTINGS.slogan }}</div>
      <div class="footer-org">{{ SYSTEM_SETTINGS.copyright }}</div>
    </footer>
  </div>
</template>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: var(--st-navbar-h);
}

.public-layout.is-home {
  padding-top: 0;
}

.public-main {
  flex: 1;
}

/* ---------- 导航栏 ---------- */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--st-navbar-h);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--st-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 var(--st-gutter);
  transition: box-shadow 0.3s;
}

.navbar.scrolled {
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-logo {
  height: 80px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--st-text);
  letter-spacing: 3px;
  font-family: var(--st-font-serif);
}

.brand-sub {
  font-size: 9px;
  color: var(--st-text-light);
  letter-spacing: 1.4px;
}

.navbar-nav {
  display: flex;
  gap: 6px;
  list-style: none;
}

.navbar-nav a {
  display: block;
  text-decoration: none;
  color: var(--st-text-secondary);
  font-size: 14px;
  padding: 8px 18px;
  border-radius: var(--st-radius-sm);
  transition: var(--st-transition);
  letter-spacing: 1px;
  white-space: nowrap;
}

.navbar-nav a:hover {
  color: var(--st-primary);
  background: var(--st-primary-soft-6);
}

.navbar-nav a.active {
  color: var(--st-primary);
  font-weight: 600;
  background: var(--st-primary-soft);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.admin-entry {
  color: var(--st-text-muted);
}

.admin-entry:hover {
  color: var(--st-primary);
}

/* ---------- 版权栏 ---------- */
.site-footer {
  background: #1a1a1a;
  padding: 36px var(--st-gutter);
  text-align: center;
}

.footer-slogan {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 6px;
  margin-bottom: 10px;
  font-weight: 300;
}

.footer-org {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 2px;
}

@media (max-width: 992px) {
  .brand-sub {
    display: none;
  }
  .navbar-nav a {
    padding: 8px 12px;
    letter-spacing: 0;
  }
}

@media (max-width: 768px) {
  .brand-text {
    display: none;
  }
  .admin-entry {
    display: none;
  }
}
</style>
