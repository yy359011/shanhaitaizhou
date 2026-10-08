<script setup lang="ts">
/**
 * 知识图谱页：1:1 还原原型 knowledge-graph.html
 * 左侧图谱分类（可折叠）+ 右侧 Canvas 手写力导向图（斥力 / 弹簧 / 径向约束 / 角度均分 /
 * 缩放平移 / 节点拖拽 / 悬停提示 / 选中高亮）
 *
 * 该路由为独立顶层路由，因此导航栏与页脚在本视图内自行渲染。
 */
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { getGraphById, getGraphList, GRAPH_CATEGORY_META, GRAPH_CATEGORY_ORDER } from '@/api/graph'
import { SYSTEM_SETTINGS } from '@/constants/site'
import logoUrl from '@/images/logo.png'
import type { GraphCategory, GraphData, NodeGroup } from '@/types'

const route = useRoute()

/* ==================== 导航栏 ==================== */

const scrolled = ref(false)
const navItems = [
  { key: 'home', label: '首页', name: 'home' },
  { key: 'search', label: '资源检索', name: 'search' },
  { key: 'categories', label: '分类导航', name: 'categories' },
  { key: 'graph', label: '知识图谱', name: 'knowledge-graph' },
]

function onScroll() {
  scrolled.value = window.scrollY > 10
}

/* ==================== 节点样式（等价原型 GC / CM 常量） ==================== */

const NODE_STYLE: Record<NodeGroup, { color: string; label: string; r: number }> = {
  core: { color: '#2C4A45', label: '核心实体', r: 30 },
  person: { color: '#5B8A7F', label: '人物', r: 22 },
  institution: { color: '#C9A96E', label: '机构', r: 22 },
  event: { color: '#B85450', label: '事件', r: 22 },
  place: { color: '#4A7C8C', label: '地名', r: 22 },
}

const LEGEND: Array<{ color: string; label: string }> = [
  { color: '#2C4A45', label: '核心实体' },
  { color: '#5B8A7F', label: '人物' },
  { color: '#C9A96E', label: '机构' },
  { color: '#B85450', label: '事件' },
  { color: '#4A7C8C', label: '地名' },
]

/* ==================== 侧栏数据 ==================== */

interface SidebarItem {
  id: string
  label: string
}

interface SidebarGroup {
  category: GraphCategory
  name: string
  color: string
  items: SidebarItem[]
}

const groups = ref<SidebarGroup[]>([])
const collapsed = reactive<Record<string, boolean>>({})
const activeGraphId = ref('')

const graphTitle = ref('知识图谱')
const graphInfo = ref('选择左侧实体查看知识图谱。')
const nodeCount = ref(0)
const linkCount = ref(0)

async function loadSidebar() {
  const list = await Promise.all(
    GRAPH_CATEGORY_ORDER.map(async (category) => {
      const graphs = await getGraphList(category)
      const meta = GRAPH_CATEGORY_META[category]
      return {
        category,
        name: meta.name,
        color: meta.color,
        items: graphs.map((g) => ({
          id: g.id,
          label: g.nodes.find((n) => n.group === 'core')?.label || g.title,
        })),
      } satisfies SidebarGroup
    }),
  )
  groups.value = list.filter((g) => g.items.length > 0)
  // 默认仅展开第一个分类（等价原型 defaultOpen = persons）
  GRAPH_CATEGORY_ORDER.forEach((category, index) => {
    collapsed[category] = index !== 0
  })
}

function toggleCategory(category: GraphCategory) {
  const next = !collapsed[category]
  collapsed[category] = next
  // 展开时自动选中该分类下的第一个实体（等价原型行为）
  if (!next) {
    const group = groups.value.find((g) => g.category === category)
    if (group?.items.length) void selectGraph(group.items[0].id)
  }
}

function revealCategory(id: string) {
  const group = groups.value.find((g) => g.items.some((item) => item.id === id))
  if (group) collapsed[group.category] = false
}

/* ==================== Canvas 力导向图 ==================== */

