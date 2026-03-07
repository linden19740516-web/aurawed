'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, ArrowRight, Users, Crown, X, Mail, Lock, User, MapPin, Settings, Phone, Image } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// 用户类型
type UserType = 'couple' | 'planner' | 'admin' | null

// 中国主要城市列表
const CITIES = [
  '北京市', '上海市', '广州市', '深圳市', '杭州市',
  '南京市', '武汉市', '成都市', '重庆市', '西安市',
  '苏州市', '天津市', '长沙市', '郑州市', '青岛市',
  '济南市', '大连市', '沈阳市', '厦门市', '宁波市',
  '福州市', '合肥市', '昆明市', '兰州市', '石家庄市',
  '哈尔滨市', '长春市', '南昌市', '贵阳市', '太原市',
  '东莞市', '佛山市', '无锡市', '温州市', '常州市',
  '徐州市', '扬州市', '南通市', '镇江市', '台州市',
  '嘉兴市', '绍兴市', '金华市', '湖州市', '淮安市',
  '泰州市', '盐城市', '连云港市', '宿迁市', '舟山市'
]

// 预定义的管理员账号
const ADMIN_ACCOUNTS = [
  { email: 'admin@aurawed.com', password: 'admin123', name: '超级管理员' },
]

export default function Home() {
  const [userType, setUserType] = useState<UserType>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    name: '',
    city: '',
    inviteCode: ''
  })
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 检查是否已登录 - 修复: 添加loading状态防止循环跳转
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    // 标记组件已挂载
    setAuthReady(true)
  }, [])

  useEffect(() => {
    if (!authReady) return // 等待组件挂载完成

    const savedType = localStorage.getItem('aurawed_user_type')
    if (savedType) {
      // 延迟执行，确保不触发重定向循环
      setTimeout(() => {
        if (savedType === 'admin') {
          window.location.href = '/admin'
        } else if (savedType === 'planner') {
          window.location.href = '/planner'
        } else {
          window.location.href = '/couple'
        }
      }, 100)
    }
  }, [authReady])

  // 处理用户类型选择
  const handleTypeSelect = (type: 'couple' | 'planner') => {
    setUserType(type)
    setShowRegister(true)
  }

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!registerForm.email || !registerForm.password || !registerForm.name) {
        setError('请填写完整信息')
        return
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(registerForm.email)) {
        setError('请输入有效的邮箱地址')
        return
      }

      // 调用后端 API 注册 (跳过邮箱确认)
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password,
          name: registerForm.name,
          city: registerForm.city,
          userType: userType || 'couple',
          inviteCode: registerForm.inviteCode
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || '注册失败')
        return
      }

      // 注册成功，直接登录
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: registerForm.email,
        password: registerForm.password,
      })

      if (authError) throw authError

      // 保存信息到本地存储
      localStorage.setItem('aurawed_user_type', userType || 'couple')
      localStorage.setItem('aurawed_user_name', registerForm.name)
      localStorage.setItem('aurawed_user_city', registerForm.city)

      setShowRegister(false)

      // 跳转到对应端
      if (userType === 'couple') {
        window.location.href = '/couple'
      } else {
        window.location.href = '/planner'
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || '注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!loginForm.email || !loginForm.password) {
        setError('请输入邮箱和密码')
        return
      }

      // 调用 Supabase 登录
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      })

      if (authError) throw authError

      // 获取用户资料
      if (authData.user) {
        const { data: profile, error: profileError } = await (supabase
          .from('user_profiles')
          .select('user_type, name, city')
          .eq('id', authData.user.id)
          .single() as any)

        if (profileError) throw profileError

        const userTypeValue = profile?.user_type || 'couple'

        // 保存用户信息
        localStorage.setItem('aurawed_user_type', userTypeValue)
        localStorage.setItem('aurawed_user_name', profile?.name || '')
        localStorage.setItem('aurawed_user_city', profile?.city || '')

        // 根据用户类型跳转
        if (userTypeValue === 'admin') {
          window.location.href = '/admin'
        } else if (userTypeValue === 'planner') {
          window.location.href = '/planner'
        } else {
          window.location.href = '/couple'
        }
      }
    } catch (err: any) {
      console.error(err)
      if (err.message?.includes('Invalid login credentials')) {
        setError('邮箱或密码错误')
      } else {
        setError(err.message || '登录失败，请检查信息')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-luxury-dark relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="glow-ambient top-[-200px] left-[-200px]" />
        <div className="glow-ambient bottom-[-200px] right-[-200px]" style={{ background: 'radial-gradient(circle, rgba(139, 69, 87, 0.06) 0%, transparent 70%)' }} />

        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-aurora-gold/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Heart className="w-8 h-8 text-aurora-gold" />
          <span className="font-display text-2xl text-gold font-semibold tracking-wide">AuraWed</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <button
            onClick={() => setShowLogin(true)}
            className="px-6 py-2 text-aurora-gold-light border border-aurora-gold/30 rounded-full hover:bg-aurora-gold/10 transition-all duration-300"
          >
            登录
          </button>
        </motion.div>
      </nav>

      {/* 主内容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-aurora-gold/20 bg-aurora-gold/5"
          >
            <Sparkles className="w-4 h-4 text-aurora-gold" />
            <span className="text-sm text-aurora-gold-light">AI 驱动的婚礼美学革命</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl mb-6 leading-tight">
            <span className="text-gold">让婚礼</span>
            <br />
            <span className="text-white/90">成为一生的故事</span>
          </h1>

          <p className="text-aurora-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            拒绝同质化堆砌，用心理学构建具有叙事感的婚礼方案
            <br />
            <span className="text-aurora-rose-light">让每一个瞬间都充满意义</span>
          </p>
        </motion.div>

        {/* 入口选择卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl w-full"
        >
          <motion.button
            onClick={() => handleTypeSelect('couple')}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-8 rounded-2xl card-luxury text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-rose/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-aurora-rose/20 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-aurora-rose-light" />
              </div>

              <h3 className="font-display text-2xl text-white mb-2">新人入口</h3>
              <p className="text-aurora-muted mb-6">
                开启一场沉浸式婚礼探索之旅，通过心理学故事发现您独一无二的婚礼美学
              </p>

              <div className="flex items-center text-aurora-rose-light group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-medium">开始探索</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-aurora-rose to-aurora-rose-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </motion.button>

          <motion.button
            onClick={() => handleTypeSelect('planner')}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-8 rounded-2xl card-luxury text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-aurora-gold/20 flex items-center justify-center mb-6">
                <Crown className="w-7 h-7 text-aurora-gold" />
              </div>

              <h3 className="font-display text-2xl text-white mb-2">策划师入口</h3>
              <p className="text-aurora-muted mb-6">
                专业级美学提案引擎，为您的客户提供独特且富有叙事感的高级婚礼方案
              </p>

              <div className="flex items-center text-aurora-gold group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-medium">专业入驻</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-aurora-gold to-aurora-gold-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </motion.button>
        </motion.div>

        {/* 作品集入口 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <button
            onClick={() => window.location.href = '/portfolio'}
            className="group relative px-8 py-4 rounded-2xl card-luxury inline-flex items-center gap-3 hover:border-aurora-gold/30 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-aurora-gold/5 to-aurora-rose/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <Image className="w-6 h-6 text-aurora-gold" />
            <span className="text-white font-medium">浏览优秀作品</span>
            <ArrowRight className="w-4 h-4 text-aurora-gold group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 flex flex-wrap justify-center gap-8 text-center"
        >
          {[
            { icon: Sparkles, label: 'AI 智能故事引擎', desc: '心理学驱动的需求挖掘' },
            { icon: Heart, label: '独特美学标签', desc: '拒绝流水线式方案' },
            { icon: Users, label: 'B/C 端协同', desc: '新人与策划师的高效对接' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center px-6">
              <item.icon className="w-6 h-6 text-aurora-gold/60 mb-2" />
              <span className="text-white/80 font-medium">{item.label}</span>
              <span className="text-aurora-muted text-sm">{item.desc}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 注册弹窗 */}
      <AnimatePresence>
        {showRegister && userType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRegister(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-8 rounded-2xl card-luxury"
            >
              <button
                onClick={() => setShowRegister(false)}
                className="absolute top-4 right-4 p-2 text-aurora-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <h2 className="font-display text-3xl text-white mb-2">
                  {userType === 'couple' ? '新人注册' : '策划师入驻'}
                </h2>
                <p className="text-aurora-muted">
                  {userType === 'couple'
                    ? '开启您的婚礼美学探索之旅'
                    : '加入专业婚礼美学策划平台'}
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm text-aurora-muted mb-2">邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
                    <input
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="请输入邮箱地址"
                      className="w-full pl-12 pr-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-aurora-muted mb-2">密码</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
                    <input
                      type="password"
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="请设置密码"
                      className="w-full pl-12 pr-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-aurora-muted mb-2">姓名</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
                    <input
                      type="text"
                      required
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      placeholder="请输入您的姓名"
                      className="w-full pl-12 pr-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-aurora-muted mb-2">所在城市</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
                    <select
                      required
                      value={registerForm.city}
                      onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl input-luxury text-white appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-gray-800">请选择您的城市</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city} className="bg-gray-800">{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {userType === 'planner' && (
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">邀请码 <span className="text-aurora-rose-light">(必填)</span></label>
                    <input
                      type="text"
                      required
                      value={registerForm.inviteCode}
                      onChange={(e) => setRegisterForm({ ...registerForm, inviteCode: e.target.value })}
                      placeholder="请输入邀请码"
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                    />
                    <p className="mt-2 text-xs text-aurora-muted">* 策划师入驻需要邀请码，请联系平台获取</p>
                  </div>
                )}

                {error && (
                  <p className="text-aurora-rose-light text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl btn-gold text-aurora-dark font-semibold disabled:opacity-50"
                >
                  {isLoading ? '注册中...' : '立即注册'}
                </button>
              </form>

              <p className="mt-6 text-center text-aurora-muted text-sm">
                已有账号？{' '}
                <button
                  onClick={() => {
                    setShowRegister(false)
                    setShowLogin(true)
                  }}
                  className="text-aurora-gold hover:underline"
                >
                  立即登录
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 登录弹窗 */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-8 rounded-2xl card-luxury"
            >
              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-4 right-4 p-2 text-aurora-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <h2 className="font-display text-3xl text-white mb-2">欢迎回来</h2>
                <p className="text-aurora-muted">账号登录</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm text-aurora-muted mb-2">邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
                    <input
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="请输入邮箱地址"
                      className="w-full pl-12 pr-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-aurora-muted mb-2">密码</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
                    <input
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="请输入密码"
                      className="w-full pl-12 pr-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-aurora-rose-light text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl btn-gold text-aurora-dark font-semibold disabled:opacity-50"
                >
                  {isLoading ? '登录中...' : '登录'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setShowLogin(false)
                    window.location.href = '/forgot-password'
                  }}
                  className="text-aurora-gold text-sm hover:underline"
                >
                  忘记密码？
                </button>
              </div>

              <p className="mt-4 text-center text-aurora-muted text-sm">
                还没有账号？{' '}
                <button
                  onClick={() => {
                    setShowLogin(false)
                    setShowRegister(true)
                  }}
                  className="text-aurora-gold hover:underline"
                >
                  立即注册
                </button>
              </p>

              <div className="mt-6 p-4 bg-aurora-card rounded-lg">
                <p className="text-aurora-muted text-xs text-center">
                  管理员测试账号：13800000000 / admin123
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
