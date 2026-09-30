/**
 * 元数据（等价还原原型 metaData.js 的 META_BOOK / META_VIDEO）
 * 说明：原型中每个 sysId 都有独立著录值；此处按分类规则可复现地生成，
 *       并对关键条目做手工覆盖，保证详情页数据真实可读。
 *
 * 字段名归一化：admin.html 的 dataRows 使用 role / subtitleLang，
 *              前台 schema 使用 respType / subLang，统一输出后者。
 */
import type { BookMeta, DocCategory, LiteratureItem, VideoMeta } from '@/types'
import { LITERATURE_DATA } from './literature'

/** 分类 → 中图法分类号前缀 */
const CLASS_NO_BY_CATEGORY: Record<DocCategory, string> = {
  饮食文化: 'TS971.2',
  自然景观: 'K928.7',
  非遗传承: 'J528',
  人文历史: 'K295.5',
}

/** 出版者（按责任者推断，兜底用台州本地出版机构） */
function pickPublisher(author: string): string {
  if (author.includes('图书馆')) return '国家图书馆出版社'
  if (author.includes('局') || author.includes('办公室') || author.includes('中心')) return '方志出版社'
  if (author.includes('协会') || author.includes('学会') || author.includes('研究会')) return '浙江古籍出版社'
  return '浙江人民出版社'
}

/** 可复现的伪随机（避免每次渲染数据跳动） */
function pseudo(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  const r = x - Math.floor(x)
  return Math.floor(min + r * (max - min + 1))
}

/** 生成图书著录 */
function buildBookMeta(item: LiteratureItem, index: number): BookMeta {
  const seed = index + 1
  const pages = pseudo(seed, 128, 486)
  return {
    sysId: item.sysId,
    title: item.title,
    author: item.author,
    classNo: `${CLASS_NO_BY_CATEGORY[item.category]}-${String(pseudo(seed, 1, 89)).padStart(2, '0')}`,
    language: '中文',
    isbn: `978-7-${pseudo(seed, 100, 999)}-${pseudo(seed * 3, 1000, 9999)}-${pseudo(seed * 7, 1, 9)}`,
    keywords: item.keywords,
    summary: `本资源围绕「${item.title}」展开，系统梳理了${item.category}相关内容，涵盖历史沿革、地域特征与当代价值，是了解台州${item.category}的重要地方文献。`,
    note: index % 4 === 0 ? '' : `本书由${item.author}整理编撰，收录图片${pseudo(seed * 5, 20, 180)}幅，附参考文献。`,
    publisher: pickPublisher(item.author),
    publishPlace: index % 3 === 0 ? '杭州' : '台州',
    publishDate: `${pseudo(seed * 2, 2014, 2024)}年${pseudo(seed * 11, 1, 12)}月`,
    format: index % 5 === 0 ? 'EPUB' : 'PDF',
    pageCount: String(pages),
  }
}

/** 生成视频著录 */
function buildVideoMeta(item: LiteratureItem, index: number): VideoMeta {
  const seed = index + 1
  const mm = pseudo(seed * 13, 12, 58)
  const sizeMpg = (pseudo(seed * 17, 800, 3600) / 1000).toFixed(2)
  const sizeMp4 = (Number(sizeMpg) * 0.42).toFixed(2)
  return {
    sysId: item.sysId,
    title: item.title,
    author: item.author,
    respType: index % 3 === 0 ? '主讲' : '编导',
    classNo: `${CLASS_NO_BY_CATEGORY[item.category]}-${String(pseudo(seed, 1, 89)).padStart(2, '0')}`,
    duration: `${pseudo(seed * 19, 8, 46)}分${String(mm).padStart(2, '0')}秒`,
    audioLang: '汉语普通话',
    subLang: index % 4 === 0 ? '' : '中文字幕',
    keywords: item.keywords,
    note: index % 3 === 0 ? '' : `拍摄于台州，素材来源：${item.author}。`,
    summary: `本片以「${item.title}」为主题，通过实地拍摄与人物访谈，呈现台州${item.category}的真实面貌与人文底蕴。`,
    mpgFormat: 'MPEG-PS',
    mpgSize: `${sizeMpg} GB`,
    mpgDetail: `1920×1080 / 25fps / 视频码率 ${pseudo(seed * 23, 18, 32)} Mbps / 音频 PCM 48kHz 立体声`,
    mp4Format: 'MP4 (H.264)',
    mp4Size: `${sizeMp4} GB`,
    mp4Detail: `1920×1080 / 25fps / 视频码率 ${pseudo(seed * 29, 6, 12)} Mbps / 音频 AAC 128kbps`,
  }
}

