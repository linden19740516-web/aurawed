/**
 * 故事数据库 - 本地备用故事模板
 * 当API失效时，使用本地故事模板生成婚礼方案
 */

export interface StoryTemplate {
  id: string
  category: string
  title: string
  description: string
  // 爱情故事要素
  loveStory: {
    meet: string           // 相遇场景
    firstDate: string      // 第一次约会
    confession: string     // 表白场景
    proposal: string       // 求婚场景
  }
  // 难忘时刻
  meaningfulMoments: string[]
  // 共同爱好
  sharedInterests: string[]
  // 价值观
  values: string[]
  // 推荐的美学方向
  recommendedStyles: string[]
  recommendedColors: string[]
  recommendedMood: string
}

// 相遇场景库
const meetScenes = [
  '大学校园的图书馆相遇',
  '朋友生日聚会上的偶然相识',
  '公司年会的惊鸿一瞥',
  '旅行途中的结伴同行',
  '咖啡馆里的邻座相遇',
  '健身房里的目光交汇',
  '地铁站的一次让座',
  '共同参加的音乐节',
  '画展上对同一幅画的欣赏',
  '雨天共撑一把伞的巧合'
]

// 第一次约会场景
const firstDates = [
  '一起看了人生中第一场电影',
  '在海边散步直到日落',
  '一起做饭给对方吃',
  '去动物园看熊猫',
  '在公园野餐聊天',
  '一起逛了旧货市场',
  '在摩天轮上俯瞰城市夜景',
  '一起做了手工DIY',
  '在书店待了整个下午',
  '骑行郊外踏青'
]

// 表白场景
const confessions = [
  '在星空下的真情告白',
  '生日那天的惊喜表白',
  '一起跨年时的真心话',
  '旅行途中的浪漫表白',
  '通过一封长信表达心意',
  '在第一次相遇的地方等待',
  '用一顿精心准备的晚餐表白',
  '在演唱会现场大胆表白',
  '写满一整本日记的深情',
  '用音乐创作表达爱意'
]

// 求婚场景
const proposals = [
  '在相识的大学校园里',
  '海边的日落时分',
  '精心布置的家中',
  '旅行途中的浪漫地点',
  '朋友聚会上的惊喜求婚',
  '第一次约会的咖啡馆',
  '两人的秘密基地',
  '星空下的浪漫求婚',
  '共同养的小宠物见证下',
  '用无人机送上戒指'
]

// 难忘时刻
const meaningfulMomentOptions = [
  '第一次一起旅行，租车自驾去大理',
  '一起领养了第一只宠物',
  '经历了一次难忘的生病照顾',
  '一起完成了人生第一个马拉松',
  '在异国他乡度过的新年',
  '第一次给对方做饭的温暖',
  '一起装修第一个共同的家',
  '经历疫情期间的相互陪伴',
  '一起看过的每一场日出日落',
  '在对方低谷时的不离不弃',
  '第一次带对方见父母',
  '一起度过的每个纪念日',
  '一起领证那天的心情',
  '第一次拍婚纱照的幸福',
  '共同面对人生第一次重大决定'
]

// 共同爱好
const interestOptions = [
  '一起看电影的时光',
  '周末户外徒步',
  '共同热爱烹饪',
  '音乐和演唱会',
  '旅行和探索新地方',
  '摄影记录生活',
  '健身和运动',
  '阅读和交流',
  '游戏和电竞',
  '艺术和看展',
  '咖啡和探店',
  '宠物和动物',
  '美食和餐厅探索',
  'DIY手工创作',
  '瑜伽和冥想'
]

// 价值观
const valueOptions = [
  '家庭永远是第一位',
  '真诚对待彼此',
  '共同成长进步',
  '简单幸福的生活',
  '用心经营每一天',
  '相互尊重独立空间',
  '旅行看世界的梦想',
  '健康积极的生活态度',
  '传承和珍惜传统文化',
  '环保可持续的生活方式',
  '追求精神层面的富足',
  '努力创造更好生活',
  '感恩生活中的小确幸',
  '保持童心和浪漫',
  '重视朋友和社交'
]

