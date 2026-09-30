<script setup lang="ts">
/**
 * 后台 · 控制台
 * 原型：admin.html renderDashboard()
 * 数据源：api/admin.ts（数量与趋势取自 mock），页面结构 1:1 还原原型
 */
import { computed, onMounted, ref } from 'vue'
import {
  getAdminStats,
  getDataRows,
  getGraphStats,
  getVisitStats,
  type AdminStats,
} from '@/api/admin'
import { DOC_CATEGORIES } from '@/constants/schema'
import type { DocCategory, LiteratureItem } from '@/types'

interface CategoryRow {
  name: DocCategory
  total: number
  book: number
  video: number
}

/** 原型中四个分类的图标配色与说明文案 */
const CATEGORY_META: Record<DocCategory, { badge: string; iconBg: string; iconColor: string; desc: string }> = {
  饮食文化: { badge: 'badge-green', iconBg: '#E8F0EE', iconColor: 'var(--primary-dark)', desc: '浙东菜系、地方小吃' },
  自然景观: { badge: 'badge-blue', iconBg: '#E0EBF0', iconColor: 'var(--info)', desc: '山水名胜、古城古镇' },
  非遗传承: { badge: 'badge-gold', iconBg: '#FAF0E0', iconColor: '#9A7830', desc: '传统技艺、民俗风情' },
  人文历史: { badge: 'badge-red', iconBg: '#F5E5E4', iconColor: 'var(--danger)', desc: '名人传记、历史事件' },
}

/** 图谱分类的徽章配色与说明文案 */
const GRAPH_META: Record<string, { badge: string; iconBg: string; iconColor: string; desc: string }> = {
  人物: { badge: 'badge-green', iconBg: '#E8F0EE', iconColor: 'var(--primary-dark)', desc: '骆宾王、戴复古、齐召南等' },
  机构: { badge: 'badge-gold', iconBg: '#FAF0E0', iconColor: '#9A7830', desc: '台州市图书馆、博物馆等' },
  事件: { badge: 'badge-red', iconBg: '#F5E5E4', iconColor: 'var(--danger)', desc: '十大美食主题' },
  地名: { badge: 'badge-blue', iconBg: '#E0EBF0', iconColor: 'var(--info)', desc: '山海十景' },
}

/** 页面访问排行趋势（原型固定文案，mock 未提供该字段） */
const RANK_TRENDS = ['↑ 12%', '↑ 8%', '↑ 15%', '↑ 35%', '↑ 5%', '↓ 3%']

/** 动态（原型固定文案） */
const ACTIVITY_LOG: Array<{ time: string; user: string; action: string; module: string; result: string; badge: string }> = [
  { time: '2026-08-26 14:32', user: 'admin', action: '新增2条视频文献', module: '数据管理', result: '成功', badge: 'badge-green' },
  { time: '2026-08-26 11:15', user: 'zhangsan', action: '编辑《宋韵路桥》元数据', module: '数据管理', result: '成功', badge: 'badge-green' },
  { time: '2026-08-25 16:48', user: 'lisi', action: '审核图书《千年古城》', module: '数据管理', result: '已发布', badge: 'badge-green' },
  { time: '2026-08-25 10:22', user: 'wangwu', action: '修改首页布局配置', module: '布局调整', result: '成功', badge: 'badge-green' },
  { time: '2026-08-24 15:36', user: 'admin', action: '导出访问统计报表', module: '访问统计', result: '成功', badge: 'badge-green' },
  { time: '2026-08-24 09:12', user: 'zhaoliu', action: '删除废弃视频记录', module: '数据管理', result: '失败', badge: 'badge-red' },
  { time: '2026-08-23 17:05', user: 'admin', action: '添加字段「分类号」到图书', module: '字段管理', result: '成功', badge: 'badge-green' },
  { time: '2026-08-23 14:18', user: 'qianqi', action: '登录系统', module: '用户管理', result: '成功', badge: 'badge-green' },
  { time: '2026-08-22 11:40', user: 'admin', action: '更新权限矩阵配置', module: '权限设置', result: '成功', badge: 'badge-green' },
  { time: '2026-08-22 08:55', user: 'lisi', action: '批量导入10条文献', module: '数据管理', result: '成功', badge: 'badge-green' },
]

