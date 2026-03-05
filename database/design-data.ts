/**
 * 设计数据库 - 配色方案
 * 支撑AI生成婚礼方案的颜色搭配
 */

export const colorPalettes = [
  // 经典浪漫系列
  {
    id: 'romantic-pink-gold',
    name: '樱光金焰',
    colors: ['#F5E6E8', '#E8B4B8', '#D4A5A5', '#9A7B7B', '#C9A86C'],
    description: '温柔的樱花粉搭配香槟金，浪漫而不失优雅',
    mood: 'romantic',
    seasons: ['spring', 'summer']
  },
  {
    id: 'elegant-pearl',
    name: '珠光贝影',
    colors: ['#FAF7F5', '#E8E4E1', '#D4CFCB', '#A69E97', '#8B7D6B'],
    description: '珍珠白与贝母灰的温柔碰撞，营造高级感',
    mood: 'elegant',
    seasons: ['spring', 'autumn', 'winter']
  },
  {
    id: 'wine-red-luxury',
    name: '红酒微醺',
    colors: ['#722F37', '#943A46', '#B85C6E', '#D4A5A5', '#C9A86C'],
    description: '浓郁酒红搭配金色，低调奢华',
    mood: 'luxury',
    seasons: ['autumn', 'winter']
  },

  // 清新自然系列
  {
    id: 'forest-green',
    name: '森语绿光',
    colors: ['#E8F5E9', '#C8E6C9', '#81C784', '#4CAF50', '#2E7D32'],
    description: '森林绿与自然白的清新组合',
    mood: 'natural',
    seasons: ['spring', 'summer']
  },
  {
    id: 'ocean-blue',
    name: '深海传说',
    colors: ['#E3F2FD', '#90CAF9', '#42A5F5', '#1E88E5', '#1565C0'],
    description: '深蓝到浅蓝的层次递进，如海洋般深邃',
    mood: 'mysterious',
    seasons: ['summer']
  },
  {
    id: 'sunset-gold',
    name: '落日熔金',
    colors: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FF9800', '#E65100'],
    description: '落日余晖的温暖色调，温馨而浪漫',
    mood: 'warm',
    seasons: ['autumn']
  },

  // 东方美学系列
  {
    id: 'chinese-red',
    name: '朱砂印记',
    colors: ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#C62828', '#8D6E63'],
    description: '正红与朱砂的东方韵味，经典中式婚礼',
    mood: 'traditional',
    seasons: ['spring', 'winter']
  },
  {
    id: 'jade-green',
    name: '翠玉烟雨',
    colors: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#66BB6A', '#004D40'],
    description: '翠玉色的清雅，新中式首选',
    mood: 'elegant',
    seasons: ['spring', 'summer']
  },

  // 梦幻系列
  {
    id: 'purple-dream',
    name: '紫藤梦境',
    colors: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#AB47BC', '#4A148C'],
    description: '紫色系的梦幻与浪漫',
    mood: 'dreamy',
    seasons: ['spring']
  },
  {
    id: 'silver-starlight',
    name: '星河长明',
    colors: ['#ECEFF1', '#CFD8DC', '#B0BEC5', '#78909C', '#37474F'],
    description: '银灰与星空的冷艳搭配',
    mood: 'stellar',
    seasons: ['winter']
  }
]