/** 手工覆盖的关键条目（保证首页推荐与分类置顶条目的著录内容更真实） */
const BOOK_OVERRIDES: Record<string, Partial<BookMeta>> = {
  '110820260710000093': {
    classNo: 'K928.78-01',
    isbn: '978-7-308-19283-4',
    publisher: '浙江大学出版社',
    publishPlace: '杭州',
    publishDate: '2020年2月',
    format: 'PDF',
    pageCount: '236',
    summary:
      '《温岭老桥》以田野调查为基础，逐一记录了温岭境内现存古桥的建筑形制、营造工艺与兴废沿革，配以实测图纸与老照片，是研究浙东石拱桥的重要乡土文献。',
    note: '附温岭古桥分布图 1 幅、实测图纸 28 张。',
  },
  '110820260710000011': {
    classNo: 'K295.53-06',
    isbn: '978-7-101-11876-2',
    publisher: '中华书局',
    publishPlace: '北京',
    publishDate: '2016年7月',
    format: 'PDF',
    pageCount: '384',
    summary:
      '本书考述六朝时期临海郡的建置沿革、辖境变迁与地方社会，利用正史、方志及出土碑刻材料，重新厘定临海郡在浙东行政地理中的位置。',
    note: '附参考文献与征引书目。',
  },
  '110820260710000096': {
    classNo: 'K925.55-04',
    isbn: '978-7-112-25601-8',
    publisher: '中国建筑工业出版社',
    publishPlace: '北京',
    publishDate: '2021年9月',
    format: 'PDF',
    pageCount: '412',
    summary:
      '《台州古村落》系统调查了台州九县市区内保存较好的传统村落，从选址格局、街巷肌理、建筑类型到民俗生活逐项记录，是传统村落保护的基础性资料集。',
    note: '附村落分布图与测绘图纸。',
  },
  '110820260710000092': {
    classNo: 'X321.55-02',
    isbn: '978-7-5111-4682-3',
    publisher: '中国环境出版集团',
    publishPlace: '北京',
    publishDate: '2021年7月',
    format: 'PDF',
    pageCount: '268',
  },
  '110820260710000094': {
    classNo: 'K295.53-08',
    isbn: '978-7-5144-3712-6',
    publisher: '方志出版社',
    publishPlace: '北京',
    publishDate: '2019年4月',
    format: 'PDF',
    pageCount: '520',
  },
  '110820260710000095': {
    classNo: 'G258.6-03',
    isbn: '978-7-5013-7412-9',
    publisher: '国家图书馆出版社',
    publishPlace: '北京',
    publishDate: '2022年12月',
    format: 'PDF',
    pageCount: '186',
  },
}

const VIDEO_OVERRIDES: Record<string, Partial<VideoMeta>> = {
  '110820260716000126': {
    author: '宁波大学图书馆',
    respType: '测试',
    duration: '测试',
    audioLang: '测试',
    subLang: '测试',
    note: '测试',
    summary: '样例视频，用于演示视频类文献的元数据著录与在线播放。',
  },
  '110820260716000127': {
    respType: '编导',
    duration: '32分18秒',
    summary:
      '第四集《山野时鲜》走进括苍山腹地，记录山民采撷春笋、蕨菜与野菌的日常，讲述山野食材如何走上台州人的餐桌。',
    mpgFormat: 'MPEG-PS',
    mpgSize: '2.86 GB',
    mpgDetail: '1920×1080 / 25fps / 视频码率 24 Mbps / 音频 PCM 48kHz 立体声',
    mp4Format: 'MP4 (H.264)',
    mp4Size: '1.12 GB',
    mp4Detail: '1920×1080 / 25fps / 视频码率 8 Mbps / 音频 AAC 128kbps',
  },
  '110820260716000123': {
    respType: '编导',
    duration: '28分40秒',
    summary:
      '第一集《古城烟火》穿行临海老城的街巷，从清晨的麦虾摊到深夜的海苔饼铺，记录古城里延续百年的舌尖记忆。',
  },
  '110820260716000101': {
    respType: '主讲',
    duration: '46分05秒',
    summary:
      '本场讲座从地理环境、物产结构与移民史三个维度，系统阐述台州饮食文化的渊源及其地域特质。',
  },
}

/** 图书著录表 */
export const META_BOOK: Record<string, BookMeta> = {}
/** 视频著录表 */
export const META_VIDEO: Record<string, VideoMeta> = {}

LITERATURE_DATA.forEach((item, i) => {
  if (item.type === '视频') {
    META_VIDEO[item.sysId] = { ...buildVideoMeta(item, i), ...VIDEO_OVERRIDES[item.sysId] }
  } else {
    META_BOOK[item.sysId] = { ...buildBookMeta(item, i), ...BOOK_OVERRIDES[item.sysId] }
  }
})

/** 取原始著录表 */
export function getRawMeta(item: LiteratureItem): BookMeta | VideoMeta {
  return item.type === '视频' ? META_VIDEO[item.sysId] || {} : META_BOOK[item.sysId] || {}
}
