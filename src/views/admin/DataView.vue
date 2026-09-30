<script setup lang="ts">
/**
 * 后台 · 数据管理
 * 原型：admin.html renderData() / 新增文献三步模态 / 上传与导入校验
 *
 * 说明：接口层的 LiteratureItem 为扁平结构，行内编辑的其余著录字段
 * （图书 14 / 视频 17）以视图内 metaMap 承载，与原型一行的 meta 语义一致。
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  addDataRow,
  getAdminStats,
  getDataRows,
  LIMITS,
  updateDataRow,
} from '@/api/admin'
import { DOC_CATEGORIES } from '@/constants/schema'
import type { DocCategory, DocType, LiteratureItem } from '@/types'

type TabKey = 'all' | 'book' | 'video' | 'graph'

const TYPE_FILTERS: DocType[] = ['图书', '视频']
const STATUS_FILTERS = ['已发布', '待审核']
const STEP_LABELS = ['选择类型', '编辑元数据', '上传文件']

const router = useRouter()

/* ==================== 列表 ==================== */

const rows = ref<LiteratureItem[]>([])
/** 行内编辑的著录字段（图书 / 视频），键为正题名对应的系统标识号 */
const metaMap = ref<Record<string, Record<string, string>>>({})

const activeTab = ref<TabKey>('all')
const keywordInput = ref('')
const keyword = ref('')
const filterCategory = ref('')
const filterType = ref('')
const filterStatus = ref('')
const graphTotal = ref(0)

const bookCount = computed(() => rows.value.filter((r) => r.type === '图书').length)
const videoCount = computed(() => rows.value.filter((r) => r.type === '视频').length)

const tabs = computed(() => [
  { key: 'all' as TabKey, label: `全部文献（${rows.value.length}）` },
  { key: 'book' as TabKey, label: `图书（${bookCount.value}）` },
  { key: 'video' as TabKey, label: `视频（${videoCount.value}）` },
  { key: 'graph' as TabKey, label: `知识图谱（${graphTotal.value}）` },
])

const filteredRows = computed(() => {
  let list = rows.value
  if (activeTab.value === 'book') list = list.filter((r) => r.type === '图书')
  if (activeTab.value === 'video') list = list.filter((r) => r.type === '视频')

  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (r) => r.title.toLowerCase().includes(kw) || r.sysId.toLowerCase().includes(kw),
    )
  }
  if (filterCategory.value) list = list.filter((r) => r.category === filterCategory.value)
  if (filterType.value) list = list.filter((r) => r.type === filterType.value)
  if (filterStatus.value) list = list.filter((r) => (r.status || '已发布') === filterStatus.value)
  return list
})

async function loadRows() {
  rows.value = await getDataRows()
}

async function loadGraphTotal() {
  graphTotal.value = (await getAdminStats()).graphTotal
}

function switchTab(tab: TabKey) {
  activeTab.value = tab
  cancelEdit()
}

function handleSearch() {
  keyword.value = keywordInput.value
}

function typeBadgeClass(type: DocType): string {
  return type === '视频' ? 'badge-red' : 'badge-green'
}

function categoryBadgeClass(category: DocCategory): string {
  if (category === '饮食文化') return 'badge-gold'
  if (category === '自然景观') return 'badge-blue'
  if (category === '非遗传承') return 'badge-red'
  return 'badge-green'
}

function openDetail(row: LiteratureItem) {
  const { href } = router.resolve({ name: 'detail', query: { id: row.id } })
  window.open(href, '_blank')
}

/* ==================== 行内编辑 ==================== */

interface EditFormState {
  sysId: string
  title: string
  author: string
  role: string
  classNo: string
  keywords: string
  summary: string
  note: string
  publisher: string
  publishPlace: string
  publishDate: string
  format: string
  pageCount: string
  language: string
  isbn: string
  mpgFormat: string
  mpgSize: string
  mpgDetail: string
  mp4Format: string
  mp4Size: string
  mp4Detail: string
  duration: string
  audioLang: string
  subtitleLang: string
}

function emptyEditForm(): EditFormState {
  return {
    sysId: '',
    title: '',
    author: '',
    role: '编导',
    classNo: '',
    keywords: '',
    summary: '',
    note: '',
    publisher: '',
    publishPlace: '',
    publishDate: '',
    format: 'PDF',
    pageCount: '',
    language: '中文',
    isbn: '',
    mpgFormat: '',
    mpgSize: '',
    mpgDetail: '',
    mp4Format: '',
    mp4Size: '',
    mp4Detail: '',
    duration: '',
    audioLang: '中文',
    subtitleLang: '中文',
  }
}

