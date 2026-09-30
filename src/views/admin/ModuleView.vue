<script setup lang="ts">
/**
 * 后台 · 模块设置
 * 原型：admin.html renderModule() / toggleModule / addCat / addType
 */
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getCategoryConfig, getModuleConfigs, getTypeConfig } from '@/api/admin'
import type { DocCategory, DocType, ModuleConfig } from '@/types'

interface SelectItem {
  label: string
  options: string[]
}

const HOME_LAYOUT_OPTIONS: SelectItem[] = [
  { label: '英雄区高度', options: ['100vh（全屏）', '80vh', '60vh'] },
  { label: '推荐导读数量', options: ['4本', '6本', '8本'] },
  { label: '每页文献数', options: ['10条', '20条', '50条'] },
  { label: '搜索热词数量', options: ['6个', '10个', '15个'] },
]

const SORT_OPTIONS = ['置顶优先', '日期降序', '题名升序']

/** 新增分类时循环使用的徽章配色（原型 addCat） */
const CAT_BADGES = ['badge-green', 'badge-blue', 'badge-red', 'badge-gold', 'badge-gray']

/** 一级分类固定配色，与数据管理表格保持一致 */
const CATEGORY_BADGE: Record<string, string> = {
  饮食文化: 'badge-gold',
  自然景观: 'badge-blue',
  非遗传承: 'badge-red',
  人文历史: 'badge-green',
}

const modules = ref<ModuleConfig[]>([])
const cats = ref<DocCategory[]>([])
const types = ref<DocType[]>([])
const newCat = ref('')
const newType = ref('')
const sortBy = ref(SORT_OPTIONS[0])
const homeLayout = reactive<Record<string, string>>(
  Object.fromEntries(HOME_LAYOUT_OPTIONS.map((item) => [item.label, item.options[0]])),
)

function toggleModule(item: ModuleConfig) {
  item.enabled = !item.enabled
}

function addCat() {
  const value = newCat.value.trim()
  if (!value) return
  if (cats.value.includes(value as DocCategory)) {
    ElMessage.warning('该分类已存在')
    return
  }
  cats.value.push(value as DocCategory)
  newCat.value = ''
}

function removeCat(cat: DocCategory) {
  cats.value = cats.value.filter((item) => item !== cat)
}

function addType() {
  const value = newType.value.trim()
  if (!value) return
  if (types.value.includes(value as DocType)) {
    ElMessage.warning('该类型已存在')
    return
  }
  types.value.push(value as DocType)
  newType.value = ''
}

function removeType(type: DocType) {
  types.value = types.value.filter((item) => item !== type)
}

function catBadge(cat: string, index: number): string {
  if (cat === '视频') return 'badge-red'
  return CATEGORY_BADGE[cat] || CAT_BADGES[index % CAT_BADGES.length]
}

function saveSettings() {
  ElMessage.success('设置已保存')
}

onMounted(async () => {
  const [moduleList, categoryList, typeList] = await Promise.all([
    getModuleConfigs(),
    getCategoryConfig(),
    getTypeConfig(),
  ])
  modules.value = moduleList
  cats.value = categoryList
  types.value = typeList
})
</script>

<template>
  <div class="module-view">
    <div class="page-header">
      <div class="page-title">模块设置</div>
      <div class="page-actions">
        <button class="btn btn-primary" @click="saveSettings">保存设置</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">前端模块管理</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>模块名称</th>
            <th>功能描述</th>
            <th style="width: 160px">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in modules" :key="item.name">
            <td><strong>{{ item.name }}</strong></td>
            <td>{{ item.desc }}</td>
            <td>
              <div style="display: flex; align-items: center">
                <label class="toggle">
                  <input v-model="item.enabled" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-status" :class="item.enabled ? 'on' : 'off'">
                  {{ item.enabled ? '已启用' : '未启用' }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-title">首页布局配置</div>
        <div class="form-grid">
          <div v-for="item in HOME_LAYOUT_OPTIONS" :key="item.label" class="form-group">
            <label class="form-label">{{ item.label }}</label>
            <select v-model="homeLayout[item.label]" class="form-select">
              <option v-for="option in item.options" :key="option">{{ option }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">分类导航配置</div>

        <div style="margin-bottom: 14px">
          <label class="form-label">一级分类</label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px">
            <span
              v-for="(cat, index) in cats"
              :key="cat"
              class="badge"
              :class="catBadge(cat, index)"
              style="cursor: pointer"
              @click="removeCat(cat)"
            >
              {{ cat }} ✕
            </span>
          </div>
          <div style="display: flex; gap: 8px">
            <input
              v-model="newCat"
              class="form-input"
              style="flex: 1"
              placeholder="输入分类名称后点击添加"
              @keydown.enter="addCat"
            />
            <button class="btn btn-primary" @click="addCat">+ 添加</button>
          </div>
        </div>

        <div style="margin-bottom: 14px">
          <label class="form-label">文献类型</label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px">
            <span
              v-for="type in types"
              :key="type"
              class="badge"
              :class="type === '视频' ? 'badge-red' : 'badge-gray'"
              style="cursor: pointer"
              @click="removeType(type)"
            >
              {{ type }} ✕
            </span>
          </div>
          <div style="display: flex; gap: 8px">
            <input
              v-model="newType"
              class="form-input"
              style="flex: 1"
              placeholder="输入类型名称后点击添加"
              @keydown.enter="addType"
            />
            <button class="btn btn-primary" @click="addType">+ 添加</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">默认排序方式</label>
          <select v-model="sortBy" class="form-select">
            <option v-for="option in SORT_OPTIONS" :key="option">{{ option }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