export const styleDirections = [
  {
    id: 'minimalist-modern',
    name: '极简现代',
    description: '简洁线条、大面积留白、几何美学',
    keywords: ['几何', '线条', '极简', '现代', '纯粹'],
    suitableFor: ['city-hall', 'outdoor', 'hotel']
  },
  {
    id: 'boho-free',
    name: '波西米亚',
    description: '自由浪漫、吉普赛风情、复古印花',
    keywords: ['自由', '波西米亚', '复古', '印花', '藤蔓'],
    suitableFor: ['outdoor', 'garden', 'beach']
  },
  {
    id: 'romantic-garden',
    name: '浪漫花园',
    description: '花团锦簇、浪漫温馨、精致细腻',
    keywords: ['花艺', '浪漫', '花园', '温馨', '柔美'],
    suitableFor: ['garden', 'outdoor', 'hotel']
  },
  {
    id: 'luxury-western',
    name: '西式奢华',
    description: '华丽古典、水晶灯饰、绸缎帷幔',
    keywords: ['奢华', '水晶', '古典', '华丽', '宫廷'],
    suitableFor: ['hotel', 'ballroom']
  },
  {
    id: 'new-chinese',
    name: '新中式',
    description: '传统与现代融合、东方美学意境',
    keywords: ['中式', '传统', '意境', '东方', '古典'],
    suitableFor: ['hotel', 'traditional-hall']
  },
  {
    id: 'nordic-natural',
    name: '北欧自然',
    description: '原木自然、简约舒适、清新脱俗',
    keywords: ['北欧', '原木', '自然', '清新', '简约'],
    suitableFor: ['outdoor', 'garden', 'cafe']
  },
  {
    id: 'vintage-retro',
    name: '复古怀旧',
    description: '怀旧复古、时光质感、老物件装饰',
    keywords: ['复古', '怀旧', '时光', '老物件', '复古'],
    suitableFor: ['warehouse', 'museum', 'garden']
  },
  {
    id: 'crystal-dream',
    name: '水晶梦境',
    description: '通透晶莹、星光璀璨、梦幻华丽',
    keywords: ['水晶', '星光', '梦幻', '通透', '华丽'],
    suitableFor: ['hotel', 'ballroom']
  }
]

export const floralStyles = [
  {
    id: 'wildflower-meadow',
    name: '野花甸',
    description: '自然野生的小花组合，如漫步在花甸中',
    flowers: ['雏菊', '波斯菊', '小苍兰', '天人菊', '花毛茛'],
    colors: ['white', 'yellow', 'pink', 'purple'],
    seasons: ['spring', 'summer']
  },
  {
    id: 'elegant-rose',
    name: '玫瑰盛典',
    description: '以玫瑰为主花材，营造浪漫奢华氛围',
    flowers: ['玫瑰', '尤加利', '龙柳', '澳梅'],
    colors: ['red', 'pink', 'white', 'peach'],
    seasons: ['all']
  },
  {
    id: 'oriental-lily',
    name: '百合清韵',
    description: '东方百合的清雅，寓意百年好合',
    flowers: ['东方百合', '马蹄莲', '文竹', '叶上花'],
    colors: ['white', 'pink', 'yellow'],
    seasons: ['spring', 'summer']
  },
  {
    id: 'peony-luxury',
    name: '牡丹雍容',
    description: '芍药牡丹的华丽，花中之王的雍容',
    flowers: ['芍药', '牡丹', '绣球', '大花蕙兰'],
    colors: ['pink', 'white', 'red', 'coral'],
    seasons: ['spring']
  },
  {
    id: 'dry-flower-minimal',
    name: '干花极简',
    description: '自然干燥的花材，营造复古质感',
    flowers: ['干玫瑰', '干棉花', '芦苇', '尤加利叶', '银莲花'],
    colors: ['beige', 'brown', 'gray', 'white'],
    seasons: ['all']
  },
  {
    id: 'greenery-only',
    name: '纯绿植',
    description: '全部使用绿色植物，清新现代',
    flowers: ['龟背竹', '散尾葵', '春羽', '新西兰叶', '八角金盘'],
    colors: ['green'],
    seasons: ['all']
  }
]

export const lightingDescriptions = [
  {
    id: 'candle-warm',
    name: '烛光摇曳',
    description: '大量蜡烛、串灯营造温馨浪漫氛围',
    elements: ['香薰蜡烛', 'LED蜡烛', '星星灯串', '光纤灯'],
    mood: 'warm romantic'
  },
  {
    id: 'chandelier-luxury',
    name: '水晶璀璨',
    description: '华丽水晶吊灯作为主光源',
    elements: ['水晶吊灯', 'LED筒灯', '灯带', '追光灯'],
    mood: 'luxury elegant'
  },
  {
    id: 'natural-sunlight',
    name: '自然采光',
    description: '利用自然光为主，白天婚礼首选',
    elements: ['纱幔柔光', '反光板', '自然光利用'],
    mood: 'fresh natural'
  },
  {
    id: 'dramatic-spotlight',
    name: '戏剧光影',
    description: '强烈的明暗对比，营造戏剧张力',
    elements: ['光束灯', '追光灯', 'LED帕灯', '激光灯'],
    mood: 'dramatic mysterious'
  },
  {
    id: 'soft-glow',
    name: '柔光笼罩',
    description: '整体柔和光线，如梦似幻',
    elements: ['柔光箱', '染色灯', '灯带', '球泡灯'],
    mood: 'dreamy soft'
  }
]
