<script setup lang="ts">
/**
 * 后台 · 系统设置
 * 原型：admin.html renderSystem()
 *
 * 说明：基本信息字段与存储路径 / 版本号取自 getSystemSettings()；
 * 安全设置、备份策略、系统信息为原型静态展示值，操作日志为原型静态记录。
 */
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemSettings } from '@/api/admin'

interface SelectItem {
  label: string
  options: string[]
}

const SECURITY_OPTIONS: SelectItem[] = [
  { label: '登录密码长度', options: ['6位（最低）', '8位', '10位'] },
  { label: '登录失败锁定', options: ['5次失败后锁定30分钟', '3次失败后锁定1小时', '不锁定'] },
  { label: '会话超时', options: ['30分钟', '1小时', '2小时', '永不超时'] },
]
const STORAGE_OPTIONS: SelectItem[] = [
  { label: '最大上传大小', options: ['100MB', '500MB', '1GB'] },
  { label: '备份周期', options: ['每日', '每周', '每月'] },
]

/** 生成「标签 → 默认选项」的响应式表单状态 */
function createForm(items: SelectItem[]): Record<string, string> {
  return reactive(Object.fromEntries(items.map((item) => [item.label, item.options[0]])))
}

const basic = reactive({
  siteName: '',
  siteSubtitle: '',
  org: '',
  slogan: '',
  icp: '',
  copyright: '',
  pageSize: '',
})
const security = createForm(SECURITY_OPTIONS)
const storage = createForm(STORAGE_OPTIONS)
const storagePath = ref('')
const fileTypes = ref('PDF,MP4,MPG,JPG,PNG')
const captcha = ref(true)
const autoBackup = ref(true)
const whiteList = ref('')
const version = ref('v1.0.0')

const SYSTEM_INFO = [
  { label: '运行环境', value: 'Node.js 18 + Vite 6' },
  { label: '数据库', value: 'SQLite (前端模拟)' },
  { label: '前端框架', value: 'Vue 3 + TypeScript + Element Plus' },
  { label: '知识图谱引擎', value: 'Canvas 2D 力导向' },
  { label: 'PDF阅读器', value: '内嵌 iframe' },
  { label: '视频播放器', value: 'HTML5 Video' },
  { label: '最后更新', value: '2026-08-24' },
]

const OPERATION_LOGS = [
  { time: '2026-08-24 14:32', operator: 'admin', action: '新增文献「大陈岛志」', module: '数据管理', result: '成功' },
  { time: '2026-08-24 13:15', operator: 'zhangsan', action: '编辑知识图谱「齐召南」', module: '数据管理', result: '成功' },
  { time: '2026-08-24 11:08', operator: 'admin', action: '修改系统配色为墨绿', module: '布局调整', result: '成功' },
  { time: '2026-08-23 16:45', operator: 'lisi', action: '新增文献「温岭生态」', module: '数据管理', result: '成功' },
  { time: '2026-08-23 10:20', operator: 'wangwu', action: '审核文献「丹丘瓷韵」', module: '数据管理', result: '待审' },
  { time: '2026-08-22 09:30', operator: 'admin', action: '新增用户「钱七」', module: '用户管理', result: '成功' },
]

function saveSettings() {
  if (!basic.siteName.trim()) {
    ElMessage.warning('系统名称不能为空')
    return
  }
  ElMessage.success('系统设置已保存')
}

onMounted(async () => {
  const data = await getSystemSettings()
  basic.siteName = data.siteName
  basic.siteSubtitle = data.siteSubtitle
  basic.org = data.org
  basic.slogan = data.slogan
  basic.icp = data.icp
  basic.copyright = data.copyright
  basic.pageSize = String(data.pageSize)
  storagePath.value = `${data.storage}/`
  version.value = data.version
})
</script>

<template>
  <div class="page-header">
    <div class="page-title">系统设置</div>
    <div class="page-actions">
      <button class="btn btn-primary" @click="saveSettings">保存设置</button>
    </div>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-title">基本信息</div>
      <div class="form-group">
        <label class="form-label">系统名称</label>
        <input v-model="basic.siteName" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">系统副标题</label>
        <input v-model="basic.siteSubtitle" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">主办单位</label>
        <input v-model="basic.org" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">平台口号</label>
        <input v-model="basic.slogan" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">ICP 备案号</label>
        <input v-model="basic.icp" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">版权信息</label>
        <input v-model="basic.copyright" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">列表每页条数</label>
        <input v-model="basic.pageSize" class="form-input" />
      </div>
    </div>

    <div class="card">
      <div class="card-title">安全设置</div>
      <div v-for="item in SECURITY_OPTIONS" :key="item.label" class="form-group">
        <label class="form-label">{{ item.label }}</label>
        <select v-model="security[item.label]" class="form-select">
          <option v-for="option in item.options" :key="option">{{ option }}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">验证码</label>
        <label class="toggle">
          <input v-model="captcha" type="checkbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="form-group">
        <label class="form-label">IP白名单</label>
        <input v-model="whiteList" class="form-input" placeholder="如：192.168.1.0/24" />
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-title">存储配置</div>
      <div class="form-group">
        <label class="form-label">文件存储路径</label>
        <input v-model="storagePath" class="form-input" />
      </div>
      <div v-for="item in STORAGE_OPTIONS" :key="item.label" class="form-group">
        <label class="form-label">{{ item.label }}</label>
        <select v-model="storage[item.label]" class="form-select">
          <option v-for="option in item.options" :key="option">{{ option }}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">允许的文件类型</label>
        <input v-model="fileTypes" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">自动备份</label>
        <label class="toggle">
          <input v-model="autoBackup" type="checkbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="card">
      <div class="card-title">系统信息</div>
      <div class="system-info">
        <div class="list-item">
          <div class="list-item-text">系统版本</div>
          <div><span class="badge badge-green">{{ version }}</span></div>
        </div>
        <div v-for="item in SYSTEM_INFO" :key="item.label" class="list-item">
          <div class="list-item-text">{{ item.label }}</div>
          <div>{{ item.value }}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">操作日志</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>时间</th>
          <th>操作人</th>
          <th>操作</th>
          <th>模块</th>
          <th>结果</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in OPERATION_LOGS" :key="log.time">
          <td>{{ log.time }}</td>
          <td>{{ log.operator }}</td>
          <td>{{ log.action }}</td>
          <td>{{ log.module }}</td>
          <td>
            <span class="badge" :class="log.result === '成功' ? 'badge-green' : 'badge-gold'">
              {{ log.result }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.system-info {
  font-size: 13px;
  line-height: 2;
}
</style>
