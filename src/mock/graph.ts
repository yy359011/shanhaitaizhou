/**
 * 知识图谱数据（等价还原原型 graphData.js 的 GRAPH_DATA）
 * 分类：persons 人物 / institutions 机构 / events 事件 / places 地名
 *
 * 说明：每个图谱以「核心实体」为中心，向关联实体发散；
 *       原型中 10 个地名图谱、10 个事件图谱与首页山海十景 / 舌尖山海一一对应。
 */
import type { GraphCategory, GraphData, GraphEdge, GraphNode, NodeGroup } from '@/types'

/** [标签, 分组, 关系名?, 描述?] */
type Related = [string, NodeGroup, string?, string?]

interface GraphSeed {
  id: string
  category: GraphCategory
  title: string
  /** 右侧信息面板文案 */
  info: string
  /** 核心实体描述 */
  coreDesc: string
  related: Related[]
}

/* ==================== 地名（places） ==================== */

const PLACE_SEEDS: GraphSeed[] = [
  {
    id: 'p_shenxianju',
    category: 'places',
    title: '神仙居',
    info: '国家级风景名胜区，以流纹岩地貌与云海奇观著称，位于仙居县白塔镇。',
    coreDesc: '仙居县西南部，国家级风景名胜区、国家 5A 级旅游景区。',
    related: [
      ['仙居县', 'place', '位于', '台州市下辖县，地处浙东南。'],
      ['流纹岩地貌', 'event', '地貌成因', '白垩纪火山喷发形成的流纹岩台地。'],
      ['韦羌山', 'place', '属', '神仙居主峰所在。'],
      ['徐霞客', 'person', '游历', '明代地理学家，曾考察浙东山水。'],
      ['仙居县自然资源和规划局', 'institution', '管理', '负责景区地质遗迹保护。'],
      ['南天桥', 'place', '景点', '横跨两崖的高空栈桥。'],
    ],
  },
  {
    id: 'p_tiantai',
    category: 'places',
    title: '天台山',
    info: '中国佛教天台宗发祥地、道教南宗祖庭，素以「佛宗道源、山水神秀」闻名。',
    coreDesc: '天台县境内，国家 5A 级旅游景区，国家级重点风景名胜区。',
    related: [
      ['天台县', 'place', '位于', '台州市下辖县。'],
      ['国清寺', 'place', '坐落', '天台宗祖庭。'],
      ['天台宗', 'event', '发祥', '中国佛教第一个本土宗派。'],
      ['寒山', 'person', '隐居', '唐代诗僧，隐居天台寒岩。'],
      ['拾得', 'person', '隐居', '唐代僧，与寒山并称「和合二圣」。'],
      ['天台山文化研究会', 'institution', '研究', '专门研究天台山文化的学术团体。'],
      ['云雾茶', 'event', '物产', '天台山特产名茶。'],
    ],
  },
  {
    id: 'p_taizhoufu',
    category: 'places',
    title: '台州府城墙',
    info: '始建于东晋，被称为「江南长城」，是全国重点文物保护单位。',
    coreDesc: '临海市古城北部，全国重点文物保护单位。',
    related: [
      ['临海市', 'place', '位于', '台州代管县级市，国家历史文化名城。'],
      ['戚继光', 'person', '修筑', '明代抗倭名将，曾增筑城墙敌台。'],
      ['揽胜门', 'place', '城门', '台州府城墙主要城门之一。'],
      ['临海市文物保护管理所', 'institution', '保护', '负责城墙日常修缮与监测。'],
      ['江南长城', 'event', '别称', '因其形制与功能得名。'],
      ['台州府城', 'place', '属', '城墙为府城核心防御体系。'],
    ],
  },
  {
    id: 'p_dachengtuo',
    category: 'places',
    title: '大陈岛',
    info: '位于椒江区东部海域，是垦荒精神发源地与重要海岛旅游目的地。',
    coreDesc: '椒江区大陈镇，由上大陈、下大陈等岛屿组成。',
    related: [
      ['椒江区', 'place', '位于', '台州市主城区之一。'],
      ['大陈黄鱼', 'event', '物产', '国家地理标志产品。'],
      ['垦荒精神', 'event', '诞生', '1956 年青年志愿垦荒队登岛开垦。'],
      ['椒江区档案馆', 'institution', '收藏', '藏有大陈岛垦荒档案。'],
      ['甲午岩', 'place', '景点', '大陈岛标志性海蚀景观。'],
      ['大陈岛渔业志', 'event', '记载', '记录海岛渔业发展历程。'],
    ],
  },
  {
    id: 'p_shepandao',
    category: 'places',
    title: '蛇蟠岛',
    info: '三门县海岛，以千年采石留下的洞窟群著称，被誉为「千洞之岛」。',
    coreDesc: '三门县东南海域，国家 4A 级旅游景区。',
    related: [
      ['三门县', 'place', '位于', '台州市下辖县。'],
      ['采石文化', 'event', '形成', '自宋代延续千年的采石活动。'],
      ['三门青蟹', 'event', '物产', '国家地理标志产品。'],
      ['海盗村', 'place', '景点', '洞窟群中的特色人文景观。'],
      ['三门县文化和广电旅游体育局', 'institution', '管理', '负责景区运营与文化推广。'],
    ],
  },
  {
    id: 'p_haiyangshijie',
    category: 'places',
    title: '台州海洋世界',
    info: '位于椒江区的大型海洋主题科普场馆，是青少年海洋科普教育基地。',
    coreDesc: '椒江区，集展示、科普、互动于一体的海洋主题场馆。',
    related: [
      ['椒江区', 'place', '位于', '台州市主城区之一。'],
      ['海洋科普', 'event', '开展', '面向青少年的常态化科普活动。'],
      ['台州海洋文化', 'event', '展示', '呈现台州海洋文明脉络。'],
      ['台州市海洋与渔业局', 'institution', '指导', '提供海洋生物与生态专业支持。'],
    ],
  },
  {
    id: 'p_potangu',
    category: 'places',
    title: '皤滩古镇',
    info: '仙居县历史古镇，因古代盐道而兴，保留大量明清商业建筑。',
    coreDesc: '仙居县皤滩乡，中国历史文化名镇。',
    related: [
      ['仙居县', 'place', '位于', '台州市下辖县。'],
      ['盐道', 'event', '商贸', '古代食盐转运的重要通道。'],
      ['针刺无骨花灯', 'event', '非遗', '仙居独有的传统灯彩技艺。'],
      ['仙居县文化和广电旅游体育局', 'institution', '保护', '负责古镇保护与利用。'],
      ['何氏里学士府', 'place', '建筑', '古镇内保存完好的明清宅第。'],
    ],
  },
  {
    id: 'p_xiaoruo',
    category: 'places',
    title: '小箬村',
    info: '温岭市石塘镇网红渔村，以彩色石屋闻名，被称为「七彩小岛」。',
    coreDesc: '温岭市石塘镇，依山面海的彩色石屋聚落。',
    related: [
      ['温岭市', 'place', '位于', '台州代管县级市。'],
      ['石塘石屋', 'event', '建筑', '浙东渔村典型石构民居。'],
      ['曙光园', 'place', '邻近', '中国大陆新千年第一缕曙光首照地。'],
      ['温岭市文化和广电旅游体育局', 'institution', '推广', '负责乡村旅游品牌运营。'],
    ],
  },
  {
    id: 'p_qiongtai',
    category: 'places',
    title: '琼台仙谷',
    info: '天台山核心景区之一，以峡谷、飞瀑与道教文化遗迹见长。',
    coreDesc: '天台县境内，天台山国家级风景名胜区核心景区。',
    related: [
      ['天台县', 'place', '位于', '台州市下辖县。'],
      ['道教南宗', 'event', '祖庭', '道教南宗重要活动区域。'],
      ['天台山', 'place', '属', '琼台仙谷为天台山景区组成部分。'],
      ['八仙湖', 'place', '景点', '谷内人工湖泊景观。'],
    ],
  },
  {
    id: 'p_chicheng',
    category: 'places',
    title: '赤城山',
    info: '天台山南麓丹霞地貌孤山，山色赤赭，为天台山标志性景观。',
    coreDesc: '天台县城北，海拔 306 米的丹霞孤山。',
    related: [
      ['天台县', 'place', '位于', '台州市下辖县。'],
      ['济公', 'person', '出生地附近', '南宋高僧，天台人。'],
      ['梁妃塔', 'place', '建筑', '赤城山顶古塔。'],
      ['天台山', 'place', '属', '赤城山为天台山门户。'],
    ],
  },
  {
    id: 'p_kuocang',
    category: 'places',
    title: '括苍山',
    info: '浙东南最高峰所在山脉，主峰米筛浪海拔 1382 米，建有大型风电场。',
    coreDesc: '横跨临海、仙居等地，浙东南重要山脉。',
    related: [
      ['临海市', 'place', '位于', '山脉主要位于临海境内。'],
      ['米筛浪', 'place', '主峰', '海拔 1382 米，浙东南第一高峰。'],
      ['风力发电', 'event', '建设', '浙江省早期山地风电基地。'],
      ['括苍山志', 'event', '记载', '系统记录山脉自然与人文。'],
    ],
  },
  {
    id: 'p_guoqingsi',
    category: 'places',
    title: '国清寺',
    info: '始建于隋代，佛教天台宗祖庭，全国重点文物保护单位。',
    coreDesc: '天台山南麓，隋代古刹，天台宗祖庭。',
    related: [
      ['天台县', 'place', '位于', '台州市下辖县。'],
      ['智顗', 'person', '创立', '天台宗实际创始人，世称智者大师。'],
      ['天台宗', 'event', '祖庭', '中国佛教首个本土宗派。'],
      ['隋梅', 'place', '古树', '寺内千年古梅，传为隋代所植。'],
      ['天台山国清寺', 'institution', '管理', '寺院管理机构。'],
    ],
  },
]

