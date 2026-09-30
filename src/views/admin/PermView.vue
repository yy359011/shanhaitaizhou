<script setup lang="ts">
/**
 * 后台 · 权限设置
 * 原型：admin.html renderPerm()
 *
 * 说明：权限矩阵由 getPermissionMatrix() 提供（4 角色 × 8 权限项）；
 * 角色代码 / 可访问模块 / 操作权限为原型静态展示值，人数由用户列表统计得出。
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getPermissionMatrix, getUsers } from '@/api/admin'
import type { AdminUser } from '@/types'

interface MatrixItem {
  name: string
  values: boolean[]
}

/** 角色代码与权限描述（原型静态值） */
const ROLE_META: Record<string, { code: string; modules: string; perm: string }> = {
  超级管理员: { code: 'super_admin', modules: '全部模块', perm: '完全控制' },
  内容管理员: { code: 'content_admin', modules: '数据管理 + 模块设置 + 布局调整', perm: '增删改查' },
  审核员: { code: 'reviewer', modules: '数据管理', perm: '审核 + 发布' },
  只读用户: { code: 'viewer', modules: '控制台 + 访问统计', perm: '只读' },
}

const MODULE_OPTIONS = ['控制台', '数据管理', '模块设置', '布局调整', '字段管理', '访问统计']
const PERM_OPTIONS = ['完全控制', '增删改查', '新增+编辑', '只读']

const roles = ref<string[]>([])
const matrixItems = ref<MatrixItem[]>([])
const users = ref<AdminUser[]>([])
/** 新增角色补充的展示信息 */
const extraMeta = ref<Record<string, { code: string; modules: string; perm: string }>>({})

const newRole = reactive({
  name: '',
  code: '',
  modules: [] as string[],
  perm: PERM_OPTIONS[0],
})

/** 角色列表：以权限矩阵角色为准，人数取自用户列表 */
const roleRows = computed(() =>
  roles.value.map((role) => {
    const meta = (extraMeta.value[role] ?? ROLE_META[role]) || { code: '—', modules: '—', perm: '—' }
    return {
      role,
      code: meta.code,
      modules: meta.modules,
      perm: meta.perm,
      count: users.value.filter((user) => user.role === role).length,
    }
  }),
)

function editRole() {
  ElMessage.info('编辑角色权限需对接后端接口后开放')
}

function savePerm() {
  ElMessage.success('权限已保存')
}

function addRole() {
  const name = newRole.name.trim()
  const code = newRole.code.trim()
  if (!name || !code) {
    ElMessage.warning('角色名称和角色代码不能为空')
    return
  }
  if (roles.value.includes(name)) {
    ElMessage.warning('该角色已存在')
    return
  }
  extraMeta.value[name] = {
    code,
    modules: newRole.modules.length ? newRole.modules.join(' + ') : '—',
    perm: newRole.perm,
  }
  roles.value.push(name)
  matrixItems.value.forEach((item) => item.values.push(false))
  newRole.name = ''
  newRole.code = ''
  newRole.modules = []
  newRole.perm = PERM_OPTIONS[0]
  ElMessage.success('角色已新增')
}

onMounted(async () => {
  const [matrix, userList] = await Promise.all([getPermissionMatrix(), getUsers()])
  roles.value = [...matrix.roles]
  matrixItems.value = matrix.items
  users.value = userList
})
</script>

<template>
  <div class="page-header">
    <div class="page-title">权限设置</div>
    <div class="page-actions">
      <button class="btn btn-outline" @click="addRole">新增角色</button>
      <button class="btn btn-primary" @click="savePerm">保存权限</button>
    </div>
  </div>

  <div class="card">
    <div class="card-title">角色列表</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>角色名称</th>
          <th>角色代码</th>
          <th>可访问模块</th>
          <th>操作权限</th>
          <th>人数</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in roleRows" :key="row.role">
          <td><strong>{{ row.role }}</strong></td>
          <td class="role-code">{{ row.code }}</td>
          <td>{{ row.modules }}</td>
          <td><span class="badge badge-gray">{{ row.perm }}</span></td>
          <td>{{ row.count }}人</td>
          <td><a class="link" @click="editRole">编辑权限</a></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="card">
    <div class="card-title">权限矩阵</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>权限项</th>
          <th v-for="role in roles" :key="role">{{ role }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in matrixItems" :key="item.name">
          <td><strong>{{ item.name }}</strong></td>
          <td v-for="(value, index) in item.values" :key="index" class="matrix-cell">
            <span class="badge" :class="value ? 'badge-green' : 'badge-gray'">{{ value ? '✓' : '✗' }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="card">
    <div class="card-title">新增角色</div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">角色名称</label>
        <input v-model="newRole.name" class="form-input" placeholder="如：高级编辑">
      </div>
      <div class="form-group">
        <label class="form-label">角色代码</label>
        <input v-model="newRole.code" class="form-input" placeholder="如：senior_editor">
      </div>
      <div class="form-group">
        <label class="form-label">可访问模块</label>
        <select v-model="newRole.modules" class="form-select module-select" multiple>
          <option v-for="module in MODULE_OPTIONS" :key="module">{{ module }}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">操作权限</label>
        <select v-model="newRole.perm" class="form-select">
          <option v-for="perm in PERM_OPTIONS" :key="perm">{{ perm }}</option>
        </select>
      </div>
    </div>
    <div style="margin-top: 12px">
      <button class="btn btn-primary" @click="addRole">确认新增</button>
    </div>
  </div>
</template>

<style scoped>
.role-code {
  font-family: monospace;
  color: var(--text-light);
}

.matrix-cell {
  text-align: center;
}

.module-select {
  height: 120px;
}
</style>
