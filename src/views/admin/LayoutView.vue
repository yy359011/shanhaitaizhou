<script setup lang="ts">
/**
 * 后台 · 布局调整
 * 原型：admin.html renderLayout() / initLayoutDragDrop()
 *
 * 说明：原型首页版式预览为 7 个固定区块（nav/hero/category/recommend/hot/latest/footer），
 * 接口层 LAYOUT_BLOCKS 以「页面 → 区块」组织、首页仅 5 项且语义不同，
 * 此处按原型 7 区块为准；拖拽排序与序号重排改为响应式数组驱动。
 */
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

interface LayoutBlock {
  id: string
  name: string
  badge: string
  badgeClass: string
}

interface SelectItem {
  label: string
  options: string[]
}

/** 首页版式预览区块（原型 data-block 顺序） */
const DEFAULT_BLOCKS: LayoutBlock[] = [
  { id: 'nav', name: '顶部导航栏', badge: '固定', badgeClass: 'badge-gray' },
  { id: 'hero', name: 'Hero英雄区', badge: '全屏搜索', badgeClass: 'badge-blue' },
  { id: 'category', name: '分类导航', badge: '四大主题', badgeClass: 'badge-green' },
  { id: 'recommend', name: '推荐导读', badge: '4本推荐', badgeClass: 'badge-gold' },
  { id: 'hot', name: '热门资源', badge: 'TOP10', badgeClass: 'badge-red' },
  { id: 'latest', name: '最新更新', badge: '时间线', badgeClass: 'badge-gray' },
  { id: 'footer', name: '页脚信息', badge: '版权/链接', badgeClass: 'badge-gray' },
]

const HOME_GRID_OPTIONS: SelectItem[] = [
  { label: '桌面端列数', options: ['4列（默认）', '3列', '5列', '6列'] },
  { label: '平板端列数', options: ['3列（默认）', '2列', '4列'] },
  { label: '移动端列数', options: ['1列（默认）', '2列'] },
  { label: '卡片间距', options: ['16px（默认）', '12px', '20px', '24px'] },
  { label: '卡片圆角', options: ['10px（默认）', '6px', '14px'] },
  { label: '卡片阴影', options: ['轻柔（默认）', '明显', '无阴影'] },
  { label: '区块间距', options: ['32px（默认）', '24px', '40px', '48px'] },
  { label: '内容区最大宽度', options: ['1280px（默认）', '1200px', '1440px', '全宽'] },
]

const DETAIL_GRID_OPTIONS: SelectItem[] = [
  { label: '侧边栏宽度', options: ['280px（默认）', '240px', '320px'] },
  { label: '主内容区比例', options: ['7:3（默认）', '6:4', '8:2'] },
  { label: '字段布局', options: ['双列（默认）', '单列', '自适应'] },
  { label: '封面图尺寸', options: ['4:3（默认）', '3:2', '16:9', '1:1'] },
  { label: '元数据展示', options: ['分组卡片（默认）', '表格形式', '折叠面板'] },
  { label: '相关推荐', options: ['显示6条（默认）', '显示4条', '显示8条', '不显示'] },
  { label: '评论区位置', options: ['底部（默认）', '侧边栏'] },
  { label: '面包屑导航', options: ['显示（默认）', '不显示'] },
]

const THEME_OPTIONS: SelectItem[] = [
  { label: '主色调', options: ['墨绿 #2C4A45（默认）', '雾青 #5B8A7F', '暖金 #C9A96E', '朱红 #B85450'] },
  { label: '背景色', options: ['米白 #F8F6F2（默认）', '纯白 #FFFFFF', '浅灰 #F5F3EF'] },
  { label: '导航栏样式', options: ['固定毛玻璃', '固定实色', '不固定'] },
  { label: '圆角大小', options: ['8px（默认）', '4px', '12px', '0px'] },
]

const PAGE_OPTIONS: SelectItem[] = [
  { label: '分类页布局', options: ['左栏+右列表', '卡片网格', '瀑布流'] },
  { label: '检索页布局', options: ['左筛选+右结果', '上筛选+下结果'] },
  { label: '知识图谱画布', options: ['左侧边栏+右画布', '全屏画布'] },
  { label: '页脚样式', options: ['深色实色条', '浅色简约'] },
]

const NODE_COLOR_FIELDS: SelectItem[] = [
  { label: '核心实体颜色', options: ['#2C4A45'] },
  { label: '人物节点颜色', options: ['#5B8A7F'] },
  { label: '机构节点颜色', options: ['#C9A96E'] },
  { label: '事件节点颜色', options: ['#B85450'] },
  { label: '地名节点颜色', options: ['#4A7C8C'] },
  { label: '选中高亮色', options: ['#E8682B'] },
]

const FONT_OPTIONS: SelectItem[] = [
  { label: '正文字体', options: ['Microsoft YaHei（默认）', 'PingFang SC', '思源黑体'] },
  { label: '标题字号', options: ['22px', '20px', '24px'] },
  { label: '正文字号', options: ['14px', '13px', '16px'] },
  { label: '行高', options: ['1.6（默认）', '1.5', '1.8'] },
]

/** 生成「标签 → 默认选项」的响应式表单状态 */
function createForm(items: SelectItem[]): Record<string, string> {
  return reactive(Object.fromEntries(items.map((item) => [item.label, item.options[0]])))
}