const editingSysId = ref('')
const editingType = ref<DocType>('图书')
const editForm = reactive<EditFormState>(emptyEditForm())

function openEdit(row: LiteratureItem) {
  const meta = metaMap.value[row.sysId] || {}
  Object.assign(editForm, emptyEditForm(), {
    sysId: meta.sysId || row.sysId,
    title: meta.title || row.title,
    author: meta.author || row.author,
    keywords: meta.keywords || row.keywords || '',
    publishDate: meta.publishDate || row.publishDate || '',
    role: meta.role || '编导',
    classNo: meta.classNo || '',
    summary: meta.summary || '',
    note: meta.note || '',
    publisher: meta.publisher || '',
    publishPlace: meta.publishPlace || '',
    format: meta.format || 'PDF',
    pageCount: meta.pageCount || '',
    language: meta.language || '中文',
    isbn: meta.isbn || '',
    mpgFormat: meta.mpgFormat || '',
    mpgSize: meta.mpgSize || '',
    mpgDetail: meta.mpgDetail || '',
    mp4Format: meta.mp4Format || '',
    mp4Size: meta.mp4Size || '',
    mp4Detail: meta.mp4Detail || '',
    duration: meta.duration || '',
    audioLang: meta.audioLang || '中文',
    subtitleLang: meta.subtitleLang || '中文',
  })
  editingSysId.value = row.sysId
  editingType.value = row.type
}

function cancelEdit() {
  editingSysId.value = ''
}

async function saveEdit() {
  const row = rows.value.find((r) => r.sysId === editingSysId.value)
  if (!row) {
    cancelEdit()
    return
  }

  const meta: Record<string, string> = { ...editForm }
  await updateDataRow(row.sysId, {
    sysId: editForm.sysId,
    title: editForm.title,
    author: editForm.author,
    keywords: editForm.keywords,
    publishDate: editForm.publishDate,
  })

  delete metaMap.value[row.sysId]
  metaMap.value[editForm.sysId] = meta

  row.sysId = editForm.sysId
  row.title = editForm.title
  row.author = editForm.author
  row.keywords = editForm.keywords
  row.publishDate = editForm.publishDate

  cancelEdit()
  ElMessage.success('元数据已保存')
}

/* ==================== 新增文献（三步模态） ==================== */

interface AddFormState {
  type: DocType
  sysId: string
  title: string
  author: string
  role: string
  classNo: string
  keywords: string
  summary: string
  note: string
  category: DocCategory | ''
  publisher: string
  publishPlace: string
  publishDate: string
  format: string
  pageCount: string
  language: string
  isbn: string
  mpgFormat: string
  mpgSize: string
  mpgDetail: string
  mp4Format: string
  mp4Size: string
  mp4Detail: string
  duration: string
  audioLang: string
  subtitleLang: string
}

function emptyAddForm(): AddFormState {
  return {
    type: '图书',
    sysId: '',
    title: '',
    author: '',
    role: '编导',
    classNo: '',
    keywords: '',
    summary: '',
    note: '',
    category: '',
    publisher: '',
    publishPlace: '',
    publishDate: '',
    format: 'PDF',
    pageCount: '',
    language: '中文',
    isbn: '',
    mpgFormat: '',
    mpgSize: '',
    mpgDetail: '',
    mp4Format: '',
    mp4Size: '',
    mp4Detail: '',
    duration: '',
    audioLang: '中文',
    subtitleLang: '中文',
  }
}

const addVisible = ref(false)
const addStep = ref(1)
const addForm = reactive<AddFormState>(emptyAddForm())

const uploadInput = ref<HTMLInputElement | null>(null)
const importInput = ref<HTMLInputElement | null>(null)

const uploadLoaded = ref(false)
const uploadFileName = ref('')
const uploadHint = ref(`支持 PDF / MP4 / MPG 格式，单个文件不超过${LIMITS.upload}MB`)
const uploadSuccess = ref(false)
const uploadSuccessFile = ref('')

function openAddModal() {
  addStep.value = 1
  resetAddForm()
  addVisible.value = true
}

function closeAddModal() {
  addVisible.value = false
  addStep.value = 1
  resetAddForm()
}

