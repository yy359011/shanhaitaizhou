/**
 * 后台管理 mock 数据（等价还原原型 admin.html 的 9 个模块）
 */
import type { AdminUser, DocCategory, DocType, FieldConfig, ModuleConfig } from '@/types'
import { DOC_CATEGORIES, DOC_TYPES } from '@/constants/schema'

/** 用户管理（原型控制台统计：用户 6） */
export const ADMIN_USERS: AdminUser[] = [
  {
    id: 1,
    username: 'admin',
    nickname: '系统管理员',
    role: '超级管理员',
    dept: '台州市图书馆 · 信息技术部',
    status: '启用',
    lastLogin: '2026-09-23 09:12',
  },
  {
    id: 2,
    username: 'linhai',
    nickname: '临海分馆',
    role: '内容管理员',
    dept: '临海市图书馆',
    status: '启用',
    lastLogin: '2026-09-22 16:40',
  },
  {
    id: 3,
    username: 'wenling',
    nickname: '温岭分馆',
    role: '内容管理员',
    dept: '温岭市图书馆',
    status: '启用',
    lastLogin: '2026-09-21 10:05',
  },
  {
    id: 4,
    username: 'tiantai',
    nickname: '天台分馆',
    role: '内容管理员',
    dept: '天台县图书馆',
    status: '启用',
    lastLogin: '2026-09-20 14:28',
  },
  {
    id: 5,
    username: 'auditor',
    nickname: '审核员',
    role: '审核员',
    dept: '台州市图书馆 · 地方文献部',
    status: '启用',
    lastLogin: '2026-09-19 11:02',
  },
  {
    id: 6,
    username: 'guest',
    nickname: '访客账号',
    role: '只读用户',
    dept: '—',
    status: '停用',
    lastLogin: '2026-08-30 15:47',
  },
]

/** 模块设置（开关项） */
export const MODULE_CONFIGS: ModuleConfig[] = [
  { name: '资源检索', desc: '面向读者开放文献题名 / 责任者 / 关键词检索', enabled: true },
  { name: '分类导航', desc: '按一级分类与文献类型浏览全部文献', enabled: true },
  { name: '知识图谱', desc: '发布人物 / 机构 / 事件 / 地名四类图谱', enabled: true },
  { name: '推荐导读', desc: '首页展示推荐文献卡片', enabled: true },
  { name: '山海十景', desc: '首页展示台州十处代表性景观', enabled: true },
  { name: '舌尖山海', desc: '首页展示台州地方风味', enabled: true },
  { name: '文献细览', desc: '在线阅览 PDF 与视频资源', enabled: true },
  { name: '访问统计', desc: '记录并展示页面访问数据', enabled: false },
]

/** 一级分类（可在后台增删） */
export const CATEGORY_CONFIG: DocCategory[] = [...DOC_CATEGORIES]

/** 文献类型（可在后台增删） */
export const TYPE_CONFIG: DocType[] = [...DOC_TYPES]

/** 字段管理：图书 14 字段 */
export const BOOK_FIELD_CONFIGS: FieldConfig[] = [
  { name: '记录标识号', code: 'sysId', dataType: '文本', required: '必填', desc: '文献唯一标识，系统自动生成', enabled: true },
  { name: '正题名', code: 'title', dataType: '文本', required: '必填', desc: '文献的主要题名', enabled: true },
  { name: '责任者', code: 'author', dataType: '文本', required: '必填', desc: '编著者或责任机构', enabled: true },
  { name: '分类号', code: 'classNo', dataType: '文本', required: '选填', desc: '中图法分类号', enabled: true },
  { name: '语种', code: 'language', dataType: '下拉', required: '选填', desc: '中文 / 英文', enabled: true },
  { name: 'ISBN', code: 'isbn', dataType: '文本', required: '选填', desc: '国际标准书号', enabled: true },
  { name: '关键词', code: 'keywords', dataType: '多值', required: '选填', desc: '以空格分隔的多个关键词', enabled: true },
  { name: '摘要', code: 'summary', dataType: '长文本', required: '选填', desc: '内容提要', enabled: true },
  { name: '附注', code: 'note', dataType: '长文本', required: '选填', desc: '补充说明信息', enabled: true },
  { name: '出版者', code: 'publisher', dataType: '文本', required: '选填', desc: '出版机构名称', enabled: true },
  { name: '出版地', code: 'publishPlace', dataType: '文本', required: '选填', desc: '出版城市', enabled: true },
  { name: '出版日期', code: 'publishDate', dataType: '日期', required: '选填', desc: '出版年月', enabled: true },
  { name: '格式', code: 'format', dataType: '下拉', required: '选填', desc: 'PDF / EPUB', enabled: true },
  { name: '页数', code: 'pageCount', dataType: '数字', required: '选填', desc: '总页数', enabled: true },
]

