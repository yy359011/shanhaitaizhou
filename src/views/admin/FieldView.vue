<script setup lang="ts">
/**
 * 后台 · 字段管理
 * 原型：admin.html renderField() / switchFieldTab / openFieldEdit / saveFieldEdit
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getFieldConfigs, updateFieldConfig } from '@/api/admin'
import type { FieldConfig } from '@/types'

type TabKey = 'book' | 'video' | 'graph'
type FieldType = 'book' | 'video'

const DATA_TYPES = ['文本', '长文本', '数字', '日期', '时间', '下拉', '多值']
const REQUIRED_OPTIONS: Array<FieldConfig['required']> = ['必填', '选填']

const activeTab = ref<TabKey>('book')
const bookFields = ref<FieldConfig[]>([])
const videoFields = ref<FieldConfig[]>([])

const tabs = computed(() => [
  { key: 'book' as TabKey, label: `图书元数据（${bookFields.value.length}字段）` },
  { key: 'video' as TabKey, label: `视频元数据（${videoFields.value.length}字段）` },
  { key: 'graph' as TabKey, label: '知识图谱字段' },
])

/** 当前 tab 展示的字段列表（图书 / 视频） */
const currentFields = computed<FieldConfig[]>(() =>
  activeTab.value === 'video' ? videoFields.value : bookFields.value,
)

const editVisible = ref(false)
const editType = ref<FieldType>('book')
const editIndex = ref(-1)
/** 提交时按原始字段代码定位，允许修改代码本身 */
const originCode = ref('')
const editForm = reactive({
  name: '',
  code: '',
  dataType: DATA_TYPES[0],
  required: '必填' as FieldConfig['required'],
  desc: '',
})

async function loadFields(type: FieldType) {
  const list = await getFieldConfigs(type)
  if (type === 'book') bookFields.value = list
  else videoFields.value = list
}

function openFieldEdit(index: number) {
  const field = currentFields.value[index]
  if (!field) return
  editType.value = activeTab.value === 'video' ? 'video' : 'book'
  editIndex.value = index
  originCode.value = field.code
  editForm.name = field.name
  editForm.code = field.code
  editForm.dataType = field.dataType
  editForm.required = field.required
  editForm.desc = field.desc
  editVisible.value = true
}

function closeFieldEdit() {
  editVisible.value = false
}

async function saveFieldEdit() {
  const name = editForm.name.trim()
  const code = editForm.code.trim()
  if (!name || !code) {
    ElMessage.warning('字段名和字段代码不能为空')
    return
  }
  await updateFieldConfig(editType.value, originCode.value, {
    name,
    code,
    dataType: editForm.dataType,
    required: editForm.required,
    desc: editForm.desc.trim(),
  })
  await loadFields(editType.value)
  closeFieldEdit()
  ElMessage.success('字段已保存')
}

async function resetFields() {
  await Promise.all([loadFields('book'), loadFields('video')])
  ElMessage.success('已恢复默认字段')
}

function saveFields() {
  ElMessage.success('字段配置已保存')
}

onMounted(() => {
  void Promise.all([loadFields('book'), loadFields('video')])
})
</script>

<template>
  <div class="page-header">
    <div class="page-title">字段管理</div>
    <div class="page-actions">
      <button class="btn btn-outline" @click="resetFields">恢复默认</button>
      <button class="btn btn-primary" @click="saveFields">保存字段</button>
    </div>
  </div>

  <div class="card">
    <div class="tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <div v-if="activeTab === 'graph'" class="admin-empty">知识图谱字段暂未开放编辑</div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>字段名</th>
          <th>字段代码</th>
          <th>数据类型</th>
          <th>是否必填</th>
          <th>说明</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(field, index) in currentFields" :key="field.code">
          <td><strong>{{ field.name }}</strong></td>
          <td class="field-code">{{ field.code }}</td>
          <td><span class="badge badge-gray">{{ field.dataType }}</span></td>
          <td>
            <span class="badge" :class="field.required === '必填' ? 'badge-red' : 'badge-gray'">
              {{ field.required }}
            </span>
          </td>
          <td>{{ field.desc }}</td>
          <td><a class="link" @click="openFieldEdit(index)">编辑</a></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="modal-mask" :class="{ show: editVisible }">
    <div class="modal" style="width: 520px">
      <div class="modal-header">
        <div class="modal-title">编辑字段</div>
        <button class="modal-close" @click="closeFieldEdit">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="metadata-field">
            <label>字段名<span class="required">*</span></label>
            <input v-model="editForm.name" placeholder="字段显示名称">
          </div>
          <div class="metadata-field">
            <label>字段代码<span class="required">*</span></label>
            <input v-model="editForm.code" placeholder="英文字段标识">
          </div>
          <div class="metadata-field">
            <label>数据类型</label>
            <select v-model="editForm.dataType">
              <option v-for="type in DATA_TYPES" :key="type">{{ type }}</option>
            </select>
          </div>
          <div class="metadata-field">
            <label>是否必填</label>
            <select v-model="editForm.required">
              <option v-for="item in REQUIRED_OPTIONS" :key="item">{{ item }}</option>
            </select>
          </div>
        </div>
        <div class="metadata-field">
          <label>说明</label>
          <textarea v-model="editForm.desc" rows="3" placeholder="字段用途说明"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" @click="closeFieldEdit">取消</button>
        <button class="btn btn-primary" @click="saveFieldEdit">保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-code {
  font-family: monospace;
  color: var(--text-light);
}
</style>
