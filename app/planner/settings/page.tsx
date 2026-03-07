'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, User, Image, Palette, Lock, Eye, EyeOff,
  Loader2, CheckCircle, X, Upload, Trash2, Plus,
  ChevronRight, Settings as SettingsIcon, LogOut
} from 'lucide-react'
import { supabase, UserProfile } from '@/lib/supabase'
import { updatePassword } from '@/lib/auth'
import Link from 'next/link'

// 预设风格标签
const STYLE_TAGS = [
  '浪漫', '梦幻', '简约', '复古', '中式', '韩式', '森系', '星空',
  '海洋', '田园', '古典', '现代', '唯美', 'ins风', '自然', '奢华'
]

// 预设颜色标签
const COLOR_TAGS = [
  '白色', '粉色', '红色', '金色', '银色', '蓝色', '绿色', '紫色',
  '橙色', '黄色', '香槟色', '裸色', '酒红色', '雾霾蓝', '莫兰迪色'
]

export default function PlannerSettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio' | 'password'>('profile')
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  // 个人资料表单
  const [profileForm, setProfileForm] = useState({
    name: '',
    city: '',
    company_name: '',
    bio: '',
    service_type: '',
    service_price: '',
    avatar_url: '',
    style_tags: [] as string[],
    color_tags: [] as string[]
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

  // 作品集
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // 验证登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const savedType = localStorage.getItem('aurawed_user_type')
      if (!savedType || savedType !== 'planner') {
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
            company_name: profile.company_name || '',
            bio: profile.bio || '',
            service_type: profile.service_type || '',
            service_price: profile.service_price?.toString() || '',
            avatar_url: profile.avatar_url || '',
            style_tags: [],
            color_tags: []
          })

          // 获取风格标签
          const { data: styleTags } = await supabase
            .from('planner_style_tags')
            .select('tag_name, tag_category')
            .eq('planner_id', authUser.id)

          if (styleTags) {
            const styles = styleTags.filter((t: { tag_category: string }) => t.tag_category === 'style').map((t: { tag_name: string }) => t.tag_name)
            const colors = styleTags.filter((t: { tag_category: string }) => t.tag_category === 'color').map((t: { tag_name: string }) => t.tag_name)
            setProfileForm(prev => ({ ...prev, style_tags: styles, color_tags: colors }))
          }
        }
      } catch (err) {
        console.error('获取用户信息失败:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [isAuthorized])

  // 获取作品集
  useEffect(() => {
    if (!isAuthorized || !user) return

    const fetchPortfolio = async () => {
      const { data } = await supabase
        .from('planner_portfolio_items')
        .select('*')
        .eq('planner_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setPortfolioItems(data)
      }
    }

    fetchPortfolio()
  }, [isAuthorized, user])

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
      // 更新用户资料
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: profileForm.name,
          city: profileForm.city,
          company_name: profileForm.company_name,
          bio: profileForm.bio,
          service_type: profileForm.service_type,
          service_price: profileForm.service_price ? parseFloat(profileForm.service_price) : null,
          avatar_url: profileForm.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // 更新风格标签
      // 先删除旧的
      await supabase
        .from('planner_style_tags')
        .delete()
        .eq('planner_id', user.id)

      // 添加新的
      const tagInserts = [
        ...profileForm.style_tags.map(tag => ({
          planner_id: user.id,
          tag_name: tag,
          tag_category: 'style'
        })),
        ...profileForm.color_tags.map(tag => ({
          planner_id: user.id,
          tag_name: tag,
          tag_category: 'color'
        }))
      ]

      if (tagInserts.length > 0) {
        await supabase
          .from('planner_style_tags')
          .insert(tagInserts)
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
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `avatars/${user?.id}/${fileName}`

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
        <Loader2 className="w-8 h-8 text-aurora-gold animate-spin" />
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
            <div className="w-10 h-10 rounded-xl bg-aurora-gold/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-aurora-gold" />
            </div>
            <div>
              <span className="font-display text-lg text-gold">AuraWed</span>
              <p className="text-xs text-aurora-muted">策划师设置</p>
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
                  ? 'bg-aurora-gold/10 text-aurora-gold'
                  : 'text-aurora-muted hover:bg-aurora-card hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">个人资料</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-aurora-gold/10 text-aurora-gold'
                  : 'text-aurora-muted hover:bg-aurora-card hover:text-white'
              }`}
            >
              <Image className="w-5 h-5" />
              <span className="font-medium">作品集</span>
            </button>

            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'password'
                  ? 'bg-aurora-gold/10 text-aurora-gold'
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
            href="/planner"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-aurora-muted hover:bg-aurora-card hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="font-medium">返回工作台</span>
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

              <div className="card-luxury p-6 rounded-2xl mb-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    {profileForm.avatar_url ? (
                      <img
                        src={profileForm.avatar_url}
                        alt="头像"
                        className="w-24 h-24 rounded-full object-cover border-2 border-aurora-gold"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-aurora-card flex items-center justify-center border-2 border-aurora-gold/30">
                        <User className="w-10 h-10 text-aurora-gold" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-aurora-gold rounded-full flex items-center justify-center cursor-pointer hover:bg-aurora-gold/80 transition-colors">
                      <Upload className="w-4 h-4 text-aurora-dark" />
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
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">公司名称</label>
                    <input
                      type="text"
                      value={profileForm.company_name}
                      onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white"
                      placeholder="请输入公司名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">服务类型</label>
                    <select
                      value={profileForm.service_type}
                      onChange={(e) => setProfileForm({ ...profileForm, service_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white appearance-none cursor-pointer"
                    >
                      <option value="">请选择服务类型</option>
                      <option value="remote">远程策划</option>
                      <option value="full">全程策划</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">服务价格（元）</label>
                    <input
                      type="number"
                      value={profileForm.service_price}
                      onChange={(e) => setProfileForm({ ...profileForm, service_price: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white"
                      placeholder="请输入服务价格"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm text-aurora-muted mb-2">个人简介</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl input-luxury text-white h-32 resize-none"
                    placeholder="请介绍一下自己和您的策划理念..."
                  />
                </div>
              </div>

              {/* 风格标签 */}
              <div className="card-luxury p-6 rounded-2xl mb-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-aurora-gold" />
                  擅长风格
                </h3>
                <div className="flex flex-wrap gap-2">
                  {STYLE_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const newTags = profileForm.style_tags.includes(tag)
                          ? profileForm.style_tags.filter(t => t !== tag)
                          : [...profileForm.style_tags, tag]
                        setProfileForm({ ...profileForm, style_tags: newTags })
                      }}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        profileForm.style_tags.includes(tag)
                          ? 'bg-aurora-gold text-aurora-dark'
                          : 'bg-aurora-card text-aurora-muted hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 颜色标签 */}
              <div className="card-luxury p-6 rounded-2xl mb-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-aurora-rose" />
                  偏好颜色
                </h3>
                <div className="flex flex-wrap gap-2">
                  {COLOR_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const newTags = profileForm.color_tags.includes(tag)
                          ? profileForm.color_tags.filter(t => t !== tag)
                          : [...profileForm.color_tags, tag]
                        setProfileForm({ ...profileForm, color_tags: newTags })
                      }}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        profileForm.color_tags.includes(tag)
                          ? 'bg-aurora-rose text-white'
                          : 'bg-aurora-card text-aurora-muted hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-8 py-3 rounded-xl btn-gold text-aurora-dark font-semibold disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存修改'}
              </button>
            </motion.div>
          )}

          {/* 作品集 */}
          {activeTab === 'portfolio' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl text-white">作品集</h1>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-aurora-gold text-aurora-dark rounded-xl font-medium hover:bg-aurora-gold/80 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  添加作品
                </button>
              </div>

              {portfolioItems.length === 0 ? (
                <div className="card-luxury p-12 rounded-2xl text-center">
                  <Image className="w-12 h-12 text-aurora-muted mx-auto mb-4" />
                  <p className="text-aurora-muted mb-4">暂无作品集</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-aurora-gold hover:underline"
                  >
                    添加第一个作品
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {portfolioItems.map(item => (
                    <div key={item.id} className="card-luxury rounded-2xl overflow-hidden">
                      <div className="aspect-video bg-aurora-card relative">
                        {item.cover_image ? (
                          <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-12 h-12 text-aurora-muted" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-medium mb-2">{item.title}</h3>
                        <p className="text-aurora-muted text-sm mb-3 line-clamp-2">{item.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.style_tags?.map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 bg-aurora-gold/20 text-aurora-gold text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-aurora-muted text-sm">{item.city}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-2 text-aurora-muted hover:text-white transition-colors"
                            >
                              <SettingsIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePortfolio(item.id)}
                              className="p-2 text-aurora-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-aurora-muted text-sm mt-6 text-center">
                * 作品集将公开显示在您的个人页面（/planner/{user?.id}）
              </p>
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
                    className="w-full py-3 rounded-xl btn-gold text-aurora-dark font-semibold disabled:opacity-50"
                  >
                    {passwordLoading ? '修改中...' : '确认修改'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 添加/编辑作品弹窗 */}
      {showAddModal && (
        <PortfolioModal
          userId={user?.id || ''}
          editingItem={editingItem}
          onClose={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
          onSuccess={() => {
            setShowAddModal(false)
            setEditingItem(null)
            // 刷新作品集
            if (user) {
              supabase
                .from('planner_portfolio_items')
                .select('*')
                .eq('planner_id', user.id)
                .order('created_at', { ascending: false })
                .then(({ data }: { data: unknown }) => {
                  if (data) setPortfolioItems(data as { id: string }[])
                })
            }
          }}
        />
      )}
    </main>
  )
}

// 作品集弹窗组件
function PortfolioModal({
  userId,
  editingItem,
  onClose,
  onSuccess
}: {
  userId: string
  editingItem: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    title: editingItem?.title || '',
    description: editingItem?.description || '',
    city: editingItem?.city || '',
    venue_name: editingItem?.venue_name || '',
    venue_type: editingItem?.venue_type || '',
    budget_range: editingItem?.budget_range || '',
    wedding_date: editingItem?.wedding_date || '',
    style_tags: editingItem?.style_tags || [],
    cover_image: editingItem?.cover_image || ''
  })
  const [images, setImages] = useState<any[]>(editingItem?.images || [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `portfolios/${userId}/${fileName}`

        const { error } = await supabase.storage
          .from('wedding-media')
          .upload(filePath, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('wedding-media')
          .getPublicUrl(filePath)

        setImages(prev => [...prev, { url: publicUrl, name: file.name }])
      }
    } catch (err: any) {
      console.error('上传失败:', err)
      alert('图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!form.title) {
      alert('请输入作品标题')
      return
    }

    setSaving(true)
    try {
      const data = {
        planner_id: userId,
        title: form.title,
        description: form.description,
        city: form.city,
        venue_name: form.venue_name,
        venue_type: form.venue_type,
        budget_range: form.budget_range,
        wedding_date: form.wedding_date || null,
        style_tags: form.style_tags,
        cover_image: form.cover_image || images[0]?.url || '',
        images: images,
        is_public: true,
        updated_at: new Date().toISOString()
      }

      if (editingItem) {
        await supabase
          .from('planner_portfolio_items')
          .update(data)
          .eq('id', editingItem.id)
      } else {
        await supabase
          .from('planner_portfolio_items')
          .insert({ ...data, created_at: new Date().toISOString() })
      }

      onSuccess()
    } catch (err: any) {
      console.error('保存失败:', err)
      alert('保存失败: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl card-luxury"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-white">
            {editingItem ? '编辑作品' : '添加作品'}
          </h2>
          <button onClick={onClose} className="text-aurora-muted hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-aurora-muted mb-2">作品标题 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl input-luxury text-white"
              placeholder="请输入作品标题"
            />
          </div>

          <div>
            <label className="block text-sm text-aurora-muted mb-2">作品描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl input-luxury text-white h-24 resize-none"
              placeholder="描述这个作品的特点..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-aurora-muted mb-2">城市</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl input-luxury text-white"
                placeholder="婚礼举办城市"
              />
            </div>
            <div>
              <label className="block text-sm text-aurora-muted mb-2">婚礼日期</label>
              <input
                type="date"
                value={form.wedding_date}
                onChange={(e) => setForm({ ...form, wedding_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl input-luxury text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-aurora-muted mb-2">场地名称</label>
              <input
                type="text"
                value={form.venue_name}
                onChange={(e) => setForm({ ...form, venue_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl input-luxury text-white"
                placeholder="婚礼场地"
              />
            </div>
            <div>
              <label className="block text-sm text-aurora-muted mb-2">场地类型</label>
              <select
                value={form.venue_type}
                onChange={(e) => setForm({ ...form, venue_type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl input-luxury text-white appearance-none cursor-pointer"
              >
                <option value="">请选择</option>
                <option value="酒店">酒店</option>
                <option value="户外">户外</option>
                <option value="教堂">教堂</option>
                <option value="庭院">庭院</option>
                <option value="餐厅">餐厅</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-aurora-muted mb-2">预算范围</label>
            <input
              type="text"
              value={form.budget_range}
              onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
              className="w-full px-4 py-3 rounded-xl input-luxury text-white"
              placeholder="如: 10-20万"
            />
          </div>

          <div>
            <label className="block text-sm text-aurora-muted mb-2">风格标签</label>
            <div className="flex flex-wrap gap-2">
              {STYLE_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const newTags = form.style_tags.includes(tag)
                      ? form.style_tags.filter(t => t !== tag)
                      : [...form.style_tags, tag]
                    setForm({ ...form, style_tags: newTags })
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    form.style_tags.includes(tag)
                      ? 'bg-aurora-gold text-aurora-dark'
                      : 'bg-aurora-card text-aurora-muted hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-aurora-muted mb-2">作品图片</label>
            <div className="border-2 border-dashed border-aurora-border rounded-xl p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="portfolio-images"
              />
              <label
                htmlFor="portfolio-images"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-aurora-muted mb-2" />
                <span className="text-aurora-muted text-sm">
                  {uploading ? '上传中...' : '点击上传图片'}
                </span>
              </label>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-aurora-border text-white hover:bg-aurora-card transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 rounded-xl btn-gold text-aurora-dark font-semibold disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// 删除作品集
async function handleDeletePortfolio(id: string) {
  if (!confirm('确定要删除这个作品吗？')) return

  const { error } = await supabase
    .from('planner_portfolio_items')
    .delete()
    .eq('id', id)

  if (error) {
    alert('删除失败: ' + error.message)
  } else {
    alert('删除成功')
    window.location.reload()
  }
}