/* ==================== 事件（events，与舌尖山海对应） ==================== */

const EVENT_SEEDS: GraphSeed[] = [
  {
    id: 'e_dchyy',
    category: 'events',
    title: '大陈黄鱼',
    info: '国家地理标志产品。大陈海域传统网箱养殖大黄鱼，以肉质细嫩、体色金黄著称。',
    coreDesc: '椒江区大陈镇特产，国家地理标志保护产品。',
    related: [
      ['大陈岛', 'place', '产地', '黄鱼养殖核心海区。'],
      ['大黄鱼养殖', 'event', '产业', '台州重要的海水养殖产业。'],
      ['椒江区海洋与渔业局', 'institution', '主管', '负责养殖技术推广与品牌管理。'],
      ['台州小海鲜', 'event', '属于', '台州小海鲜代表性品种。'],
      ['大陈岛渔业志', 'event', '记载', '记录黄鱼养殖发展历程。'],
    ],
  },
  {
    id: 'e_jtangmian',
    category: 'events',
    title: '姜汤面',
    info: '台州传统面食，以老姜熬汤为底，是产妇月子与冬令进补的经典吃食。',
    coreDesc: '流行于临海及台州全域的传统面食，已列入非物质文化遗产名录。',
    related: [
      ['临海市', 'place', '流行地', '姜汤面最具代表性的地区。'],
      ['米面', 'event', '主料', '以早米制成的细面。'],
      ['台州饮食文化', 'event', '属于', '体现台州「药食同源」观念。'],
      ['台州市餐饮行业协会', 'institution', '推广', '负责标准制定与技艺传承。'],
      ['月子习俗', 'event', '民俗', '姜汤面与本地生育习俗紧密相关。'],
    ],
  },
  {
    id: 'e_linhaimaixia',
    category: 'events',
    title: '临海麦虾',
    info: '临海传统面食，以小麦粉浆入沸汤拨成条状，形似虾而得名，是古城标志性小吃。',
    coreDesc: '临海市传统面食，台州代表性地方小吃之一。',
    related: [
      ['临海市', 'place', '发源', '麦虾的发源地与核心流行区。'],
      ['紫阳街', 'place', '聚集地', '古城内麦虾店铺集中街区。'],
      ['台州米面与麦虾', 'event', '记载', '介绍其制作技艺与源流。'],
      ['临海市餐饮行业协会', 'institution', '传承', '推动技艺标准化。'],
    ],
  },
  {
    id: 'e_smenqingxie',
    category: 'events',
    title: '三门青蟹',
    info: '国家地理标志产品。三门湾滩涂养殖的青蟹以壳薄、膏黄、肉嫩著称。',
    coreDesc: '三门县特产，国家地理标志保护产品、中国名牌农产品。',
    related: [
      ['三门县', 'place', '产地', '三门湾沿岸滩涂。'],
      ['三门湾', 'place', '海域', '青蟹天然生长的海湾环境。'],
      ['滩涂养殖', 'event', '产业', '三门县农业支柱产业。'],
      ['三门县水产技术推广站', 'institution', '技术', '负责养殖技术研究与推广。'],
    ],
  },
  {
    id: 'e_tiantaiyanshi',
    category: 'events',
    title: '天台扁食',
    info: '天台县传统年节食品，以薄面皮包裹馅料捏成半月形，形似馄饨而更扁。',
    coreDesc: '天台县年节食品，春节期间家家必做。',
    related: [
      ['天台县', 'place', '发源', '天台县传统食俗。'],
      ['年节习俗', 'event', '民俗', '与春节团圆饭紧密相关。'],
      ['天台山素斋', 'event', '关联', '天台山佛教饮食文化影响下的素食传统。'],
      ['天台县餐饮行业协会', 'institution', '推广', '推动地方风味传承。'],
    ],
  },
  {
    id: 'e_shitangyuwan',
    category: 'events',
    title: '温岭石塘鱼丸',
    info: '温岭市石塘镇渔家传统小吃，以新鲜海鱼捶打成茸，口感弹韧。',
    coreDesc: '温岭市石塘镇传统海鲜小吃。',
    related: [
      ['温岭市', 'place', '发源', '石塘镇渔村传统吃食。'],
      ['石塘石屋', 'event', '伴生', '渔村生活方式的一部分。'],
      ['台州小海鲜', 'event', '属于', '以海产为原料的台州小吃。'],
      ['温岭市餐饮行业协会', 'institution', '推广', '组织技艺交流展示。'],
    ],
  },
  {
    id: 'e_wufanmaci',
    category: 'events',
    title: '乌饭麻糍',
    info: '临海及台州全域的传统节令小吃，以乌饭树叶汁浸糯米制成，立夏前后食用。',
    coreDesc: '台州传统节令小吃，与立夏习俗相绑定。',
    related: [
      ['临海市', 'place', '流行地', '临海为核心流行区。'],
      ['立夏', 'event', '节令', '乌饭麻糍的固定食用时令。'],
      ['糯米食俗', 'event', '民俗', '体现台州「糯叽叽」饮食偏好。'],
      ['台州市餐饮行业协会', 'institution', '推广', '参与节令食品推广。'],
    ],
  },
  {
    id: 'e_shipingtong',
    category: 'events',
    title: '食饼筒',
    info: '台州全域节庆食品，以薄饼卷裹十余种菜肴，又称「麦油脂」「五虎擒羊」。',
    coreDesc: '台州最具代表性的节庆食品之一，已列入非物质文化遗产名录。',
    related: [
      ['黄岩区', 'place', '流行地', '黄岩为主要流行区之一。'],
      ['端午', 'event', '节令', '台州端午食饼筒的传统。'],
      ['台州市餐饮行业协会', 'institution', '非遗', '推动制作技艺列入非遗名录。'],
      ['台州饮食文化', 'event', '属于', '体现「山海兼味」的饮食结构。'],
    ],
  },
  {
    id: 'e_linhaihaitai',
    category: 'events',
    title: '海苔饼',
    info: '临海紫阳街传统糕点，以海苔与面粉为原料烘烤而成，咸香酥脆。',
    coreDesc: '临海市传统糕点，紫阳街最具代表性的伴手礼。',
    related: [
      ['临海市', 'place', '发源', '临海古城传统糕点。'],
      ['紫阳街', 'place', '聚集地', '海苔饼店铺集中街区。'],
      ['非物质文化遗产', 'event', '列入', '制作技艺列入非遗名录。'],
      ['临海市餐饮行业协会', 'institution', '传承', '组织技艺保护与推广。'],
    ],
  },
  {
    id: 'e_danqingyangwei',
    category: 'events',
    title: '蛋清羊尾',
    info: '临海传统甜点，以蛋清打发裹豆沙油炸，形似羊尾，外脆内糯。',
    coreDesc: '临海市传统甜点，已列入非物质文化遗产名录。',
    related: [
      ['临海市', 'place', '发源', '临海传统宴席甜点。'],
      ['非物质文化遗产', 'event', '列入', '制作技艺列入非遗名录。'],
      ['台州饮食文化', 'event', '属于', '体现台州甜点工艺传统。'],
      ['临海市餐饮行业协会', 'institution', '传承', '推动技艺传承培训。'],
    ],
  },
]