/** 字段管理：视频 17 字段 */
export const VIDEO_FIELD_CONFIGS: FieldConfig[] = [
  { name: '记录标识号', code: 'sysId', dataType: '文本', required: '必填', desc: '文献唯一标识，系统自动生成', enabled: true },
  { name: '正题名', code: 'title', dataType: '文本', required: '必填', desc: '视频主要题名', enabled: true },
  { name: '责任者', code: 'author', dataType: '文本', required: '必填', desc: '摄制单位或责任人', enabled: true },
  { name: '责任方式', code: 'respType', dataType: '下拉', required: '选填', desc: '编导 / 主讲 / 摄制', enabled: true },
  { name: '分类号', code: 'classNo', dataType: '文本', required: '选填', desc: '中图法分类号', enabled: true },
  { name: '时长', code: 'duration', dataType: '时间', required: '选填', desc: '视频总时长', enabled: true },
  { name: '声道语种', code: 'audioLang', dataType: '下拉', required: '选填', desc: '汉语普通话等', enabled: true },
  { name: '字幕语种', code: 'subLang', dataType: '下拉', required: '选填', desc: '中文字幕等', enabled: true },
  { name: '关键词', code: 'keywords', dataType: '多值', required: '选填', desc: '以空格分隔的多个关键词', enabled: true },
  { name: '附注', code: 'note', dataType: '长文本', required: '选填', desc: '补充说明信息', enabled: true },
  { name: '简介', code: 'summary', dataType: '长文本', required: '选填', desc: '内容简介', enabled: true },
  { name: 'MPG 格式', code: 'mpgFormat', dataType: '文本', required: '选填', desc: '主文件封装格式', enabled: true },
  { name: 'MPG 文件大小', code: 'mpgSize', dataType: '文本', required: '选填', desc: '主文件体积', enabled: true },
  { name: 'MPG 技术细节', code: 'mpgDetail', dataType: '长文本', required: '选填', desc: '分辨率 / 帧率 / 码率', enabled: true },
  { name: 'MP4 格式', code: 'mp4Format', dataType: '文本', required: '选填', desc: '衍生文件封装格式', enabled: true },
  { name: 'MP4 文件大小', code: 'mp4Size', dataType: '文本', required: '选填', desc: '衍生文件体积', enabled: true },
  { name: 'MP4 技术细节', code: 'mp4Detail', dataType: '长文本', required: '选填', desc: '分辨率 / 帧率 / 码率', enabled: true },
]

/** 布局调整：页面区块（支持拖动排序） */
export const LAYOUT_BLOCKS: Record<string, Array<{ id: string; name: string; enabled: boolean }>> = {
  首页: [
    { id: 'hero', name: '顶部检索区', enabled: true },
    { id: 'recommend', name: '推荐导读', enabled: true },
    { id: 'scenery', name: '山海十景', enabled: true },
    { id: 'food', name: '舌尖山海', enabled: true },
    { id: 'footer', name: '页脚', enabled: true },
  ],
  分类导航: [
    { id: 'category', name: '一级分类', enabled: true },
    { id: 'type', name: '文献类型侧栏', enabled: true },
    { id: 'table', name: '文献列表', enabled: true },
    { id: 'pagination', name: '分页', enabled: true },
  ],
  知识图谱: [
    { id: 'sidebar', name: '图谱目录侧栏', enabled: true },
    { id: 'canvas', name: '图谱画布', enabled: true },
    { id: 'legend', name: '图例', enabled: true },
    { id: 'footer', name: '底部标识栏', enabled: true },
  ],
}

/** 近 7 天访问趋势（原型内联柱状图数据） */
export const VISIT_TREND: Array<{ date: string; value: number }> = [
  { date: '09-17', value: 88 },
  { date: '09-18', value: 125 },
  { date: '09-19', value: 75 },
  { date: '09-20', value: 150 },
  { date: '09-21', value: 113 },
  { date: '09-22', value: 423 },
  { date: '09-23', value: 328 },
]

/** 今日访问量（原型控制台固定值） */
export const TODAY_VISITS = 328

/** 页面访问排行 */
export const PAGE_RANK: Array<{ page: string; pv: number; ratio: number }> = [
  { page: '首页', pv: 1286, ratio: 34 },
  { page: '分类导航', pv: 942, ratio: 25 },
  { page: '资源检索', pv: 718, ratio: 19 },
  { page: '文献详情', pv: 486, ratio: 13 },
  { page: '知识图谱', pv: 352, ratio: 9 },
]

/** 权限设置：角色与权限矩阵 */
export const PERM_ROLES = ['超级管理员', '内容管理员', '审核员', '只读用户'] as const

export const PERM_ITEMS: Array<{ name: string; values: boolean[] }> = [
  { name: '查看控制台', values: [true, true, true, true] },
  { name: '新增 / 编辑文献', values: [true, true, false, false] },
  { name: '删除文献', values: [true, false, false, false] },
  { name: '审核发布', values: [true, false, true, false] },
  { name: '模块与布局设置', values: [true, false, false, false] },
  { name: '字段管理', values: [true, false, false, false] },
  { name: '用户与权限管理', values: [true, false, false, false] },
  { name: '查看访问统计', values: [true, true, true, true] },
]

/** 系统设置 */
export const SYSTEM_SETTINGS = {
  siteName: '山海台州 · 文旅记忆',
  siteSubtitle: '台州旅游主题文献知识化专题库平台',
  org: '台州市图书馆',
  slogan: '山海水城・和合圣地',
  icp: '浙ICP备00000000号',
  copyright: '© 台州市图书馆',
  pageSize: 10,
  storage: '/data/taizhou-literature',
  version: 'v1.0.0',
}

/** 压缩包导入限制 */
export const IMPORT_LIMIT_MB = 200
/** 单文件上传限制 */
export const UPLOAD_LIMIT_MB = 500