// 故事模板集合 - 不同类型的新人故事
export const storyTemplates: StoryTemplate[] = [
  {
    id: 'campus-lovers',
    category: '校园爱情',
    title: '从校服到婚纱',
    description: '在最美的年华相遇，一起走过青春岁月，最终修成正果',
    loveStory: {
      meet: '大学图书馆的某个午后，阳光正好，你在整理书架，我在找一本诗集',
      firstDate: '一起在校园散步，聊各自喜欢的电影，不知不觉走到了操场的看台',
      confession: '毕业晚会上，我鼓起勇气在歌声中向你表白',
      proposal: '回到学校求婚，就像当年在这里相遇一样'
    },
    meaningfulMoments: ['一起备考研究生的日子', '第一次带你去见父母', '毕业典礼上的合影'],
    sharedInterests: ['校园漫步', '图书馆时光', '一起追剧'],
    values: ['共同成长', '珍惜当下', '家庭观念'],
    recommendedStyles: ['浪漫花园', '森系自然', '复古怀旧'],
    recommendedColors: ['樱光金焰', '珠光贝影'],
    recommendedMood: '温馨浪漫'
  },
  {
    id: 'work-colleagues',
    category: '职场爱情',
    title: '并肩作战的爱情',
    description: '从同事到伴侣，我们在职场中相识相知',
    loveStory: {
      meet: '公司的项目会议，你是项目负责人，我是配合的设计师',
      firstDate: '项目完成后的一次团建，我们第一次单独聊天到深夜',
      confession: '在我加班到凌晨时，你送来了热腾腾的夜宵',
      proposal: '在公司的年会上，当着所有同事的面求婚'
    },
    meaningfulMoments: ['一起熬过的项目截止日', '第一次出差同行', '相互支持度过职业低谷'],
    sharedInterests: ['工作之外的轻松时光', '美食探索', '健身运动'],
    values: ['相互支持', '共同进步', '事业家庭平衡'],
    recommendedStyles: ['极简现代', '西式奢华', '水晶梦境'],
    recommendedColors: ['珠光贝影', '红酒微醺'],
    recommendedMood: '简约优雅'
  },
  {
    id: 'travel-lovers',
    category: '旅行爱情',
    title: '在旅途中找到你',
    description: '因为热爱旅行，我们相遇在世界各个角落',
    loveStory: {
      meet: '大理古城的青旅，你正在前台办理入住，我刚好出来倒水',
      firstDate: '一起租了自行车环洱海骑行，在海舌公园看日落',
      confession: '在丽江古城的酒吧街，我鼓起勇气牵起你的手',
      proposal: '在我们第一次相遇的大理，再次向你求婚'
    },
    meaningfulMoments: ['一起自驾川西高原', '泰国夜市的小插曲', '冰岛追极光的夜晚'],
    sharedInterests: ['背包旅行', '探索美食', '摄影拍照'],
    values: ['热爱自由', '探索世界', '随性生活'],
    recommendedStyles: ['波西米亚', '自然森系', '新中式'],
    recommendedColors: ['森语绿光', '落日熔金'],
    recommendedMood: '自由浪漫'
  },
  {
    id: 'childhood-friends',
    category: '青梅竹马',
    title: '从邻居到爱人',
    description: '我们是童年的玩伴，兜兜转转最终还是走到了一起',
    loveStory: {
      meet: '你家楼下的花园，我们一起长大',
      firstDate: '长大后第一次单独约会，在小时候常去的公园',
      confession: '你出国深造那天，在机场我终于说出了藏在心里多年的话',
      proposal: '回到小时候约定的秘密基地'
    },
    meaningfulMoments: ['一起长大的每个夏天', '你出国后的跨国恋', '终于在一起的时刻'],
    sharedInterests: ['童年的回忆', '安静时光', '家庭聚会'],
    values: ['珍惜缘分', '长情陪伴', '知根知底'],
    recommendedStyles: ['复古怀旧', '浪漫花园', '温馨田园'],
    recommendedColors: ['樱光金焰', '朱砂印记'],
    recommendedMood: '温馨怀旧'
  },
  {
    id: 'music-lovers',
    category: '音乐爱情',
    title: '因音乐结缘',
    description: '我们因为共同的音乐爱好走到一起',
    loveStory: {
      meet: '一个音乐节的后台，你弹吉他，我刚好路过',
      firstDate: '一起去琴行，我弹钢琴你弹吉他，合奏了一首曲子',
      confession: '在我的演唱会上，我唱了一首写给你的歌',
      proposal: '在我们第一次合奏的琴行'
    },
    meaningfulMoments: ['组乐队的日子', '第一次同台演出', '互相鼓励参加比赛'],
    sharedInterests: ['音乐演奏', '演唱会', '乐器收藏'],
    values: ['艺术追求', '默契配合', '浪漫细胞'],
    recommendedStyles: ['波西米亚', '复古怀旧', '水晶梦境'],
    recommendedColors: ['紫藤梦境', '星河长明'],
    recommendedMood: '艺术浪漫'
  },
  {
    id: 'foodie-lovers',
    category: '吃货爱情',
    title: '一起吃遍世界',
    description: '民以食为天，我们因为美食走到一起',
    loveStory: {
      meet: '一家网红餐厅门口排队，我们正好拼桌',
      firstDate: '一起去吃那家传说中最好吃的火锅',
      confession: '在我精心准备的私房菜晚餐后',
      proposal: '在我们常去的那家小餐馆'
    },
    meaningfulMoments: ['一起学做饭的日子', '探店打卡每个周末', '为对方做的每一道菜'],
    sharedInterests: ['美食探店', '烹饪料理', '各地美食'],
    values: ['认真生活', '分享美好', '烟火气'],
    recommendedStyles: ['温馨田园', '新中式', '极简现代'],
    recommendedColors: ['落日熔金', '翠玉烟雨'],
    recommendedMood: '温暖烟火'
  },
  {
    id: 'fitness-couple',
    category: '健身爱情',
    title: '汗水中的甜蜜',
    description: '我们在健身房相遇，因为健康生活走到一起',
    loveStory: {
      meet: '健身房的器械区，你在做硬拉，我刚好在旁边',
      firstDate: '一起晨跑后去吃早餐'
    },
    meaningfulMoments: ['一起跑完马拉松', '互相监督健身', '改变生活习惯'],
    sharedInterests: ['健身运动', '跑步', '健康饮食'],
    values: ['健康生活', '相互督促', '积极向上'],
    recommendedStyles: ['极简现代', '北欧自然'],
    recommendedColors: ['森语绿光', '深海传说'],
    recommendedMood: '活力健康'
  },
  {
    id: 'artist-couple',
    category: '艺术爱情',
    title: '艺术家的浪漫',
    description: '两个艺术灵魂的碰撞',
    loveStory: {
      meet: '一个艺术展览，你在一幅画前驻足',
      firstDate: '一起去看了一个小众画展'
    },
    meaningfulMoments: ['一起创作的作品', '艺术展上的共同回忆'],
    sharedInterests: ['艺术展览', '看展', '创作'],
    values: ['艺术追求', '精神共鸣', '独特审美'],
    recommendedStyles: ['极简现代', '水晶梦境', '新中式'],
    recommendedColors: ['星河长明', '翠玉烟雨'],
    recommendedMood: '艺术精致'
  }
]

