<script setup lang="ts">
/**
 * 资源检索页
 * 视觉：深墨绿渐变检索头 + 三段式检索条 + 热门标签 + 复选框精细筛选 + 卡片式结果列表
 */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { buildDetailMeta, countByCategory, countByType, getLiteratureList } from '@/api/literature'
import type { LiteratureFilter } from '@/api/literature'
import { CATEGORY_PAGE_SIZE, DOC_CATEGORIES, DOC_TYPES, splitKeywords } from '@/constants/schema'
import banner2Url from '@/images/banner2.jpeg'
import type { DetailMeta, DocCategory, DocType, LiteratureItem } from '@/types'

const route = useRoute()
const router = useRouter()

const heroStyle = {
  backgroundImage: `url(${banner2Url})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
}

const pageSize = CATEGORY_PAGE_SIZE

/** 检索范围（原型下拉项，当前与关键词检索等价） */
const SCOPE_OPTIONS = ['全文检索', '题名', '责任者', '关键词']
/** 排序方式（原型下拉项） */
const SORT_OPTIONS = ['相关度', '出版日期', '题名']
/** 热门检索词 */
const HOT_TAGS = ['台州', '饮食', '温岭', '古村落', '陶瓷', '非遗']

const searchScope = ref(SCOPE_OPTIONS[0])
const sortBy = ref(SORT_OPTIONS[0])
const keyword = ref((route.query.q as string) || '')
const activeKeyword = ref(keyword.value)
const selectedCategory = ref<DocCategory[]>([])
const selectedType = ref<DocType[]>([])
const currentPage = ref(1)

const rows = ref<LiteratureItem[]>([])
const total = ref(0)
const loading = ref(false)

/** 高级检索弹层 */
const showAdvanced = ref(false)
const advancedForm = reactive({
  title: '',
  authorExact: '',
  keywords: '',
  classNo: '',
  publisher: '',
  isbn: '',
  publishYear: '',
  publishPlace: '',
  litType: '全部' as '全部' | '图书' | '视频',
  matchMode: '模糊' as '模糊' | '精确',
})

const hasAdvancedFields = computed(() =>
  Boolean(
    advancedForm.title || advancedForm.authorExact || advancedForm.keywords || advancedForm.classNo ||
    advancedForm.publisher || advancedForm.isbn || advancedForm.publishYear || advancedForm.publishPlace
  )
)

const categoryCounts = computed(() => countByCategory())
const typeCounts = computed(() => countByType())
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const hasFilter = computed(
  () => Boolean(activeKeyword.value || selectedCategory.value.length || selectedType.value.length || hasAdvancedFields.value)
)

/** 结果项附加著录元数据（日期 / 分类号 / 出版者 / ISBN / 摘要） */
const resultRows = computed<Array<LiteratureItem & { meta: DetailMeta }>>(() =>
  rows.value.map((item) => ({ ...item, meta: buildDetailMeta(item) }))
)

/** 组装 filter，统一提供给 load() */
function buildFilter(advanced = false): LiteratureFilter {
  const base: LiteratureFilter = {
    keyword: activeKeyword.value.trim(),
    category: selectedCategory.value,
    type: selectedType.value,
  }
  if (!advanced) return base
  return {
    ...base,
    title: advancedForm.title.trim(),
    authorExact: advancedForm.authorExact.trim(),
    classNo: advancedForm.classNo.trim(),
    publisher: advancedForm.publisher.trim(),
    isbn: advancedForm.isbn.trim(),
    publishYear: advancedForm.publishYear.trim(),
    publishPlace: advancedForm.publishPlace.trim(),
    keywords: advancedForm.keywords.trim(),
    matchMode: advancedForm.matchMode,
    type:
      advancedForm.litType !== '全部'
        ? (advancedForm.litType as DocType)
        : selectedType.value,
  }
}

async function load(advanced = false) {
  loading.value = true
  try {
    const res = await getLiteratureList(buildFilter(advanced), { page: currentPage.value, pageSize })
    const pages = Math.max(1, Math.ceil(res.total / pageSize))
    if (currentPage.value > pages) {
      currentPage.value = pages
      return await load(advanced)
    }
    rows.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function applyKeyword() {
  const q = keyword.value.trim()
  activeKeyword.value = q
  currentPage.value = 1
  router.replace({ name: 'search', query: q ? { q } : undefined })
  load()
}

/** 点击热门标签：填入关键词并检索 */
function applyHotTag(tag: string) {
  keyword.value = tag
  applyKeyword()
}

function toggleCategory(cat: DocCategory) {
  const idx = selectedCategory.value.indexOf(cat)
  if (idx > -1) selectedCategory.value.splice(idx, 1)
  else selectedCategory.value.push(cat)
  currentPage.value = 1
  load(hasAdvancedFields.value)
}

function toggleType(type: DocType) {
  const idx = selectedType.value.indexOf(type)
  if (idx > -1) selectedType.value.splice(idx, 1)
  else selectedType.value.push(type)
  currentPage.value = 1
  load(hasAdvancedFields.value)
}

function resetFilter() {
  keyword.value = ''
  activeKeyword.value = ''
  selectedCategory.value = []
  selectedType.value = []
  resetAdvanced()
  currentPage.value = 1
  router.replace({ name: 'search' })
  load()
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value || p === currentPage.value) return
  currentPage.value = p
  load(hasAdvancedFields.value)
}

function goDetail(item: LiteratureItem) {
  router.push({ name: 'detail', query: { sysId: item.sysId, id: item.id, from: 'search' } })
}

function goRead(item: LiteratureItem) {
  router.push({ name: 'reader', query: { sysId: item.sysId, id: item.id, from: 'search' } })
}

/* ---- 高级检索弹层 ---- */
function openAdvanced() {
  showAdvanced.value = true
}

function resetAdvanced() {
  advancedForm.title = ''
  advancedForm.authorExact = ''
  advancedForm.keywords = ''
  advancedForm.classNo = ''
  advancedForm.publisher = ''
  advancedForm.isbn = ''
  advancedForm.publishYear = ''
  advancedForm.publishPlace = ''
  advancedForm.litType = '全部'
  advancedForm.matchMode = '模糊'
}

function submitAdvanced() {
  currentPage.value = 1
  load(true)
  showAdvanced.value = false
}

/** 关键词高亮（先转义再包裹，避免 XSS） */
function highlight(text: string): string {
  const raw = String(text ?? '')
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  const kw = activeKeyword.value.trim()
  if (!kw) return escaped
  const safeKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return escaped.replace(new RegExp(safeKw, 'gi'), (m) => `<mark>${m}</mark>`)
}

watch(
  () => route.query.q,
  (val) => {
    const next = (val as string) || ''
    if (next === activeKeyword.value) return
    keyword.value = next
    activeKeyword.value = next
    currentPage.value = 1
    load()
  }
)

onMounted(load)
</script>

<template>
  <div class="search-page">
    <!-- 检索头 -->
    <section class="search-hero" :style="heroStyle">
      <div class="hero-inner">
        <div class="search-panel">
          <label class="scope-field">
            <select v-model="searchScope" class="scope-select" aria-label="检索范围">
              <option v-for="opt in SCOPE_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <span class="scope-caret" aria-hidden="true" />
          </label>

          <el-input
            v-model="keyword"
            class="search-input"
            placeholder="请输入你的搜索内容…"
            clearable
            @keyup.enter="applyKeyword"
          />

          <button class="panel-btn btn-search" type="button" @click="applyKeyword">检索</button>
          <button class="panel-btn btn-advanced" type="button" @click="openAdvanced">高级检索</button>
        </div>

        <div class="hot-row">
          <span class="hot-label">热门:</span>
          <button
            v-for="tag in HOT_TAGS"
            :key="tag"
            class="hot-tag"
            type="button"
            @click="applyHotTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </section>

    <!-- 内容区 -->
    <div class="content-area">
      <div class="content-inner">
        <aside class="sidebar">
          <div class="sidebar-head">
            <h2 class="sidebar-title">精细筛选</h2>
            <button v-if="hasFilter" class="reset-btn" type="button" @click="resetFilter">
              重置
            </button>
          </div>

          <div class="filter-group">
            <div class="filter-group-title">主题分类</div>
            <ul class="filter-list">
              <li v-for="cat in DOC_CATEGORIES" :key="cat">
                <button
                  class="filter-item"
                  :class="{ active: selectedCategory.includes(cat) }"
                  type="button"
                  @click="toggleCategory(cat)"
                >
                  <span class="cb" aria-hidden="true" />
                  <span class="f-label">{{ cat }}</span>
                  <span class="f-count">{{ categoryCounts[cat] || 0 }}</span>
                </button>
              </li>
            </ul>
          </div>

          <div class="filter-group">
            <div class="filter-group-title">文献类型</div>
            <ul class="filter-list">
              <li v-for="type in DOC_TYPES" :key="type">
                <button
                  class="filter-item"
                  :class="{ active: selectedType.includes(type) }"
                  type="button"
                  @click="toggleType(type)"
                >
                  <span class="cb" aria-hidden="true" />
                  <span class="f-label">{{ type }}</span>
                  <span class="f-count">{{ typeCounts[type] || 0 }}</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <main class="main-panel">
          <div class="result-bar">
            <div class="result-info">
              <template v-if="activeKeyword">
                “<strong>{{ activeKeyword }}</strong>” 共 <strong>{{ total }}</strong> 条结果
              </template>
              <template v-else>共 <strong>{{ total }}</strong> 条结果</template>
            </div>

            <label class="sort-field">
              <span class="sort-label">排序:</span>
              <select v-model="sortBy" class="sort-select" aria-label="排序方式">
                <option v-for="opt in SORT_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <span class="sort-caret" aria-hidden="true" />
            </label>
          </div>

          <div class="result-list">
            <template v-if="!rows.length">
              <div class="empty-state">
                <p>{{ loading ? '文献加载中…' : '暂无符合当前检索条件的文献' }}</p>
              </div>
            </template>

            <template v-else>
              <article v-for="row in resultRows" :key="row.sysId" class="result-card">
                <div class="card-main">
                  <h3 class="card-title">
                    <a class="title-link" href="javascript:void(0)" @click="goDetail(row)">
                      <span v-html="highlight(row.title)" />
                    </a>
                  </h3>

                  <div class="card-meta">
                    <span class="meta-item">责任者 <span v-html="highlight(row.author)" /></span>
                    <span v-if="row.publishDate" class="meta-item">日期 {{ row.publishDate }}</span>
                    <span class="meta-item">分类号 {{ row.meta.classNo }}</span>
                    <span class="meta-item">出版者 {{ row.meta.publisher }}</span>
                    <span v-if="row.meta.isbn" class="meta-item">ISBN {{ row.meta.isbn }}</span>
                  </div>

                  <p v-if="row.meta.summary" class="card-summary">{{ row.meta.summary }}</p>

                  <div class="card-keywords">
                    <span v-for="kw in splitKeywords(row.keywords)" :key="kw" class="kw-chip">
                      {{ kw }}
                    </span>
                  </div>
                </div>

                <div class="card-side">
                  <span class="type-badge" :class="`t-${row.type}`">{{ row.type }}</span>
                  <div class="card-links">
                    <a class="side-link" href="javascript:void(0)" @click="goDetail(row)">元数据</a>
                    <a class="side-link" href="javascript:void(0)" @click="goRead(row)">阅读</a>
                  </div>
                </div>
              </article>
            </template>
          </div>

          <div v-if="totalPages > 1" class="pagination">
            <button class="prev-next" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">
              上一页
            </button>
            <button
              v-for="p in totalPages"
              :key="p"
              :class="{ active: p === currentPage }"
              @click="goPage(p)"
            >
              {{ p }}
            </button>
            <button
              class="prev-next"
              :disabled="currentPage === totalPages"
              @click="goPage(currentPage + 1)"
            >
              下一页
            </button>
          </div>
        </main>
      </div>
    </div>

    <!-- 高级检索弹层 -->
    <el-dialog
      v-model="showAdvanced"
      width="760px"
      :show-close="true"
      :append-to-body="true"
      :close-on-click-modal="true"
      custom-class="advanced-dialog"
      class="advanced-dialog-wrap"
    >
      <template #title>
        <div class="adv-title">高级检索 · 多字段组合</div>
      </template>

      <div class="adv-grid">
        <div class="adv-field">
          <label class="adv-label">题名</label>
          <el-input v-model="advancedForm.title" placeholder="精确题名" clearable />
        </div>
        <div class="adv-field">
          <label class="adv-label">责任者</label>
          <el-input v-model="advancedForm.authorExact" placeholder="作者/编者" clearable />
        </div>
        <div class="adv-field">
          <label class="adv-label">关键词</label>
          <el-input v-model="advancedForm.keywords" placeholder="多个关键词用空格分隔" clearable />
        </div>
        <div class="adv-field">
          <label class="adv-label">分类号</label>
          <el-input v-model="advancedForm.classNo" placeholder="如 TS972" clearable />
        </div>
        <div class="adv-field">
          <label class="adv-label">出版者</label>
          <el-input v-model="advancedForm.publisher" placeholder="出版社/机构" clearable />
        </div>
        <div class="adv-field">
          <label class="adv-label">ISBN</label>
          <el-input v-model="advancedForm.isbn" placeholder="ISBN 编号" clearable />
        </div>
        <div class="adv-field">
          <label class="adv-label">出版年</label>
          <el-input v-model="advancedForm.publishYear" placeholder="如 2022" clearable />
        </div>
        <div class="adv-field">
          <label class="adv-label">出版地</label>
          <el-input v-model="advancedForm.publishPlace" placeholder="出版城市" clearable />
        </div>
      </div>

      <div class="adv-footer">
        <div class="adv-row">
          <span class="adv-row-label">文献类型</span>
          <el-radio-group v-model="advancedForm.litType">
            <el-radio-button value="全部">全部</el-radio-button>
            <el-radio-button value="图书">图书</el-radio-button>
            <el-radio-button value="视频">视频</el-radio-button>
          </el-radio-group>
        </div>
        <div class="adv-row">
          <span class="adv-row-label">匹配方式</span>
          <el-radio-group v-model="advancedForm.matchMode">
            <el-radio-button value="模糊">模糊</el-radio-button>
            <el-radio-button value="精确">精确</el-radio-button>
          </el-radio-group>
        </div>
        <div class="adv-actions">
          <button type="button" class="adv-reset" @click="resetAdvanced">重置</button>
          <button type="button" class="adv-submit" @click="submitAdvanced">高级检索</button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
/* ---------- 检索头 ---------- */
.search-hero {
  position: relative;
  background: linear-gradient(105deg, #1F3754, #3E7272);
  padding: 0 20px;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, rgba(31, 55, 84, 0.4) 0%, rgba(62, 114, 114, 0.4) 100%);
  pointer-events: none;
  z-index: 0;
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1000px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search-panel {
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 56px;
  margin-top: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
}

.scope-field {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background: #f4f0e7;
  color: #5c5548;
  border-right: 1px solid #e6e0d3;
}

.scope-select {
  appearance: none;
  -webkit-appearance: none;
  height: 100%;
  padding: 0 34px 0 18px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: inherit;
  letter-spacing: 1px;
  cursor: pointer;
  outline: none;
}

.scope-caret {
  position: absolute;
  right: 15px;
  top: 50%;
  width: 0;
  height: 0;
  margin-top: -1px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid currentColor;
  pointer-events: none;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
}

.search-input :deep(.el-input__wrapper) {
  height: 100%;
  padding: 0 16px;
  background: transparent;
  box-shadow: none;
}

.search-input :deep(.el-input__inner) {
  height: 100%;
  font-size: 14px;
  color: var(--st-text);
}

.search-input :deep(.el-input__inner::placeholder) {
  color: var(--st-text-placeholder);
  letter-spacing: 1px;
}

.panel-btn {
  flex-shrink: 0;
  width: 96px;
  border: none;
  font-family: inherit;
  font-size: 15px;
  letter-spacing: 3px;
  cursor: pointer;
  transition: var(--st-transition);
}

.btn-search {
  background: #CAB477;
  color: #fff;
  font-weight: 600;
}

.btn-search:hover {
  background: #B09A5E;
}

.btn-advanced {
  width: 116px;
  background: #3E7272;
  color: #fff;
}

.btn-advanced:hover {
  background: #345F5F;
}

.hot-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.hot-label {
  font-size: 13px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.82);
}

.hot-tag {
  padding: 3px 12px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.92);
  font-family: inherit;
  font-size: 13px;
  color: var(--st-green);
  letter-spacing: 1px;
  cursor: pointer;
  transition: var(--st-transition);
}

.hot-tag:hover {
  background: #fff;
  color: var(--st-accent);
}

/* ---------- 内容区 ---------- */
.content-area {
  background: #fff;
}

.content-inner {
  display: flex;
  max-width: var(--st-content-max);
  margin: 0 auto;
  padding: 0 var(--st-gutter) 64px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  padding: 32px 24px 0 0;
  border-right: 1px solid var(--st-border-light);
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--st-text);
}

.reset-btn {
  border: none;
  background: transparent;
  padding: 0;
  font-family: inherit;
  font-size: 13px;
  color: var(--st-text-light);
  letter-spacing: 1px;
  cursor: pointer;
  transition: var(--st-transition);
}

.reset-btn:hover {
  color: var(--st-accent);
}

.filter-group {
  margin-top: 26px;
}

.filter-group-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--st-green);
  margin-bottom: 6px;
}

.filter-list li {
  margin-bottom: 2px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: var(--st-text-muted);
  letter-spacing: 1px;
  text-align: left;
  cursor: pointer;
  transition: var(--st-transition);
}

.filter-item:hover .f-label {
  color: var(--st-primary);
}

.cb {
  position: relative;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border: 1px solid #cfcbc3;
  border-radius: 2px;
  background: #fff;
  transition: var(--st-transition);
}

.filter-item.active .cb {
  background: var(--st-green);
  border-color: var(--st-green);
}

.filter-item.active .cb::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
}

.f-label {
  flex: 1;
  transition: var(--st-transition);
}

.filter-item.active .f-label {
  color: var(--st-green);
  font-weight: 600;
}

.f-count {
  font-size: 13px;
  color: var(--st-text-light);
}

.main-panel {
  flex: 1;
  min-width: 0;
  padding: 32px 0 0 var(--st-gutter);
}

.result-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--st-border-light);
}

.result-info {
  font-size: 14px;
  color: var(--st-text-muted);
  letter-spacing: 1px;
}

.result-info strong {
  color: var(--st-accent);
  font-weight: 600;
}

.sort-field {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--st-text-muted);
}

.sort-label {
  font-size: 13px;
  letter-spacing: 1px;
}

.sort-select {
  appearance: none;
  -webkit-appearance: none;
  padding: 0 22px 0 10px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  color: var(--st-text-secondary);
  letter-spacing: 1px;
  cursor: pointer;
  outline: none;
}

.sort-caret {
  position: absolute;
  right: 4px;
  top: 50%;
  width: 0;
  height: 0;
  margin-top: -1px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid currentColor;
  pointer-events: none;
}

/* ---------- 结果卡片 ---------- */
.result-card {
  display: flex;
  align-items: stretch;
  gap: 24px;
  padding: 22px 0;
  border-bottom: 1px solid var(--st-border-light);
}

.card-main {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.5;
}

.title-link {
  color: var(--st-text);
  cursor: pointer;
  transition: var(--st-transition);
}

.title-link:hover {
  color: var(--st-accent);
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  margin-top: 8px;
  font-size: 13px;
  color: var(--st-text-light);
  letter-spacing: 0.5px;
}

.card-summary {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--st-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.kw-chip {
  padding: 2px 10px;
  border-radius: 3px;
  background: #f4f1ea;
  font-size: 12px;
  color: var(--st-text-muted);
  letter-spacing: 1px;
}

.card-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}

.type-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1px;
  line-height: 1.5;
  color: #fff;
  white-space: nowrap;
}

.t-图书 {
  background: var(--st-type-book);
}

.t-折页 {
  background: var(--st-type-fold);
}

.t-期刊 {
  background: var(--st-type-journal);
}

.t-宣传册 {
  background: var(--st-type-brochure);
}

.t-地图 {
  background: var(--st-type-map);
}

.t-视频 {
  background: var(--st-type-video);
}

.card-links {
  display: flex;
  gap: 16px;
}

.side-link {
  font-size: 13px;
  color: var(--st-text-light);
  letter-spacing: 1px;
  cursor: pointer;
  transition: var(--st-transition);
}

.side-link:hover {
  color: var(--st-accent);
}

/* 关键词高亮 */
.main-panel :deep(mark) {
  background: rgba(221, 113, 56, 0.18);
  color: var(--st-accent-deep);
  padding: 0 2px;
  border-radius: 2px;
}

.empty-state {
  padding: 90px 20px;
  text-align: center;
  color: var(--st-text-light);
}

.empty-state p {
  letter-spacing: 1px;
}

/* ---------- 分页 ---------- */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 36px;
}

.pagination button {
  border: 1px solid var(--st-border);
  background: #fff;
  color: var(--st-text-secondary);
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  transition: var(--st-transition);
}

.pagination button:hover:not(:disabled) {
  border-color: var(--st-primary);
  color: var(--st-primary);
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination button.active {
  background: var(--st-primary);
  color: #fff;
  border-color: var(--st-primary);
}

.pagination .prev-next {
  padding: 0 14px;
  letter-spacing: 1px;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1200px) {
  .search-hero {
    min-height: 260px;
  }
}

@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
    padding-right: 18px;
  }

  .main-panel {
    padding-left: 28px;
  }

  .panel-btn {
    width: 84px;
    font-size: 14px;
  }

  .btn-advanced {
    width: 100px;
  }
}

@media (max-width: 992px) {
  .content-inner {
    padding-bottom: 48px;
  }

  .main-panel {
    padding-left: 22px;
  }
}

@media (max-width: 768px) {
  .search-hero {
    min-height: 240px;
  }

  .search-panel {
    flex-wrap: wrap;
    height: auto;
    padding: 10px;
    gap: 10px;
  }

  .scope-field,
  .search-input {
    flex: 1 1 100%;
    height: 42px;
    border-radius: 6px;
  }

  .scope-field {
    border-right: none;
    background: #f4f0e7;
  }

  .search-input :deep(.el-input__wrapper) {
    padding: 0 12px;
    box-shadow: 0 0 0 1px var(--st-border) inset;
    border-radius: 6px;
  }

  .panel-btn {
    flex: 1;
    height: 42px;
    border-radius: 6px;
  }

  .content-inner {
    flex-direction: column;
    padding-bottom: 44px;
  }

  .sidebar {
    width: 100%;
    padding: 24px 0 18px;
    border-right: none;
    border-bottom: 1px solid var(--st-border-light);
  }

  .filter-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 24px;
  }

  .filter-list li {
    margin-bottom: 0;
  }

  .filter-item {
    width: auto;
    gap: 8px;
    padding: 6px 0;
  }

  .main-panel {
    padding: 22px 0 0;
  }

  .result-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .result-card {
    gap: 14px;
  }
}
</style>

<style>
/* ---------- 高级检索弹层（非 scoped，因为 el-dialog append-to-body） ---------- */
.advanced-dialog {
  border-radius: 14px !important;
  overflow: hidden;
}

.advanced-dialog .el-dialog__header {
  padding: 22px 28px 0;
  margin-right: 0;
}

.advanced-dialog .el-dialog__body {
  padding: 18px 28px 22px;
}

.advanced-dialog .el-dialog__footer {
  display: none;
}

.adv-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--st-primary);
}

.advanced-dialog .el-dialog__headerbtn .el-dialog__close {
  font-size: 20px;
  color: var(--st-text-light);
}

.adv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
}

.adv-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.adv-label {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--st-text-muted);
}

.advanced-dialog .el-input__wrapper {
  border-radius: 6px;
  box-shadow: 0 0 0 1px var(--st-border) inset;
  transition: var(--st-transition);
}

.advanced-dialog .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--st-primary) inset !important;
}

.adv-footer {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 24px;
}

.adv-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.adv-row-label {
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--st-text-muted);
}

.advanced-dialog .el-radio-button__inner {
  padding: 8px 16px;
  font-size: 13px;
  letter-spacing: 1px;
  border-radius: 6px;
}

.advanced-dialog .el-radio-button__original-radio:checked + .el-radio-button__inner {
  background: #3E7272;
  border-color: #3E7272;
  box-shadow: -1px 0 0 0 #3E7272;
  color: #fff;
}

.adv-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.adv-reset {
  border: 1px solid var(--st-border);
  background: #fff;
  color: var(--st-text-muted);
  padding: 8px 22px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: var(--st-transition);
}

.adv-reset:hover {
  border-color: var(--st-primary);
  color: var(--st-primary);
}

.adv-submit {
  border: none;
  background: #3E7272;
  color: #fff;
  padding: 9px 28px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: var(--st-transition);
}

.adv-submit:hover {
  background: #345F5F;
}

@media (max-width: 768px) {
  .adv-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .adv-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .adv-actions {
    margin-left: 0;
    justify-content: flex-end;
  }
}
</style>
