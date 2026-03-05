/**
 * 策划数据库 - 婚礼策划模板
 * 包含预算分配、流程模板、区域规划等
 */

export const budgetTemplates = [
  {
    id: 'luxury-wedding',
    name: '高端奢华婚礼',
    totalMin: 200000,
    totalMax: 500000,
    allocations: {
      '场地租赁': 25,
      '餐饮': 30,
      '花艺': 15,
      '摄影摄像': 10,
      '婚纱': 8,
      '灯光音响': 7,
      '搭建': 8,
      '其他': 2
    },
    description: '五星级酒店或高端婚礼会所，适合来宾100-200人'
  },
  {
    id: 'quality-wedding',
    name: '品质婚礼',
    totalMin: 80000,
    totalMax: 150000,
    allocations: {
      '场地租赁': 20,
      '餐饮': 35,
      '花艺': 12,
      '摄影摄像': 12,
      '婚纱礼服': 8,
      '灯光音响': 6,
      '搭建': 5,
      '其他': 2
    },
    description: '品质餐厅或特色场地，适合来宾80-150人'
  },
  {
    id: ' intimate-wedding',
    name: '小而美婚礼',
    totalMin: 30000,
    totalMax: 60000,
    allocations: {
      '场地租赁': 15,
      '餐饮': 30,
      '花艺': 15,
      '摄影摄像': 15,
      '婚纱礼服': 10,
      '灯光音响': 5,
      '搭建': 8,
      '其他': 2
    },
    description: '户外草坪或特色民宿，适合来宾30-60人'
  },
  {
    id: 'destination-wedding',
    name: '目的地婚礼',
    totalMin: 150000,
    totalMax: 300000,
    allocations: {
      '场地租赁': 20,
      '餐饮': 25,
      '花艺': 12,
      '摄影摄像': 12,
      '婚纱礼服': 10,
      '灯光音响': 8,
      '搭建': 10,
      '交通住宿': 8
    },
    description: '三亚/大理/海外目的地，适合来宾20-50人'
  }
]

export const timelineTemplates = [
  {
    id: 'standard-day',
    name: '标准中式婚礼',
    duration: '1天',
    schedule: [
      { time: '08:00', item: '新娘化妆', area: '新娘房', notes: '通常需要2-3小时' },
      { time: '09:00', item: '新郎接亲', area: '新娘家/酒店', notes: '堵门游戏' },
      { time: '10:30', item: '敬茶改口', area: '新娘家/酒店', notes: '双方父母都在' },
      { time: '11:30', item: '外景拍摄', area: '酒店周边/外景', notes: '新人+伴郎伴娘' },
      { time: '12:30', item: '午宴/休息', area: '宴会厅', notes: '或迎宾' },
      { time: '14:00', item: '宾客签到', area: '签到区', notes: '引导来宾入座' },
      { time: '15:00', item: '仪式开始', area: '仪式区', notes: '主持人开场' },
      { time: '15:30', item: '誓言交换', area: '仪式区', notes: '誓词、戒指' },
      { time: '16:00', item: '敬酒合影', area: '宴会区', notes: '逐桌敬酒' },
      { time: '17:30', item: '晚宴开始', area: '宴会区', notes: '婚礼晚宴' },
      { time: '18:30', item: '互动游戏', area: '宴会区', notes: '抽奖、致辞' },
      { time: '20:00', item: '婚礼结束', area: '宴会区', notes: '送客' }
    ]
  },
  {
    id: 'evening-ceremony',
    name: '晚间仪式婚礼',
    duration: '半天',
    schedule: [
      { time: '14:00', item: '新娘化妆', area: '新娘房', notes: '下午开始化妆' },
      { time: '16:00', item: '外景拍摄', area: '酒店/户外', notes: '光线最好的时段' },
      { time: '17:30', item: '宾客签到', area: '签到区', notes: '领取伴手礼' },
      { time: '18:00', item: '仪式开始', area: '仪式区', notes: '日落时分开场' },
      { time: '18:30', item: '婚礼仪式', area: '仪式区', notes: '约30分钟' },
      { time: '19:00', item: '合影时间', area: '合影区', notes: '与宾客合影' },
      { time: '19:30', item: '晚宴开始', area: '宴会区', notes: '入座开餐' },
      { time: '20:00', item: '祝酒致辞', area: '宴会区', notes: '双方致辞' },
      { time: '20:30', item: '互动环节', area: '宴会区', notes: '游戏、抽奖' },
      { time: '21:30', item: '婚礼结束', area: '宴会区', notes: '送客' }
    ]
  },
  {
    id: 'outdoor-tea-ceremony',
    name: '户外茶歇婚礼',
    duration: '1天',
    schedule: [
      { time: '10:00', item: '场地布置', area: '户外草坪', notes: '最后检查' },
      { time: '11:00', item: '宾客入场', area: '签到区', notes: '领取饮品' },
      { time: '11:30', item: 'First Look', area: '私密区域', notes: '新人first look' },
      { time: '12:00', item: '户外仪式', area: '仪式区', notes: '30分钟' },
      { time: '12:30', item: '自由拍照', area: '拍照区', notes: '来宾互动' },
      { time: '13:00', item: '自助午餐', area: '用餐区', notes: '轻食/茶歇' },
      { time: '14:30', item: '游戏互动', area: '活动区', notes: '投壶/射箭等' },
      { time: '16:00', item: '切蛋糕/香槟', area: '仪式区', notes: '庆祝环节' },
      { time: '16:30', item: '傍晚鸡尾酒', area: '酒吧区', notes: '日落时光' },
      { time: '18:00', item: '婚礼结束', area: '出口', notes: '送客伴手礼' }
    ]
  }
]

