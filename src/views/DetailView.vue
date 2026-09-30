<script setup lang="ts">
/**
 * 文献元数据详情页
 * 1:1 还原原型 detail.html：头卡（封面 + 标签 + 题名 + 关键词 + 操作按钮）+ 著录字段分组卡
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CoverImage from '@/components/CoverImage.vue'
import { buildDetailMeta, getLiteratureDetail } from '@/api/literature'
import { getFieldSchema, getSchemaTitle, isEmptyMetaValue, splitKeywords } from '@/constants/schema'
import type { DetailMeta, LiteratureItem } from '@/types'

const route = useRoute()
const router = useRouter()

const item = ref<LiteratureItem | null>(null)
const meta = ref<DetailMeta | null>(null)
const loading = ref(true)

const schema = computed(() => (meta.value ? getFieldSchema(meta.value._type) : []))
const schemaTitle = computed(() => (meta.value ? getSchemaTitle(meta.value._type) : ''))
const isVideo = computed(() => meta.value?._type === '视频')
const totalFields = computed(() => schema.value.reduce((sum, g) => sum + g.fields.length, 0))
const keywords = computed(() => (meta.value ? splitKeywords(String(meta.value.keywords ?? '')) : []))

async function load() {
  loading.value = true
  try {
    const sysId = (route.query.sysId as string) || ''
    const id = (route.query.id as string) || ''
    const found = await getLiteratureDetail({ sysId, id })
    item.value = found
    meta.value = found ? buildDetailMeta(found) : null
  } finally {
    loading.value = false
  }
}

/** 空值判定（测试 / 暂无 / 公式占位等） */
function valueOf(key: string): string {
  if (!meta.value) return ''
  const raw = meta.value[key]
  return isEmptyMetaValue(raw) ? '' : String(raw ?? '').trim()
}

/** 进入本页的来源模块（各入口跳转时通过 query.from 透传） */
const from = (route.query.from as string) || 'categories'

/** 各来源模块对应的返回目标（路由名 + 面包屑文案） */
const BACK_TARGETS: Record<string, { name: string; label: string }> = {
  search: { name: 'search', label: '资源检索' },
  categories: { name: 'categories', label: '分类导航' },
  home: { name: 'home', label: '首页' },
}

const backTarget = computed(() => BACK_TARGETS[from] ?? BACK_TARGETS.categories)

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push({ name: backTarget.value.name })
}

function goReader() {
  if (!meta.value) return
  router.push({ name: 'reader', query: { sysId: meta.value._sysId, from } })
}

watch(() => [route.query.sysId, route.query.id], load)
onMounted(load)
</script>

<template>
  <div class="detail-page">
    <div class="breadcrumb">
      <RouterLink :to="{ name: 'home' }">首页</RouterLink>
      <span class="sep">/</span>
      <RouterLink :to="{ name: backTarget.name }">{{ backTarget.label }}</RouterLink>
      <span class="sep">/</span>
      <span class="current">{{ valueOf('title') || '文献详情' }}</span>
    </div>

    <div class="detail-wrap">
      <!-- 加载中 -->
      <div v-if="loading" class="not-found">
        <h2>加载中…</h2>
        <p>正在读取文献元数据</p>
      </div>

      <!-- 未找到 -->
      <div v-else-if="!meta || !item" class="not-found">
        <h2>未找到对应文献</h2>
        <p>参数异常或文献已被移除，请返回重新选择。</p>
        <button class="btn-back" type="button" @click="goBack">← 返回上一页</button>
      </div>

      <template v-else>
        <!-- 头卡 -->
        <div class="detail-header">
          <div class="cover-wrap">
            <CoverImage :src="meta._cover" :alt="valueOf('title')" />
          </div>

          <div class="info-block">
            <div class="meta-tags">
              <span v-if="meta._category" class="meta-tag category">{{ meta._category }}</span>
              <span class="meta-tag" :class="`type-${meta._type}`">{{ meta._type }}</span>
              <span class="meta-tag sysid">NO. {{ meta._sysId }}</span>
            </div>

            <h1 class="doc-title">{{ valueOf('title') || '未命名文献' }}</h1>

            <div class="doc-subtitle">
              <span><b>责任者</b>{{ valueOf('author') || '暂无' }}</span>
              <span v-if="isVideo ? valueOf('duration') : valueOf('publishDate')">
                <b>{{ isVideo ? '时长' : '出版日期' }}</b>
                {{ isVideo ? valueOf('duration') : valueOf('publishDate') }}
              </span>
              <span v-if="valueOf('classNo')"><b>分类号</b>{{ valueOf('classNo') }}</span>
            </div>

            <div class="kw-group">
              <template v-if="keywords.length">
                <span v-for="kw in keywords" :key="kw" class="kw-chip">{{ kw }}</span>
              </template>
              <span v-else class="kw-empty">暂无关键词</span>
            </div>

            <div class="action-row">
              <button class="btn-back" type="button" @click="goBack">← 返回上一页</button>
              <button class="btn-read" type="button" @click="goReader">查看/阅读</button>
            </div>
          </div>
        </div>

        <!-- 著录字段 -->
        <section class="section-card">
          <div class="section-title">
            {{ schemaTitle }}
            <span class="count">共 {{ totalFields }} 项著录字段</span>
          </div>

          <div
            v-for="group in schema"
            :key="group.group"
            class="meta-grid"
            :class="{ full: group.full || isVideo }"
          >
            <div class="section-subtitle">{{ group.group }}</div>
            <div v-for="field in group.fields" :key="field.key" class="meta-row">
              <div class="meta-label">{{ field.label }}</div>
              <div class="meta-value" :class="{ empty: !valueOf(field.key) }">
                {{ valueOf(field.key) || '暂无' }}
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
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
.detail-wrap {
  max-width: var(--st-content-max);
  margin: 0 auto;
  padding: 20px 48px 64px;
}

