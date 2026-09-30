<script setup lang="ts">
/**
 * 后台 · 访问统计
 * 原型：admin.html renderStats()
 *
 * 说明：接口 getVisitStats() 提供页面访问排行（rank）与访问趋势（trend）；
 * 概览卡片、占比环形图、热词与来源分布为原型静态展示数据，接口层无对应字段。
 */
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getVisitStats } from '@/api/admin'

const RANGE_OPTIONS = ['近7天', '近30天', '近3个月', '全部']

/** 概览卡片（原型静态值） */
const OVERVIEW = [
  { label: '总访问量', value: '12,847', trend: '↑ +15.3%', up: true, icon: '◎', bg: '#e8f0ee', color: 'var(--primary-dark)' },
  { label: '独立访客', value: '3,210', trend: '↑ +8.7%', up: true, icon: '◉', bg: '#faf0e0', color: '#9a7830' },
  { label: '页面浏览', value: '28,456', trend: '↑ +22.1%', up: true, icon: '▣', bg: '#e0ebf0', color: 'var(--info)' },
  { label: '平均停留', value: '4:32', trend: '↓ -0.8%', up: false, icon: '◑', bg: '#f5e5e4', color: 'var(--danger)' },
]

/** 排行进度条配色与趋势（原型静态值，按名次取用） */
const RANK_COLORS = ['var(--primary)', 'var(--primary)', 'var(--info)', 'var(--accent)', 'var(--accent)', 'var(--danger)']
const RANK_TRENDS = [
  { text: '↑ 12%', up: true },
  { text: '↑ 8%', up: true },
  { text: '↑ 15%', up: true },
  { text: '↑ 35%', up: true },
  { text: '↑ 5%', up: true },
  { text: '↓ 3%', up: false },
]

/** 访问比例环形图（原型静态值） */
const DONUTS = [
  {
    title: '本日访问比例',
    paths: [
      { d: 'M65,65 L65,15 A50,50 0 0,1 108.5,38 Z', fill: '#2c4a45' },
      { d: 'M65,65 L108.5,38 A50,50 0 0,1 88,110 Z', fill: '#5b8a7f' },
      { d: 'M65,65 L88,110 A50,50 0 0,1 30,90 Z', fill: '#c9a96e' },
      { d: 'M65,65 L30,90 A50,50 0 0,1 65,15 Z', fill: '#b85450' },
    ],
    legend: [
      { color: '#2c4a45', label: '首页', percent: '40%' },
      { color: '#5b8a7f', label: '分类', percent: '26%' },
      { color: '#c9a96e', label: '检索', percent: '18%' },
      { color: '#b85450', label: '其他', percent: '16%' },
    ],
  },
  {
    title: '本周访问比例',
    paths: [
      { d: 'M65,65 L65,15 A50,50 0 0,1 105,42 Z', fill: '#2c4a45' },
      { d: 'M65,65 L105,42 A50,50 0 0,1 82,108 Z', fill: '#4a7c8c' },
      { d: 'M65,65 L82,108 A50,50 0 0,1 28,82 Z', fill: '#c9a96e' },
      { d: 'M65,65 L28,82 A50,50 0 0,1 65,15 Z', fill: '#5b8a7f' },
    ],
    legend: [
      { color: '#2c4a45', label: '首页', percent: '38%' },
      { color: '#4a7c8c', label: '分类', percent: '28%' },
      { color: '#c9a96e', label: '检索', percent: '17%' },
      { color: '#5b8a7f', label: '其他', percent: '17%' },
    ],
  },
]

/** 搜索热词排行（原型静态值） */
const HOT_KEYWORDS = [
  { word: '台州', count: 862, percent: 90, color: 'var(--primary)' },
  { word: '饮食', count: 534, percent: 56, color: 'var(--accent)' },
  { word: '陶瓷', count: 421, percent: 44, color: 'var(--info)' },
  { word: '古村落', count: 318, percent: 33, color: 'var(--danger)' },
  { word: '非遗', count: 256, percent: 27, color: 'var(--primary)' },
]

