/**
 * 封面图池
 * 原型中的 assets/*.png 位图不存在，改为按提示词实时生成的图片服务地址
 */
import type { ImageSize } from '@/utils/image'
import { img } from '@/utils/image'

/** 图书类封面（对应原型 BOOK_LIKE_COVERS 6 张） */
const BOOK_LIKE_PROMPTS: Array<[string, ImageSize]> = [
  [
    '中国地方文献书籍封面，米黄色宣纸质感，竖排毛笔书法书名区域留白，简洁东方排版，平铺正面，高清摄影',
    'portrait_4_3',
  ],
  [
    '地方志书籍封面，深墨绿色布面精装，烫金细线边框，中式古典排版，平铺正面，高清摄影',
    'portrait_4_3',
  ],
  [
    '浙东民俗摄影画册封面，暖橙色与米白配色，水墨山水插画，中式简约排版，平铺正面，高清摄影',
    'portrait_4_3',
  ],
  [
    '江南古城旅游图册封面，青灰砖墙与飞檐剪影，素雅留白，中式排版，平铺正面，高清摄影',
    'portrait_4_3',
  ],
  [
    '海洋主题地方文献封面，深蓝色调，浪花与渔船剪影，简洁排版，平铺正面，高清摄影',
    'portrait_4_3',
  ],
  [
    '非遗技艺图录封面，米色纸张底纹，金棕色纹样装饰，中式素雅排版，平铺正面，高清摄影',
    'portrait_4_3',
  ],
]

/** 纪录片封面（对应原型 纪录片1/2/3.png） */
const VIDEO_COVER_PROMPTS: Array<[string, ImageSize]> = [
  [
    '台州临海古城夜晚街巷烟火气，暖黄灯光下传统小吃摊，纪实质感，电影感光影，横构图',
    'landscape_16_9',
  ],
  [
    '江南糯米传统糕点特写，蒸笼热气，暖色柔光，美食纪录片画面，横构图',
    'landscape_16_9',
  ],
  [
    '东海渔港清晨，渔船与海浪，渔民劳作，蓝色调纪实摄影，横构图',
    'landscape_16_9',
  ],
]

/** 视频待机封面（对应原型 测试待机.png） */
const DEFAULT_VIDEO_PROMPT: [string, ImageSize] = [
  '视频播放待机画面，深墨绿色渐变背景，中央简约山海水墨纹理，无文字，横构图',
  'landscape_16_9',
]

/** 图书类封面池 */
export const BOOK_LIKE_COVERS: string[] = BOOK_LIKE_PROMPTS.map(([p, s]) => img(p, s))

/** 纪录片封面池（按集索引 1/2/3） */
export const VIDEO_COVERS: string[] = VIDEO_COVER_PROMPTS.map(([p, s]) => img(p, s))

/** 默认视频封面 */
export const DEFAULT_VIDEO_COVER: string = img(...DEFAULT_VIDEO_PROMPT)

/** 详情页封面加载失败占位 */
export const COVER_FALLBACK_TEXT = '封面加载失败'

/** 原型中纪录片标题与集号的匹配规则 */
export const VIDEO_COVER_SPEC: Array<{ title: string; idx: number }> = [
  { title: '古城烟火：临海老城的舌尖记忆', idx: 1 },
  { title: '糯食人间：台州的糯叽叽风物', idx: 2 },
  { title: '向海而食：大海馈赠的台州滋味', idx: 3 },
]

/** 推荐导读卡片封面提示词（首页 4 张） */
export const RECOMMEND_COVER_PROMPTS: Record<string, string> = {
  温岭老桥: '浙东石拱古桥横跨河面，晨雾与柳树，水墨写意摄影，横构图',
  六朝临海郡考述: '古籍书页与毛笔砚台静物，暖黄宣纸，历史文献质感，横构图',
  宋韵路桥: '宋代风格江南街市，青瓦白墙与灯笼，暖色调，横构图',
  千年古城: '临海古城墙与江南长城全景，云雾缭绕青山，横构图',
}
