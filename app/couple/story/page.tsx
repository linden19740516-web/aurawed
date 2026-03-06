'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, ArrowRight, ChevronLeft, ChevronRight, Star, User, MessageCircle, Crown, X } from 'lucide-react'

// 故事选项
interface StoryChoice {
  id: string
  title: string
  description: string
  tags: string[]
  image?: string
}

// 心理标签到美学风格的映射
const TAG_TO_STYLE_MAPPING: Record<string, string[]> = {
  '古典主义': ['古典美学', '复古质感', '油画色调'],
  '蒸汽朋克': ['机械美学', '黄铜质感', '工业浪漫'],
  '自然主义': ['有机形态', '植物美学', '清新色调'],
  '极简主义': ['现代简约', '几何美学', '纯净空间'],
  '浪漫主义': ['柔美氛围', '梦幻色调', '情感表达'],
  '暗黑美学': ['戏剧张力', '神秘氛围', '对比强烈'],
  '怀旧情结': ['复古情怀', '时光质感', '温暖色调'],
  '未来感': ['科技美学', '前卫设计', '冷调光影'],
  '东方美学': ['含蓄典雅', '传统元素', '意境营造'],
  '童话感': ['梦幻场景', '纯真氛围', '浪漫叙事'],
}

// 故事节点数据
const STORY_NODES = [
  {
    id: 'intro',
    title: '欢迎来到故事入口',
    description: '在开始之前，请想象你正站在一扇神秘的门上。门上刻着古老的纹样，散发出微弱的光芒。推开这扇门，你将进入一个专为你们设计的婚礼美学世界。',
    choices: [
      {
        id: 'enter',
        title: '推开门',
        description: '带着期待与好奇，踏入未知的旅程',
        tags: ['浪漫主义', '好奇'],
      },
    ],
  },
  {
    id: 'choose_theme',
    title: '选择你的信物',
    description: '在房间中央的桌子上，摆放着几件充满象征意义的物品。每一件都代表着不同的美学方向和情感表达。选择一件最触动你内心的物件。',
    choices: [
      {
        id: 'rose',
        title: '枯萎但永恒的玫瑰',
        description: '凋零之美，时间的印记，永恒的爱意',
        tags: ['古典主义', '怀旧情结', '浪漫主义'],
      },
      {
        id: 'watch',
        title: '滴答作响的黄铜怀表',
        description: '时间的流动，机械之美，生命的齿轮',
        tags: ['蒸汽朋克', '未来感'],
      },
      {
        id: 'crystal',
        title: '清澈的水晶球',
        description: '纯净、梦想、未来的映射',
        tags: ['童话感', '极简主义'],
      },
      {
        id: 'compass',
        title: '古老的罗盘',
        description: '指引、冒险、方向的确定',
        tags: ['自然主义', '东方美学'],
      },
    ],
  },
  {
    id: 'atmosphere',
    title: '描绘你心中的场景',
    description: '闭上眼睛，想象你们的婚礼现场。它是什么样子的？光线如何？空气中弥漫着什么气息？',
    choices: [
      {
        id: 'candlelight',
        title: '摇曳的烛光与暖色调',
        description: '温馨、亲密、浪漫的氛围',
        tags: ['古典主义', '怀旧情结'],
      },
      {
        id: 'nature',
        title: '自然光影与户外绿意',
        description: '清新、生机、与自然融合',
        tags: ['自然主义', '童话感'],
      },
      {
        id: 'dramatic',
        title: '戏剧性的光影对比',
        description: '张力、情绪、深刻的记忆点',
        tags: ['暗黑美学', '未来感'],
      },
      {
        id: 'minimal',
        title: '简约纯净的空间',
        description: '简洁、现代、focus在情感本身',
        tags: ['极简主义'],
      },
    ],
  },
  {
    id: 'emotion',
    title: '最珍视的情感表达',
    description: '在婚礼上，你们最希望宾客感受到的情感是什么？',
    choices: [
      {
        id: 'warmth',
        title: '温暖与亲密',
        description: '家一般的接纳与爱意',
        tags: ['怀旧情结', '浪漫主义'],
      },
      {
        id: 'awe',
        title: '震撼与惊叹',
        description: '令人难忘的视觉与情感冲击',
        tags: ['暗黑美学', '未来感'],
      },
      {
        id: 'tender',
        title: '温柔与细腻',
        description: '如细雨般润物细无声的感动',
        tags: ['童话感', '东方美学'],
      },
      {
        id: 'timeless',
        title: '永恒与庄重',
        description: '跨越时间的誓言与承诺',
        tags: ['古典主义', '蒸汽朋克'],
      },
    ],
  },
]

