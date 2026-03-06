'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, ArrowRight, X, Check, Upload, DollarSign, Users, Calendar, MapPin } from 'lucide-react'

// 场景类型
const SCENES = [
  { id: 'wedding', name: '婚礼', icon: '💒' },
  { id: 'proposal', name: '求婚', icon: '💍' },
  { id: 'birthday', name: '生日派对', icon: '🎂' },
  { id: 'event', name: '公司活动', icon: '🏢' },
  { id: 'other', name: '其他', icon: '✨' },
]

// 风格偏好
const STYLES = [
  { id: 'romantic', name: '浪漫梦幻', description: '唯美、温馨、充满爱意' },
  { id: 'luxury', name: '高端奢华', description: '华丽、精致、品质感' },
  { id: 'minimal', name: '简约现代', description: '简洁、时尚、大气' },
  { id: 'boho', name: '波西米亚', description: '自由、复古、民族风' },
  { id: 'chinese', name: '新中式', description: '传统与时尚的融合' },
  { id: 'nature', name: '自然森系', description: '清新、原生态、舒适' },
  { id: 'vintage', name: '复古怀旧', description: '怀旧、复古、时光感' },
]

// 预算区间
const BUDGETS = [
  { id: 'low', name: '3万以下', range: '0-30000' },
  { id: 'medium', name: '3-8万', range: '30000-80000' },
  { id: 'high', name: '8-15万', range: '80000-150000' },
  { id: 'luxury', name: '15-30万', range: '150000-300000' },
  { id: 'ultra', name: '30万以上', range: '300000+' },
]

// 喜欢元素（多选）
const ELEMENTS = [
  '花艺拱门', '星光灯串', '水晶吊饰', '绸缎布置', '木质架构',
  '纱幔帷幔', '镜面T台', '喷泉流水', '气球', '纸艺',
  '摄影', '摄像', '直播', '乐队', '主持',
]

// 期望氛围
const MOODS = [
  { id: 'warm', name: '温馨浪漫', description: '温暖、甜蜜、感人' },
  { id: 'grand', name: '庄重盛大', description: '仪式感强、大气磅礴' },
  { id: 'relaxed', name: '轻松欢乐', description: '欢乐、互动、热闹' },
  { id: 'intimate', name: '温馨私密', description: '小而美、亲密感动' },
  { id: 'fashion', name: '时尚潮流', description: '现代感强、前卫' },
]

interface DemandForm {
  scene: string
  style: string[]
  budget: string
  elements: string[]
  mood: string
  guestCount: number
  weddingDate: string
  location: string
  specialRequirements: string
}