/* ==================== 人物（persons） ==================== */

const PERSON_SEEDS: GraphSeed[] = [
  {
    id: 'n_hanshan',
    category: 'persons',
    title: '寒山',
    info: '唐代诗僧，长期隐居天台山寒岩，与拾得并称「和合二圣」。',
    coreDesc: '唐代诗僧，隐居于天台山寒岩七十余年。',
    related: [
      ['天台山', 'place', '隐居', '寒岩位于天台山境内。'],
      ['拾得', 'person', '并称', '二人合称「和合二圣」。'],
      ['和合文化', 'event', '影响', '台州和合文化的精神源头。'],
      ['寒山子诗集', 'event', '著作', '存诗三百余首。'],
    ],
  },
  {
    id: 'n_shide',
    category: 'persons',
    title: '拾得',
    info: '唐代僧人，天台山国清寺僧厨，与寒山交好，同被尊为「和合二圣」。',
    coreDesc: '唐代僧人，与寒山并称「和合二圣」。',
    related: [
      ['国清寺', 'place', '驻锡', '在国清寺任僧厨。'],
      ['寒山', 'person', '并称', '二人合称「和合二圣」。'],
      ['和合文化', 'event', '影响', '和合文化的重要象征人物。'],
      ['天台宗', 'event', '关联', '与天台山佛教脉络相关。'],
    ],
  },
  {
    id: 'n_wangshixing',
    category: 'persons',
    title: '王士性',
    info: '明代人文地理学家，临海人，著《广志绎》，被誉为「中国人文地理学开创者」。',
    coreDesc: '明代临海籍人文地理学家，官至南京鸿胪寺卿。',
    related: [
      ['临海市', 'place', '籍贯', '浙江临海人。'],
      ['广志绎', 'event', '著作', '系统记述各地人文地理。'],
      ['五岳游草', 'event', '著作', '游记类地理著作。'],
      ['台州市社会科学界联合会', 'institution', '研究', '组织相关学术研究。'],
    ],
  },
  {
    id: 'n_xuxiake',
    category: 'persons',
    title: '徐霞客',
    info: '明代地理学家、旅行家，曾两度游历天台山，并留有《游天台山日记》。',
    coreDesc: '明代地理学家，所著《徐霞客游记》开篇即记天台山。',
    related: [
      ['天台山', 'place', '游历', '两次考察天台山。'],
      ['游天台山日记', 'event', '著作', '《徐霞客游记》首篇。'],
      ['霞客古道', 'place', '遗迹', '天台山现存古道遗迹。'],
      ['神仙居', 'place', '游历', '曾考察浙东山水。'],
    ],
  },
  {
    id: 'n_qizhaonan',
    category: 'persons',
    title: '齐召南',
    info: '清代史地学家，天台人，参与纂修《大清一统志》，著《水道提纲》。',
    coreDesc: '清代天台籍史地学家，官至礼部侍郎。',
    related: [
      ['天台县', 'place', '籍贯', '浙江天台人。'],
      ['水道提纲', 'event', '著作', '系统记述全国水系。'],
      ['大清一统志', 'event', '参与', '参与纂修。'],
      ['天台山文化研究会', 'institution', '研究', '整理其学术成果。'],
    ],
  },
  {
    id: 'n_kejiusi',
    category: 'persons',
    title: '柯九思',
    info: '元代书画家、鉴藏家，仙居人，工画墨竹，擅楷书，官至奎章阁鉴书博士。',
    coreDesc: '元代仙居籍书画家、书画鉴藏家。',
    related: [
      ['仙居县', 'place', '籍贯', '浙江仙居人。'],
      ['墨竹图', 'event', '作品', '以墨竹题材著称。'],
      ['奎章阁', 'institution', '任职', '元文宗朝书画鉴藏机构。'],
      ['台州文博', 'event', '研究', '台州书画传统的重要个案。'],
    ],
  },
  {
    id: 'n_fangguozhen',
    category: 'persons',
    title: '方国珍',
    info: '元末义军首领，黄岩人，据浙东沿海二十余年，后归附明朝。',
    coreDesc: '元末黄岩籍割据势力首领，据有浙东沿海。',
    related: [
      ['黄岩区', 'place', '籍贯', '浙江黄岩人。'],
      ['浙东割据', 'event', '事件', '元末据庆元、台州、温州等地。'],
      ['台州港口史', 'event', '关联', '与台州海贸格局演变相关。'],
      ['椒江志', 'event', '记载', '地方志书记有其事。'],
    ],
  },
  {
    id: 'n_qijiguang',
    category: 'persons',
    title: '戚继光',
    info: '明代抗倭名将，在台州九战九捷，并增筑台州府城墙敌台。',
    coreDesc: '明代抗倭名将，台州抗倭战役的指挥者。',
    related: [
      ['台州府城墙', 'place', '修筑', '增筑敌台与空心台。'],
      ['台州大捷', 'event', '战役', '嘉靖年间台州九战九捷。'],
      ['海防', 'event', '体系', '主持浙东海防建设。'],
      ['临海市文物保护管理所', 'institution', '保护', '保护相关遗迹。'],
    ],
  },
  {
    id: 'n_jigong',
    category: 'persons',
    title: '济公',
    info: '南宋高僧，俗名李修缘，天台人，以「济公活佛」形象广为人知。',
    coreDesc: '南宋天台籍高僧，法号道济。',
    related: [
      ['天台县', 'place', '籍贯', '浙江天台人。'],
      ['赤城山', 'place', '出生地', '相传出生于赤城山附近。'],
      ['济公传说', 'event', '非遗', '列入国家级非物质文化遗产名录。'],
      ['国清寺', 'place', '关联', '天台山佛教文化脉络。'],
    ],
  },
  {
    id: 'n_xielingyun',
    category: 'persons',
    title: '谢灵运',
    info: '南朝宋诗人，任永嘉太守期间游历天台山，开山水诗先河。',
    coreDesc: '南朝宋诗人，中国山水诗派的开创者。',
    related: [
      ['天台山', 'place', '游历', '曾登临天台山。'],
      ['山水诗', 'event', '开创', '开创中国山水诗传统。'],
      ['霞客古道', 'place', '遗迹', '古道与其游踪相关。'],
      ['台州诗词楹联', 'event', '影响', '对台州诗风影响深远。'],
    ],
  },
]