/* ---------- 头卡 ---------- */
.detail-header {
  background: #fff;
  border-radius: 24px;
  padding: 44px;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 48px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05);
  border: 1px solid #edeae5;
}

.cover-wrap {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
  aspect-ratio: 3 / 4;
  background: #e5e3df;
}

.cover-wrap :deep(.cover-img),
.cover-wrap :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-tag {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 13px;
  letter-spacing: 1.5px;
  font-weight: 500;
}

.type-图书 {
  background: color-mix(in srgb, var(--st-type-book) 10%, white);
  color: var(--st-type-book);
}

.type-折页 {
  background: color-mix(in srgb, var(--st-type-fold) 10%, white);
  color: var(--st-type-fold);
}

.type-期刊 {
  background: color-mix(in srgb, var(--st-type-journal) 10%, white);
  color: var(--st-type-journal);
}

.type-宣传册 {
  background: color-mix(in srgb, var(--st-type-brochure) 10%, white);
  color: var(--st-type-brochure);
}

.type-地图 {
  background: color-mix(in srgb, var(--st-type-map) 10%, white);
  color: var(--st-type-map);
}

.type-视频 {
  background: color-mix(in srgb, var(--st-type-video) 10%, white);
  color: var(--st-type-video);
}

.meta-tag.category {
  background: rgba(221, 113, 56, 0.1);
  color: var(--st-accent);
  border: 1px solid rgba(221, 113, 56, 0.2);
}

.meta-tag.sysid {
  background: rgba(0, 0, 0, 0.04);
  color: #6d6b66;
  font-family: 'Consolas', monospace;
  letter-spacing: 0.5px;
}

.doc-title {
  font-size: 34px;
  font-weight: 700;
  color: var(--st-text);
  letter-spacing: 2px;
  line-height: 1.35;
}

.doc-subtitle {
  font-size: 15px;
  color: #6d6b66;
  letter-spacing: 2px;
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  padding-top: 4px;
}

.doc-subtitle span b {
  color: var(--st-text);
  font-weight: 600;
  margin-right: 8px;
}

.kw-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 8px;
}

.kw-chip {
  padding: 6px 14px;
  border-radius: 8px;
  background: #f3f0eb;
  color: var(--st-text-secondary);
  font-size: 13px;
  letter-spacing: 1px;
  transition: all 0.2s;
}

.kw-chip:hover {
  background: rgba(232, 104, 43, 0.1);
  color: var(--st-primary);
}

.kw-empty {
  font-size: 13px;
  color: #b0ada6;
  letter-spacing: 1px;
}

.action-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: auto;
}

