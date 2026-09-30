/**
 * 首页展示数据：山海十景 + 舌尖山海
 * 山海十景：使用本地素材图（src/images/）
 * 舌尖山海：保留文生图服务地址（原型 assets/ 位图不存在）
 */
import type { FoodItem, ScenerySpot } from '@/types'
import { img } from '@/utils/image'

import shenxianjvUrl from '@/images/shenxianjv.jpeg'
import tiantaishanUrl from '@/images/tiantaishan.jpeg'
import chengqiangUrl from '@/images/chengqiang.jpeg'
import dachendaoUrl from '@/images/dachendao.jpeg'
import shefandaoUrl from '@/images/shefandao.jpeg'
import haiyangshijieUrl from '@/images/haiyangshijie.jpeg'
import fantanguzhenUrl from '@/images/fantanguzhen.jpeg'
import xiaoruocunUrl from '@/images/xiaoruocun.jpeg'
import qiongtaixianguUrl from '@/images/qiongtaixiangu.jpeg'
import chichengshanUrl from '@/images/chichengshan.jpeg'

/** 山海十景 */
export const SCENERY_SPOTS: ScenerySpot[] = [
  { name: '神仙居', short: '云海奇峰', img: shenxianjvUrl, rating: '5A', desc: '国家级风景名胜区，以流纹岩地貌与云海奇观著称，山势奇险，云雾缭绕。', addr: '台州市仙居县白塔镇', graphId: 'p_shenxianju' },
  { name: '天台山', short: '佛宗道源', img: tiantaishanUrl, rating: '5A', desc: '中国佛教天台宗发祥地、道教南宗祖庭，素以「佛宗道源、山水神秀」闻名。', addr: '台州市天台县赤城街道', graphId: 'p_tiantai' },
  { name: '台州府城墙', short: '江南长城', img: chengqiangUrl, rating: '5A', desc: '始建于东晋，形制独特、保存完整，被称为「江南长城」，全国重点文物保护单位。', addr: '台州市临海市古城街道', graphId: 'p_taizhoufu' },
  { name: '大陈岛', short: '垦荒记忆', img: dachendaoUrl, rating: '4A', desc: '椒江区东部海岛，垦荒精神发源地，海蚀景观壮美，是重要的海岛旅游目的地。', addr: '台州市椒江区大陈镇', graphId: 'p_dachengtuo' },
  { name: '蛇蟠岛', short: '千洞之岛', img: shefandaoUrl, rating: '4A', desc: '三门县海岛，因千年采石留下大量洞窟群，被誉为「千洞之岛」，洞内冬暖夏凉。', addr: '台州市三门县蛇蟠乡', graphId: 'p_shepandao' },
  { name: '台州海洋世界', short: '海洋科普', img: haiyangshijieUrl, rating: '4A', desc: '集展示、科普与互动于一体的大型海洋主题场馆，是青少年海洋科普教育基地。', addr: '台州市椒江区', graphId: 'p_haiyangshijie' },
  { name: '皤滩古镇', short: '千年盐道', img: fantanguzhenUrl, rating: '4A', desc: '仙居县历史古镇，因古代盐道而兴，保留大量明清商业建筑与鹅卵石长街。', addr: '台州市仙居县皤滩乡', graphId: 'p_potangu' },
  { name: '小箬村', short: '七彩渔村', img: xiaoruocunUrl, rating: '3A', desc: '温岭市石塘镇网红渔村，彩色石屋层层叠叠，被称为「七彩小岛」。', addr: '台州市温岭市石塘镇', graphId: 'p_xiaoruo' },
  { name: '琼台仙谷', short: '峡谷飞瀑', img: qiongtaixianguUrl, rating: '4A', desc: '天台山核心景区之一，峡谷幽深、飞瀑层叠，留有丰富的道教文化遗迹。', addr: '台州市天台县', graphId: 'p_qiongtai' },
  { name: '赤城山', short: '丹霞孤峰', img: chichengshanUrl, rating: '3A', desc: '天台山南麓的丹霞地貌孤山，山色赤赭如霞，为天台山标志性景观。', addr: '台州市天台县赤城街道', graphId: 'p_chicheng' },
]