interface SimNode {
  id: string
  label: string
  sub: string
  group: NodeGroup
  desc: string
  x: number
  y: number
  vx: number
  vy: number
  fx: number | null
  fy: number | null
}

interface SimEdge {
  s: string
  t: string
  label: string
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let W = 800
let H = 600
let dpr = 1
let lastW = 0
let lastH = 0

let nodes: SimNode[] = []
let edges: SimEdge[] = []
let nodeIndex = new Map<string, SimNode>()
let currentGraphId: string | null = null
const graphCache = new Map<string, GraphData>()

let hoverNode: SimNode | null = null
let selNode: SimNode | null = null
let dragNode: SimNode | null = null
let isDrag = false
let isPan = false
let dragStartX = 0
let dragStartY = 0
let dragMoved = false

let scale = 1
let offX = 0
let offY = 0
let alpha = 1
let animId: number | null = null

const tip = reactive({ show: false, x: 0, y: 0, name: '', sub: '', desc: '' })

function resizeCanvas() {
  const el = canvasRef.value
  if (!el) return
  dpr = window.devicePixelRatio || 1
  const rect = el.getBoundingClientRect()
  W = rect.width || 800
  H = rect.height || 600
  lastW = W
  lastH = H
  el.width = Math.max(1, Math.round(W * dpr))
  el.height = Math.max(1, Math.round(H * dpr))
  ctx = el.getContext('2d')
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = true
  }
}

async function selectGraph(id: string) {
  if (!id || id === currentGraphId) return
  currentGraphId = id
  activeGraphId.value = id
  revealCategory(id)

  let graph = graphCache.get(id)
  if (!graph) {
    const fetched = await getGraphById(id)
    if (!fetched) return
    graphCache.set(id, fetched)
    graph = fetched
  }
  // 请求期间用户又切换了图谱，则丢弃本次结果
  if (currentGraphId !== id) return
  loadGraph(graph)
}

function loadGraph(graph: GraphData) {
  resizeCanvas()
  if (!ctx) return

  const coreX = W * 0.53
  const coreY = H * 0.52
  const nonCore = graph.nodes.filter((n) => n.group !== 'core')
  const nCount = Math.max(1, nonCore.length)
  const baseR = Math.min(W * 0.42, H * 0.46)
  const idealR = baseR * (0.9 + Math.min(0.7, nCount / 16))
  const idxMap = new Map<string, number>()
  nonCore.forEach((n, i) => idxMap.set(n.id, i))

  nodes = graph.nodes.map((n) => {
    if (n.group === 'core') {
      return {
        id: n.id,
        label: n.label,
        sub: n.sub || '',
        group: n.group,
        desc: n.desc || '',
        x: coreX,
        y: coreY,
        vx: 0,
        vy: 0,
        fx: coreX,
        fy: coreY,
      }
    }
    const k = idxMap.get(n.id) ?? Math.floor(Math.random() * nCount)
    // 按角度均匀分布，并加 ±0.1rad 抖动，避免整圈挤在同一方向
    const ang = (k / nCount) * Math.PI * 2 - Math.PI / 2 + (Math.random() * 0.2 - 0.1)
    const rr = idealR * (0.92 + Math.random() * 0.22)
    return {
      id: n.id,
      label: n.label,
      sub: n.sub || '',
      group: n.group,
      desc: n.desc || '',
      x: coreX + Math.cos(ang) * rr,
      y: coreY + Math.sin(ang) * rr,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
    }
  })

  edges = graph.edges.map((e) => ({ s: e.source, t: e.target, label: e.label || '' }))
  nodeIndex = new Map(nodes.map((n) => [n.id, n]))

  selNode = null
  hoverNode = null
  tip.show = false
  graphTitle.value = graph.title || '知识图谱'
  graphInfo.value = graph.info || '暂无说明'
  nodeCount.value = nodes.length
  linkCount.value = edges.length
  scale = 1
  offX = 0
  offY = 0
  alpha = 0.85
  if (animId !== null) {
    cancelAnimationFrame(animId)
    animId = null
  }
  animate()
}

