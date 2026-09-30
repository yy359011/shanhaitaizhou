/**
 * 阅读器资源路径映射
 * 等价还原原型 reader.html 的 DATA_DIR / BOOK_PDFS / LECTURE_VIDEOS 常量
 * （工程内将 BOOK_PDFS 泛化为 DOC_PDFS，覆盖图书/折页/期刊/宣传册/地图）。
 *
 * 原型引用的是与页面同级的「台州地方文献项目（临时）」目录；
 * Vue 工程中统一放到 public/resources 下，通过 /resources/... 访问。
 * 若实际媒体文件未部署，阅读页会给出明确提示而不是白屏。
 */

/** 资源根目录（web 访问路径） */
export const RESOURCE_ROOT = '/resources'

const PDF_DIR = `${RESOURCE_ROOT}/台州地方文献项目（临时）/PDF`
const VIDEO_DIR = `${RESOURCE_ROOT}/台州地方文献项目（临时）/讲座`

/** 题名 → PDF 路径（图书 / 折页 / 期刊 / 宣传册 / 地图） */
export const DOC_PDFS: Record<string, string> = {
  // 图书
  台州古村落: `${PDF_DIR}/台州古村落.pdf`,
  温岭生态: `${PDF_DIR}/温岭生态.pdf`,
  温岭老桥: `${PDF_DIR}/温岭老桥.pdf`,
  大陈岛志: `${PDF_DIR}/大陈岛志.pdf`,
  // 折页
  '跟着央视游台州：首届旅游网红打卡点折页': `${PDF_DIR}/跟着央视游台州：首届旅游网红打卡点折页.pdf`,
  皤滩古镇导览折页: `${PDF_DIR}/皤滩古镇导览折页.pdf`,
  温岭曙光园导览折页: `${PDF_DIR}/温岭曙光园导览折页.pdf`,
  天台霞客古道折页: `${PDF_DIR}/天台霞客古道折页.pdf`,
  // 期刊
  天台山文化研究: `${PDF_DIR}/天台山文化研究.pdf`,
  台州文博: `${PDF_DIR}/台州文博.pdf`,
  台州民间文艺: `${PDF_DIR}/台州民间文艺.pdf`,
  灵江文化研究: `${PDF_DIR}/灵江文化研究.pdf`,
  台州气象志: `${PDF_DIR}/台州气象志.pdf`,
  台州美食: `${PDF_DIR}/台州美食.pdf`,
  // 宣传册
  山海台州: `${PDF_DIR}/山海台州.pdf`,
  大美台州旅行攻略: `${PDF_DIR}/大美台州旅行攻略.pdf`,
  玉环大鹿岛旅游手册: `${PDF_DIR}/玉环大鹿岛旅游手册.pdf`,
  // 地图
  台州市公共文化地图: `${PDF_DIR}/台州市公共文化地图.pdf`,
  台州百景图: `${PDF_DIR}/台州百景图.pdf`,
}

/** 非 PDF 文献回退到的默认书 */
export const FALLBACK_BOOK = '温岭老桥'

/** 样例视频 */
export const NINGBO_VIDEO = `${VIDEO_DIR}/宁波大学图书馆特藏文献.mp4`

/** 讲座视频池（与原型一一对应） */
export const LECTURE_VIDEOS: string[] = [
  '闲聊.mp4',
  '狮子头.mp4',
  '劳作.mp4',
  '大坞庙.mp4',
  '“十八步”来历.mp4',
  '上源芳村两句古话的来历.mp4',
  '询问.mp4',
  '村民扩展的传说.mp4',
  '王氏家族及其文化.mp4',
  '手工作坊.mp4',
  '绣溪风光由来.mp4',
  '洗菜场景(乡音).mp4',
  '钓鱼场景.mp4',
  '徐氏家族及其文化 (乡音).mp4',
  '大麦坞名称由来（乡音）.mp4',
  '上湖蓬名称由来（乡音）.mp4',
]

/** 拼接讲座视频完整路径 */
export function lectureVideoPath(index: number): string {
  const name = LECTURE_VIDEOS[((index % LECTURE_VIDEOS.length) + LECTURE_VIDEOS.length) % LECTURE_VIDEOS.length]
  return `${VIDEO_DIR}/${name}`
}
