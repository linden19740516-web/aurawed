'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, ArrowRight, Check, Upload, Star, MapPin, DollarSign, Clock, X, Sparkles, RefreshCw, Copy } from 'lucide-react'

// 策划师服务类型
const SERVICE_TYPES = [
  { id: 'remote', name: '远程咨询', description: '线上指导，不到场', price: '299-999元/次' },
  { id: 'full', name: '全程委托', description: '全程跟进，现场执行', price: '1999-9999元/场' },
  { id: 'both', name: '两者都做', description: '支持远程咨询和全程委托', price: '根据项目定价' },
]

// 擅长风格
const EXPERTISE_STYLES = [
  '浪漫梦幻', '高端奢华', '简约现代', '波西米亚',
  '新中式', '自然森系', '复古怀旧', '水晶梦境',
  '户外婚礼', '目的地婚礼', '小型婚礼', '中式婚礼',
]

// 经验年限
const EXPERIENCE_YEARS = [
  { id: '1', name: '1年以下' },
  { id: '3', name: '1-3年' },
  { id: '5', name: '3-5年' },
  { id: '10', name: '5-10年' },
  { id: '10+', name: '10年以上' },
]

// AI生成的灵感示例
const AI_INSPIRATION_EXAMPLE = {
  styleSuggestions: [
    '根据您的"浪漫梦幻"风格，建议尝试"星光隧道"主题',
    '结合"高端奢华"，可以考虑"法式宫廷"元素',
    '加入"波西米亚"元素，增加自由浪漫感'
  ],
  caseIdeas: [
    '森系主题婚礼：原木、藤蔓、星光灯串',
    '水晶梦境：镜面T台、水晶吊饰、星光顶',
    '新中式：红色灯笼、梅花、意境山水'
  ],
  marketingTips: [
    '建议在简介中突出您的独特风格标签',
    '可以加入一些成功案例的数据支撑',
    '展示您对细节的把控能力'
  ]
}

interface PlannerForm {
  // 基本信息
  realName: string
  phone: string
  companyName: string
  city: string
  // 专业信息
  expertiseStyles: string[]
  experienceYears: string
  serviceType: string
  priceRange: string
  // AI灵感
  aiInspiration: {
    styleSuggestions: string[]
    caseIdeas: string[]
    marketingTips: string[]
  } | null
  // 详细介绍
  bio: string
  portfolio: string[]
  // 认证
  certificate: string
}

