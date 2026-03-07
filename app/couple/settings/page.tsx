'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart, User, Palette, Lock, Eye, EyeOff,
  Loader2, CheckCircle, X, Upload, Settings as SettingsIcon,
  ChevronRight, LogOut, DollarSign, Calendar, Users
} from 'lucide-react'
import { supabase, UserProfile } from '@/lib/supabase'
import { updatePassword } from '@/lib/auth'

// 默认个人标签（API 不可用时使用）
const DEFAULT_PERSONAL_TAGS = [
  '浪漫主义', '完美主义', '简约控', '细节控', '浪漫主义者',
  '理想主义者', '务实的浪漫', '追求独特', '注重体验', 'Plan控'
]

// 默认颜色偏好（API 不可用时使用）
const DEFAULT_COLOR_PREFERENCES = [
  '白色', '粉色', '红色', '金色', '银色', '蓝色', '绿色', '紫色',
  '橙色', '黄色', '香槟色', '裸色', '酒红色', '雾霾蓝', '莫兰迪色'
]

// 默认场地类型（API 不可用时使用）
const DEFAULT_VENUE_TYPES = ['酒店', '户外', '教堂', '庭院', '餐厅', '海滩', '其他']

// 默认季节（API 不可用时使用）
const DEFAULT_SEASONS = ['春季', '夏季', '秋季', '冬季', '不限']

