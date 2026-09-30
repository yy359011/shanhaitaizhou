<script setup lang="ts">
/**
 * 分类导航页
 * 1:1 还原原型 categories.html：一级分类图卡 + 类型侧栏筛选 + 结果表格 + 分页
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { countByCategory, countByType, getLiteratureList } from '@/api/literature'
import { CATEGORY_PAGE_SIZE, DOC_TYPES } from '@/constants/schema'
import yinshiUrl from '@/images/yinshi.jpeg'
import ziranUrl from '@/images/ziran.jpeg'
import feiyiUrl from '@/images/feiyi.jpeg'
import renwenUrl from '@/images/renwen.jpeg'
import type { DocCategory, DocType, LiteratureItem } from '@/types'

const router = useRouter()

const CATEGORY_CARDS: Array<{ name: DocCategory; image: string }> = [
  { name: '饮食文化', image: yinshiUrl },
  { name: '自然景观', image: ziranUrl },
  { name: '非遗传承', image: feiyiUrl },
  { name: '人文历史', image: renwenUrl },
]

const pageSize = CATEGORY_PAGE_SIZE

const selectedCategory = ref<DocCategory | ''>('')
const selectedType = ref<DocType | ''>('')
const currentPage = ref(1)

const rows = ref<LiteratureItem[]>([])
const total = ref(0)
const loading = ref(false)

const categoryCounts = computed(() => countByCategory())
const typeCounts = computed(() => countByType())
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const hasFilter = computed(() => Boolean(selectedCategory.value || selectedType.value))

async function load() {
  loading.value = true
  try {
    const res = await getLiteratureList(
      { category: selectedCategory.value, type: selectedType.value },
      { page: currentPage.value, pageSize }
    )
    const pages = Math.max(1, Math.ceil(res.total / pageSize))
    if (currentPage.value > pages) {
      currentPage.value = pages
      return await load()
    }
    rows.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function toggleCategory(cat: DocCategory) {
  selectedCategory.value = selectedCategory.value === cat ? '' : cat
  currentPage.value = 1
  load()
}

function toggleType(type: DocType) {
  selectedType.value = selectedType.value === type ? '' : type
  currentPage.value = 1
  load()
}

function resetFilter() {
  selectedCategory.value = ''
  selectedType.value = ''
  currentPage.value = 1
  load()
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value || p === currentPage.value) return
  currentPage.value = p
  load()
}

function goDetail(item: LiteratureItem) {
  router.push({ name: 'detail', query: { sysId: item.sysId, id: item.id, from: 'categories' } })
}

onMounted(load)
</script>

<template>
  <div class="categories-page">
    <!-- 一级分类图卡 -->
    <section class="main-categories">
      <button
        v-for="card in CATEGORY_CARDS"
        :key="card.name"
        class="cat-btn"
        :class="{ active: selectedCategory === card.name }"
        type="button"
        @click="toggleCategory(card.name)"
      >
        <img class="cat-img" :src="card.image" :alt="card.name" />
        <span class="cat-text">
          <span class="cat-label">{{ card.name }}</span>
          <span class="count">{{ categoryCounts[card.name] || 0 }}</span>
        </span>
      </button>
    </section>

    <!-- 内容区 -->
    <div class="content-area">
      <aside class="sidebar">
        <div class="sidebar-title">文献类型</div>
        <ul class="type-list" id="typeList">
          <li v-for="type in DOC_TYPES" :key="type">
            <button
              class="type-btn"
              :class="{ active: selectedType === type }"
              type="button"
              @click="toggleType(type)"
            >
              <span>{{ type }}</span>
              <span class="tcount">{{ typeCounts[type] || 0 }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <main class="main-panel">
        <div class="result-bar">
          <div class="result-info">共 <strong>{{ total }}</strong> 条文献资源</div>
          <button v-if="hasFilter" class="reset-btn" type="button" @click="resetFilter">
            重置筛选
          </button>
        </div>

        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th class="col-no">序号</th>
                <th class="col-title">题名</th>
                <th class="col-author">责任者</th>
                <th class="col-keywords">关键词</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading && !rows.length">
                <td colspan="4"><div class="empty-state"><p>文献加载中…</p></div></td>
              </tr>
              <tr v-else-if="!rows.length">
                <td colspan="4">
                  <div class="empty-state">
                    <p>暂无符合当前筛选条件的文献</p>
                  </div>
                </td>
              </tr>
              <tr v-for="(item, idx) in rows" :key="item.sysId">
                <td class="col-no">{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
                <td class="col-title">
                  <a class="title-link" href="javascript:void(0)" @click="goDetail(item)">
                    {{ item.title }}
                  </a>
                  <span class="type-tag" :class="`t-${item.type}`">{{ item.type }}</span>
                </td>
                <td class="col-author">{{ item.author }}</td>
                <td class="col-keywords">{{ item.keywords }}</td>
              </tr>
            </tbody>
          </table>
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
</template>

<style scoped>
/* ---------- 一级分类图卡 ---------- */
.main-categories {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 28px;
  padding: 48px 48px 56px;
  background: #fff;
  border-bottom: 1px solid var(--st-border);
  width: 100%;
}