.btn-back,
.btn-read {
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 14px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.25s;
  border: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-back {
  background: var(--st-primary);
  color: #fff;
  box-shadow: 0 6px 18px rgba(232, 104, 43, 0.28);
}

.btn-back:hover {
  background: var(--st-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(232, 104, 43, 0.36);
}

.btn-read {
  background: #3E7272;
  color: #fff;
  box-shadow: 0 6px 18px rgba(62, 114, 114, 0.28);
}

.btn-read:hover {
  background: #345F5F;
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(62, 114, 114, 0.36);
}

/* ---------- 字段分组卡 ---------- */
.section-card {
  background: #fff;
  border-radius: 24px;
  padding: 40px 44px;
  margin-top: 28px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05);
  border: 1px solid #edeae5;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--st-text);
  letter-spacing: 3px;
  padding-left: 16px;
  border-left: 4px solid var(--st-primary);
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title .count {
  font-size: 13px;
  color: var(--st-text-light);
  letter-spacing: 1px;
  font-weight: 500;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 40px;
}

.meta-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  padding: 14px 0;
  border-bottom: 1px dashed #f0ede8;
  font-size: 14px;
  line-height: 1.8;
  align-items: start;
}

.meta-row:last-child,
.meta-row:nth-last-child(-n + 2) {
  border-bottom: none;
}

.meta-label {
  color: var(--st-text-light);
  letter-spacing: 1.5px;
  font-weight: 500;
  padding-right: 10px;
}

.meta-value {
  color: var(--st-text);
  word-break: break-all;
}

.meta-value.empty {
  color: #b0ada6;
}

.meta-grid.full .meta-row {
  grid-template-columns: 140px 1fr;
}

.section-subtitle {
  grid-column: 1 / -1;
  font-size: 15px;
  font-weight: 600;
  color: #3E7272;
  letter-spacing: 2px;
  padding: 8px 12px;
  background: rgba(62, 114, 114, 0.08);
  border-radius: 8px;
  margin: 6px 0 10px;
}

/* ---------- 404 / 加载 ---------- */
.not-found {
  background: #fff;
  border-radius: 24px;
  padding: 120px 40px;
  text-align: center;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05);
  border: 1px solid #edeae5;
}

.not-found h2 {
  font-size: 24px;
  color: var(--st-text);
  letter-spacing: 3px;
  margin-bottom: 12px;
}

.not-found p {
  color: var(--st-text-light);
  letter-spacing: 1.5px;
  margin-bottom: 32px;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1440px) {
  .breadcrumb {
    padding: 24px 40px 12px;
  }

  .detail-wrap {
    padding: 20px 40px 56px;
  }

  .detail-header {
    grid-template-columns: 320px 1fr;
    gap: 36px;
    padding: 36px;
  }

  .doc-title {
    font-size: 30px;
  }
}

@media (max-width: 1200px) {
  .breadcrumb {
    padding: 22px 32px 10px;
  }

  .detail-wrap {
    padding: 18px 32px 52px;
  }

  .detail-header {
    grid-template-columns: 280px 1fr;
    gap: 28px;
    padding: 32px;
  }

  .doc-title {
    font-size: 27px;
  }

  .section-card {
    padding: 34px 32px;
  }
}

@media (max-width: 1024px) {
  .breadcrumb {
    padding: 20px 24px 10px;
  }

  .detail-wrap {
    padding: 16px 24px 48px;
  }

  .detail-header {
    grid-template-columns: 240px 1fr;
    gap: 24px;
    padding: 28px;
  }

  .doc-title {
    font-size: 24px;
    letter-spacing: 1px;
  }

  .meta-grid {
    gap: 4px 28px;
  }

  .meta-row {
    grid-template-columns: 106px 1fr;
  }
}

@media (max-width: 960px) {
  .detail-header {
    grid-template-columns: 1fr;
    padding: 28px;
    gap: 28px;
  }

  .cover-wrap {
    max-width: 300px;
    margin: 0 auto;
    width: 100%;
  }

  .detail-wrap {
    padding: 20px 20px 48px;
  }

  .breadcrumb {
    padding: 24px 20px 10px;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }

  .section-card {
    padding: 28px 24px;
  }

  .section-title {
    font-size: 18px;
    letter-spacing: 2px;
  }
}

@media (max-width: 768px) {
  .breadcrumb {
    padding: 20px 16px 8px;
    font-size: 12px;
  }

  .detail-wrap {
    padding: 16px 16px 40px;
  }

  .detail-header {
    padding: 20px;
    gap: 20px;
    border-radius: 18px;
  }

  .doc-title {
    font-size: 21px;
  }

  .doc-subtitle {
    font-size: 14px;
    gap: 14px;
  }

  .action-row {
    gap: 10px;
  }

  .btn-back,
  .btn-read {
    flex: 1 1 100%;
    justify-content: center;
    padding: 11px 20px;
  }

  .section-card {
    padding: 22px 18px;
    border-radius: 18px;
  }

  .section-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .meta-row {
    grid-template-columns: 96px 1fr;
    font-size: 13px;
    padding: 12px 0;
  }

  .not-found {
    padding: 72px 24px;
  }
}
</style>