const blocks = ref<LayoutBlock[]>(DEFAULT_BLOCKS.map((item) => ({ ...item })))
const homeGrid = createForm(HOME_GRID_OPTIONS)
const detailGrid = createForm(DETAIL_GRID_OPTIONS)
const theme = createForm(THEME_OPTIONS)
const pageLayout = createForm(PAGE_OPTIONS)
const nodeColors = createForm(NODE_COLOR_FIELDS)
const fonts = createForm(FONT_OPTIONS)

const dragIndex = ref(-1)
const overIndex = ref(-1)

function onDragStart(event: DragEvent, index: number) {
  dragIndex.value = index
  if (!event.dataTransfer) return
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', blocks.value[index].id)
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onDragEnter(event: DragEvent, index: number) {
  event.preventDefault()
  if (index !== dragIndex.value) overIndex.value = index
}

function onDragLeave(index: number) {
  if (overIndex.value === index) overIndex.value = -1
}

function onDrop(event: DragEvent, index: number) {
  event.preventDefault()
  overIndex.value = -1
  const from = dragIndex.value
  if (from < 0 || from === index) return
  // 原型 `(e.clientY - rect.top) / 2 < rect.height / 2` 恒为真，此处按「落在区块上半部分则插入其前」修正
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const before = event.clientY - rect.top < rect.height / 2
  const list = blocks.value.slice()
  const [moved] = list.splice(from, 1)
  const anchor = from < index ? index - 1 : index
  list.splice(before ? anchor : anchor + 1, 0, moved)
  blocks.value = list
}

function onDragEnd() {
  dragIndex.value = -1
  overIndex.value = -1
}

function resetLayout() {
  blocks.value = DEFAULT_BLOCKS.map((item) => ({ ...item }))
  ElMessage.success('已恢复默认布局')
}

function applyLayout() {
  ElMessage.success('布局已应用')
}
</script>

<template>
  <div class="page-header">
    <div class="page-title">布局调整</div>
    <div class="page-actions">
      <button class="btn btn-outline" @click="resetLayout">重置默认</button>
      <button class="btn btn-primary" @click="applyLayout">应用布局</button>
    </div>
  </div>

  <div class="card">
    <div class="card-title">首页版式预览 <span class="card-title-hint">拖拽区块调整顺序</span></div>
    <div class="home-preview">
      <div
        v-for="(block, index) in blocks"
        :key="block.id"
        class="layout-block"
        :class="{ dragging: index === dragIndex, 'drag-over': index === overIndex }"
        draggable="true"
        @dragstart="onDragStart($event, index)"
        @dragend="onDragEnd"
        @dragover="onDragOver"
        @dragenter="onDragEnter($event, index)"
        @dragleave="onDragLeave(index)"
        @drop="onDrop($event, index)"
      >
        <span class="block-handle">⋮⋮</span>
        <span class="block-index">{{ index + 1 }}</span>
        <span class="block-name">{{ block.name }}</span>
        <span class="badge block-badge" :class="block.badgeClass">{{ block.badge }}</span>
      </div>
    </div>
    <div class="layout-tip">提示：按住区块拖动可调整首页展示顺序。此为演示交互，实际效果将同步更新前端页面布局。</div>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-title">版式参数 · 首页网格配置</div>
      <div class="form-grid">
        <div v-for="item in HOME_GRID_OPTIONS" :key="item.label" class="form-group">
          <label class="form-label">{{ item.label }}</label>
          <select v-model="homeGrid[item.label]" class="form-select">
            <option v-for="option in item.options" :key="option">{{ option }}</option>
          </select>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">版式参数 · 详情页网格配置</div>
      <div class="form-grid">
        <div v-for="item in DETAIL_GRID_OPTIONS" :key="item.label" class="form-group">
          <label class="form-label">{{ item.label }}</label>
          <select v-model="detailGrid[item.label]" class="form-select">
            <option v-for="option in item.options" :key="option">{{ option }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-title">主题配色</div>
      <div class="form-grid">
        <div v-for="item in THEME_OPTIONS" :key="item.label" class="form-group">
          <label class="form-label">{{ item.label }}</label>
          <select v-model="theme[item.label]" class="form-select">
            <option v-for="option in item.options" :key="option">{{ option }}</option>
          </select>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">页面布局</div>
      <div class="form-grid">
        <div v-for="item in PAGE_OPTIONS" :key="item.label" class="form-group">
          <label class="form-label">{{ item.label }}</label>
          <select v-model="pageLayout[item.label]" class="form-select">
            <option v-for="option in item.options" :key="option">{{ option }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">知识图谱节点配色</div>
    <div class="form-grid">
      <div v-for="item in NODE_COLOR_FIELDS" :key="item.label" class="form-group">
        <label class="form-label">{{ item.label }}</label>
        <input v-model="nodeColors[item.label]" class="form-input">
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">字体设置</div>
    <div class="form-grid">
      <div v-for="item in FONT_OPTIONS" :key="item.label" class="form-group">
        <label class="form-label">{{ item.label }}</label>
        <select v-model="fonts[item.label]" class="form-select">
          <option v-for="option in item.options" :key="option">{{ option }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-preview {
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 16px;
  background: #fafaf8;
}
</style>
