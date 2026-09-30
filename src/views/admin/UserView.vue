<script setup lang="ts">
/**
 * 后台 · 用户管理
 * 原型：admin.html renderUser()
 *
 * 说明：接口层 AdminUser 为「用户名 / 姓名 / 角色 / 所属部门 / 状态 / 最近登录」，
 * 无邮箱与注册时间字段，此处以实际字段列表呈现并保持原型的统计卡片与表格风格；
 * 角色对应权限范围由 ROLE_SCOPE 映射得出。
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { addUser, getUsers, toggleUserStatus } from '@/api/admin'
import type { AdminUser } from '@/types'

/** 角色 → 权限范围（与 mock 角色体系一致） */
const ROLE_SCOPE: Record<string, string> = {
  超级管理员: '全部权限',
  内容管理员: '数据管理 + 模块设置',
  审核员: '数据审核',
  只读用户: '只读',
}

const STATUSES: Array<AdminUser['status']> = ['启用', '停用']

const users = ref<AdminUser[]>([])
const newUser = reactive({
  username: '',
  nickname: '',
  role: '',
  dept: '',
  status: '启用' as AdminUser['status'],
})

const stats = computed(() => ({
  total: users.value.length,
  enabled: users.value.filter((user) => user.status === '启用').length,
  disabled: users.value.filter((user) => user.status === '停用').length,
  roleCount: new Set(users.value.map((user) => user.role)).size,
}))

const roleOptions = computed(() => Array.from(new Set(users.value.map((user) => user.role))))

function scopeOf(role: string) {
  return ROLE_SCOPE[role] || '—'
}

async function loadUsers() {
  users.value = await getUsers()
}

/** 点击状态徽章切换启用 / 停用 */
async function switchStatus(user: AdminUser) {
  const next: AdminUser['status'] = user.status === '启用' ? '停用' : '启用'
  await toggleUserStatus(user.id, next)
  await loadUsers()
  ElMessage.success(`已将「${user.username}」设为${next}`)
}

async function submitUser() {
  const username = newUser.username.trim()
  const nickname = newUser.nickname.trim()
  if (!username || !nickname) {
    ElMessage.warning('请填写用户名和姓名')
    return
  }
  if (!newUser.role) {
    ElMessage.warning('请选择角色')
    return
  }
  if (users.value.some((user) => user.username === username)) {
    ElMessage.warning('该用户名已存在')
    return
  }
  await addUser({
    username,
    nickname,
    role: newUser.role,
    dept: newUser.dept.trim() || '—',
    status: newUser.status,
  })
  await loadUsers()
  newUser.username = ''
  newUser.nickname = ''
  newUser.role = ''
  newUser.dept = ''
  newUser.status = '启用'
  ElMessage.success('用户已新增')
}

function importUsers() {
  ElMessage.info('批量导入用户需对接后端接口后开放')
}

function editUser() {
  ElMessage.info('编辑用户需对接后端接口后开放')
}

function removeUser() {
  ElMessage.info('删除用户需对接后端接口后开放')
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <div class="page-header">
    <div class="page-title">用户管理</div>
    <div class="page-actions">
      <button class="btn btn-outline" @click="importUsers">导入用户</button>
      <button class="btn btn-primary" @click="submitUser">新增用户</button>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-icon" style="background: #e8f0ee; color: var(--primary-dark)">◉</div>
      <div class="stat-info">
        <div class="stat-label">总用户数</div>
        <div class="stat-value">{{ stats.total }}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background: #e8f0ee; color: var(--primary-dark)">▣</div>
      <div class="stat-info">
        <div class="stat-label">启用账号</div>
        <div class="stat-value">{{ stats.enabled }}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background: #faf0e0; color: #9a7830">◑</div>
      <div class="stat-info">
        <div class="stat-label">停用账号</div>
        <div class="stat-value">{{ stats.disabled }}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background: #f5e5e4; color: var(--danger)">◐</div>
      <div class="stat-info">
        <div class="stat-label">角色种类</div>
        <div class="stat-value">{{ stats.roleCount }}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <table class="data-table">
      <thead>
        <tr>
          <th>用户名</th>
          <th>姓名</th>
          <th>所属部门</th>
          <th>角色</th>
          <th>权限范围</th>
          <th>最近登录</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td><strong>{{ user.username }}</strong></td>
          <td>{{ user.nickname }}</td>
          <td>{{ user.dept }}</td>
          <td><span class="badge badge-gray">{{ user.role }}</span></td>
          <td>{{ scopeOf(user.role) }}</td>
          <td>{{ user.lastLogin }}</td>
          <td>
            <span
              class="badge status-badge"
              :class="user.status === '启用' ? 'badge-green' : 'badge-gray'"
              title="点击切换启用 / 停用"
              @click="switchStatus(user)"
            >
              {{ user.status }}
            </span>
          </td>
          <td>
            <a class="link" @click="editUser">编辑</a>
            <a class="link link-danger" @click="removeUser">删除</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="card">
    <div class="card-title">新增用户</div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">用户名</label>
        <input v-model="newUser.username" class="form-input" placeholder="请输入用户名">
      </div>
      <div class="form-group">
        <label class="form-label">姓名</label>
        <input v-model="newUser.nickname" class="form-input" placeholder="请输入姓名">
      </div>
      <div class="form-group">
        <label class="form-label">所属部门</label>
        <input v-model="newUser.dept" class="form-input" placeholder="如：台州市图书馆 · 信息技术部">
      </div>
      <div class="form-group">
        <label class="form-label">角色</label>
        <select v-model="newUser.role" class="form-select">
          <option value="">请选择角色</option>
          <option v-for="role in roleOptions" :key="role">{{ role }}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">状态</label>
        <select v-model="newUser.status" class="form-select">
          <option v-for="status in STATUSES" :key="status">{{ status }}</option>
        </select>
      </div>
    </div>
    <div style="margin-top: 12px">
      <button class="btn btn-primary" @click="submitUser">确认新增</button>
    </div>
  </div>
</template>

<style scoped>
.status-badge {
  cursor: pointer;
}

.link + .link {
  margin-left: 8px;
}

.link-danger {
  color: var(--danger);
}
</style>