/* ==================== 机构（institutions） ==================== */

const INSTITUTION_SEEDS: GraphSeed[] = [
  {
    id: 'i_taizhoulib',
    category: 'institutions',
    title: '台州市图书馆',
    info: '全市文献信息资源保障中心，本平台的建设与发布单位。',
    coreDesc: '台州市公共图书馆，市级文献信息资源中心。',
    related: [
      ['台州市', 'place', '所在', '位于台州市区。'],
      ['地方文献', 'event', '收藏', '建有台州地方文献专藏。'],
      ['文旅记忆平台', 'event', '建设', '本专题库的建设单位。'],
      ['台州市文化和广电旅游体育局', 'institution', '主管', '上级主管部门。'],
    ],
  },
  {
    id: 'i_taizhoumuseum',
    category: 'institutions',
    title: '台州市博物馆',
    info: '市级综合博物馆，收藏展示台州历史文物与陶瓷、民俗藏品。',
    coreDesc: '台州市综合性博物馆，承担文物收藏、研究与展示职能。',
    related: [
      ['台州市', 'place', '所在', '位于台州市区。'],
      ['台州窑', 'event', '收藏', '藏有台州窑青瓷标本。'],
      ['台州文博', 'event', '出版', '编印文博类刊物。'],
      ['台州市文物保护中心', 'institution', '协作', '共同开展文物保护工作。'],
    ],
  },
  {
    id: 'i_feiyi',
    category: 'institutions',
    title: '台州市非物质文化遗产保护中心',
    info: '负责全市非遗项目的普查、申报、保护与传承推广。',
    coreDesc: '承担台州市非遗保护、研究与传播工作的专门机构。',
    related: [
      ['台州乱弹', 'event', '保护', '国家级非遗代表性项目。'],
      ['台州刺绣', 'event', '保护', '传统美术类非遗项目。'],
      ['大奏鼓', 'event', '保护', '传统舞蹈类非遗项目。'],
      ['黄沙狮子', 'event', '保护', '传统舞蹈类非遗项目。'],
      ['台州市文化馆', 'institution', '协作', '共同开展传承活动。'],
    ],
  },
  {
    id: 'i_tiantaistudy',
    category: 'institutions',
    title: '天台山文化研究会',
    info: '从事天台山佛教、道教、和合文化与地方史研究的学术团体。',
    coreDesc: '专注天台山文化研究的学术性社会团体。',
    related: [
      ['天台山', 'place', '研究', '研究对象所在。'],
      ['和合文化', 'event', '研究', '和合文化研究核心机构之一。'],
      ['天台宗', 'event', '研究', '天台宗研究的重要力量。'],
      ['国清寺', 'place', '关联', '与祖庭保持学术合作。'],
    ],
  },
  {
    id: 'i_shekelian',
    category: 'institutions',
    title: '台州市社会科学界联合会',
    info: '统筹全市社科研究力量，组织地方历史文化课题研究与成果出版。',
    coreDesc: '台州市社会科学界的联合组织，负责社科研究与普及。',
    related: [
      ['王士性', 'person', '研究', '组织相关人物研究。'],
      ['台州和合文化', 'event', '课题', '重点研究课题之一。'],
      ['台州商帮', 'event', '课题', '地方经济社会史研究。'],
      ['台州市', 'place', '所在', '位于台州市区。'],
    ],
  },
  {
    id: 'i_gucheng',
    category: 'institutions',
    title: '临海市古城保护管理委员会',
    info: '负责台州府城历史街区的保护、修缮与文旅运营管理。',
    coreDesc: '临海市古城保护与利用的专门管理机构。',
    related: [
      ['台州府城墙', 'place', '保护', '负责城墙及府城保护。'],
      ['紫阳街', 'place', '保护', '历史街区保护主体。'],
      ['临海市', 'place', '所在', '隶属临海市政府。'],
      ['台州府城', 'event', '运营', '推动府城 5A 级景区创建。'],
    ],
  },
  {
    id: 'i_taizhoucollege',
    category: 'institutions',
    title: '台州学院',
    info: '台州市属本科高校，设有地方文化研究机构，参与地方文献整理。',
    coreDesc: '台州市属全日制普通本科高校。',
    related: [
      ['台州市', 'place', '所在', '位于台州市区。'],
      ['台州方言研究', 'event', '研究', '方言研究的重要学术力量。'],
      ['和合文化', 'event', '研究', '设立相关研究平台。'],
      ['台州市社会科学界联合会', 'institution', '协作', '开展联合课题研究。'],
    ],
  },
  {
    id: 'i_wwbhzx',
    category: 'institutions',
    title: '台州市文物保护中心',
    info: '承担全市文物保护、考古调查与修缮方案审查工作。',
    coreDesc: '台州市文物保护与考古研究的专业机构。',
    related: [
      ['台州府城墙', 'place', '保护', '负责城墙本体保护。'],
      ['台州古塔', 'event', '调查', '开展古塔专项调查。'],
      ['台州文博', 'event', '出版', '编印文博类刊物。'],
      ['台州市博物馆', 'institution', '协作', '联合开展文物研究。'],
    ],
  },
  {
    id: 'i_wenglv',
    category: 'institutions',
    title: '台州市文化和广电旅游体育局',
    info: '统筹全市文化旅游、广播电视与体育事业发展。',
    coreDesc: '台州市政府组成部门，主管文化旅游体育工作。',
    related: [
      ['台州市图书馆', 'institution', '下属', '下属事业单位。'],
      ['山海十景', 'event', '推广', '旅游品牌推广主体。'],
      ['台州非遗', 'event', '主管', '非遗保护工作主管部门。'],
      ['台州市', 'place', '所在', '位于台州市区。'],
    ],
  },
  {
    id: 'i_nbulib',
    category: 'institutions',
    title: '宁波大学图书馆',
    info: '综合性高校图书馆，藏有丰富的浙东地方文献与特藏资源。',
    coreDesc: '宁波大学文献信息中心，浙东地方文献重要收藏单位。',
    related: [
      ['宁波大学图书馆特藏文献', 'event', '收藏', '特藏文献资源。'],
      ['浙东地方文献', 'event', '收藏', '区域文献保障重要节点。'],
      ['台州市图书馆', 'institution', '协作', '区域图书馆协作伙伴。'],
    ],
  },
]