/** 舌尖山海 */
export const FOOD_ITEMS: FoodItem[] = [
  { name: '大陈黄鱼', region: '椒江区大陈镇', tag: '国家地理标志产品', img: img('红烧大黄鱼摆盘，金黄鱼身配葱姜，青花瓷盘，中式美食摄影，横构图', 'landscape_4_3'), videoTitle: '《大陈黄鱼：东海馈赠的鲜味》', graphId: 'e_dchyy', desc: '大陈海域传统网箱养殖的大黄鱼，肉质细嫩、体色金黄，是台州海味的代表。' },
  { name: '姜汤面', region: '临海市 / 台州全域', tag: '非物质文化遗产', img: img('台州姜汤面，深色姜汤中细面与虾干香菇浇头，粗陶碗，热气，横构图', 'landscape_4_3'), videoTitle: '《姜汤面：台州人的清晨》', graphId: 'e_jtangmian', desc: '以老姜熬汤为底的传统面食，暖胃驱寒，是月子与冬令进补的经典吃食。' },
  { name: '临海麦虾', region: '临海市', tag: '传统面食', img: img('临海麦虾，麦粉浆拨成的条状面食在清汤中配青菜，家常碗装，横构图', 'landscape_4_3'), videoTitle: '《临海麦虾：一碗面食里的乡愁》', graphId: 'e_linhaimaixia', desc: '以小麦粉浆入沸汤拨成条状，形似小虾而得名，是古城最日常的早餐之一。' },
  { name: '三门青蟹', region: '三门县', tag: '国家地理标志产品', img: img('清蒸三门青蟹，壳薄膏黄，配姜醋，白瓷盘，中式美食摄影，横构图', 'landscape_4_3'), videoTitle: '《三门青蟹：滩涂上的黄金》', graphId: 'e_smenqingxie', desc: '三门湾滩涂养殖的青蟹，壳薄、膏黄、肉嫩，为国家地理标志保护产品。' },
  { name: '天台扁食', region: '天台县', tag: '年节食品', img: img('天台扁食，半月形薄皮面点蒸熟摆盘，配蘸料，竹制蒸笼，横构图', 'landscape_4_3'), graphId: 'e_tiantaiyanshi', desc: '天台县传统年节食品，薄面皮包裹馅料捏成半月形，春节期间家家必做。' },
  { name: '温岭石塘鱼丸', region: '温岭市石塘镇', tag: '海鲜小吃', img: img('石塘鱼丸汤，洁白鱼丸在清汤中配紫菜葱花，粗陶碗，横构图', 'landscape_4_3'), graphId: 'e_shitangyuwan', desc: '渔家传统小吃，以新鲜海鱼捶打成茸，入口弹韧，汤清味鲜。' },
  { name: '乌饭麻糍', region: '临海市 / 台州全域', tag: '传统节令小吃', img: img('乌饭麻糍，深紫色糯米糕切块撒松花粉，竹叶垫底，横构图', 'landscape_4_3'), videoTitle: '《乌饭麻糍：立夏时节的青香》', graphId: 'e_wufanmaci', desc: '以乌饭树叶汁浸糯米制成，立夏前后食用，是台州「糯叽叽」食俗的代表。' },
  { name: '食饼筒', region: '黄岩区 / 台州全域', tag: '非物质文化遗产', img: img('台州食饼筒，薄饼卷入多种菜肴后煎至金黄，切段摆盘，横构图', 'landscape_4_3'), videoTitle: '《食饼筒：卷起的台州年味》', graphId: 'e_shipingtong', desc: '以薄饼卷裹十余种菜肴，又称「麦油脂」，是台州最具代表性的节庆食品。' },
  { name: '海苔饼', region: '临海市紫阳街', tag: '非物质文化遗产', img: img('临海海苔饼，圆形酥饼层层起酥，海苔碎点缀，油纸包装，横构图', 'landscape_4_3'), videoTitle: '《海苔饼：紫阳街的老味道》', graphId: 'e_linhaihaitai', desc: '紫阳街传统糕点，以海苔与面粉烘烤而成，咸香酥脆，是最受欢迎的伴手礼。' },
  { name: '蛋清羊尾', region: '临海市', tag: '非物质文化遗产', img: img('蛋清羊尾，雪白蓬松的油炸甜点撒糖粉，白瓷碟，中式甜点摄影，横构图', 'landscape_4_3'), videoTitle: '《蛋清羊尾：失传边缘的甜》', graphId: 'e_danqingyangwei', desc: '以蛋清打发裹豆沙油炸，形似羊尾，外脆内糯，是临海传统宴席甜点。' },
]
