'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, Users, FileText, CreditCard, MessageSquare, BarChart3, Settings,
  Search, Plus, MoreVertical, Check, X, Eye, Edit, Trash2, Send,
  ChevronLeft, LogOut, Shield, AlertCircle, CheckCircle, Clock,
  DollarSign, Sparkles, Bell, RefreshCw, Loader2, Key, Save, EyeOff, Copy, CheckCircle2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// 管理员侧边栏菜单
const ADMIN_MENU = [
  { id: 'dashboard', name: '数据概览', icon: BarChart3 },
  { id: 'users', name: '用户管理', icon: Users },
  { id: 'planners', name: '策划师管理', icon: Crown },
  { id: 'orders', name: '订单管理', icon: FileText },
  { id: 'content', name: '内容管理', icon: Sparkles },
  { id: 'payments', name: '支付流水', icon: CreditCard },
  { id: 'support', name: '客服/公告', icon: MessageSquare },
  { id: 'site_settings', name: '网站设置', icon: Settings },
  { id: 'tags', name: '标签管理', icon: Sparkles },
  { id: 'settings', name: '系统设置', icon: Key },
]

// ========== 修复1: 删除所有 MOCK_ 数据常量 ==========
// 数据全部从 Supabase 真实获取，不再使用模拟数据

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null) // 修复: 登录状态守卫
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalPlanners: 0,
    pendingPlanners: 0,
    activePlanners: 0
  })
  const [users, setUsers] = useState<any[]>([])
  const [planners, setPlanners] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [apiConfigs, setApiConfigs] = useState<any[]>([])
  const [apiConfigsLoading, setApiConfigsLoading] = useState(false)
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [savingConfig, setSavingConfig] = useState<string | null>(null)

  // 网站设置状态
  const [siteSettings, setSiteSettings] = useState<any>({})
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(false)
  const [siteSettingsSaving, setSiteSettingsSaving] = useState(false)

  // 标签管理状态
  const [tags, setTags] = useState<any[]>([])
  const [tagsLoading, setTagsLoading] = useState(false)
  const [tagsSaving, setTagsSaving] = useState(false)
  const [editingTag, setEditingTag] = useState<any>(null)
  const [showAddTagModal, setShowAddTagModal] = useState(false)

  // 用户同步状态
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncStats, setSyncStats] = useState<{ total_auth: number; total_profiles: number; missing_profiles: number } | null>(null)

  // ========== 修复: 登录状态守卫 - 防止重定向循环 ==========
  useEffect(() => {
    const checkAuth = async () => {
      const savedType = localStorage.getItem('aurawed_user_type')
      if (!savedType || savedType !== 'admin') {
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

  // ========== 获取 API 配置数据 ==========
  const fetchApiConfigs = async () => {
    setApiConfigsLoading(true)
    try {
      const response = await fetch('/api/admin/api-config')
      const result = await response.json()
      if (result.success) {
        setApiConfigs(result.data)
      }
    } catch (error) {
      console.error('获取 API 配置失败:', error)
    } finally {
      setApiConfigsLoading(false)
    }
  }

  // ========== 获取网站设置 ==========
  const fetchSiteSettings = async () => {
    setSiteSettingsLoading(true)
    try {
      const response = await fetch('/api/admin/site-settings')
      const result = await response.json()
      if (result.success) {
        setSiteSettings(result.data)
      }
    } catch (error) {
      console.error('获取网站设置失败:', error)
    } finally {
      setSiteSettingsLoading(false)
    }
  }

  // ========== 保存网站设置 ==========
  const saveSiteSettings = async (settings: any) => {
    setSiteSettingsSaving(true)
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      const result = await response.json()
      if (result.success) {
        setSiteSettings(result.data)
        alert('网站设置已保存')
      } else {
        alert('保存失败: ' + result.error)
      }
    } catch (error) {
      console.error('保存网站设置失败:', error)
      alert('保存失败')
    } finally {
      setSiteSettingsSaving(false)
    }
  }

  // ========== 重置网站设置 ==========
  const resetSiteSettings = async () => {
    if (!confirm('确定要重置为默认设置吗？')) return

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'POST'
      })
      const result = await response.json()
      if (result.success) {
        setSiteSettings(result.data)
        alert('已重置为默认设置')
      }
    } catch (error) {
      console.error('重置网站设置失败:', error)
    }
  }

  // ========== 获取标签列表 ==========
  const fetchTags = async () => {
    setTagsLoading(true)
    try {
      const response = await fetch('/api/admin/configurable-tags')
      const result = await response.json()
      if (result.success) {
        setTags(result.data || [])
      }
    } catch (error) {
      console.error('获取标签列表失败:', error)
    } finally {
      setTagsLoading(false)
    }
  }

  // ========== 保存标签 ==========
  const saveTag = async (tag: any) => {
    setTagsSaving(true)
    try {
      let response
      if (tag.id) {
        // 更新
        response = await fetch(`/api/admin/configurable-tags?id=${tag.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tag)
        })
      } else {
        // 创建
        response = await fetch('/api/admin/configurable-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tag)
        })
      }
      const result = await response.json()
      if (result.success) {
        await fetchTags()
        setShowAddTagModal(false)
        setEditingTag(null)
        alert(tag.id ? '标签已更新' : '标签已创建')
      } else {
        alert('保存失败: ' + result.error)
      }
    } catch (error) {
      console.error('保存标签失败:', error)
      alert('保存失败')
    } finally {
      setTagsSaving(false)
    }
  }

  // ========== 删除标签 ==========
  const deleteTag = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return

    try {
      const response = await fetch(`/api/admin/configurable-tags?id=${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        await fetchTags()
        alert('标签已删除')
      } else {
        alert('删除失败: ' + result.error)
      }
    } catch (error) {
      console.error('删除标签失败:', error)
      alert('删除失败')
    }
  }

  // ========== 切换标签状态 ==========
  const toggleTagStatus = async (tag: any) => {
    try {
      const response = await fetch(`/api/admin/configurable-tags?id=${tag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !tag.is_active })
      })
      const result = await response.json()
      if (result.success) {
        await fetchTags()
      }
    } catch (error) {
      console.error('更新标签状态失败:', error)
    }
  }

  // ========== 保存 API 配置 ==========
  const saveApiConfig = async (config: any) => {
    setSavingConfig(config.id)
    try {
      const response = await fetch('/api/admin/api-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const result = await response.json()
      if (result.success) {
        await fetchApiConfigs()
        setEditingConfig(null)
        alert(`${config.platform_name} 配置已更新`)
      } else {
        alert('更新失败: ' + result.error)
      }
    } catch (error) {
      console.error('保存 API 配置失败:', error)
      alert('保存失败')
    } finally {
      setSavingConfig(null)
    }
  }

  // ========== 修复2: 从后端 API 获取真实数据 ==========
  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/dashboard')
      // 移除自动跳转逻辑，删除操作后不应影响当前页面状态
      if (response.status === 401 || response.status === 403) {
        console.warn('认证过期，但保留当前页面状态')
        setLoading(false)
        return
      }
      if (!response.ok) throw new Error('获取数据失败')
      const result = await response.json()
      if (result.success) {
        setStats(result.stats)
        setUsers(result.users)
        setPlanners(result.planners)
        setOrders(result.orders)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      // 不再弹窗打扰用户，也不跳转页面
    } finally {
      setLoading(false)
    }
  }

  // ========== 同步用户数据 ==========
  const syncUsers = async () => {
    setSyncLoading(true)
    try {
      const response = await fetch('/api/admin/sync-users', { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        alert(result.message)
        fetchData() // 刷新数据
        // 获取同步状态
        const statsRes = await fetch('/api/admin/sync-users')
        const statsData = await statsRes.json()
        if (statsData.success) {
          setSyncStats(statsData.stats)
        }
      } else {
        alert('同步失败: ' + result.error)
      }
    } catch (error) {
      console.error('同步用户失败:', error)
      alert('同步失败')
    } finally {
      setSyncLoading(false)
    }
  }

  // 获取同步状态
  const fetchSyncStats = async () => {
    try {
      const response = await fetch('/api/admin/sync-users')
      const result = await response.json()
      if (result.success) {
        setSyncStats(result.stats)
      }
    } catch (error) {
      console.error('获取同步状态失败:', error)
    }
  }

  useEffect(() => {
    if (isAuthorized) {
      fetchData()
      fetchSyncStats()
    }
  }, [isAuthorized])

  // 当切换到设置页面时，获取 API 配置
  useEffect(() => {
    if (activeMenu === 'settings' && isAuthorized) {
      fetchApiConfigs()
    }
  }, [activeMenu, isAuthorized])

  // 当切换到网站设置页面时，获取设置
  useEffect(() => {
    if (activeMenu === 'site_settings' && isAuthorized) {
      fetchSiteSettings()
    }
  }, [activeMenu, isAuthorized])

  // 当切换到标签管理页面时，获取标签列表
  useEffect(() => {
    if (activeMenu === 'tags' && isAuthorized) {
      fetchTags()
    }
  }, [activeMenu, isAuthorized])

  // 修复: 等待授权检查完成
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
        <div className="text-white">验证中...</div>
      </div>
    )
  }

  // 渲染各个功能模块
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent stats={stats} orders={orders} loading={loading} onRefresh={fetchData} />
      case 'users':
        return <UsersContent users={users} loading={loading} deleting={deleting} onRefresh={fetchData} setDeleting={setDeleting} syncStats={syncStats} onSync={syncUsers} />
      case 'planners':
        return <PlannersContent planners={planners} onRefresh={fetchData} />
      case 'orders':
        return <OrdersContent orders={orders} planners={planners} loading={loading} deleting={deleting} onRefresh={fetchData} setDeleting={setDeleting} />
      case 'content':
        return <div className="text-center py-20"><Sparkles className="w-16 h-16 text-aurora-muted mx-auto mb-4" /><h3 className="text-white text-xl">内容管理</h3><p className="text-aurora-muted">AI生成内容管理功能...</p></div>
      case 'payments':
        return <div className="text-center py-20"><CreditCard className="w-16 h-16 text-aurora-muted mx-auto mb-4" /><h3 className="text-white text-xl">支付流水</h3><p className="text-aurora-muted">支付订单管理...</p></div>
      case 'support':
        return <div className="text-center py-20"><MessageSquare className="w-16 h-16 text-aurora-muted mx-auto mb-4" /><h3 className="text-white text-xl">客服/公告</h3><p className="text-aurora-muted">公告管理功能...</p></div>
      case 'site_settings':
        return (
          <SiteSettingsContent
            settings={siteSettings}
            loading={siteSettingsLoading}
            saving={siteSettingsSaving}
            onSave={saveSiteSettings}
            onReset={resetSiteSettings}
            onRefresh={fetchSiteSettings}
          />
        )
      case 'tags':
        return (
          <TagsManagementContent
            tags={tags}
            loading={tagsLoading}
            saving={tagsSaving}
            onSave={saveTag}
            onDelete={deleteTag}
            onToggleStatus={toggleTagStatus}
            onRefresh={fetchTags}
            showModal={showAddTagModal}
            setShowModal={setShowAddTagModal}
            editingTag={editingTag}
            setEditingTag={setEditingTag}
          />
        )
      case 'settings':
        return (
          <ApiSettingsContent
            configs={apiConfigs}
            loading={apiConfigsLoading}
            editing={editingConfig}
            saving={savingConfig}
            onEdit={setEditingConfig}
            onSave={saveApiConfig}
            onRefresh={fetchApiConfigs}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-luxury-dark flex relative z-10">
      {/* 侧边栏 */}
      <aside className="w-64 bg-aurora-surface border-r border-aurora-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-aurora-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="font-display text-lg text-white">AuraWed</span>
              <p className="text-xs text-aurora-muted">管理后台</p>
            </div>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 p-4 overflow-auto">
          <div className="space-y-1">
            {ADMIN_MENU.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeMenu === item.id
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-aurora-muted hover:bg-aurora-card hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* 底部 */}
        <div className="p-4 border-t border-aurora-border">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-aurora-muted hover:bg-aurora-card hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">返回首页</span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="h-16 bg-aurora-surface border-b border-aurora-border flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
              <input
                type="text"
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 rounded-xl bg-aurora-card border border-aurora-border text-white placeholder:text-aurora-muted focus:border-purple-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-aurora-muted hover:text-white hover:bg-aurora-card rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-purple-500/10">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">管理员</span>
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <div className="flex-1 p-8 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </main>
  )
}

// ========== 组件: 数据概览 ==========
function DashboardContent({ stats, orders, loading, onRefresh }: { stats: any, orders: any[], loading: boolean, onRefresh: () => void }) {
  const statCards = [
    { label: '总用户', value: stats.totalUsers, icon: Users, color: 'rose' },
    { label: '策划师', value: stats.totalPlanners, icon: Crown, color: 'gold' },
    { label: '待审核', value: stats.pendingPlanners, icon: Clock, color: 'green' },
    { label: '活跃策划师', value: stats.activePlanners, icon: CheckCircle, color: 'purple' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">数据概览</h1>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>刷新</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-xl card-luxury"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-aurora-${card.color}/20 flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 text-aurora-${card.color}`} />
              </div>
            </div>
            <div className="text-3xl font-display text-white mb-1">{card.value}</div>
            <div className="text-aurora-muted text-sm">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-xl card-luxury">
          <h3 className="text-white font-medium mb-4">待处理事项</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-aurora-card">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-aurora-gold" />
                <span className="text-white">待审核策划师</span>
              </div>
              <span className="text-aurora-gold font-medium">{stats.pendingPlanners}人</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl card-luxury">
          <h3 className="text-white font-medium mb-4">平台概览</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-aurora-card">
              <span className="text-aurora-muted">活跃策划师</span>
              <span className="text-white font-medium">{stats.activePlanners}人</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-aurora-card">
              <span className="text-aurora-muted">累计订单</span>
              <span className="text-white font-medium">{stats.totalOrders}单</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== 组件: 用户管理 (修复: 完整删除功能) ==========
function UsersContent({ users, loading, deleting, onRefresh, setDeleting, syncStats, onSync }: {
  users: any[], loading: boolean, deleting: string | null, onRefresh: () => void, setDeleting: (id: string | null) => void, syncStats?: { total_auth: number; total_profiles: number; missing_profiles: number } | null, onSync?: () => void
}) {
  // ========== 修复3: 补全删除用户处理函数 ==========
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`确定要删除用户 "${name}" 吗？此操作不可恢复。`)) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        alert('删除成功')
        onRefresh()
      } else {
        alert('删除失败: ' + (result.error || '未知错误'))
      }
    } catch (err: any) {
      alert('删除失败: 网络错误')
    } finally {
      setDeleting(null)
    }
  }

  // ========== 修复4: 补全查看详情处理函数 ==========
  const handleViewUser = (user: any) => {
    alert(`用户详情:\n姓名: ${user.name}\n邮箱: ${user.email}\n城市: ${user.city || '未知'}\n注册时间: ${new Date(user.created_at).toLocaleDateString()}`)
  }

  // ========== 修复5: 补全编辑处理函数 ==========
  const handleEditUser = (user: any) => {
    const newName = prompt('请输入新姓名:', user.name)
    if (newName && newName !== user.name) {
      alert('编辑功能需要后端API支持，当前仅展示交互')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">用户管理</h1>
        <div className="flex items-center gap-4">
          {/* 同步状态提示 */}
          {syncStats && syncStats.missing_profiles > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{syncStats.missing_profiles} 个用户未同步</span>
            </div>
          )}
          {/* 同步按钮 */}
          <button
            onClick={onSync}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>同步用户</span>
          </button>
          {loading && <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />}
        </div>
      </div>

      <div className="card-luxury rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-aurora-card">
            <tr>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">用户</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">城市</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">注册时间</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">状态</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-aurora-border">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-aurora-muted text-sm">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-aurora-muted">{user.city || '未知'}</td>
                <td className="px-6 py-4 text-aurora-muted">{new Date(user.created_at || Date.now()).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                    正常
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {/* 修复6: 补全查看按钮 onClick */}
                    <button
                      onClick={() => handleViewUser(user)}
                      className="p-2 text-aurora-muted hover:text-white hover:bg-aurora-card rounded-lg"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {/* 修复7: 补全编辑按钮 onClick */}
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-aurora-muted hover:text-white hover:bg-aurora-card rounded-lg"
                      title="编辑用户"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {/* 修复8: 补全删除按钮 loading 状态 */}
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={deleting === user.id}
                      className="p-2 text-aurora-muted hover:text-red-400 hover:bg-aurora-card rounded-lg disabled:opacity-50"
                      title="删除用户"
                    >
                      {deleting === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-aurora-muted">
                  暂无用户数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ========== 组件: 策划师管理 ==========
function PlannersContent({ planners, onRefresh }: { planners: any[], onRefresh: () => void }) {
  const [editingPlanner, setEditingPlanner] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [saving, setSaving] = useState(false)

  // 开始编辑
  const handleStartEdit = (planner: any) => {
    setEditingPlanner(planner.id)
    setEditForm({
      name: planner.name || '',
      city: planner.city || '',
      company_name: planner.company_name || '',
      bio: planner.bio || '',
      service_price: planner.service_price || 0,
      status: planner.status || 'active'
    })
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingPlanner(null)
    setEditForm({})
  }

  // 保存编辑
  const handleSaveEdit = async (plannerId: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/users?id=${plannerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const result = await response.json()
      if (result.success) {
        alert('保存成功')
        setEditingPlanner(null)
        onRefresh()
      } else {
        alert('保存失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      console.error('保存策划师失败:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">策划师管理</h1>
      </div>

      <div className="grid gap-4">
        {planners.map((planner) => (
          <div key={planner.id} className="p-6 rounded-xl card-luxury border border-aurora-border">
            {editingPlanner === planner.id ? (
              // 编辑模式
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-aurora-muted mb-1">姓名</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-aurora-card border border-aurora-border text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-aurora-muted mb-1">城市</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-aurora-card border border-aurora-border text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-aurora-muted mb-1">公司/工作室</label>
                    <input
                      type="text"
                      value={editForm.company_name}
                      onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-aurora-card border border-aurora-border text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-aurora-muted mb-1">服务价格</label>
                    <input
                      type="number"
                      value={editForm.service_price}
                      onChange={(e) => setEditForm({ ...editForm, service_price: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-aurora-card border border-aurora-border text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-aurora-muted mb-1">简介</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-aurora-card border border-aurora-border text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-aurora-muted mb-1">状态</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-aurora-card border border-aurora-border text-white"
                  >
                    <option value="active">活跃</option>
                    <option value="inactive">停用</option>
                    <option value="pending">待审核</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveEdit(planner.id)}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-lg bg-aurora-card text-aurora-muted hover:text-white"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // 查看模式
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-aurora-gold/20 flex items-center justify-center">
                    <Crown className="w-7 h-7 text-aurora-gold" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-lg">{planner.name}</div>
                    <div className="text-aurora-muted text-sm">{planner.company_name || '个人工作室'} · {planner.city || '未知'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-white font-medium">-</div>
                    <div className="text-aurora-muted text-xs">订单数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-medium">¥{planner.service_price || 0}</div>
                    <div className="text-aurora-muted text-xs">服务价格</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(planner)}
                      className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                    >
                      编辑
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {planners.length === 0 && (
          <div className="text-center py-20 text-aurora-muted">
            暂无策划师数据
          </div>
        )}
      </div>
    </div>
  )
}

// ========== 组件: 订单管理 (修复: 完整删除+派单功能) ==========
function OrdersContent({ orders, planners, loading, deleting, onRefresh, setDeleting }: {
  orders: any[], planners: any[], loading: boolean, deleting: string | null, onRefresh: () => void, setDeleting: (id: string | null) => void
}) {
  const [assigningOrder, setAssigningOrder] = useState<string | null>(null)
  const [assigning, setAssigning] = useState(false)

  // ========== 修复9: 补全派单处理函数 ==========
  const handleAssign = async (orderId: string, plannerId: string) => {
    if (!plannerId) return

    setAssigning(true)
    try {
      const updateData = {
        planner_id: plannerId,
        status: 'in_progress',
        planner_status: 'matched'
      }
      const { error } = await (supabase
        .from('weddings') as any)
        .update(updateData)
        .eq('id', orderId)

      if (error) throw error
      setAssigningOrder(null)
      onRefresh()
      alert('指派成功')
    } catch (err: any) {
      alert('指派失败: ' + err.message)
    } finally {
      setAssigning(false)
    }
  }

  // ========== 修复10: 补全删除订单处理函数 ==========
  const handleDeleteOrder = async (id: string, name: string) => {
    if (!confirm(`确定要删除订单 "${name}" 吗？此操作不可恢复。`)) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/orders?id=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        alert('删除成功')
        onRefresh()
      } else {
        alert('删除失败: ' + (result.error || '未知错误'))
      }
    } catch (err: any) {
      alert('删除失败: 网络错误')
    } finally {
      setDeleting(null)
    }
  }

  // ========== 修复11: 补全查看详情处理函数 ==========
  const handleViewOrder = (order: any) => {
    alert(`订单详情:\n名称: ${order.name}\n城市: ${order.city}\n预算: ¥${order.budget || 0}\n状态: ${order.status}\n创建时间: ${new Date(order.created_at).toLocaleDateString()}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">订单管理</h1>
        {loading && <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />}
      </div>

      <div className="card-luxury rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-aurora-card">
            <tr>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">订单名称</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">城市</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">预算</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">状态</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">负责策划师</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-aurora-border">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-white font-medium">{order.name}</div>
                    <div className="text-aurora-muted text-sm">{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-aurora-muted">{order.city}</td>
                <td className="px-6 py-4">
                  <span className="text-white font-medium">¥{order.budget || 0}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    order.status === 'draft' ? 'bg-aurora-muted/20 text-aurora-muted' :
                    order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {order.status === 'draft' ? '草稿' :
                     order.status === 'in_progress' ? '策划中' :
                     order.status === 'completed' ? '已完成' : order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {assigningOrder === order.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        className="bg-aurora-card border border-aurora-border text-white rounded px-2 py-1 text-sm"
                        onChange={(e) => {
                          if(e.target.value) handleAssign(order.id, e.target.value)
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>选择策划师...</option>
                        {planners.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setAssigningOrder(null)}
                        className="text-aurora-muted hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-aurora-muted">
                      {order.planner_id ? planners.find(p => p.id === order.planner_id)?.name || '未知策划师' : '未指派'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {/* 修复12: 补全查看详情按钮 onClick */}
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="p-2 text-aurora-muted hover:text-white hover:bg-aurora-card rounded-lg"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {/* 修复13: 补全派单按钮 onClick */}
                    {!order.planner_id && (
                      <button
                        onClick={() => setAssigningOrder(order.id)}
                        disabled={assigning}
                        className="p-2 text-aurora-gold hover:text-aurora-gold-light hover:bg-aurora-card rounded-lg disabled:opacity-50"
                        title="派单给策划师"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {/* 修复14: 补全删除按钮 loading 状态 */}
                    <button
                      onClick={() => handleDeleteOrder(order.id, order.name)}
                      disabled={deleting === order.id}
                      className="p-2 text-aurora-muted hover:text-red-400 hover:bg-aurora-card rounded-lg disabled:opacity-50"
                      title="删除订单"
                    >
                      {deleting === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-aurora-muted">
                  暂无订单数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ========== 组件: API 设置 ==========
function ApiSettingsContent({
  configs,
  loading,
  editing,
  saving,
  onEdit,
  onSave,
  onRefresh
}: {
  configs: any[],
  loading: boolean,
  editing: string | null,
  saving: string | null,
  onEdit: (id: string | null) => void,
  onSave: (config: any) => void,
  onRefresh: () => void
}) {
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({})
  const [localConfigs, setLocalConfigs] = useState<{ [key: string]: string }>({})

  // 平台名称映射
  const platformNames: { [key: string]: string } = {
    gemini: 'Google Gemini',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    feishu: '飞书 Webhook'
  }

  // 平台图标/颜色
  const platformStyles: { [key: string]: { bg: string, text: string } } = {
    gemini: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    openai: { bg: 'bg-green-500/20', text: 'text-green-400' },
    anthropic: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
    feishu: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' }
  }

  const handleEdit = (config: any) => {
    setLocalConfigs((prev) => ({ ...prev, [config.id]: config.api_key || '' }))
    onEdit(config.id)
  }

  const handleCancel = () => {
    setLocalConfigs({})
    onEdit(null)
  }

  const handleSave = (config: any) => {
    onSave({
      id: config.id,
      platform_name: config.platform_name,
      api_key: localConfigs[config.id] || ''
    })
  }

  const toggleShowKey = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">系统设置</h1>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>刷新</span>
        </button>
      </div>

      {/* API 配置列表 */}
      <div className="space-y-4">
        {configs.map((config) => (
          <motion.div
            key={config.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl card-luxury border border-aurora-border"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${platformStyles[config.platform_name]?.bg || 'bg-purple-500/20'} flex items-center justify-center`}>
                  <Key className={`w-6 h-6 ${platformStyles[config.platform_name]?.text || 'text-purple-400'}`} />
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">
                    {platformNames[config.platform_name] || config.platform_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {config.api_key_set ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        已配置
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-aurora-muted">
                        <AlertCircle className="w-3 h-3" />
                        未配置
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editing === config.id ? (
                  <>
                    <button
                      onClick={() => handleSave(config)}
                      disabled={saving === config.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                    >
                      {saving === config.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>保存</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-aurora-card text-aurora-muted hover:text-white"
                    >
                      <X className="w-4 h-4" />
                      <span>取消</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit(config)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                  >
                    <Edit className="w-4 h-4" />
                    <span>配置</span>
                  </button>
                )}
              </div>
            </div>

            {/* API Key 输入区域 */}
            <div className="mt-4">
              {editing === config.id ? (
                <div className="relative">
                  <input
                    type={showKey[config.id] ? 'text' : 'password'}
                    value={localConfigs[config.id] || ''}
                    onChange={(e) => setLocalConfigs((prev) => ({ ...prev, [config.id]: e.target.value }))}
                    placeholder="请输入 API Key"
                    className="w-full px-4 py-3 pr-24 rounded-xl bg-aurora-card border border-aurora-border text-white placeholder:text-aurora-muted focus:border-purple-500/50 focus:outline-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleShowKey(config.id)}
                      className="p-2 text-aurora-muted hover:text-white"
                    >
                      {showKey[config.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-aurora-muted">
                  <span className="font-mono bg-aurora-card px-2 py-1 rounded">
                    {config.api_key_set ? (showKey[config.id] ? '••••••••••••••••' : '••••••••••••••••') : '未设置'}
                  </span>
                  {config.api_key_set && (
                    <button
                      onClick={() => toggleShowKey(config.id)}
                      className="p-1 hover:text-white"
                    >
                      {showKey[config.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              )}

              {/* 首次展示开关 */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-aurora-muted">在首页首次展示此平台</span>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/admin/api-config', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          id: config.id,
                          is_first_view: !config.is_first_view
                        })
                      })
                      onRefresh()
                    } catch (e) {
                      console.error(e)
                    }
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.is_first_view ? 'bg-purple-500' : 'bg-aurora-card'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      config.is_first_view ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {configs.length === 0 && !loading && (
          <div className="text-center py-20 text-aurora-muted">
            暂无 API 配置
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}
      </div>

      {/* 说明 */}
      <div className="mt-8 p-4 rounded-xl bg-aurora-card/50 border border-aurora-border">
        <h4 className="text-white font-medium mb-2">配置说明</h4>
        <ul className="space-y-1 text-sm text-aurora-muted">
          <li>• <strong className="text-aurora-gold">Google Gemini</strong>: 用于AI生成婚礼方案和图片（推荐）</li>
          <li>• <strong className="text-aurora-gold">OpenAI</strong>: 可选的文字生成API</li>
          <li>• <strong className="text-aurora-gold">Anthropic</strong>: 可选的Claude模型API</li>
          <li>• <strong className="text-aurora-gold">飞书 Webhook</strong>: 接收订单通知（可选）</li>
        </ul>
      </div>
    </div>
  )
}

// ========== 组件: 网站设置 ==========
function SiteSettingsContent({
  settings,
  loading,
  saving,
  onSave,
  onReset,
  onRefresh
}: {
  settings: any,
  loading: boolean,
  saving: boolean,
  onSave: (settings: any) => void,
  onReset: () => void,
  onRefresh: () => void
}) {
  const [localSettings, setLocalSettings] = useState<any>({})

  // 当设置加载完成时，初始化本地状态
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleChange = (key: string, value: string) => {
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    onSave(localSettings)
  }

  // 设置项分组
  const settingGroups = [
    {
      title: '基础设置',
      items: [
        { key: 'brand_name', label: '品牌名称', placeholder: 'AuraWed' }
      ]
    },
    {
      title: '首页主区域',
      items: [
        { key: 'hero_tagline', label: '顶部标语', placeholder: 'AI 驱动的婚礼美学革命' },
        { key: 'hero_title_1', label: '主标题（第1行）', placeholder: '让婚礼' },
        { key: 'hero_title_2', label: '主标题（第2行）', placeholder: '成为一生的故事' },
        { key: 'hero_subtitle_1', label: '副标题（第1行）', placeholder: '拒绝同质化堆砌...' },
        { key: 'hero_subtitle_2', label: '副标题（第2行）', placeholder: '让每一个瞬间都充满意义' }
      ]
    },
    {
      title: '新人入口',
      items: [
        { key: 'couple_title', label: '标题', placeholder: '新人入口' },
        { key: 'couple_description', label: '描述', placeholder: '开启一场沉浸式婚礼探索之旅...' },
        { key: 'couple_button', label: '按钮文字', placeholder: '开始探索' }
      ]
    },
    {
      title: '策划师入口',
      items: [
        { key: 'planner_title', label: '标题', placeholder: '策划师入口' },
        { key: 'planner_description', label: '描述', placeholder: '专业级美学提案引擎...' },
        { key: 'planner_button', label: '按钮文字', placeholder: '专业入驻' }
      ]
    },
    {
      title: '作品集',
      items: [
        { key: 'portfolio_button', label: '按钮文字', placeholder: '浏览优秀作品' }
      ]
    },
    {
      title: '特性介绍',
      items: [
        { key: 'feature_1_title', label: '特性1标题', placeholder: 'AI 智能故事引擎' },
        { key: 'feature_1_desc', label: '特性1描述', placeholder: '心理学驱动的需求挖掘' },
        { key: 'feature_2_title', label: '特性2标题', placeholder: '独特美学标签' },
        { key: 'feature_2_desc', label: '特性2描述', placeholder: '拒绝流水线式方案' },
        { key: 'feature_3_title', label: '特性3标题', placeholder: 'B/C 端协同' },
        { key: 'feature_3_desc', label: '特性3描述', placeholder: '新人与策划师的高效对接' }
      ]
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">网站设置</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-aurora-card text-aurora-muted hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
            <span>重置默认</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </button>
        </div>
      </div>

      {loading && Object.keys(settings).length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* 实时预览提示 */}
          <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-400">
              <Eye className="w-5 h-5" />
              <span className="font-medium">保存后，首页将实时显示更新后的文字</span>
            </div>
          </div>

          {/* 设置表单 */}
          <div className="space-y-8">
            {settingGroups.map((group) => (
              <div key={group.title} className="p-6 rounded-xl card-luxury border border-aurora-border">
                <h3 className="text-white font-medium text-lg mb-4">{group.title}</h3>
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.key}>
                      <label className="block text-sm text-aurora-muted mb-2">{item.label}</label>
                      <input
                        type="text"
                        value={localSettings[item.key] || ''}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        placeholder={item.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-aurora-card border border-aurora-border text-white placeholder:text-aurora-muted focus:border-purple-500/50 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 保存按钮 */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl btn-gold text-aurora-dark font-semibold disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>保存设置</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ========== 组件: 标签管理 ==========
function TagsManagementContent({
  tags,
  loading,
  saving,
  onSave,
  onDelete,
  onToggleStatus,
  onRefresh,
  showModal,
  setShowModal,
  editingTag,
  setEditingTag
}: {
  tags: any[],
  loading: boolean,
  saving: boolean,
  onSave: (tag: any) => void,
  onDelete: (id: string) => void,
  onToggleStatus: (tag: any) => void,
  onRefresh: () => void,
  showModal: boolean,
  setShowModal: (show: boolean) => void,
  editingTag: any,
  setEditingTag: (tag: any) => void
}) {
  const [localTags, setLocalTags] = useState<any[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [formData, setFormData] = useState({ tag_type: 'personal', tag_name: '' })

  useEffect(() => {
    setLocalTags(tags)
  }, [tags])

  // 标签类型名称映射
  const tagTypeNames: Record<string, string> = {
    personal: '新人个人标签',
    color: '颜色偏好',
    venue: '场地类型',
    season: '季节偏好',
    style: '策划师风格'
  }

  // 过滤标签
  const filteredTags = filterType === 'all'
    ? localTags
    : localTags.filter(t => t.tag_type === filterType)

  // 按类型分组
  const groupedTags = filteredTags.reduce((acc, tag) => {
    if (!acc[tag.tag_type]) {
      acc[tag.tag_type] = []
    }
    acc[tag.tag_type].push(tag)
    return acc
  }, {} as Record<string, any[]>)

  // 打开添加弹窗
  const handleOpenAdd = () => {
    setFormData({ tag_type: 'personal', tag_name: '' })
    setEditingTag(null)
    setShowModal(true)
  }

  // 打开编辑弹窗
  const handleOpenEdit = (tag: any) => {
    setFormData({ tag_type: tag.tag_type, tag_name: tag.tag_name })
    setEditingTag(tag)
    setShowModal(true)
  }

  // 保存标签
  const handleSave = () => {
    if (!formData.tag_name.trim()) {
      alert('请输入标签名称')
      return
    }
    onSave({
      id: editingTag?.id,
      tag_type: formData.tag_type,
      tag_name: formData.tag_name.trim()
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">标签管理</h1>
        <div className="flex items-center gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl bg-aurora-card border border-aurora-border text-white"
          >
            <option value="all">全部标签</option>
            <option value="personal">新人个人标签</option>
            <option value="color">颜色偏好</option>
            <option value="venue">场地类型</option>
            <option value="season">季节偏好</option>
            <option value="style">策划师风格</option>
          </select>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加标签
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTags).map(([type, typeTags]) => (
            <div key={type} className="p-6 rounded-xl card-luxury border border-aurora-border">
              <h3 className="text-white font-medium text-lg mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                {tagTypeNames[type] || type}
                <span className="text-aurora-muted text-sm font-normal">({typeTags.length}个)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {typeTags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      tag.is_active
                        ? 'bg-aurora-card border-aurora-border text-white'
                        : 'bg-aurora-card/50 border-aurora-border text-aurora-muted opacity-60'
                    }`}
                  >
                    <span className="text-sm">{tag.tag_name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(tag)}
                        className="p-1 text-aurora-muted hover:text-white transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(tag)}
                        className={`p-1 transition-colors ${
                          tag.is_active ? 'text-green-500 hover:text-green-400' : 'text-aurora-muted hover:text-white'
                        }`}
                        title={tag.is_active ? '禁用' : '启用'}
                      >
                        {tag.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onDelete(tag.id)}
                        className="p-1 text-red-500 hover:text-red-400 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 添加/编辑标签弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-2xl card-luxury"
          >
            <h2 className="font-display text-2xl text-white mb-6">
              {editingTag ? '编辑标签' : '添加标签'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-aurora-muted mb-2">标签类型</label>
                <select
                  value={formData.tag_type}
                  onChange={(e) => setFormData({ ...formData, tag_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-aurora-card border border-aurora-border text-white"
                  disabled={!!editingTag}
                >
                  <option value="personal">新人个人标签</option>
                  <option value="color">颜色偏好</option>
                  <option value="venue">场地类型</option>
                  <option value="season">季节偏好</option>
                  <option value="style">策划师风格</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-aurora-muted mb-2">标签名称</label>
                <input
                  type="text"
                  value={formData.tag_name}
                  onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-aurora-card border border-aurora-border text-white placeholder:text-aurora-muted"
                  placeholder="请输入标签名称"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-aurora-border text-white hover:bg-aurora-card transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
}