export const areaTemplates = [
  {
    id: 'ceremony-arch',
    name: '仪式拱门',
    types: [
      { name: '花艺拱门', description: '鲜花或仿真花制作的拱门，浪漫温馨' },
      { name: '框架拱门', description: '金属或木质框架，可装饰花艺或纱幔' },
      { name: '圆形拱门', description: '半圆形设计，象征圆满' },
      { name: '隧道拱门', description: '宾客可走过的花艺隧道' }
    ],
    elements: ['花艺', '纱幔', '灯光', '绸缎', '气球']
  },
  {
    id: 'signin-area',
    name: '签到区',
    types: [
      { name: '指纹签到', description: '用指纹画作留念，创意独特' },
      { name: '照片墙签到', description: '宾客在照片上签名祝福' },
      { name: '寄语墙签到', description: '写下祝福话语贴于墙上' },
      { name: '复古签到', description: '使用复古羽毛笔签到' }
    ],
    elements: ['签到册', '照片墙', '装饰画', '花艺', '灯串']
  },
  {
    id: 'photo-area',
    name: '拍照区/留影区',
    types: [
      { name: '主题背景', description: '与婚礼主题统一的背景板' },
      { name: '花艺墙', description: '精美的花艺造型背景' },
      { name: '道具区', description: '提供拍照道具、墨镜、头纱等' },
      { name: '灯光区', description: '霓虹灯、灯串装饰' }
    ],
    elements: ['背景板', '花艺', '灯光', '拍照道具', '镜面']
  },
  {
    id: 'reception-area',
    name: '宴会区/用餐区',
    types: [
      { name: '圆桌宴席', description: '传统中式圆桌，每桌10人' },
      { name: '长桌西式', description: '西式长条桌，亲密氛围' },
      { name: '自助餐区', description: '自助形式，灵活走动' },
      { name: '茶歇区', description: '站立式轻松氛围' }
    ],
    elements: ['桌花', '餐布', '餐具', '椅子装饰', '桌卡']
  },
  {
    id: 'stage-area',
    name: '舞台/T台',
    types: [
      { name: '镜面T台', description: '时尚现代，反光效果好' },
      { name: '花艺T台', description: '两侧花艺装饰' },
      { name: '地毯T台', description: '花瓣或欧根纱覆盖' },
      { name: '木质舞台', description: '自然温馨感' }
    ],
    elements: ['T台', '地毯', '灯光', '花艺', '柱子']
  },
  {
    id: 'dessert-area',
    name: '甜品区/茶歇区',
    types: [
      { name: '蛋糕塔', description: '多层婚礼蛋糕' },
      { name: '甜品台', description: 'cupcake、巧克力、曲奇等' },
      { name: '饮品台', description: '鸡尾酒、果汁、咖啡' },
      { name: '水果台', description: '精致水果拼盘' }
    ],
    elements: ['蛋糕', '甜品', '饮品', '装饰', '花艺']
  },
  {
    id: 'gift-area',
    name: '伴手礼区',
    types: [
      { name: '礼品盒', description: '精致礼盒装伴手礼' },
      { name: '展示区', description: '展示礼物供宾客取用' },
      { name: '定制区', description: '可定制刻字等个性化' }
    ],
    elements: ['礼盒', '展示架', '花艺', '感谢卡', '包装']
  }
]

export const servicePackages = [
  {
    id: 'remote-consult',
    name: '远程咨询',
    priceRange: '299-999',
    services: [
      'AI婚礼方案生成',
      '线上方案讲解',
      '供应商推荐清单',
      '婚礼流程建议',
      '预算分配指导',
      '3次线上沟通修改'
    ],
    notIncluded: [
      '现场执行督导',
      '供应商对接',
      '婚礼当天现场服务'
    ]
  },
  {
    id: 'full-plan',
    name: '全程委托',
    priceRange: '1999-9999',
    services: [
      '远程咨询全部服务',
      '全程婚礼策划',
      '供应商筛选对接',
      '合同审核把关',
      '现场执行督导',
      '婚礼当天统筹',
      '全程跟进无限沟通'
    ],
    notIncluded: [
      '场地费用',
      '餐饮费用',
      '花艺搭建等执行费用'
    ]
  }
]
