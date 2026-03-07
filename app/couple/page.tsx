'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, ArrowRight, FileText, MessageCircle, X, LogOut, Settings, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function CouplePage() {
  const [showChoice, setShowChoice] = useState(true)
  const [userCity, setUserCity] = useState('')

  // 获取用户城市
  useEffect(() => {
    const city = localStorage.getItem('aurawed_user_city') || ''
    setUserCity(city)
  }, [])

  // 选择基础问卷
  const handleDemandForm = () => {
    window.location.href = '/couple/demand'
  }

  // 选择故事问答
  const handleStoryQuiz = () => {
    setShowChoice(false)
    window.location.href = '/couple/story'
  }

  // 退出登录
  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    window.location.href = '/'
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
        {userCity && (
          <div className="text-aurora-muted text-sm">
            当前城市：{userCity}
          </div>
        )}
        <div className="flex items-center gap-3">
          <a
            href="/couple/settings"
            className="flex items-center gap-2 px-4 py-2 text-aurora-muted hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>设置</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-aurora-muted hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>退出</span>
          </button>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-aurora-rose/20 bg-aurora-rose/5">
            <Sparkles className="w-4 h-4 text-aurora-rose-light" />
            <span className="text-sm text-aurora-rose-light">欢迎来到 AuraWed</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
            开始您的婚礼策划之旅
          </h1>
          <p className="text-aurora-muted text-lg max-w-xl mx-auto">
            选择一种方式，让我们更好地了解您的需求
          </p>
        </motion.div>

        {/* 选择卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 max-w-3xl w-full"
        >
          {/* 基础问卷 */}
          <motion.button
            onClick={handleDemandForm}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-8 rounded-2xl card-luxury text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-rose/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-aurora-rose/20 flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-aurora-rose-light" />
              </div>

              <h3 className="font-display text-2xl text-white mb-2">快速问卷</h3>
              <p className="text-aurora-muted mb-6">
                填写基础问卷，快速提交您的婚礼需求：场景、风格、预算、元素等
              </p>

              <div className="flex items-center text-aurora-rose-light group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-medium">开始填写</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-aurora-rose to-aurora-rose-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </motion.button>

          {/* 故事问答 */}
          <motion.button
            onClick={handleStoryQuiz}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-8 rounded-2xl card-luxury text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-aurora-gold/20 flex items-center justify-center mb-6">
                <MessageCircle className="w-7 h-7 text-aurora-gold" />
              </div>

              <h3 className="font-display text-2xl text-white mb-2">故事探索</h3>
              <p className="text-aurora-muted mb-6">
                通过互动问答，挖掘您独一无二的爱情故事，生成专属美学方案
              </p>

              <div className="flex items-center text-aurora-gold group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-medium">开始探索</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-aurora-gold to-aurora-gold-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </motion.button>
        </motion.div>

        {/* 底部提示 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-aurora-muted text-sm mt-12 text-center"
        >
          两种方式都能生成专属您的婚礼方案<br />
          问卷更快速，故事更有深度
        </motion.p>
      </div>
    </main>
  )
}