// 生成随机故事的函数
export function generateLocalStory(templateId?: string): StoryTemplate {
  if (templateId) {
    const template = storyTemplates.find(t => t.id === templateId)
    if (template) return template
  }

  // 随机选择一个模板
  const randomTemplate = storyTemplates[Math.floor(Math.random() * storyTemplates.length)]

  // 随机组合一些细节
  const shuffledMoments = [...meaningfulMomentOptions].sort(() => Math.random() - 0.5).slice(0, 3)
  const shuffledInterests = [...interestOptions].sort(() => Math.random() - 0.5).slice(0, 3)
  const shuffledValues = [...valueOptions].sort(() => Math.random() - 0.5).slice(0, 3)

  return {
    ...randomTemplate,
    meaningfulMoments: shuffledMoments,
    sharedInterests: shuffledInterests,
    values: shuffledValues
  }
}

// 风格到标签的映射
export const styleToTags: Record<string, string[]> = {
  '极简现代': ['几何', '线条', '简约', '现代', '纯粹'],
  '波西米亚': ['自由', '复古', '印花', '藤蔓', '民族'],
  '浪漫花园': ['花艺', '浪漫', '花园', '温馨', '柔美'],
  '西式奢华': ['奢华', '水晶', '古典', '华丽', '宫廷'],
  '新中式': ['中式', '传统', '意境', '东方', '古典'],
  '北欧自然': ['北欧', '原木', '自然', '清新', '简约'],
  '复古怀旧': ['复古', '怀旧', '时光', '老物件', '温馨'],
  '水晶梦境': ['水晶', '星光', '梦幻', '通透', '华丽'],
  '森系自然': ['森林', '原木', '自然', '清新', '绿植'],
  '温馨田园': ['田园', '自然', '温馨', '花草', '朴素']
}