function animate() {
  alpha = Math.max(alpha - 0.0035, 0)

  const core = nodes.find((n) => n.group === 'core') || null

  // 1. 节点间斥力（含重叠碰撞分离）
  const chargeBase = 700
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]
      const b = nodes[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      let d2 = dx * dx + dy * dy
      if (d2 < 1) d2 = 1
      const d = Math.sqrt(d2)
      let f = (chargeBase / d2) * alpha
      if (d < 100) f *= 1.9
      else if (d < 140) f *= 1.3
      const fx = (dx / d) * f
      const fy = (dy / d) * f
      if (a.fx === null) {
        a.vx += fx
        a.vy += fy
      }
      if (b.fx === null) {
        b.vx -= fx
        b.vy -= fy
      }
      const ra = (NODE_STYLE[a.group]?.r ?? 22) + 65
      const rb = (NODE_STYLE[b.group]?.r ?? 22) + 65
      const minDist = Math.max(ra, rb, ra * 0.5 + rb * 0.5)
      if (d < minDist) {
        const overlap = (minDist - d) * 0.75 * alpha
        const ox = (dx / d) * overlap
        const oy = (dy / d) * overlap
        if (a.fx === null) {
          a.x -= ox
          a.y -= oy
        }
        if (b.fx === null) {
          b.x += ox
          b.y += oy
        }
      }
    }
  }

  // 2. 边的弹簧力（按节点规模调节理想长度）
  const count = nodes.length
  let linkDist = 170
  if (count >= 15) linkDist = 280
  else if (count >= 12) linkDist = 255
  else if (count >= 9) linkDist = 230
  else if (count >= 6) linkDist = 210
  else if (count >= 4) linkDist = 195

  for (const e of edges) {
    const s = nodeIndex.get(e.s)
    const t = nodeIndex.get(e.t)
    if (!s || !t) continue
    const dx = t.x - s.x
    const dy = t.y - s.y
    const d = Math.sqrt(dx * dx + dy * dy) || 1
    const f = (d - linkDist) * 0.06 * alpha
    const fx = (dx / d) * f
    const fy = (dy / d) * f
    if (s.fx === null) {
      s.vx += fx
      s.vy += fy
    }
    if (t.fx === null) {
      t.vx -= fx
      t.vy -= fy
    }
  }

  // 3. 径向约束 + 角度均分（围绕核心实体均匀铺开）
  if (core) {
    const nonCoreCount = Math.max(1, nodes.length - 1)
    let idealRad = Math.min(W * 0.44, H * 0.46)
    if (nonCoreCount >= 15) idealRad *= 1.5
    else if (nonCoreCount >= 12) idealRad *= 1.35
    else if (nonCoreCount >= 8) idealRad *= 1.22
    else if (nonCoreCount >= 5) idealRad *= 1.08

    const angNodes = nodes.filter((n) => n.group !== 'core' && n.fx === null)
    if (angNodes.length >= 3) {
      angNodes.sort(
        (a, b) => Math.atan2(a.y - core.y, a.x - core.x) - Math.atan2(b.y - core.y, b.x - core.x),
      )
      for (let ai = 0; ai < angNodes.length; ai++) {
        const n = angNodes[ai]
        const curAng = Math.atan2(n.y - core.y, n.x - core.x)
        let idealAng = (ai / angNodes.length) * Math.PI * 2 - Math.PI / 2
        while (idealAng - curAng > Math.PI) idealAng -= Math.PI * 2
        while (curAng - idealAng > Math.PI) idealAng += Math.PI * 2
        const diff = idealAng - curAng
        const dx = n.x - core.x
        const dy = n.y - core.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const tx = -dy / dist
        const ty = dx / dist
        const tangAlign = diff * 0.04 * alpha
        n.vx += tx * tangAlign
        n.vy += ty * tangAlign
      }
    }

    for (const n of nodes) {
      if (n.group === 'core' || n.fx !== null) continue
      const dx = n.x - core.x
      const dy = n.y - core.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const radF = (dist - idealRad) * 0.04 * alpha
      const ux = dx / dist
      const uy = dy / dist
      n.vx += ux * radF
      n.vy += uy * radF
      const tangF = 0.025 * alpha
      n.vx += -uy * tangF
      n.vy += ux * tangF
    }
  }

  // 4. 画布整体吸附（很轻）+ 速度整合与边界约束
  const cx = W / 2
  const cy = H / 2
  for (const n of nodes) {
    if (n.fx !== null) {
      n.vx = 0
      n.vy = 0
      continue
    }
    n.vx += (cx - n.x) * 0.0035 * alpha
    n.vy += (cy - n.y) * 0.0035 * alpha
    n.vx *= 0.82
    n.vy *= 0.82
    const maxV = 9
    const vLen = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
    if (vLen > maxV) {
      n.vx = (n.vx / vLen) * maxV
      n.vy = (n.vy / vLen) * maxV
    }
    n.x += n.vx
    n.y += n.vy
    const r = NODE_STYLE[n.group]?.r ?? 22
    const pad = r + 24
    n.x = Math.max(pad, Math.min(W - pad, n.x))
    n.y = Math.max(pad + 40, Math.min(H - pad, n.y))
  }

  draw()
  if (alpha > 0.005) animId = requestAnimationFrame(animate)
  else animId = null
}