/* ==================== 构建 ==================== */

/** 分组中文名（用于节点副标题与悬停提示） */
export const NODE_GROUP_LABEL: Record<NodeGroup, string> = {
  core: '核心实体',
  person: '人物',
  institution: '机构',
  event: '事件',
  place: '地名',
}

function buildGraph(seed: GraphSeed): GraphData {
  const coreId = `${seed.id}_core`
  const nodes: GraphNode[] = [
    {
      id: coreId,
      label: seed.title,
      sub: NODE_GROUP_LABEL.core,
      group: 'core',
      desc: seed.coreDesc,
    },
    ...seed.related.map((r, i) => ({
      id: `${seed.id}_n${i}`,
      label: r[0],
      sub: NODE_GROUP_LABEL[r[1]],
      group: r[1],
      desc: r[3] || `${r[0]}（${NODE_GROUP_LABEL[r[1]]}）`,
    })),
  ]
  const edges: GraphEdge[] = seed.related.map((r, i) => ({
    source: coreId,
    target: `${seed.id}_n${i}`,
    label: r[2] || '关联',
  }))
  return {
    id: seed.id,
    category: seed.category,
    title: seed.title,
    info: seed.info,
    nodes,
    edges,
  }
}

const ALL_SEEDS: GraphSeed[] = [...PERSON_SEEDS, ...INSTITUTION_SEEDS, ...EVENT_SEEDS, ...PLACE_SEEDS]

/** 全部图谱，键为图谱 id */
export const GRAPH_DATA: Record<string, GraphData> = ALL_SEEDS.reduce<Record<string, GraphData>>(
  (acc, seed) => {
    acc[seed.id] = buildGraph(seed)
    return acc
  },
  {},
)

/** 按分类分组 */
export function getGraphsByCategory(category: GraphCategory): GraphData[] {
  return ALL_SEEDS.filter((s) => s.category === category).map((s) => GRAPH_DATA[s.id])
}

/** 图谱分类中文名与配色（与 knowledge-graph.html 的 CM 常量一致） */
export const GRAPH_CATEGORY_META: Record<GraphCategory, { name: string; color: string }> = {
  persons: { name: '人物', color: '#5b8a7f' },
  institutions: { name: '机构', color: '#c9a96e' },
  events: { name: '事件', color: '#b85450' },
  places: { name: '地名', color: '#4a7c8c' },
}

/** 侧栏分类顺序（默认展开人物） */
export const GRAPH_CATEGORY_ORDER: GraphCategory[] = ['persons', 'institutions', 'events', 'places']