function resetAddForm() {
  Object.assign(addForm, emptyAddForm())
  uploadLoaded.value = false
  uploadFileName.value = ''
  uploadHint.value = `支持 PDF / MP4 / MPG 格式，单个文件不超过${LIMITS.upload}MB`
  uploadSuccess.value = false
  uploadSuccessFile.value = ''
  if (uploadInput.value) uploadInput.value.value = ''
}

function prevAddStep() {
  if (addStep.value > 1) addStep.value -= 1
}

async function nextAddStep() {
  if (addStep.value === 1) {
    addStep.value = 2
    return
  }

  if (addStep.value === 2) {
    if (!addForm.title.trim()) {
      ElMessage.warning('请填写正题名')
      return
    }
    if (!addForm.author.trim()) {
      ElMessage.warning('请填写责任者')
      return
    }
    if (!addForm.category) {
      ElMessage.warning('请选择分类')
      return
    }
    addStep.value = 3
    return
  }

  const sysId = addForm.sysId.trim() || `NEW${Date.now()}`
  await addDataRow({
    sysId,
    title: addForm.title.trim(),
    author: addForm.author.trim(),
    type: addForm.type,
    category: addForm.category as DocCategory,
    publishDate: addForm.publishDate,
  })
  metaMap.value[sysId] = { ...addForm, category: addForm.category }
  closeAddModal()
  await loadRows()
  activeTab.value = 'all'
  ElMessage.success('新增成功')
}

function buildUploadHint(size: number) {
  uploadHint.value = `大小：${size.toFixed(2)} MB · 点击可重新选择`
}

function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!['pdf', 'mp4', 'mpg', 'mov'].includes(ext)) {
    ElMessage.warning('请选择 PDF 或视频文件')
    input.value = ''
    return
  }

  const size = file.size / 1024 / 1024
  if (size > LIMITS.upload) {
    ElMessage.error(`文件大小超过${LIMITS.upload}MB限制`)
    input.value = ''
    return
  }

  uploadLoaded.value = true
  uploadFileName.value = file.name
  buildUploadHint(size)
  uploadSuccess.value = true
  uploadSuccessFile.value = `${file.name} (${size.toFixed(2)} MB)`
}

function triggerImport() {
  importInput.value?.click()
}

function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!['zip', 'rar', '7z'].includes(ext)) {
    ElMessage.warning('请选择压缩包文件（.zip/.rar/.7z）')
    input.value = ''
    return
  }

  const size = file.size / 1024 / 1024
  if (size > LIMITS.import) {
    ElMessage.error(`压缩包大小超过${LIMITS.import}MB限制`)
    input.value = ''
    return
  }

  ElMessage.success(
    `压缩包导入成功！${file.name}（${size.toFixed(2)} MB），系统将自动解析压缩包内的元数据表格和图像/视频资源。`,
  )
  input.value = ''
}

onMounted(async () => {
  await Promise.all([loadRows(), loadGraphTotal()])
})
</script>