function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  ctx.save()
  ctx.translate(offX, offY)
  ctx.scale(scale, scale)

  let hlSet: Set<string> | null = null
  let linkSet: Set<number> | null = null
  if (selNode) {
    hlSet = new Set([selNode.id])
    linkSet = new Set()
    edges.forEach((e, idx) => {
      if (e.s === selNode!.id) {
        hlSet!.add(e.t)
        linkSet!.add(idx)
      }
      if (e.t === selNode!.id) {
        hlSet!.add(e.s)
        linkSet!.add(idx)
      }
    })
  }

  // ---- 边与关系标签 ----
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i]
    const s = nodeIndex.get(e.s)
    const t = nodeIndex.get(e.t)
    if (!s || !t) continue
    const isRelated = linkSet ? linkSet.has(i) : false
    const sCfg = NODE_STYLE[s.group] ?? NODE_STYLE.place
    const tCfg = NODE_STYLE[t.group] ?? NODE_STYLE.place
    const dx = t.x - s.x
    const dy = t.y - s.y
    const d = Math.sqrt(dx * dx + dy * dy) || 1
    const ux = dx / d
    const uy = dy / d
    const sx = s.x + ux * sCfg.r
    const sy = s.y + uy * sCfg.r
    const ex = t.x - ux * tCfg.r
    const ey = t.y - uy * tCfg.r

    ctx.globalAlpha = 1
    ctx.strokeStyle = isRelated ? '#2C4A45' : '#888'
    ctx.lineWidth = isRelated ? 2.2 : 1.2
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(ex, ey)
    ctx.stroke()

    const ah = 8
    const ang = Math.atan2(ey - sy, ex - sx)
    ctx.beginPath()
    ctx.moveTo(ex, ey)
    ctx.lineTo(ex - ah * Math.cos(ang - 0.4), ey - ah * Math.sin(ang - 0.4))
    ctx.lineTo(ex - ah * Math.cos(ang + 0.4), ey - ah * Math.sin(ang + 0.4))
    ctx.closePath()
    ctx.fillStyle = isRelated ? '#2C4A45' : '#888'
    ctx.fill()

    if (e.label) {
      const mx = (sx + ex) / 2
      const my = (sy + ey) / 2
      ctx.font = '11px "Microsoft YaHei"'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const tw = ctx.measureText(e.label).width
      ctx.fillStyle = 'rgba(255,255,255,0.96)'
      ctx.fillRect(mx - tw / 2 - 4, my - 8, tw + 8, 16)
      ctx.strokeStyle = isRelated ? 'rgba(44,74,69,0.3)' : 'rgba(136,136,136,0.2)'
      ctx.lineWidth = 0.8
      ctx.strokeRect(mx - tw / 2 - 4, my - 8, tw + 8, 16)
      ctx.fillStyle = isRelated ? '#2C4A45' : '#555'
      ctx.fillText(e.label, mx, my)
    }
  }

  // ---- 节点 ----
  for (const n of nodes) {
    const cfg = NODE_STYLE[n.group] ?? NODE_STYLE.place
    const isSel = selNode !== null && selNode.id === n.id
    const isRelated = hlSet !== null && hlSet.has(n.id) && !isSel

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.12)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetY = 2
    ctx.beginPath()
    ctx.arc(n.x, n.y, cfg.r, 0, Math.PI * 2)
    ctx.fillStyle = cfg.color
    ctx.fill()
    ctx.restore()

    if (isSel) {
      ctx.strokeStyle = '#E8682B'
      ctx.lineWidth = 5
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(n.x, n.y, cfg.r + 3, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(232,104,43,0.35)'
      ctx.lineWidth = 4
      ctx.stroke()
    } else if (isRelated) {
      ctx.strokeStyle = '#2C4A45'
      ctx.lineWidth = 3.5
      ctx.stroke()
    } else if (n.group === 'core') {
      ctx.strokeStyle = '#1A1A1A'
      ctx.lineWidth = 3
      ctx.stroke()
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'
      ctx.lineWidth = 2.5
      ctx.stroke()
    }

    ctx.fillStyle = '#fff'
    const isCore = n.group === 'core'
    ctx.font = `${isCore ? 'bold ' : ''}${isCore ? 12 : 11}px "Microsoft YaHei"`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const maxW = cfg.r * 1.75
    let label = n.label || ''
    const lines: string[] = []
    let curLine = ''
    for (const ch of label) {
      const test = curLine + ch
      if (ctx.measureText(test).width > maxW) {
        if (curLine) lines.push(curLine)
        curLine = ch
      } else {
        curLine = test
      }
    }
    if (curLine) lines.push(curLine)
    if (lines.length > 2) {
      label = `${label.slice(0, 2)}…`
      lines.length = 0
      lines.push(label)
    }
    const lineH = lines.length === 1 ? 0 : 11
    const startY = n.y - ((lines.length - 1) * lineH) / 2
    lines.forEach((line, li) => ctx!.fillText(line, n.x, startY + li * lineH))
  }

  ctx.globalAlpha = 1
  ctx.restore()
}