const stats = ref<AdminStats>({ literatureTotal: 0, graphTotal: 0, userTotal: 0, todayVisits: 0 })
const categoryRows = ref<CategoryRow[]>([])
const graphStats = ref<Array<{ name: string; count: number; color: string }>>([])
const trend = ref<Array<{ date: string; value: number }>>([])
const rank = ref<Array<{ page: string; pv: number; ratio: number }>>([])

/** 概览四张卡片（趋势文案还原原型） */
const statCards = computed(() => [
  {
    icon: '▣',
    iconBg: '#E8F0EE',
    iconColor: 'var(--primary-dark)',
    label: '文献总量',
    value: stats.value.literatureTotal,
    trend: '↑ 本月新增 14 条',
    trendClass: 'up',
  },
  {
    icon: '▤',
    iconBg: '#FAF0E0',
    iconColor: '#9A7830',
    label: '知识图谱',
    value: stats.value.graphTotal,
    trend: `↑ 4大分类 ${stats.value.graphTotal}个图谱`,
    trendClass: 'up',
  },
  {
    icon: '◉',
    iconBg: '#E0EBF0',
    iconColor: 'var(--info)',
    label: '用户',
    value: stats.value.userTotal,
    trend: '新增1',
    trendClass: 'up',
  },
  {
    icon: '◎',
    iconBg: '#F5E5E4',
    iconColor: 'var(--danger)',
    label: '今日访问',
    value: stats.value.todayVisits,
    trend: '↑ 较昨日 +12.5%',
    trendClass: 'up',
  },
])

/* ---------- 近 7 天访问趋势柱状图（viewBox 700×180，与原型一致） ---------- */

const CHART = { axisX: 40, baseline: 150, barWidth: 50, startX: 80, step: 95, maxBarHeight: 132 }

const bars = computed(() => {
  const values = trend.value.map((d) => d.value)
  const peak = Math.max(1, ...values)
  const scaleMax = Math.ceil(peak / 50) * 50

  return trend.value.map((item, index) => {
    const height = Math.max(4, Math.round((item.value / scaleMax) * CHART.maxBarHeight))
    const x = CHART.startX + index * CHART.step
    // 末两根柱（周末）用深色强调，与原型一致
    const highlight = index >= trend.value.length - 2
    return {
      key: item.date,
      label: item.date,
      value: item.value,
      x,
      centerX: x + CHART.barWidth / 2,
      y: CHART.baseline - height,
      height,
      fill: highlight ? '#2C4A45' : '#5B8A7F',
      labelFill: highlight ? '#2C4A45' : '#6A6A6A',
      labelWeight: highlight ? 600 : 400,
    }
  })
})

/* ---------- 数据加载 ---------- */

async function loadDashboard() {
  const [statData, rows, graphData, visitData] = await Promise.all([
    getAdminStats(),
    getDataRows(),
    getGraphStats(),
    getVisitStats(),
  ])

  stats.value = statData
  graphStats.value = graphData
  trend.value = visitData.trend
  rank.value = visitData.rank
  categoryRows.value = buildCategoryRows(rows)
}

function buildCategoryRows(rows: LiteratureItem[]): CategoryRow[] {
  return DOC_CATEGORIES.map((name) => {
    const list = rows.filter((it) => it.category === name)
    const video = list.filter((it) => it.type === '视频').length
    return { name, total: list.length, book: list.length - video, video }
  })
}