/** 访问来源分布（原型静态值） */
const SOURCES = [
  { name: '直接访问', desc: '书签/直接输入', percent: '45.2%', badge: 'badge-green', bg: '#e8f0ee', color: 'var(--primary-dark)' },
  { name: '搜索引擎', desc: '百度/Google', percent: '32.8%', badge: 'badge-blue', bg: '#e0ebf0', color: 'var(--info)' },
  { name: '外部链接', desc: '图书馆官网等', percent: '15.3%', badge: 'badge-gold', bg: '#faf0e0', color: '#9a7830' },
  { name: '社交媒体', desc: '微信/微博', percent: '6.7%', badge: 'badge-red', bg: '#f5e5e4', color: 'var(--danger)' },
]

const range = ref(RANGE_OPTIONS[0])
const rank = ref<Array<{ page: string; pv: number; ratio: number }>>([])

function rankColor(index: number) {
  return RANK_COLORS[index] || 'var(--primary)'
}

function rankTrend(index: number) {
  return RANK_TRENDS[index] ?? { text: '', up: true }
}

function exportReport() {
  ElMessage.success(`已生成 ${range.value} 访问报表`)
}

onMounted(async () => {
  const data = await getVisitStats()
  rank.value = data.rank
})
</script>

<template>
  <div class="page-header">
    <div class="page-title">访问统计</div>
    <div class="page-actions">
      <select v-model="range" class="form-select range-select">
        <option v-for="item in RANGE_OPTIONS" :key="item">{{ item }}</option>
      </select>
      <button class="btn btn-outline" @click="exportReport">导出报表</button>
    </div>
  </div>

  <div class="stat-grid">
    <div v-for="item in OVERVIEW" :key="item.label" class="stat-card">
      <div class="stat-icon" :style="{ background: item.bg, color: item.color }">{{ item.icon }}</div>
      <div class="stat-info">
        <div class="stat-label">{{ item.label }}</div>
        <div class="stat-value">{{ item.value }}</div>
        <div class="stat-trend" :class="item.up ? 'up' : 'down'">{{ item.trend }}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">页面访问排行</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>排名</th>
          <th>页面</th>
          <th>访问量</th>
          <th>占比</th>
          <th>趋势</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in rank" :key="item.page">
          <td>{{ index + 1 }}</td>
          <td>{{ item.page }}</td>
          <td>{{ item.pv.toLocaleString() }}</td>
          <td>
            <div class="progress">
              <div class="progress-bar" :style="{ width: `${item.ratio}%`, background: rankColor(index) }"></div>
            </div>
          </td>
          <td><span class="stat-trend" :class="rankTrend(index).up ? 'up' : 'down'">{{ rankTrend(index).text }}</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-title">访问比例分析</div>
      <div class="donut-row">
        <div v-for="chart in DONUTS" :key="chart.title" class="donut">
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="50" fill="#e8f0ee" />
            <path v-for="path in chart.paths" :key="path.d" :d="path.d" :fill="path.fill" />
          </svg>
          <div class="donut-title">{{ chart.title }}</div>
          <div class="donut-legend">
            <div v-for="legend in chart.legend" :key="legend.label">
              <span :style="{ color: legend.color }">■</span> {{ legend.label }} {{ legend.percent }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-title">搜索热词排行</div>
      <div class="plain-text">
        <div v-for="(item, index) in HOT_KEYWORDS" :key="item.word" class="list-item">
          <div class="list-item-info">
            <div>
              <div class="list-item-text">{{ index + 1 }}. {{ item.word }}</div>
              <div class="list-item-sub">搜索 {{ item.count }} 次</div>
            </div>
          </div>
          <div class="progress keyword-progress">
            <div class="progress-bar" :style="{ width: `${item.percent}%`, background: item.color }"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">访问来源分布</div>
      <div class="plain-text">
        <div v-for="source in SOURCES" :key="source.name" class="list-item">
          <div class="list-item-info">
            <div class="list-item-icon" :style="{ background: source.bg, color: source.color }">▣</div>
            <div>
              <div class="list-item-text">{{ source.name }}</div>
              <div class="list-item-sub">{{ source.desc }}</div>
            </div>
          </div>
          <div><span class="badge" :class="source.badge">{{ source.percent }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.range-select {
  width: 120px;
}

.donut-row {
  display: flex;
  gap: 16px;
  justify-content: space-around;
  padding: 4px 0;
}

.donut {
  text-align: center;
}

.donut-title {
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

.donut-legend {
  font-size: 11px;
  color: var(--text-light);
  line-height: 1.7;
  margin-top: 4px;
}

.plain-text {
  font-size: 13px;
}

.keyword-progress {
  width: 100px;
}
</style>