function screenToWorld(sx: number, sy: number) {
  return { x: (sx - offX) / scale, y: (sy - offY) / scale }
}

function getNodeAt(sx: number, sy: number): SimNode | null {
  const w = screenToWorld(sx, sy)
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]
    const cfg = NODE_STYLE[n.group] ?? NODE_STYLE.place
    const dx = w.x - n.x
    const dy = w.y - n.y
    if (dx * dx + dy * dy < cfg.r * cfg.r) return n
  }
  return null
}

/* ==================== 画布交互 ==================== */

function onDown(e: MouseEvent) {
  const el = canvasRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top
  const node = getNodeAt(sx, sy)
  if (node) {
    dragNode = node
    isDrag = true
    dragMoved = false
  } else {
    isPan = true
    el.style.cursor = 'grabbing'
  }
  dragStartX = sx
  dragStartY = sy
}

function onMove(e: MouseEvent) {
  const el = canvasRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top

  if (dragNode && isDrag) {
    const movedX = Math.abs(sx - dragStartX)
    const movedY = Math.abs(sy - dragStartY)
    if (movedX > 3 || movedY > 3) {
      dragMoved = true
      const w = screenToWorld(sx, sy)
      dragNode.x = w.x
      dragNode.y = w.y
      dragNode.fx = w.x
      dragNode.fy = w.y
      alpha = Math.max(alpha, 0.15)
      if (animId === null) animate()
    }
  } else if (isPan) {
    offX += sx - dragStartX
    offY += sy - dragStartY
    dragStartX = sx
    dragStartY = sy
    draw()
  } else {
    const node = getNodeAt(sx, sy)
    if (node !== hoverNode) {
      hoverNode = node
      if (hoverNode) {
        const cfg = NODE_STYLE[hoverNode.group] ?? NODE_STYLE.place
        tip.name = hoverNode.label
        tip.sub = hoverNode.sub || cfg.label
        tip.desc = hoverNode.desc || ''
        tip.x = e.clientX + 14
        tip.y = e.clientY + 14
        tip.show = true
      } else {
        tip.show = false
      }
    } else if (hoverNode) {
      tip.x = e.clientX + 14
      tip.y = e.clientY + 14
    }
    el.style.cursor = hoverNode ? 'pointer' : 'grab'
  }

  if (!isDrag && !isPan) {
    dragStartX = sx
    dragStartY = sy
  }
}