.cat-btn {
  border: none;
  background: #000;
  color: #fff;
  padding: 0;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.45s var(--st-ease);
  display: block;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  width: 280px;
  height: 520px;
  flex: 1 1 280px;
  position: relative;
}

.cat-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: all 0.45s var(--st-ease);
}

.cat-text {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 36px 18px 20px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.45) 55%,
    rgba(0, 0, 0, 0) 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  transition: all 0.45s var(--st-ease);
  color: #fff;
  pointer-events: none;
}

.cat-label {
  font-size: 20px;
  letter-spacing: 4px;
  font-weight: 700;
  writing-mode: vertical-rl;
  text-orientation: upright;
  transition: all 0.45s var(--st-ease);
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

.count {
  font-size: 14px;
  padding: 5px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  color: #fff;
  transition: all 0.45s var(--st-ease);
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.cat-btn:hover {
  flex: 6 1 560px;
  max-width: 620px;
  width: 560px;
  transform: translateY(-8px);
  box-shadow: 0 20px 56px rgba(232, 104, 43, 0.24);
  z-index: 2;
}

.cat-btn:hover .cat-img {
  transform: scale(1.04);
}

.cat-btn:hover .cat-label {
  writing-mode: horizontal-tb;
  font-size: 26px;
  letter-spacing: 6px;
}

.cat-btn:hover .count {
  font-size: 15px;
  padding: 6px 18px;
}

.cat-btn.active {
  flex: 6 1 560px;
  max-width: 620px;
  width: 560px;
  transform: translateY(-8px);
  box-shadow: 0 20px 56px rgba(232, 104, 43, 0.34);
  z-index: 1;
  outline: 3px solid var(--st-primary);
  outline-offset: -1px;
}

.cat-btn.active .cat-img {
  transform: scale(1.04);
}

.cat-btn.active .cat-text {
  background: linear-gradient(
    to top,
    rgba(232, 104, 43, 0.88) 0%,
    rgba(232, 104, 43, 0.55) 55%,
    rgba(232, 104, 43, 0) 100%
  );
}

.cat-btn.active .cat-label {
  writing-mode: horizontal-tb;
  font-size: 26px;
  letter-spacing: 6px;
}

.cat-btn.active .count {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.35);
  font-size: 15px;
  padding: 6px 18px;
}

/* ---------- 内容区 ---------- */
.content-area {
  display: flex;
  max-width: var(--st-content-max);
  margin: 0 auto;
  padding: 32px 20px 64px;
  gap: 24px;
  width: 100%;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid var(--st-primary);
}

.type-list li {
  margin-bottom: 0;
}

.type-btn {
  width: 100%;
  text-align: left;
  background: transparent;
  padding: 8px 0;
  border: none;
  border-radius: 0;
  font-size: 14px;
  color: var(--st-text-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: color 0.2s;
  letter-spacing: 1px;
  cursor: pointer;
}

.type-btn:hover {
  background: transparent;
  color: var(--st-primary);
}

.type-btn.active {
  background: var(--st-primary-soft-6);
  color: var(--st-primary);
  font-weight: 600;
  border-left: 3px solid var(--st-primary);
  padding-left: 9px;
}

.tcount {
  font-size: 13px;
  color: var(--st-text-light);
  background: transparent;
  padding: 0;
  border-radius: 0;
}

.type-btn.active .tcount {
  color: var(--st-primary);
  background: transparent;
}

.main-panel {
  flex: 1;
  min-width: 0;
}

.result-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 12px;
}

.result-info {
  font-size: 14px;
  color: var(--st-text-light);
  letter-spacing: 1px;
}

.result-info strong {
  color: var(--st-primary);
  font-weight: 600;
}

.reset-btn {
  border: 1px solid var(--st-border);
  background: #fff;
  color: var(--st-text-secondary);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  letter-spacing: 1px;
  transition: all 0.2s;
}

.reset-btn:hover {
  border-color: var(--st-primary);
  color: var(--st-primary);
}

/* ---------- 表格 ---------- */
.data-table {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  overflow-x: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--st-border);
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

.data-table th {
  background: var(--st-bg);
  color: var(--st-text);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 16px 18px;
  text-align: left;
  border-bottom: 1px solid var(--st-border);
}

.data-table td {
  padding: 16px 18px;
  font-size: 14px;
  color: var(--st-text-secondary);
  border-bottom: 1px solid #f0eeea;
  vertical-align: top;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover td {
  background: rgba(232, 104, 43, 0.02);
}

.col-no {
  width: 70px;
  color: var(--st-text-light);
}

.col-title {
  font-weight: 600;
  color: var(--st-text);
  max-width: 360px;
}

.col-author {
  color: var(--st-text-secondary);
  max-width: 240px;
}

.col-keywords {
  color: var(--st-text-light);
  font-size: 13px;
  max-width: 300px;
}

.type-tag {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
  letter-spacing: 1px;
  vertical-align: middle;
  white-space: nowrap;
}

.t-图书 {
  color: var(--st-type-book);
  background: rgba(58, 107, 77, 0.1);
}

.t-折页 {
  color: var(--st-type-fold);
  background: rgba(44, 95, 138, 0.1);
}

.t-期刊 {
  color: var(--st-type-journal);
  background: rgba(139, 94, 60, 0.1);
}

.t-宣传册 {
  color: var(--st-type-brochure);
  background: rgba(232, 104, 43, 0.1);
}

.t-地图 {
  color: var(--st-type-map);
  background: rgba(82, 163, 104, 0.1);
}

.t-视频 {
  color: var(--st-type-video);
  background: rgba(58, 124, 165, 0.1);
}

.title-link {
  color: var(--st-text);
  font-weight: 600;
  border-bottom: 1px dashed transparent;
  padding-bottom: 2px;
  transition: all 0.2s;
  cursor: pointer;
}

.title-link:hover {
  color: var(--st-primary);
  border-bottom-color: var(--st-primary);
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
  color: var(--st-text-light);
}

.empty-state p {
  margin-top: 12px;
  letter-spacing: 1px;
}

/* ---------- 分页 ---------- */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 32px;
}

.pagination button {
  border: 1px solid var(--st-border);
  background: #fff;
  color: var(--st-text-secondary);
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
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
@media (max-width: 1440px) {
  .main-categories {
    padding: 40px 40px 48px;
    gap: 22px;
  }

  .cat-btn {
    height: 460px;
    flex: 1 1 240px;
  }

  .cat-btn:hover,
  .cat-btn.active {
    flex: 6 1 480px;
    max-width: 540px;
    width: 480px;
  }
}

@media (max-width: 1200px) {
  .main-categories {
    padding: 36px 32px 44px;
    gap: 18px;
  }

  .cat-btn {
    height: 400px;
    flex: 1 1 200px;
    border-radius: 20px;
  }

  .cat-label {
    font-size: 18px;
  }

  .cat-btn:hover,
  .cat-btn.active {
    flex: 6 1 400px;
    max-width: 460px;
    width: 400px;
  }

  .cat-btn:hover .cat-label,
  .cat-btn.active .cat-label {
    font-size: 22px;
    letter-spacing: 5px;
  }
}

@media (max-width: 1024px) {
  .main-categories {
    padding: 32px 24px 40px;
    gap: 14px;
  }

  .cat-btn {
    height: 340px;
    border-radius: 18px;
  }

  .cat-btn:hover,
  .cat-btn.active {
    flex: 6 1 340px;
    max-width: 380px;
    width: 340px;
  }

  .content-area {
    gap: 18px;
  }

  .sidebar {
    width: 200px;
  }
}

@media (max-width: 992px) {
  .main-categories {
    flex-wrap: wrap;
    gap: 14px;
  }

  .cat-btn {
    flex: 1 1 calc(50% - 7px);
    max-width: calc(50% - 7px);
    width: calc(50% - 7px);
    height: 280px;
  }

  .cat-btn:hover,
  .cat-btn.active {
    flex: 1 1 calc(50% - 7px);
    max-width: calc(50% - 7px);
    width: calc(50% - 7px);
  }

  .cat-label {
    writing-mode: horizontal-tb;
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .main-categories {
    padding: 24px 16px 28px;
    gap: 12px;
  }

  .cat-btn {
    flex: 1 1 100%;
    max-width: 100%;
    width: 100%;
    height: 200px;
    border-radius: 16px;
  }

  .cat-btn:hover,
  .cat-btn.active {
    flex: 1 1 100%;
    max-width: 100%;
    width: 100%;
    transform: none;
  }

  .content-area {
    flex-direction: column;
    padding: 20px 16px 48px;
    gap: 20px;
  }

  .sidebar {
    width: 100%;
  }

  .type-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .type-list li {
    margin-bottom: 0;
    margin-right: 24px;
  }

  .type-btn {
    width: auto;
    gap: 10px;
    padding: 4px 0;
  }

  .result-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