<template>
  <div class="data-view">
    <div class="page-header">
      <div class="page-title">数据管理</div>
      <div class="page-actions">
        <button class="btn btn-outline" @click="triggerImport">导入数据</button>
        <button class="btn btn-primary" @click="openAddModal">新增</button>
      </div>
    </div>

    <input
      ref="importInput"
      type="file"
      accept=".zip,.rar,.7z"
      style="display: none"
      @change="handleImport"
    />

    <div class="card">
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </div>
      </div>

      <div v-if="activeTab === 'graph'" class="admin-empty">知识图谱数据暂未开放编辑</div>

      <template v-else>
        <div style="margin-bottom: 12px; display: flex; gap: 10px; align-items: center">
          <input
            v-model="keywordInput"
            class="form-input"
            style="max-width: 200px"
            placeholder="搜索题名/标识号…"
            @keyup.enter="handleSearch"
          />
          <select v-model="filterCategory" class="form-select" style="max-width: 120px">
            <option value="">全部分类</option>
            <option v-for="c in DOC_CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
          <select v-model="filterType" class="form-select" style="max-width: 120px">
            <option value="">全部类型</option>
            <option v-for="t in TYPE_FILTERS" :key="t" :value="t">{{ t }}</option>
          </select>
          <select v-model="filterStatus" class="form-select" style="max-width: 100px">
            <option value="">全部状态</option>
            <option v-for="s in STATUS_FILTERS" :key="s" :value="s">{{ s }}</option>
          </select>
          <button class="btn btn-primary" @click="handleSearch">搜索</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>记录标识号</th>
              <th>正题名</th>
              <th>责任者</th>
              <th>类型</th>
              <th>分类</th>
              <th>日期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in filteredRows" :key="row.sysId">
              <tr v-if="editingSysId === row.sysId" style="background: #fafaf8">
                <td colspan="8" style="padding: 16px">
                  <div
                    style="
                      background: #fff;
                      border: 1px solid var(--primary);
                      border-radius: 8px;
                      padding: 16px;
                    "
                  >
                    <div
                      style="
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--primary-dark);
                        margin-bottom: 12px;
                      "
                    >
                      编辑{{ editingType }}元数据
                    </div>

                    <div v-if="editingType === '图书'" class="form-grid">
                      <div class="metadata-field">
                        <label>记录标识号</label>
                        <input v-model="editForm.sysId" readonly />
                      </div>
                      <div class="metadata-field">
                        <label>正题名</label>
                        <input v-model="editForm.title" />
                      </div>
                      <div class="metadata-field">
                        <label>责任者</label>
                        <input v-model="editForm.author" />
                      </div>
                      <div class="metadata-field">
                        <label>分类号</label>
                        <input v-model="editForm.classNo" />
                      </div>
                      <div class="metadata-field">
                        <label>关键词</label>
                        <input v-model="editForm.keywords" />
                      </div>
                      <div class="metadata-field">
                        <label>摘要</label>
                        <textarea v-model="editForm.summary" rows="2"></textarea>
                      </div>
                      <div class="metadata-field">
                        <label>附注</label>
                        <textarea v-model="editForm.note" rows="2"></textarea>
                      </div>
                      <div class="metadata-field">
                        <label>出版者</label>
                        <input v-model="editForm.publisher" />
                      </div>
                      <div class="metadata-field">
                        <label>出版地</label>
                        <input v-model="editForm.publishPlace" />
                      </div>
                      <div class="metadata-field">
                        <label>出版日期</label>
                        <input v-model="editForm.publishDate" type="date" />
                      </div>
                      <div class="metadata-field">
                        <label>格式</label>
                        <select v-model="editForm.format">
                          <option>PDF</option>
                          <option>EPUB</option>
                        </select>
                      </div>
                      <div class="metadata-field">
                        <label>页数</label>
                        <input v-model="editForm.pageCount" type="number" />
                      </div>
                      <div class="metadata-field">
                        <label>语种</label>
                        <select v-model="editForm.language">
                          <option>中文</option>
                          <option>英文</option>
                        </select>
                      </div>
                      <div class="metadata-field">
                        <label>ISBN</label>
                        <input v-model="editForm.isbn" />
                      </div>
                    </div>

                    <div v-else class="form-grid">
                      <div class="metadata-field">
                        <label>记录标识号</label>
                        <input v-model="editForm.sysId" readonly />
                      </div>
                      <div class="metadata-field">
                        <label>正题名</label>
                        <input v-model="editForm.title" />
                      </div>
                      <div class="metadata-field">
                        <label>责任者</label>
                        <input v-model="editForm.author" />
                      </div>
                      <div class="metadata-field">
                        <label>责任方式</label>
                        <select v-model="editForm.role">
                          <option>编导</option>
                          <option>摄影</option>
                          <option>出品</option>
                        </select>
                      </div>
                      <div class="metadata-field">
                        <label>分类号</label>
                        <input v-model="editForm.classNo" />
                      </div>
                      <div class="metadata-field">
                        <label>关键词</label>
                        <input v-model="editForm.keywords" />
                      </div>
                      <div class="metadata-field">
                        <label>附注</label>
                        <textarea v-model="editForm.note" rows="2"></textarea>
                      </div>
                      <div class="metadata-field">
                        <label>简介</label>
                        <textarea v-model="editForm.summary" rows="2"></textarea>
                      </div>
                      <div class="metadata-field">
                        <label>MPG格式</label>
                        <input v-model="editForm.mpgFormat" />
                      </div>
                      <div class="metadata-field">
                        <label>MPG大小</label>
                        <input v-model="editForm.mpgSize" />
                      </div>
                      <div class="metadata-field">
                        <label>MPG技术细节</label>
                        <input v-model="editForm.mpgDetail" />
                      </div>
                      <div class="metadata-field">
                        <label>MP4格式</label>
                        <input v-model="editForm.mp4Format" />
                      </div>
                      <div class="metadata-field">
                        <label>MP4大小</label>
                        <input v-model="editForm.mp4Size" />
                      </div>
                      <div class="metadata-field">
                        <label>MP4技术细节</label>
                        <input v-model="editForm.mp4Detail" />
                      </div>
                      <div class="metadata-field">
                        <label>时长</label>
                        <input v-model="editForm.duration" />
                      </div>
                      <div class="metadata-field">
                        <label>声道语种</label>
                        <select v-model="editForm.audioLang">
                          <option>中文</option>
                          <option>英文</option>
                        </select>
                      </div>
                      <div class="metadata-field">
                        <label>字幕语种</label>
                        <select v-model="editForm.subtitleLang">
                          <option>中文</option>
                          <option>英文</option>
                          <option>无</option>
                        </select>
                      </div>
                    </div>

                    <div style="text-align: right; margin-top: 12px">
                      <button class="btn btn-outline" @click="cancelEdit">取消</button>
                      <button class="btn btn-primary" @click="saveEdit">保存</button>
                    </div>
                  </div>
                </td>
              </tr>

              <tr v-else>
                <td>{{ row.sysId }}</td>
                <td>{{ row.title }}</td>
                <td style="max-width: 160px; overflow: hidden; text-overflow: ellipsis">
                  {{ row.author }}
                </td>
                <td><span class="badge" :class="typeBadgeClass(row.type)">{{ row.type }}</span></td>
                <td>
                  <span class="badge" :class="categoryBadgeClass(row.category)">{{ row.category }}</span>
                </td>
                <td>{{ row.publishDate || '—' }}</td>
                <td><span class="badge badge-green">{{ row.status || '已发布' }}</span></td>
                <td>
                  <span class="link" @click="openEdit(row)">编辑</span>
                  <span class="link-muted" @click="openDetail(row)">详情</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </template>
    </div>

    <div class="card">
      <div class="card-title">文献类型分布</div>
      <div class="stat-grid" style="margin: 0">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e8f0ee; color: var(--primary-dark)">▣</div>
          <div class="stat-info">
            <div class="stat-label">图书</div>
            <div class="stat-value">{{ bookCount }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #f5e5e4; color: var(--danger)">▷</div>
          <div class="stat-info">
            <div class="stat-label">视频</div>
            <div class="stat-value">{{ videoCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增文献模态框 -->
    <div class="modal-mask" :class="{ show: addVisible }">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">新增文献</div>
          <button class="modal-close" @click="closeAddModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="step-indicator">
            <div
              v-for="(label, index) in STEP_LABELS"
              :key="label"
              class="step-item"
              :class="{ active: addStep === index + 1, done: index + 1 < addStep }"
            >
              <div class="step-num">{{ index + 1 }}</div>
              {{ label }}
            </div>
          </div>

          <div v-if="addStep === 1">
            <div class="type-switch">
              <label :class="{ active: addForm.type === '图书' }">
                <input v-model="addForm.type" type="radio" value="图书" />
                <span>图书</span>
              </label>
              <label :class="{ active: addForm.type === '视频' }">
                <input v-model="addForm.type" type="radio" value="视频" />
                <span>视频</span>
              </label>
            </div>
            <p style="font-size: 12px; color: var(--text-light); margin-bottom: 8px">
              选择类型后，下方将显示对应的元数据模板字段
            </p>
          </div>

          <div v-else-if="addStep === 2">
            <div class="form-grid">
              <div class="metadata-field">
                <label>记录标识号</label>
                <input v-model="addForm.sysId" placeholder="系统自动生成" />
              </div>
              <div class="metadata-field">
                <label>正题名<span class="required">*</span></label>
                <input v-model="addForm.title" placeholder="请输入文献正题名" />
              </div>
              <div class="metadata-field">
                <label>责任者<span class="required">*</span></label>
                <input v-model="addForm.author" placeholder="作者/编者" />
              </div>
              <div v-if="addForm.type === '视频'" class="metadata-field">
                <label>责任方式</label>
                <select v-model="addForm.role">
                  <option>编导</option>
                  <option>摄影</option>
                  <option>出品</option>
                </select>
              </div>
              <div class="metadata-field">
                <label>分类号</label>
                <input v-model="addForm.classNo" placeholder="中图法分类号" />
              </div>
              <div class="metadata-field">
                <label>关键词</label>
                <input v-model="addForm.keywords" placeholder="多个关键词用空格分隔" />
              </div>
            </div>

            <div class="form-grid">
              <div class="metadata-field">
                <label>摘要</label>
                <textarea v-model="addForm.summary" rows="2" placeholder="内容简介"></textarea>
              </div>
              <div class="metadata-field">
                <label>附注</label>
                <textarea v-model="addForm.note" rows="2" placeholder="补充说明"></textarea>
              </div>
            </div>

            <div class="form-grid">
              <div class="metadata-field">
                <label>分类<span class="required">*</span></label>
                <select v-model="addForm.category">
                  <option value="">请选择</option>
                  <option v-for="c in DOC_CATEGORIES" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <div v-if="addForm.type === '图书'">
              <div class="form-grid">
                <div class="metadata-field">
                  <label>出版者</label>
                  <input v-model="addForm.publisher" placeholder="出版机构" />
                </div>
                <div class="metadata-field">
                  <label>出版地</label>
                  <input v-model="addForm.publishPlace" placeholder="出版城市" />
                </div>
                <div class="metadata-field">
                  <label>出版日期</label>
                  <input v-model="addForm.publishDate" type="date" />
                </div>
                <div class="metadata-field">
                  <label>格式</label>
                  <select v-model="addForm.format">
                    <option>PDF</option>
                    <option>EPUB</option>
                  </select>
                </div>
                <div class="metadata-field">
                  <label>页数</label>
                  <input v-model="addForm.pageCount" type="number" placeholder="如：256" />
                </div>
                <div class="metadata-field">
                  <label>语种</label>
                  <select v-model="addForm.language">
                    <option>中文</option>
                    <option>英文</option>
                  </select>
                </div>
                <div class="metadata-field">
                  <label>ISBN</label>
                  <input v-model="addForm.isbn" placeholder="ISBN编号" />
                </div>
              </div>
            </div>

            <div v-else>
              <div class="form-grid">
                <div class="metadata-field">
                  <label>MPG格式</label>
                  <input v-model="addForm.mpgFormat" placeholder="如：MPEG-2" />
                </div>
                <div class="metadata-field">
                  <label>MPG大小</label>
                  <input v-model="addForm.mpgSize" placeholder="如：500MB" />
                </div>
                <div class="metadata-field">
                  <label>MPG技术细节</label>
                  <input v-model="addForm.mpgDetail" placeholder="如：1920×1080" />
                </div>
                <div class="metadata-field">
                  <label>MP4格式</label>
                  <input v-model="addForm.mp4Format" placeholder="如：H.264" />
                </div>
                <div class="metadata-field">
                  <label>MP4大小</label>
                  <input v-model="addForm.mp4Size" placeholder="如：200MB" />
                </div>
                <div class="metadata-field">
                  <label>MP4技术细节</label>
                  <input v-model="addForm.mp4Detail" placeholder="如：1920×1080" />
                </div>
                <div class="metadata-field">
                  <label>时长</label>
                  <input v-model="addForm.duration" placeholder="HH:MM:SS" />
                </div>
                <div class="metadata-field">
                  <label>声道语种</label>
                  <select v-model="addForm.audioLang">
                    <option>中文</option>
                    <option>英文</option>
                  </select>
                </div>
                <div class="metadata-field">
                  <label>字幕语种</label>
                  <select v-model="addForm.subtitleLang">
                    <option>中文</option>
                    <option>英文</option>
                    <option>无</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div v-else>
            <div class="import-area" :class="{ loaded: uploadLoaded }" @click="uploadInput?.click()">
              <div class="import-icon">📁</div>
              <div class="import-text">
                {{ uploadLoaded ? `文件已选择：${uploadFileName}` : '点击选择文件' }}
              </div>
              <div class="import-hint">{{ uploadHint }}</div>
            </div>
            <input
              ref="uploadInput"
              type="file"
              accept=".pdf,.mp4,.mpg,.mov"
              style="display: none"
              @change="handleUpload"
            />
            <div
              v-if="uploadSuccess"
              style="
                text-align: center;
                padding: 16px;
                background: #e8f0ee;
                border-radius: 8px;
                margin-top: 12px;
              "
            >
              <div style="font-size: 24px">✅</div>
              <div
                style="
                  font-size: 13px;
                  color: var(--primary-dark);
                  font-weight: 600;
                  margin-top: 4px;
                "
              >
                文件上传成功
              </div>
              <div style="font-size: 11px; color: var(--text-light); margin-top: 4px">
                {{ uploadSuccessFile }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="addStep > 1" class="btn btn-outline" @click="prevAddStep">上一步</button>
          <button class="btn btn-outline" @click="closeAddModal">取消</button>
          <button class="btn btn-primary" @click="nextAddStep">
            {{ addStep === 3 ? '确认新增' : '下一步' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