export default function DemandPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<DemandForm>({
    scene: '',
    style: [],
    budget: '',
    elements: [],
    mood: '',
    guestCount: 0,
    weddingDate: '',
    location: '',
    specialRequirements: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 更新表单
  const updateForm = (field: keyof DemandForm, value: any) => {
    setForm({ ...form, [field]: value })
  }

  // 切换风格选择（多选）
  const toggleStyle = (id: string) => {
    if (form.style.includes(id)) {
      updateForm('style', form.style.filter(s => s !== id))
    } else {
      updateForm('style', [...form.style, id])
    }
  }

  // 切换元素选择（多选）
  const toggleElement = (id: string) => {
    if (form.elements.includes(id)) {
      updateForm('elements', form.elements.filter(e => e !== id))
    } else {
      updateForm('elements', [...form.elements, id])
    }
  }

  // 下一步
  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  // 上一步
  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  // 提交表单
  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // 从本地存储获取城市作为兜底
      let userCity = form.location || localStorage.getItem('aurawed_user_city') || '未知城市'

      // 调用创建订单API
      const response = await fetch('/api/wedding/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${form.scene === 'wedding' ? '婚礼' : '活动'}需求 - ${new Date().toLocaleDateString()}`,
          city: userCity,
          weddingDate: form.weddingDate || null,
          budget: form.budget ? parseInt(form.budget.split('-')[0]) || 0 : 0,
          guestCount: form.guestCount || 0,
          needPlanner: true, // 默认需要分配策划师
          tags: form.style.concat(form.elements, [form.mood]).filter(Boolean)
        })
      })

      if (!response.ok) {
        throw new Error('创建需求失败')
      }

      const result = await response.json()

      if (result.success) {
        // 保存当前wedding_id到本地以便故事环节使用
        localStorage.setItem('aurawed_current_wedding_id', result.wedding.id)

        // 可选：将需求存入 wedding_stories 表以备后续方案生成使用
        // ... (在复杂实现中可以添加另一个API进行保存)

        // 跳转到故事问答页面
        window.location.href = '/couple/story'
      } else {
        throw new Error(result.error || '创建需求失败')
      }

    } catch (error: any) {
      console.error('提交失败:', error)
      alert(error.message || '提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 检查当前步骤是否完成
  const canProceed = () => {
    switch (step) {
      case 1: return !!form.scene
      case 2: return form.style.length > 0
      case 3: return !!form.budget && form.elements.length > 0
      case 4: return !!form.mood && form.guestCount > 0
      default: return false
    }
  }

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
          基础问卷 · 第 {step} / 4 步
        </div>
      </nav>

      {/* 主内容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-24">
        {/* 进度条 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mb-8"
        >
          <div className="h-1 bg-aurora-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-aurora-rose to-aurora-rose-light"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* 步骤1：选择场景 */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-aurora-rose/20 bg-aurora-rose/5">
                <Sparkles className="w-4 h-4 text-aurora-rose-light" />
                <span className="text-sm text-aurora-rose-light">第一步</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                您要举办什么活动？
              </h2>
              <p className="text-aurora-muted">选择您想要策划的活动类型</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SCENES.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateForm('scene', item.id)}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    form.scene === item.id
                      ? 'border-aurora-rose bg-aurora-rose/10'
                      : 'border-aurora-border hover:border-aurora-rose/50 bg-aurora-card'
                  }`}
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div className="text-white font-medium">{item.name}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 步骤2：选择风格 */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-aurora-rose/20 bg-aurora-rose/5">
                <Sparkles className="w-4 h-4 text-aurora-rose-light" />
                <span className="text-sm text-aurora-rose-light">第二步</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                您喜欢什么风格？
              </h2>
              <p className="text-aurora-muted">可多选，描述您心中的理想场景</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {STYLES.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggleStyle(item.id)}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    form.style.includes(item.id)
                      ? 'border-aurora-rose bg-aurora-rose/10'
                      : 'border-aurora-border hover:border-aurora-rose/50 bg-aurora-card'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-white font-medium text-lg mb-1">{item.name}</div>
                      <div className="text-aurora-muted text-sm">{item.description}</div>
                    </div>
                    {form.style.includes(item.id) && (
                      <Check className="w-5 h-5 text-aurora-rose" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 步骤3：预算和元素 */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-aurora-rose/20 bg-aurora-rose/5">
                <Sparkles className="w-4 h-4 text-aurora-rose-light" />
                <span className="text-sm text-aurora-rose-light">第三步</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                预算和元素
              </h2>
              <p className="text-aurora-muted">告诉我们您的预算和想要的元素</p>
            </div>

            {/* 预算 */}
            <div className="mb-8">
              <label className="block text-white font-medium mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-aurora-gold" />
                预算区间
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BUDGETS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateForm('budget', item.id)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      form.budget === item.id
                        ? 'border-aurora-gold bg-aurora-gold/10'
                        : 'border-aurora-border hover:border-aurora-gold/50 bg-aurora-card'
                    }`}
                  >
                    <div className="text-white font-medium">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 元素 */}
            <div>
              <label className="block text-white font-medium mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-aurora-gold" />
                喜欢元素（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {ELEMENTS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleElement(item)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      form.elements.includes(item)
                        ? 'border-aurora-gold bg-aurora-gold/20 text-aurora-gold'
                        : 'border-aurora-border text-aurora-muted hover:border-aurora-gold/50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 步骤4：氛围和其他 */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-aurora-rose/20 bg-aurora-rose/5">
                <Sparkles className="w-4 h-4 text-aurora-rose-light" />
                <span className="text-sm text-aurora-rose-light">第四步</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                最后补充一些信息
              </h2>
              <p className="text-aurora-muted">让AI更好地为您定制方案</p>
            </div>

            {/* 氛围 */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-4">期望氛围</label>
              <div className="grid md:grid-cols-3 gap-3">
                {MOODS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateForm('mood', item.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.mood === item.id
                        ? 'border-aurora-rose bg-aurora-rose/10'
                        : 'border-aurora-border hover:border-aurora-rose/50 bg-aurora-card'
                    }`}
                  >
                    <div className="text-white font-medium mb-1">{item.name}</div>
                    <div className="text-aurora-muted text-xs">{item.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 来宾数量 */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-aurora-gold" />
                预计来宾人数
              </label>
              <input
                type="number"
                value={form.guestCount || ''}
                onChange={(e) => updateForm('guestCount', parseInt(e.target.value) || 0)}
                placeholder="请输入预计人数"
                className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
              />
            </div>

            {/* 婚礼日期 */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-aurora-gold" />
                婚礼/活动日期
              </label>
              <input
                type="date"
                value={form.weddingDate}
                onChange={(e) => updateForm('weddingDate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl input-luxury text-white"
              />
            </div>

            {/* 地点 */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-aurora-gold" />
                期望举办地点
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateForm('location', e.target.value)}
                placeholder="例如：北京市、海边户外、三亚等"
                className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
              />
            </div>

            {/* 特殊要求 */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-4">
                特殊要求（选填）
              </label>
              <textarea
                value={form.specialRequirements}
                onChange={(e) => updateForm('specialRequirements', e.target.value)}
                placeholder="请告诉我们任何特殊需求或想法..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted resize-none"
              />
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
              className="px-8 py-3 rounded-xl btn-rose disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  提交需求
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