export default function CoupleSettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'password'>('profile')
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  // 个人资料表单
  const [profileForm, setProfileForm] = useState({
    name: '',
    city: '',
    avatar_url: ''
  })

  // 偏好设置表单
  const [preferencesForm, setPreferencesForm] = useState({
    budget_min: '',
    budget_max: '',
    preferred_colors: [] as string[],
    personal_tags: [] as string[],
    preferred_season: [] as string[],
    preferred_venue_type: [] as string[],
    guest_count_min: '',
    guest_count_max: '',
    notes: ''
  })

  // 密码修改表单
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // 可配置标签状态
  const [configurableTags, setConfigurableTags] = useState<{
    personal: string[]
    color: string[]
    venue: string[]
    season: string[]
  }>({
    personal: DEFAULT_PERSONAL_TAGS,
    color: DEFAULT_COLOR_PREFERENCES,
    venue: DEFAULT_VENUE_TYPES,
    season: DEFAULT_SEASONS
  })

  // 验证登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const savedType = localStorage.getItem('aurawed_user_type')
      if (!savedType || savedType !== 'couple') {
        window.location.href = '/'
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        localStorage.removeItem('aurawed_user_type')
        window.location.href = '/'
        return
      }

      setIsAuthorized(true)
    }

    checkAuth()
  }, [])

  // 获取可配置标签
  useEffect(() => {
    const fetchConfigurableTags = async () => {
      try {
        const response = await fetch('/api/tags?types=personal,color,venue,season')
        const result = await response.json()
        if (result.success && result.grouped) {
          setConfigurableTags({
            personal: result.grouped.personal || DEFAULT_PERSONAL_TAGS,
            color: result.grouped.color || DEFAULT_COLOR_PREFERENCES,
            venue: result.grouped.venue || DEFAULT_VENUE_TYPES,
            season: result.grouped.season || DEFAULT_SEASONS
          })
        }
      } catch (error) {
        console.error('获取标签失败:', error)
      }
    }

    fetchConfigurableTags()
  }, [])

  // 获取用户信息
  useEffect(() => {
    if (!isAuthorized) return

    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile) {
          setUser(profile)
          setProfileForm({
            name: profile.name || '',
            city: profile.city || '',
            avatar_url: profile.avatar_url || ''
          })
        }

        // 获取用户偏好设置
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', authUser.id)
          .single()

        if (settings) {
          setPreferencesForm({
            budget_min: settings.budget_min?.toString() || '',
            budget_max: settings.budget_max?.toString() || '',
            preferred_colors: settings.preferred_colors || [],
            personal_tags: settings.personal_tags || [],
            preferred_season: settings.preferred_season || [],
            preferred_venue_type: settings.preferred_venue_type || [],
            guest_count_min: settings.guest_count_min?.toString() || '',
            guest_count_max: settings.guest_count_max?.toString() || '',
            notes: settings.notes || ''
          })
        }
      } catch (err) {
        console.error('获取用户信息失败:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [isAuthorized])

  // 退出登录
  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    window.location.href = '/'
  }

  // 保存个人资料
  const handleSaveProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: profileForm.name,
          city: profileForm.city,
          avatar_url: profileForm.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      alert('保存成功！')
    } catch (err: any) {
      console.error('保存失败:', err)
      alert('保存失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 保存偏好设置
  const handleSavePreferences = async () => {
    if (!user) return

    setLoading(true)
    try {
      const data = {
        user_id: user.id,
        budget_min: preferencesForm.budget_min ? parseFloat(preferencesForm.budget_min) : null,
        budget_max: preferencesForm.budget_max ? parseFloat(preferencesForm.budget_max) : null,
        preferred_colors: preferencesForm.preferred_colors,
        personal_tags: preferencesForm.personal_tags,
        preferred_season: preferencesForm.preferred_season,
        preferred_venue_type: preferencesForm.preferred_venue_type,
        guest_count_min: preferencesForm.guest_count_min ? parseInt(preferencesForm.guest_count_min) : null,
        guest_count_max: preferencesForm.guest_count_max ? parseInt(preferencesForm.guest_count_max) : null,
        notes: preferencesForm.notes,
        updated_at: new Date().toISOString()
      }

      // 检查是否已有设置
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        await supabase
          .from('user_settings')
          .update(data)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('user_settings')
          .insert({ ...data, created_at: new Date().toISOString() })
      }

      alert('保存成功！')
    } catch (err: any) {
      console.error('保存失败:', err)
      alert('保存失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 修改密码
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('请填写所有密码字段')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的密码不一致')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密码长度至少6位')
      return
    }

    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccess(false)

    const result = await updatePassword(passwordForm.currentPassword, passwordForm.newPassword)

    if (result.success) {
      setPasswordSuccess(true)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      setPasswordError(result.error || '修改密码失败')
    }

    setPasswordLoading(false)
  }

  // 头像上传
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `avatars/${user.id}/${fileName}`

      const { error } = await supabase.storage
        .from('wedding-media')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('wedding-media')
        .getPublicUrl(filePath)

      setProfileForm(prev => ({ ...prev, avatar_url: publicUrl }))
    } catch (err: any) {
      console.error('上传失败:', err)
      alert('头像上传失败')
    }
  }

  if (isAuthorized === null || loading) {
    return (
      <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-aurora-rose animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-luxury-dark flex relative z-10">
      {/* 侧边栏 */}
      <aside className="w-64 bg-aurora-surface border-r border-aurora-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-aurora-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aurora-rose/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-aurora-rose" />
            </div>
            <div>
              <span className="font-display text-lg text-aurora-rose-light">AuraWed</span>
              <p className="text-xs text-aurora-muted">个人设置</p>
            </div>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'profile'
                  ? 'bg-aurora-rose/10 text-aurora-rose'
                  : 'text-aurora-muted hover:bg-aurora-card hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">个人资料</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'preferences'
                  ? 'bg-aurora-rose/10 text-aurora-rose'
                  : 'text-aurora-muted hover:bg-aurora-card hover:text-white'
              }`}
            >
              <Palette className="w-5 h-5" />
              <span className="font-medium">婚礼偏好</span>
            </button>

            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'password'
                  ? 'bg-aurora-rose/10 text-aurora-rose'
                  : 'text-aurora-muted hover:bg-aurora-card hover:text-white'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span className="font-medium">修改密码</span>
            </button>
          </div>
        </nav>

        {/* 底部 */}
        <div className="p-4 border-t border-aurora-border">
          <a
            href="/couple"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-aurora-muted hover:bg-aurora-card hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="font-medium">返回首页</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-aurora-muted hover:bg-aurora-card hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* 个人资料 */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-3xl text-white mb-8">个人资料</h1>

              <div className="card-luxury p-6 rounded-2xl">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    {profileForm.avatar_url ? (
                      <img
                        src={profileForm.avatar_url}
                        alt="头像"
                        className="w-24 h-24 rounded-full object-cover border-2 border-aurora-rose"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-aurora-card flex items-center justify-center border-2 border-aurora-rose/30">
                        <User className="w-10 h-10 text-aurora-rose" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-aurora-rose rounded-full flex items-center justify-center cursor-pointer hover:bg-aurora-rose/80 transition-colors">
                      <Upload className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">头像</h3>
                    <p className="text-aurora-muted text-sm">点击上传新头像</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">姓名</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white"
                      placeholder="请输入姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">所在城市</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white"
                      placeholder="请输入城市"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-aurora-card rounded-xl">
                  <p className="text-aurora-muted text-sm">
                    邮箱：<span className="text-white">{user?.email}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="mt-6 px-8 py-3 rounded-xl bg-aurora-rose text-white font-semibold hover:bg-aurora-rose/80 transition-colors disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存修改'}
              </button>
            </motion.div>
          )}

          {/* 婚礼偏好 */}
          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-3xl text-white mb-8">婚礼偏好</h1>

              {/* 预算 */}
              <div className="card-luxury p-6 rounded-2xl mb-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-aurora-rose" />
                  预算范围
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">最低预算（万元）</label>
                    <input
                      type="number"
                      value={preferencesForm.budget_min}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, budget_min: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white"
                      placeholder="如: 10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">最高预算（万元）</label>
                    <input
                      type="number"
                      value={preferencesForm.budget_max}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, budget_max: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white"
                      placeholder="如: 30"
                    />
                  </div>
                </div>
              </div>

              {/* 宾客人数 */}
              <div className="card-luxury p-6 rounded-2xl mb-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-aurora-rose" />
                  预计宾客人数
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">最少宾客</label>
                    <input
                      type="number"
                      value={preferencesForm.guest_count_min}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, guest_count_min: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white"
                      placeholder="如: 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">最多宾客</label>
                    <input
                      type="number"
                      value={preferencesForm.guest_count_max}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, guest_count_max: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white"
                      placeholder="如: 300"
                    />
                  </div>
                </div>
              </div>

              {/* 喜欢的颜色 */}
              <div className="card-luxury p-6 rounded-2xl mb-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-aurora-rose" />
                  喜欢的颜色
                </h3>
                <div className="flex flex-wrap gap-2">
                  {configurableTags.color.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        const newColors = preferencesForm.preferred_colors.includes(color)
                          ? preferencesForm.preferred_colors.filter(c => c !== color)
                          : [...preferencesForm.preferred_colors, color]
                        setPreferencesForm({ ...preferencesForm, preferred_colors: newColors })
                      }}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        preferencesForm.preferred_colors.includes(color)
                          ? 'bg-aurora-rose text-white'
                          : 'bg-aurora-card text-aurora-muted hover:text-white'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* 个人标签 */}
              <div className="card-luxury p-6 rounded-2xl mb-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-aurora-rose" />
                  个人标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {configurableTags.personal.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const newTags = preferencesForm.personal_tags.includes(tag)
                          ? preferencesForm.personal_tags.filter(t => t !== tag)
                          : [...preferencesForm.personal_tags, tag]
                        setPreferencesForm({ ...preferencesForm, personal_tags: newTags })
                      }}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        preferencesForm.personal_tags.includes(tag)
                          ? 'bg-aurora-rose text-white'
                          : 'bg-aurora-card text-aurora-muted hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 偏好季节 */}
              <div className="card-luxury p-6 rounded-2xl mb-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-aurora-rose" />
                  偏好季节
                </h3>
                <div className="flex flex-wrap gap-2">
                  {configurableTags.season.map(season => (
                    <button
                      key={season}
                      onClick={() => {
                        const newSeasons = preferencesForm.preferred_season.includes(season)
                          ? preferencesForm.preferred_season.filter(s => s !== season)
                          : [...preferencesForm.preferred_season, season]
                        setPreferencesForm({ ...preferencesForm, preferred_season: newSeasons })
                      }}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        preferencesForm.preferred_season.includes(season)
                          ? 'bg-aurora-rose text-white'
                          : 'bg-aurora-card text-aurora-muted hover:text-white'
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              {/* 偏好场地类型 */}
              <div className="card-luxury p-6 rounded-2xl mb-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-aurora-rose" />
                  偏好场地类型
                </h3>
                <div className="flex flex-wrap gap-2">
                  {configurableTags.venue.map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const newTypes = preferencesForm.preferred_venue_type.includes(type)
                          ? preferencesForm.preferred_venue_type.filter(t => t !== type)
                          : [...preferencesForm.preferred_venue_type, type]
                        setPreferencesForm({ ...preferencesForm, preferred_venue_type: newTypes })
                      }}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        preferencesForm.preferred_venue_type.includes(type)
                          ? 'bg-aurora-rose text-white'
                          : 'bg-aurora-card text-aurora-muted hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 备注 */}
              <div className="card-luxury p-6 rounded-2xl mb-6">
                <h3 className="text-white font-medium mb-4">其他备注</h3>
                <textarea
                  value={preferencesForm.notes}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl input-luxury text-white h-32 resize-none"
                  placeholder="其他想备注的信息，如特殊需求、婚礼风格想法等..."
                />
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-aurora-rose text-white font-semibold hover:bg-aurora-rose/80 transition-colors disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存修改'}
              </button>
            </motion.div>
          )}

          {/* 修改密码 */}
          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-3xl text-white mb-8">修改密码</h1>

              <div className="card-luxury p-6 rounded-2xl max-w-md">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">当前密码</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 rounded-xl input-luxury text-white"
                        placeholder="请输入当前密码"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-aurora-muted hover:text-white"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">新密码</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 rounded-xl input-luxury text-white"
                        placeholder="请输入新密码（至少6位）"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-aurora-muted hover:text-white"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">确认新密码</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 rounded-xl input-luxury text-white"
                        placeholder="请再次输入新密码"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-aurora-muted hover:text-white"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <p className="text-red-500 text-sm">{passwordError}</p>
                  )}

                  {passwordSuccess && (
                    <p className="text-green-500 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      密码修改成功！
                    </p>
                  )}

                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="w-full py-3 rounded-xl bg-aurora-rose text-white font-semibold hover:bg-aurora-rose/80 transition-colors disabled:opacity-50"
                  >
                    {passwordLoading ? '修改中...' : '确认修改'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