function rankTrend(index: number): { text: string; cls: string } {
  const text = RANK_TRENDS[index] ?? '—'
  return { text, cls: text.startsWith('↓') ? 'down' : 'up' }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="dashboard-view">
    <div class="page-header">
      <div class="page-title">控制台</div>
      <div class="page-actions">
        <button class="btn btn-outline" @click="loadDashboard">刷新数据</button>
        <button class="btn btn-primary">导出报告</button>
      </div>
    </div>

    <!-- 概览 -->
    <div class="stat-grid">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <div class="stat-icon" :style="{ background: card.iconBg, color: card.iconColor }">{{ card.icon }}</div>
        <div class="stat-info">
          <div class="stat-label">{{ card.label }}</div>
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-trend" :class="card.trendClass">{{ card.trend }}</div>
        </div>
      </div>
    </div>

    <!-- 分类统计 + 图谱分布 -->
    <div class="two-col">
      <div class="card">
        <div class="card-title">文献分类统计</div>
        <div style="font-size: 13px">
          <div v-for="row in categoryRows" :key="row.name" class="list-item">
            <div class="list-item-info">
              <div
                class="list-item-icon"
                :style="{ background: CATEGORY_META[row.name].iconBg, color: CATEGORY_META[row.name].iconColor }"
              >
                ▣
              </div>
              <div>
                <div class="list-item-text">{{ row.name }}</div>
                <div class="list-item-sub">
                  图书{{ row.book }} 视频{{ row.video }} · {{ CATEGORY_META[row.name].desc }}
                </div>
              </div>
            </div>
            <div><span class="badge" :class="CATEGORY_META[row.name].badge">{{ row.total }} 条</span></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">知识图谱分布</div>
        <div style="font-size: 13px">
          <div v-for="item in graphStats" :key="item.name" class="list-item">
            <div class="list-item-info">
              <div
                class="list-item-icon"
                :style="{ background: GRAPH_META[item.name]?.iconBg, color: GRAPH_META[item.name]?.iconColor }"
              >
                ◉
              </div>
              <div>
                <div class="list-item-text">{{ item.name }}图谱</div>
                <div class="list-item-sub">{{ GRAPH_META[item.name]?.desc }}</div>
              </div>
            </div>
            <div><span class="badge" :class="GRAPH_META[item.name]?.badge">{{ item.count }} 个</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 访问趋势 -->
    <div class="card">
      <div class="card-title">近期访问趋势（近7天）</div>
      <div style="padding: 16px 0 8px">
        <svg viewBox="0 0 700 180" width="100%" height="180">
          <line :x1="CHART.axisX" y1="10" :x2="CHART.axisX" :y2="CHART.baseline" stroke="#E5E3DF" stroke-width="1" />
          <line :x1="CHART.axisX" :y1="CHART.baseline" x2="690" :y2="CHART.baseline" stroke="#E5E3DF" stroke-width="1" />
          <line :x1="CHART.axisX" y1="50" x2="690" y2="50" stroke="#F0EDE8" stroke-width="0.5" stroke-dasharray="4,4" />
          <line :x1="CHART.axisX" y1="90" x2="690" y2="90" stroke="#F0EDE8" stroke-width="0.5" stroke-dasharray="4,4" />
          <text x="36" y="54" text-anchor="end" font-size="10" fill="#9A9A9A">400</text>
          <text x="36" y="94" text-anchor="end" font-size="10" fill="#9A9A9A">200</text>
          <text x="36" y="154" text-anchor="end" font-size="10" fill="#9A9A9A">0</text>

          <template v-for="bar in bars" :key="bar.key">
            <rect :x="bar.x" :y="bar.y" :width="CHART.barWidth" :height="bar.height" rx="3" :fill="bar.fill" />
            <text
              :x="bar.centerX"
              :y="bar.y - 3"
              text-anchor="middle"
              font-size="10"
              :fill="bar.fill"
              :font-weight="bar.labelWeight"
            >
              {{ bar.value }}
            </text>
            <text
              :x="bar.centerX"
              y="168"
              text-anchor="middle"
              font-size="11"
              :fill="bar.labelFill"
              :font-weight="bar.labelWeight"
            >
              {{ bar.label }}
            </text>
          </template>
        </svg>
      </div>
    </div>

    <!-- 访问排行 + 动态 -->
    <div class="two-col">
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
                  <div class="progress-bar" :style="{ width: `${item.ratio}%`, background: 'var(--primary)' }"></div>
                </div>
              </td>
              <td>
                <span class="stat-trend" :class="rankTrend(index).cls">{{ rankTrend(index).text }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">动态</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>操作人</th>
              <th>操作简述</th>
              <th>模块</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in ACTIVITY_LOG" :key="log.time">
              <td>{{ log.time }}</td>
              <td>{{ log.user }}</td>
              <td>{{ log.action }}</td>
              <td>{{ log.module }}</td>
              <td><span class="badge" :class="log.badge">{{ log.result }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