function onUp() {
  const el = canvasRef.value
  if (!el) return
  if (dragNode) {
    let changed = false
    if (!dragMoved) {
      // 纯点击：切换选中
      if (!selNode || selNode.id !== dragNode.id) {
        selNode = dragNode
        changed = true
      } else {
        selNode = null
        changed = true
      }
    }
    dragNode.fx = null
    dragNode.fy = null
    dragNode = null
    isDrag = false
    if (dragMoved) {
      alpha = Math.max(alpha, 0.12)
      if (changed || animId === null) draw()
      if (animId === null) animate()
    } else if (changed) {
      draw()
    }
  }
  if (isPan) {
    isPan = false
    el.style.cursor = 'grab'
  }
}

function onWheel(e: WheelEvent) {
  const el = canvasRef.value
  if (!el) return
  e.preventDefault()
  const rect = el.getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top
  const delta = e.deltaY > 0 ? 1 / 1.1 : 1.1
  const wx = (sx - offX) / scale
  const wy = (sy - offY) / scale
  scale *= delta
  scale = Math.max(0.25, Math.min(4, scale))
  offX = sx - wx * scale
  offY = sy - wy * scale
  draw()
}

/* ==================== 生命周期 ==================== */

let observer: ResizeObserver | null = null

function handleContainerResize() {
  const el = canvasRef.value
  if (!el || !ctx) return
  const rect = el.getBoundingClientRect()
  if (Math.abs(rect.width - lastW) < 1 && Math.abs(rect.height - lastH) < 1) return
  resizeCanvas()
  const graph = currentGraphId ? graphCache.get(currentGraphId) : undefined
  if (graph) loadGraph(graph)
}

/** 等待画布具备尺寸后再加载首张图谱（等价原型 tryLoad 轮询） */
function tryInitialLoad(attempt = 0) {
  const el = canvasRef.value
  if (!el) return
  const graphId = (route.query.graph as string) || ''
  const rect = el.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    const exists = groups.value.some((g) => g.items.some((item) => item.id === graphId))
    const first = groups.value[0]?.items[0]?.id
    const pick = exists ? graphId : first
    if (pick) void selectGraph(pick)
    return
  }
  if (attempt < 20) window.setTimeout(() => tryInitialLoad(attempt + 1), 100)
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  await loadSidebar()
  await nextTick()

  const el = canvasRef.value
  if (el) {
    resizeCanvas()
    el.addEventListener('mousedown', onDown)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseup', onUp)
    el.addEventListener('mouseleave', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    observer = new ResizeObserver(handleContainerResize)
    observer.observe(el)
  }
  tryInitialLoad()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  const el = canvasRef.value
  if (el) {
    el.removeEventListener('mousedown', onDown)
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseup', onUp)
    el.removeEventListener('mouseleave', onUp)
    el.removeEventListener('wheel', onWheel)
  }
  observer?.disconnect()
  observer = null
  if (animId !== null) {
    cancelAnimationFrame(animId)
    animId = null
  }
})

watch(
  () => route.query.graph,
  (val) => {
    const id = (val as string) || ''
    if (!id || id === currentGraphId) return
    if (groups.value.some((g) => g.items.some((item) => item.id === id))) void selectGraph(id)
  },
)
</script>