export default function ApplyPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<PlannerForm>({
    realName: '',
    phone: '',
    companyName: '',
    city: '',
    expertiseStyles: [],
    experienceYears: '',
    serviceType: '',
    priceRange: '',
    aiInspiration: null,
    bio: '',
    portfolio: [],
    certificate: ''
  })
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const updateForm = (field: keyof PlannerForm, value: any) => {
    setForm({ ...form, [field]: value })
  }

  const toggleStyle = (style: string) => {
    if (form.expertiseStyles.includes(style)) {
      updateForm('expertiseStyles', form.expertiseStyles.filter(s => s !== style))
    } else {
      updateForm('expertiseStyles', [...form.expertiseStyles, style])
    }
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const canProceed = () => {
    switch (step) {
      case 1: return !!form.realName && !!form.phone && !!form.city
      case 2: return form.expertiseStyles.length > 0 && !!form.serviceType && !!form.experienceYears
      case 3: return true // AI灵感步骤，可选
      case 4: return !!form.bio
      default: return false
    }
  }

  // 生成AI灵感
  const handleGenerateAI = async () => {
    setIsGeneratingAI(true)

    try {
      // 模拟AI生成过程
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 这里实际应该调用AI API
      // 模拟返回一些灵感建议
      setForm({
        ...form,
        aiInspiration: {
          styleSuggestions: [
            `根据您的"${form.expertiseStyles[0] || '风格'}"专长，建议尝试更细分的方向`,
            '结合您的服务类型，可以突出差异化竞争力',
            '建议在方案中融入个人特色标签'
          ],
          caseIdeas: [
            '打造一个沉浸式体验的婚礼场景',
            '结合新人的爱情故事定制独特元素',
            '注重宾客互动和情感共鸣'
          ],
          marketingTips: [
            '在简介中突出您的核心优势',
            '展示成功案例的量化数据',
            '强调您的服务流程和专业性'
          ]
        }
      })
    } catch (error) {
      console.error('AI生成失败:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      console.log('提交入驻申请:', form)

      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 1500))

      setShowSuccess(true)
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 提交成功弹窗
  if (showSuccess) {
    return (
      <main className="min-h-screen bg-luxury-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl card-luxury text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-display text-2xl text-white mb-4">提交成功！</h2>
          <p className="text-aurora-muted mb-6">
            您的入驻申请已提交，等待管理员审核。通常1-3个工作日内完成审核。
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 rounded-xl btn-gold text-aurora-dark font-semibold"
          >
            返回首页
          </button>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-luxury-dark relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="glow-ambient top-[-200px] right-[-200px]" />
      </div>

      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-aurora-gold" />
          <span className="font-display text-xl text-aurora-gold-light">AuraWed</span>
        </div>
        <div className="text-aurora-muted text-sm">
          策划师入驻 · 第 {step} / 4 步
        </div>
      </nav>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-24">
        {/* 进度条 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mb-8"
        >
          <div className="h-1 bg-aurora-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-aurora-gold to-aurora-gold-light"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* 步骤1：基本信息 */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-aurora-gold/20 bg-aurora-gold/5">
                <Crown className="w-4 h-4 text-aurora-gold" />
                <span className="text-sm text-aurora-gold">第一步</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                基本信息
              </h2>
              <p className="text-aurora-muted">让我们认识一下您</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-aurora-muted mb-2">真实姓名 *</label>
                <input
                  type="text"
                  value={form.realName}
                  onChange={(e) => updateForm('realName', e.target.value)}
                  placeholder="请输入您的真实姓名"
                  className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                />
              </div>

              <div>
                <label className="block text-sm text-aurora-muted mb-2">手机号码 *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  placeholder="请输入您的手机号码"
                  className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                />
              </div>

              <div>
                <label className="block text-sm text-aurora-muted mb-2">公司/工作室名称</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => updateForm('companyName', e.target.value)}
                  placeholder="请输入公司或工作室名称（选填）"
                  className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                />
              </div>

              <div>
                <label className="block text-sm text-aurora-muted mb-2">所在城市 *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateForm('city', e.target.value)}
                  placeholder="请输入您所在的城市"
                  className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* 步骤2：专业信息 */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-aurora-gold/20 bg-aurora-gold/5">
                <Star className="w-4 h-4 text-aurora-gold" />
                <span className="text-sm text-aurora-gold">第二步</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                专业信息
              </h2>
              <p className="text-aurora-muted">展示您的专业能力</p>
            </div>

            <div className="space-y-6">
              {/* 擅长风格 */}
              <div>
                <label className="block text-white font-medium mb-3">擅长风格（可多选） *</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE_STYLES.map((style) => (
                    <button
                      key={style}
                      onClick={() => toggleStyle(style)}
                      className={`px-4 py-2 rounded-full border transition-all ${
                        form.expertiseStyles.includes(style)
                          ? 'border-aurora-gold bg-aurora-gold/20 text-aurora-gold'
                          : 'border-aurora-border text-aurora-muted hover:border-aurora-gold/50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* 经验年限 */}
              <div>
                <label className="block text-white font-medium mb-3">行业经验 *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {EXPERIENCE_YEARS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => updateForm('experienceYears', item.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        form.experienceYears === item.id
                          ? 'border-aurora-gold bg-aurora-gold/10 text-aurora-gold'
                          : 'border-aurora-border text-aurora-muted hover:border-aurora-gold/50'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 服务类型 */}
              <div>
                <label className="block text-white font-medium mb-3">服务类型 *</label>
                <div className="space-y-3">
                  {SERVICE_TYPES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => updateForm('serviceType', item.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        form.serviceType === item.id
                          ? 'border-aurora-gold bg-aurora-gold/10'
                          : 'border-aurora-border hover:border-aurora-gold/50 bg-aurora-card'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-aurora-muted text-sm">{item.description}</div>
                        </div>
                        <div className="text-aurora-gold text-sm">{item.price}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 步骤3：AI辅助灵感 */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-purple-500/20 bg-purple-500/5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400">第三步</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                AI 辅助灵感
              </h2>
              <p className="text-aurora-muted">基于您的专业信息，AI为您生成灵感和方案建议</p>
            </div>

            {/* AI生成按钮 */}
            {!form.aiInspiration ? (
              <div className="text-center py-10">
                <button
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold flex items-center gap-3 mx-auto disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      AI 正在生成灵感...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      生成 AI 灵感建议
                    </>
                  )}
                </button>
                <p className="text-aurora-muted text-sm mt-4">
                  可选择跳过，直接进入下一步
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 风格建议 */}
                <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <h3 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    风格建议
                  </h3>
                  <ul className="space-y-2">
                    {form.aiInspiration.styleSuggestions.map((tip, i) => (
                      <li key={i} className="text-aurora-muted text-sm flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 案例灵感 */}
                <div className="p-5 rounded-xl bg-aurora-gold/10 border border-aurora-gold/20">
                  <h3 className="text-aurora-gold font-medium mb-3">案例灵感</h3>
                  <ul className="space-y-2">
                    {form.aiInspiration.caseIdeas.map((idea, i) => (
                      <li key={i} className="text-aurora-muted text-sm flex items-start gap-2">
                        <Star className="w-4 h-4 text-aurora-gold mt-0.5 flex-shrink-0" />
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 营销建议 */}
                <div className="p-5 rounded-xl bg-aurora-rose/10 border border-aurora-rose/20">
                  <h3 className="text-aurora-rose-light font-medium mb-3">个人品牌建议</h3>
                  <ul className="space-y-2">
                    {form.aiInspiration.marketingTips.map((tip, i) => (
                      <li key={i} className="text-aurora-muted text-sm flex items-start gap-2">
                        <Crown className="w-4 h-4 text-aurora-rose mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 重新生成 */}
                <div className="text-center">
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="text-aurora-muted text-sm flex items-center gap-2 mx-auto hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    重新生成
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 步骤4：详细介绍 */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-aurora-gold/20 bg-aurora-gold/5">
                <Upload className="w-4 h-4 text-aurora-gold" />
                <span className="text-sm text-aurora-gold">第四步</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                详细介绍
              </h2>
              <p className="text-aurora-muted">让用户更好地了解您</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-aurora-muted mb-2">个人/公司简介 *</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => updateForm('bio', e.target.value)}
                  placeholder="介绍一下您的从业经历、擅长领域、服务理念等..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-aurora-muted mb-2">代表作品/案例（选填）</label>
                <textarea
                  value={form.portfolio.join('\n')}
                  onChange={(e) => updateForm('portfolio', e.target.value.split('\n'))}
                  placeholder="每行一个作品名称和简单描述..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-aurora-muted mb-2">资质证书（选填）</label>
                <input
                  type="text"
                  value={form.certificate}
                  onChange={(e) => updateForm('certificate', e.target.value)}
                  placeholder="请输入相关证书名称或编号"
                  className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* 底部按钮 */}
        <div className="flex gap-4 mt-10">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-8 py-3 rounded-xl border border-aurora-border text-white hover:bg-aurora-card transition-colors"
            >
              上一步
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-8 py-3 rounded-xl btn-gold text-aurora-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              下一步
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="px-8 py-3 rounded-xl btn-gold text-aurora-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-aurora-dark/30 border-t-aurora-dark rounded-full animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  提交申请
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