export default function StoryPage() {
  const [currentNode, setCurrentNode] = useState(0)
  const [selectedChoices, setSelectedChoices] = useState<string[]>([])
  const [collectedTags, setCollectedTags] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showPlannerOption, setShowPlannerOption] = useState(false)
  const [needPlanner, setNeedPlanner] = useState<boolean | null>(null)
  const [plannerServiceType, setPlannerServiceType] = useState<'remote' | 'full' | null>(null)
  const [userCity, setUserCity] = useState('')
  const [weddingPlan, setWeddingPlan] = useState<any>(null)

  // 获取用户城市
  useEffect(() => {
    const city = localStorage.getItem('aurawed_user_city') || ''
    setUserCity(city)
  }, [])

  // 处理选择
  const handleChoice = (choice: StoryChoice) => {
    setSelectedChoices([...selectedChoices, choice.id])
    setCollectedTags([...collectedTags, ...choice.tags])

    if (currentNode < STORY_NODES.length - 1) {
      setCurrentNode(currentNode + 1)
    } else {
      // 所有问题都回答完了，生成结果
      handleGenerate([...collectedTags, ...choice.tags])
    }
  }

  // 生成美学方案
  const handleGenerate = async (tagsToUse: string[]) => {
    setIsGenerating(true)

    try {
      const uniqueTagsToUse = [...new Set(tagsToUse)]

      // 1. 调用 AI 生成方案 API
      const response = await fetch('/api/wedding/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: uniqueTagsToUse,
          preferences: {},
          generateImages: false // 可以根据需求开启
        })
      })

      if (!response.ok) {
        throw new Error('生成失败')
      }

      const result = await response.json()

      if (result.success) {
        setWeddingPlan(result.plan)

        // 2. 将方案保存到数据库（如果已经有 wedding_id）
        const weddingId = localStorage.getItem('aurawed_current_wedding_id')
        if (weddingId) {
          try {
            // 这里可以添加将 plan 写入 wedding_plans 表的逻辑
            // 为了简化，目前我们至少更新 weddings 表的状态
            await fetch('/api/wedding/create', {
               // 实际上应该有一个专门的更新接口，这里作为示例说明思路
            })
          } catch(e) {
            console.error('保存方案失败', e)
          }
        }
      }
    } catch (err) {
      console.error('生成方案时发生错误:', err)
      // 容错：即使失败也展示结果页，使用默认/假数据
    } finally {
      setIsGenerating(false)
      setShowResult(true)
    }
  }

  // 获取美学标签（去重）
  const uniqueTags = [...new Set(collectedTags)]
  const mappedStyles = uniqueTags.flatMap(tag => TAG_TO_STYLE_MAPPING[tag] || [])
  const finalStyles = [...new Set(mappedStyles)]

  const node = STORY_NODES[currentNode]

  return (
    <main className="min-h-screen bg-luxury-dark relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="glow-ambient top-[-200px] left-[-200px]" />
      </div>

      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-aurora-rose" />
          <span className="font-display text-xl text-aurora-rose-light">AuraWed</span>
        </div>
        <div className="text-aurora-muted text-sm">
          进度：{currentNode + 1} / {STORY_NODES.length}
        </div>
      </nav>

      {/* 主内容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-24">
        {!showResult ? (
          <>
            {/* 进度条 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl mb-12"
            >
              <div className="h-1 bg-aurora-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-aurora-rose to-aurora-rose-light"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentNode + 1) / STORY_NODES.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>

            {/* 故事卡片 */}
            <motion.div
              key={currentNode}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-aurora-rose/20 bg-aurora-rose/5">
                  <Sparkles className="w-4 h-4 text-aurora-rose-light" />
                  <span className="text-sm text-aurora-rose-light">第 {currentNode + 1} 步</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                  {node.title}
                </h2>
                <p className="text-aurora-muted text-lg leading-relaxed">
                  {node.description}
                </p>
              </div>

              {/* 选择按钮 */}
              <div className="grid gap-4">
                {node.choices.map((choice, i) => (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    onClick={() => handleChoice(choice as any)}
                    whileHover={{ scale: 1.02, x: 10 }}
                    whileTap={{ scale: 0.98 }}
                    className="group p-6 rounded-xl card-luxury text-left border border-transparent hover:border-aurora-rose/30 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-aurora-rose/20 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-aurora-rose-light" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-lg mb-1 group-hover:text-aurora-rose-light transition-colors">
                          {choice.title}
                        </h3>
                        <p className="text-aurora-muted text-sm">
                          {choice.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-aurora-muted group-hover:text-aurora-rose-light group-hover:translate-x-2 transition-all" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* 生成中状态 */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-aurora-dark/90"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 mx-auto mb-6 border-2 border-aurora-rose/30 border-t-aurora-rose rounded-full"
                  />
                  <p className="text-white font-display text-xl">正在编织你的故事...</p>
                  <p className="text-aurora-muted mt-2">AI 正在生成专属的美学方案</p>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          /* 结果展示 */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-aurora-gold/20 bg-aurora-gold/5">
                <Heart className="w-5 h-5 text-aurora-gold" />
                <span className="text-aurora-gold">你的专属美学档案</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
                你的婚礼美学关键词
              </h2>
            </div>

            {/* 标签展示 */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="p-6 rounded-xl card-luxury">
                <h3 className="text-aurora-rose-light font-medium mb-4">你的心理标签</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueTags.map((tag, i) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-aurora-rose/20 text-aurora-rose-light text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-xl card-luxury">
                <h3 className="text-aurora-gold font-medium mb-4">推荐美学风格</h3>
                <div className="flex flex-wrap gap-2">
                  {finalStyles.slice(0, 6).map((style, i) => (
                    <span
                      key={style}
                      className="px-3 py-1 rounded-full bg-aurora-gold/20 text-aurora-gold-light text-sm"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 行动按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowPlannerOption(true)}
                className="px-8 py-4 rounded-xl btn-gold text-aurora-dark font-semibold"
              >
                查看完整方案
              </button>
              <button
                onClick={() => {
                  setShowResult(false)
                  setCurrentNode(0)
                  setSelectedChoices([])
                  setCollectedTags([])
                }}
                className="px-8 py-4 rounded-xl border border-aurora-border text-white hover:bg-aurora-card transition-colors"
              >
                重新探索
              </button>
            </div>

            {/* 第6步：选择是否需要策划师 */}
            {showPlannerOption && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-2xl p-8 rounded-2xl card-luxury"
                >
                  <button
                    onClick={() => setShowPlannerOption(false)}
                    className="absolute top-4 right-4 p-2 text-aurora-muted hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full border border-aurora-gold/20 bg-aurora-gold/5">
                      <Crown className="w-4 h-4 text-aurora-gold" />
                      <span className="text-aurora-gold">升级服务</span>
                    </div>
                    <h2 className="font-display text-3xl text-white mb-2">
                      是否需要专业策划师？
                    </h2>
                    <p className="text-aurora-muted">
                      您位于 <span className="text-aurora-gold">{userCity}</span>，我们可为匹配当地专业策划师
                    </p>
                  </div>

                  {/* 选项 */}
                  <div className="space-y-4">
                    {/* 选项1：不需要 */}
                    <button
                      onClick={() => {
                        setNeedPlanner(false)
                        setShowPlannerOption(false)
                        // TODO: 跳转查看完整方案
                      }}
                      className="w-full p-6 rounded-xl border border-aurora-border text-left hover:border-aurora-rose/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-aurora-rose/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-aurora-rose-light" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-lg mb-1">纯AI方案</h3>
                          <p className="text-aurora-muted text-sm">自己查看AI生成的方案和效果图</p>
                          <span className="text-aurora-rose-light text-sm font-medium">免费</span>
                        </div>
                      </div>
                    </button>

                    {/* 选项2：远程咨询 */}
                    <button
                      onClick={() => {
                        setNeedPlanner(true)
                        setPlannerServiceType('remote')
                        setShowPlannerOption(false)
                        // TODO: 匹配同城市策划师
                      }}
                      className="w-full p-6 rounded-xl border border-aurora-border text-left hover:border-aurora-gold/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-aurora-gold/20 flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-aurora-gold" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-lg mb-1">AI + 远程咨询</h3>
                          <p className="text-aurora-muted text-sm">AI方案 + 策划师线上指导优化</p>
                          <span className="text-aurora-gold text-sm font-medium">¥299 起</span>
                        </div>
                      </div>
                    </button>

                    {/* 选项3：全程委托 */}
                    <button
                      onClick={() => {
                        setNeedPlanner(true)
                        setPlannerServiceType('full')
                        setShowPlannerOption(false)
                        // TODO: 匹配同城市策划师
                      }}
                      className="w-full p-6 rounded-xl border border-aurora-border text-left hover:border-purple-500/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <Crown className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-lg mb-1">AI + 全程委托</h3>
                          <p className="text-aurora-muted text-sm">策划师全程跟进，落地执行</p>
                          <span className="text-purple-400 text-sm font-medium">¥1999 起</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  )
}
