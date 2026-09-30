<script setup lang="ts">
/**
 * 文献细览（阅读）页
 * 1:1 还原原型 reader.html：导览行 + PDF iframe / 视频播放器
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resolveLiterature } from '@/api/literature'
import { LITERATURE_DATA } from '@/mock/literature'
import { DOC_PDFS, FALLBACK_BOOK, NINGBO_VIDEO, lectureVideoPath } from '@/constants/resources'
import { getVideoDisplayIndex } from '@/utils/cover'
import type { LiteratureItem } from '@/types'

const route = useRoute()
const router = useRouter()

const item = ref<LiteratureItem | null>(null)
const resourceUrl = ref('')
const loading = ref(true)
/** 媒体文件是否可访问：null=检测中 true=可用 false=缺失 */
const available = ref<boolean | null>(null)

const isVideo = computed(() => item.value?.type === '视频')

function resolveResource(target: LiteratureItem): string {
  if (target.type === '视频') {
    if (target.title === '样例：宁波大学图书馆') return NINGBO_VIDEO
    const displayIndex = getVideoDisplayIndex(LITERATURE_DATA, target.sysId)
    const lectureIdx = Math.max(displayIndex - 2, 0)
    return lectureVideoPath(lectureIdx)
  }
  if (Object.prototype.hasOwnProperty.call(DOC_PDFS, target.title)) {
    return DOC_PDFS[target.title]
  }
  return ''
}

async function checkResource(url: string) {
  if (!url) {
    available.value = false
    return
  }
  try {
    const res = await fetch(url, { method: 'HEAD' })
    // Vite dev server 对不存在的静态资源会走 SPA fallback 返回 index.html（200 + text/html），
    // 需额外校验 Content-Type，避免把 HTML 兜底页误判为可用的 PDF/视频。
    const contentType = res.headers.get('content-type') || ''
    available.value = res.ok && !contentType.includes('text/html')
  } catch {
    available.value = false
  }
}

async function load() {
  loading.value = true
  available.value = null
  try {
    const sysId = (route.query.sysId as string) || ''
    const id = (route.query.id as string) || ''
    const found = resolveLiterature(sysId, id)
    if (!found) {
      item.value = null
      resourceUrl.value = ''
      return
    }

    // 非视频且无对应 PDF：重定向到默认图书的细览页（等价原型 location.replace）
    if (found.type !== '视频' && !Object.prototype.hasOwnProperty.call(DOC_PDFS, found.title)) {
      const fallback = LITERATURE_DATA.find((it) => it.title === FALLBACK_BOOK)
      if (fallback && fallback.sysId !== found.sysId) {
        router.replace({ name: 'reader', query: { ...route.query, sysId: fallback.sysId, id: fallback.id } })
        return
      }
    }

    item.value = found
    resourceUrl.value = resolveResource(found)
    await checkResource(resourceUrl.value)
  } finally {
    loading.value = false
  }
}

/** 进入本页的来源模块（各入口跳转时通过 query.from 透传） */
const from = (route.query.from as string) || 'categories'

/** 面包屑中间层文案 */
const backLabel = computed(() => {
  if (from === 'search') return '资源检索'
  if (from === 'home') return '首页'
  return '分类导航'
})

/** 返回目标路由 */
const backRoute = computed(() => {
  if (from === 'search') return { name: 'search' }
  if (from === 'home') return { name: 'home' }
  return { name: 'categories' }
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push(backRoute.value)
}

function goDetail() {
  if (!item.value) return
  router.push({ name: 'detail', query: { sysId: item.value.sysId, id: item.value.id, from } })
}

watch(() => [route.query.sysId, route.query.id], load)
onMounted(load)
</script>

<template>
  <div class="reader-page">
    <div class="breadcrumb">
      <RouterLink :to="{ name: 'home' }">首页</RouterLink>
      <span class="sep">/</span>
      <RouterLink :to="backRoute">{{ backLabel }}</RouterLink>
      <span class="sep">/</span>
      <span class="current">{{ item?.title || '文献细览' }}</span>
    </div>

    <div class="reader-wrap">
      <div v-if="loading" class="not-found">
        <h2>加载中…</h2>
        <p>正在准备阅读资源</p>
      </div>

      <div v-else-if="!item" class="not-found">
        <h2>未找到对应文献</h2>
        <p>参数异常或文献已被移除，请返回重新选择。</p>
        <button class="btn btn-back" type="button" @click="goBack">← 返回{{ backLabel }}</button>
      </div>

      <template v-else>
        <!-- 导览行 -->
        <div class="reader-bar">
          <div class="reader-bar-left">
            <span class="reader-type-badge" :class="{ video: isVideo }">
              {{ isVideo ? '视频' : item.type }}
            </span>
            <span class="reader-title">{{ item.title || '文献细览' }}</span>
          </div>
          <div class="reader-bar-right">
            <button class="btn btn-meta" type="button" @click="goDetail">返回元数据</button>
            <button class="btn btn-back" type="button" @click="goBack">← 返回{{ backLabel }}</button>
          </div>
        </div>

        <!-- 媒体缺失提示 -->
        <div v-if="available === false" class="not-found media-missing">
          <h2>阅读资源暂未部署</h2>
          <p>
            未能在 <code>{{ resourceUrl || '指定的资源目录' }}</code> 中找到该
            {{ isVideo ? '视频' : 'PDF' }} 文件。<br />
            请将媒体文件放入 <code>public/resources/台州地方文献项目（临时）</code> 目录后刷新页面。
          </p>
          <button class="btn btn-back" type="button" @click="goDetail">返回元数据</button>
        </div>

        <!-- 视频播放 -->
        <div v-else-if="isVideo" class="video-container">
          <video controls autoplay :src="resourceUrl">
            您的浏览器不支持视频播放。
          </video>
          <div class="video-info">
            <b>{{ item.title }}</b> · 责任者：{{ item.author }} · 出版日期：{{ item.publishDate }}
          </div>
        </div>

        <!-- PDF 阅读 -->
        <div v-else class="pdf-container">
          <iframe :src="resourceUrl" :title="item.title" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.reader-page {
  min-height: 100%;
  background: var(--st-bg);
}

/* ---------- 面包屑 ---------- */
.breadcrumb {
  max-width: var(--st-content-max);
  margin: 0 auto;
  padding: 28px 48px 12px;
  font-size: 13px;
  color: var(--st-text-light);
  letter-spacing: 1px;
}

.breadcrumb a {
  color: var(--st-text-secondary);
  transition: color 0.2s;
}

.breadcrumb a:hover {
  color: var(--st-primary);
}

.breadcrumb .sep {
  margin: 0 10px;
  color: #c8c5be;
}

.breadcrumb .current {
  color: var(--st-text);
}

/* ---------- 主容器 ---------- */
.reader-wrap {
  max-width: var(--st-content-max);
  margin: 0 auto;
  padding: 8px 48px 24px;
}

/* ---------- 导览行 ---------- */
.reader-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  background: #fff;
  border-radius: 16px;
  padding: 16px 28px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #edeae5;
}