<template>
  <div class="kg-page">
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
          <RouterLink :to="{ name: item.name }" :class="{ active: route.meta.nav === item.key }">
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="kg-wrap">
      <aside class="kg-sidebar">
        <div class="kg-sidebar-header">
          <div class="kg-sidebar-title">图谱分类</div>
          <div class="kg-sidebar-sub">选择实体查看关联图谱</div>
        </div>
        <div class="kg-category-list">
          <div
            v-for="group in groups"
            :key="group.category"
            class="kg-cat"
            :class="{ collapsed: collapsed[group.category] }"
          >
            <div class="kg-cat-header" @click="toggleCategory(group.category)">
              <div class="kg-cat-name">
                <div class="kg-cat-color" :style="{ background: group.color }"></div>
                {{ group.name }}
              </div>
              <span class="kg-cat-arrow">▼</span>
            </div>
            <div class="kg-cat-items">
              <div
                v-for="item in group.items"
                :key="item.id"
                class="kg-item"
                :class="{ active: activeGraphId === item.id }"
                @click="selectGraph(item.id)"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main class="kg-main">
        <div class="kg-main-header">
          <div class="kg-main-title">{{ graphTitle }}</div>
          <div class="kg-main-stats">
            <span>节点 <strong>{{ nodeCount }}</strong></span>
            <span>关系 <strong>{{ linkCount }}</strong></span>
          </div>
        </div>

        <canvas ref="canvasRef" class="kg-canvas"></canvas>

        <div
          class="kg-tooltip"
          :class="{ show: tip.show }"
          :style="{ left: `${tip.x}px`, top: `${tip.y}px` }"
        >
          <div class="kg-tooltip-name">{{ tip.name }}</div>
          <div class="kg-tooltip-sub">{{ tip.sub }}</div>
          <div class="kg-tooltip-desc">{{ tip.desc }}</div>
        </div>

        <div class="kg-desc">
          <div class="kg-desc-title">图谱说明</div>
          <div class="kg-desc-text">{{ graphInfo }}</div>
        </div>

        <div class="kg-legend">
          <div class="kg-legend-title">节点类型</div>
          <div v-for="legend in LEGEND" :key="legend.label" class="kg-legend-item">
            <div class="kg-legend-dot" :style="{ background: legend.color }"></div>
            {{ legend.label }}
          </div>
        </div>
      </main>
    </div>

    <footer class="kg-footer">山海台州·文旅记忆 · 知识图谱数字发布平台</footer>
  </div>
</template>

<style scoped>
.kg-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: var(--st-navbar-h);
  background: var(--st-bg);
  overflow: hidden;
}

/* ---------- 导航栏（与公共布局一致） ---------- */
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

/* ---------- 主体：左侧图谱分类 + 右侧画布 ---------- */
.kg-wrap {
  display: grid;
  grid-template-columns: 240px 1fr;
  flex: 1;
  min-height: 0;
}

.kg-sidebar {
  background: #fff;
  border-right: 1px solid #e5e3df;
  overflow-y: auto;
  padding: 20px 0;
  height: 100%;
}

.kg-sidebar::-webkit-scrollbar {
  width: 6px;
}

.kg-sidebar::-webkit-scrollbar-thumb {
  background: #e5e3df;
  border-radius: 3px;
}

.kg-sidebar-header {
  padding: 0 20px 16px;
  border-bottom: 1.5px solid #e5e3df;
  margin-bottom: 12px;
}

.kg-sidebar-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #1a1a1a;
}

.kg-sidebar-sub {
  font-size: 12px;
  color: #8c8c8c;
  letter-spacing: 1px;
  margin-top: 4px;
}

.kg-cat {
  margin-bottom: 4px;
}