.reader-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.reader-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--st-text);
}

.reader-type-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #fff;
  background: var(--st-teal);
  letter-spacing: 1px;
  white-space: nowrap;
}

.reader-type-badge.video {
  background: var(--st-primary);
}

.reader-bar-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 13px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.25s;
  border: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-back {
  background: var(--st-primary);
  color: #fff;
  box-shadow: 0 4px 14px rgba(232, 104, 43, 0.24);
}

.btn-back:hover {
  background: var(--st-primary-dark);
  transform: translateY(-2px);
}

.btn-meta {
  background: #fff;
  color: var(--st-text-secondary);
  border: 1.5px solid var(--st-border);
}

.btn-meta:hover {
  border-color: var(--st-primary);
  color: var(--st-primary);
}

/* ---------- PDF ---------- */
.pdf-container {
  width: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
  border: 1px solid #edeae5;
}

.pdf-container iframe {
  width: 100%;
  height: calc(100vh - 220px);
  min-height: 600px;
  border: none;
  display: block;
}

/* ---------- 视频 ---------- */
.video-container {
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
  border: 1px solid #edeae5;
  text-align: center;
}

.video-container video {
  width: 100%;
  max-width: 900px;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  border-radius: 12px;
  background: #000;
}

.video-info {
  margin-top: 16px;
  font-size: 14px;
  color: var(--st-text-light);
  letter-spacing: 1px;
}

.video-info b {
  color: var(--st-text-secondary);
}

/* ---------- 加载 / 未找到 / 资源缺失 ---------- */
.not-found {
  background: #fff;
  border-radius: 24px;
  padding: 64px;
  text-align: center;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05);
  border: 1px solid #edeae5;
}

.not-found h2 {
  font-size: 24px;
  margin-bottom: 16px;
  letter-spacing: 2px;
}

.not-found p {
  color: var(--st-text-light);
  letter-spacing: 1.5px;
  margin-bottom: 32px;
  line-height: 1.9;
}

.not-found code {
  font-family: 'Consolas', monospace;
  background: var(--st-bg);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--st-primary-deep);
}

.media-missing {
  padding: 72px 40px;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1440px) {
  .breadcrumb {
    padding: 24px 40px 12px;
  }

  .reader-wrap {
    padding: 8px 40px 24px;
  }
}

@media (max-width: 1200px) {
  .breadcrumb {
    padding: 22px 32px 10px;
  }

  .reader-wrap {
    padding: 8px 32px 24px;
  }
}

@media (max-width: 1024px) {
  .breadcrumb {
    padding: 20px 24px 10px;
  }

  .reader-wrap {
    padding: 8px 24px 24px;
  }

  .reader-title {
    font-size: 18px;
  }
}

@media (max-width: 960px) {
  .breadcrumb {
    padding: 24px 20px 10px;
  }

  .reader-wrap {
    padding: 8px 20px 24px;
  }

  .reader-bar {
    padding: 12px 16px;
  }

  .reader-title {
    font-size: 16px;
  }

  .pdf-container iframe {
    height: calc(100vh - 260px);
    min-height: 460px;
  }

  .video-container {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .breadcrumb {
    padding: 20px 16px 8px;
    font-size: 12px;
  }

  .reader-wrap {
    padding: 8px 16px 20px;
  }

  .reader-bar-left {
    flex-wrap: wrap;
    gap: 8px;
  }

  .reader-bar-right {
    width: 100%;
  }

  .reader-bar-right .btn {
    flex: 1;
    justify-content: center;
  }

  .not-found {
    padding: 48px 20px;
    border-radius: 18px;
  }

  .not-found h2 {
    font-size: 20px;
  }
}
</style>