.kg-cat-header {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.kg-cat-header:hover {
  background: rgba(44, 74, 69, 0.04);
}

.kg-cat-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.kg-cat-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.kg-cat-arrow {
  font-size: 10px;
  color: #a0a0a0;
  transition: transform 0.25s;
}

.kg-cat.collapsed .kg-cat-arrow {
  transform: rotate(-90deg);
}

.kg-cat-items {
  max-height: 3000px;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.2s ease;
  padding: 4px 0;
}

.kg-cat.collapsed .kg-cat-items {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.kg-item {
  padding: 9px 20px 9px 42px;
  font-size: 13px;
  color: #4a4a4a;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
}

.kg-item:hover {
  background: rgba(44, 74, 69, 0.05);
  color: #2c4a45;
}

.kg-item.active {
  background: rgba(44, 74, 69, 0.1);
  color: #2c4a45;
  border-left-color: #2c4a45;
  font-weight: 600;
}

.kg-main {
  position: relative;
  background: #fafaf8;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.kg-main-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background: linear-gradient(to bottom, rgba(250, 250, 248, 1) 60%, rgba(250, 250, 248, 0));
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}

.kg-main-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 3px;
}

.kg-main-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #8c8c8c;
  letter-spacing: 1px;
}

.kg-main-stats strong {
  color: #2c4a45;
  font-size: 16px;
  font-weight: 700;
}

.kg-canvas {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  display: block;
  cursor: grab;
}

/* ---------- 悬停提示 ---------- */
.kg-tooltip {
  position: fixed;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #edeae5;
  border-radius: 10px;
  padding: 14px 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 220px;
  max-width: 300px;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.2s, transform 0.2s;
}

.kg-tooltip.show {
  opacity: 1;
  transform: translateY(0);
}

.kg-tooltip-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.kg-tooltip-sub {
  font-size: 12px;
  color: #2c4a45;
  margin-bottom: 6px;
  font-weight: 500;
}

.kg-tooltip-desc {
  font-size: 13px;
  color: #4a4a4a;
  line-height: 1.6;
}

/* ---------- 说明与图例 ---------- */
.kg-desc {
  position: absolute;
  bottom: 20px;
  left: 24px;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #edeae5;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.kg-desc-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.kg-desc-text {
  font-size: 13px;
  color: #5a5a5a;
  line-height: 1.7;
}

.kg-legend {
  position: absolute;
  top: 80px;
  right: 24px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #edeae5;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.kg-legend-title {
  font-size: 13px;
  font-weight: 600;
  color: #4a4a4a;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.kg-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #5a5a5a;
  margin-bottom: 4px;
}

.kg-legend-item:last-child {
  margin-bottom: 0;
}

.kg-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ---------- 页脚 ---------- */
.kg-footer {
  height: 60px;
  background: #2c4a45;
  color: #c5c3bf;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  letter-spacing: 2px;
  border-top: 1px solid #1a3a35;
  flex-shrink: 0;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1200px) {
  .kg-wrap {
    grid-template-columns: 220px 1fr;
  }

  .kg-main-title {
    font-size: 20px;
  }

  .kg-desc {
    max-width: 360px;
  }
}

@media (max-width: 992px) {
  .brand-sub {
    display: none;
  }

  .navbar-nav a {
    padding: 8px 12px;
    letter-spacing: 0;
  }

  .kg-wrap {
    grid-template-columns: 200px 1fr;
  }

  .kg-cat-header {
    padding: 9px 16px;
    font-size: 13px;
  }

  .kg-item {
    padding: 8px 16px 8px 36px;
  }

  .kg-desc {
    max-width: 300px;
    padding: 14px 16px;
  }

  .kg-legend {
    top: 74px;
    right: 16px;
  }
}

@media (max-width: 768px) {
  .brand-text {
    display: none;
  }

  .kg-wrap {
    grid-template-columns: 180px 1fr;
  }

  .kg-sidebar {
    padding: 12px 0;
  }

  .kg-sidebar-header {
    padding: 0 14px 10px;
  }

  .kg-cat-header {
    padding: 8px 14px;
    font-size: 12px;
  }

  .kg-item {
    padding: 7px 14px 7px 32px;
    font-size: 12px;
  }

  .kg-main-title {
    font-size: 17px;
    letter-spacing: 1px;
  }

  .kg-main-stats {
    gap: 10px;
    font-size: 12px;
  }

  .kg-desc {
    left: 12px;
    right: 12px;
    bottom: 12px;
    max-width: none;
  }

  .kg-legend {
    display: none;
  }
}
</style>
