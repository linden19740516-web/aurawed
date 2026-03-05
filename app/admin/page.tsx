'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, Users, FileText, CreditCard, MessageSquare, BarChart3, Settings,
  Search, Plus, MoreVertical, Check, X, Eye, Edit, Trash2, Send,
  ChevronLeft, LogOut, Shield, AlertCircle, CheckCircle, Clock,
  DollarSign, Sparkles, Bell
} from 'lucide-react'

// 管理员侧边栏菜单
const ADMIN_MENU = [
  { id: 'dashboard', name: '数据概览', icon: BarChart3 },
  { id: 'users', name: '用户管理', icon: Users },
  { id: 'planners', name: '策划师管理', icon: Crown },
  { id: 'orders', name: '订单管理', icon: FileText },
  { id: 'content', name: '内容管理', icon: Sparkles },
  { id: 'payments', name: '支付流水', icon: CreditCard },
  { id: 'support', name: '客服/公告', icon: MessageSquare },
  { id: 'settings', name: '系统设置', icon: Settings },
]

// 模拟数据
const MOCK_STATS = {
  todayOrders: 12,
  totalOrders: 156,
  paidUsers: 89,
  apiCalls: 1234,
  activePlanners: 23,
  pendingPlanners: 5
}

const MOCK_USERS = [
  { id: '1', name: '李明', email: 'liming@email.com', city: '北京', createdAt: '2024-01-15', status: 'active' },
  { id: '2', name: '王芳', email: 'wangfang@email.com', city: '上海', createdAt: '2024-01-16', status: 'active' },
  { id: '3', name: '张伟', email: 'zhangwei@email.com', city: '广州', createdAt: '2024-01-17', status: 'disabled' },
]

const MOCK_PLANNERS = [
  { id: '1', name: '陈策划', company: '唯爱婚礼', city: '北京', serviceType: 'both', status: 'active', orders: 15, income: 25000 },
  { id: '2', name: '林设计', company: '浪漫宣言', city: '上海', serviceType: 'full', status: 'active', orders: 8, income: 18000 },
  { id: '3', name: '赵创意', company: '梦幻婚礼', city: '深圳', serviceType: 'remote', status: 'pending', orders: 0, income: 0 },
]

const MOCK_ORDERS = [
  { id: '1', user: '李明 & 王芳', type: '婚礼', status: 'pending', aiStatus: 'success', createdAt: '2024-01-20', price: 299 },
  { id: '2', user: '张先生 & 陈女士', type: '求婚', status: 'processing', aiStatus: 'success', createdAt: '2024-01-19', price: 1999 },
  { id: '3', user: '刘先生 & 赵女士', type: '婚礼', status: 'completed', aiStatus: 'failed', createdAt: '2024-01-18', price: 0 },
]

const MOCK_ANNOUNCEMENTS = [
  { id: '1', title: '春节放假通知', content: '春节期间客服正常...', createdAt: '2024-01-20', status: 'active' },
  { id: '2', title: '新功能上线', content: 'AI生成功能全面升级...', createdAt: '2024-01-15', status: 'inactive' },
]

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  // 渲染各个功能模块
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent stats={MOCK_STATS} />
      case 'users':
        return <UsersContent users={MOCK_USERS} />
      case 'planners':
        return <PlannersContent planners={MOCK_PLANNERS} />
      case 'orders':
        return <OrdersContent orders={MOCK_ORDERS} />
      case 'content':
        return <div className="text-center py-20"><Sparkles className="w-16 h-16 text-aurora-muted mx-auto mb-4" /><h3 className="text-white text-xl">内容管理</h3><p className="text-aurora-muted">AI生成内容管理功能...</p></div>
      case 'payments':
        return <div className="text-center py-20"><CreditCard className="w-16 h-16 text-aurora-muted mx-auto mb-4" /><h3 className="text-white text-xl">支付流水</h3><p className="text-aurora-muted">支付订单管理...</p></div>
      case 'support':
        return <SupportContent announcements={MOCK_ANNOUNCEMENTS} />
      case 'settings':
        return <div className="text-center py-20"><Settings className="w-16 h-16 text-aurora-muted mx-auto mb-4" /><h3 className="text-white text-xl">系统设置</h3><p className="text-aurora-muted">网站基本设置...</p></div>
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-luxury-dark flex">
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

// 数据概览
function DashboardContent({ stats }: { stats: typeof MOCK_STATS }) {
  const statCards = [
    { label: '今日订单', value: stats.todayOrders, icon: FileText, color: 'rose' },
    { label: '总订单', value: stats.totalOrders, icon: CreditCard, color: 'gold' },
    { label: '付费用户', value: stats.paidUsers, icon: Users, color: 'green' },
    { label: 'API调用', value: stats.apiCalls, icon: Sparkles, color: 'purple' },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl text-white mb-8">数据概览</h1>

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
            <div className="flex items-center justify-between p-3 rounded-lg bg-aurora-card">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-aurora-rose" />
                <span className="text-white">AI生成失败</span>
              </div>
              <span className="text-aurora-rose font-medium">3条</span>
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
              <span className="text-aurora-muted">累计收入</span>
              <span className="text-green-400 font-medium">¥128,500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 用户管理
function UsersContent({ users }: { users: typeof MOCK_USERS }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">用户管理</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
          <Plus className="w-5 h-5" />
          <span>添加用户</span>
        </button>
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
                <td className="px-6 py-4 text-aurora-muted">{user.city}</td>
                <td className="px-6 py-4 text-aurora-muted">{user.createdAt}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.status === 'active' ? '正常' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-aurora-muted hover:text-white hover:bg-aurora-card rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-aurora-muted hover:text-white hover:bg-aurora-card rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-aurora-muted hover:text-red-400 hover:bg-aurora-card rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 策划师管理
function PlannersContent({ planners }: { planners: typeof MOCK_PLANNERS }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">策划师管理</h1>
      </div>

      <div className="grid gap-4">
        {planners.map((planner) => (
          <div key={planner.id} className="p-6 rounded-xl card-luxury border border-aurora-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-aurora-gold/20 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-aurora-gold" />
                </div>
                <div>
                  <div className="text-white font-medium text-lg">{planner.name}</div>
                  <div className="text-aurora-muted text-sm">{planner.company} · {planner.city}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-white font-medium">{planner.orders}</div>
                  <div className="text-aurora-muted text-xs">订单数</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-medium">¥{planner.income}</div>
                  <div className="text-aurora-muted text-xs">收入</div>
                </div>

                <div className="flex items-center gap-2">
                  {planner.status === 'pending' ? (
                    <>
                      <button className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        审核
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
                      设置
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 订单管理
function OrdersContent({ orders }: { orders: typeof MOCK_ORDERS }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">订单管理</h1>
      </div>

      <div className="card-luxury rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-aurora-card">
            <tr>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">订单</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">类型</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">金额</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">AI状态</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">订单状态</th>
              <th className="text-left px-6 py-4 text-aurora-muted font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-aurora-border">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-white font-medium">{order.user}</div>
                    <div className="text-aurora-muted text-sm">{order.createdAt}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-aurora-muted">{order.type}</td>
                <td className="px-6 py-4">
                  <span className="text-white font-medium">¥{order.price}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    order.aiStatus === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {order.aiStatus === 'success' ? '成功' : '失败'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {order.status === 'pending' ? '待处理' : order.status === 'processing' ? '处理中' : '已完成'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-aurora-muted hover:text-white hover:bg-aurora-card rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-aurora-muted hover:text-purple-400 hover:bg-aurora-card rounded-lg">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 客服/公告
function SupportContent({ announcements }: { announcements: typeof MOCK_ANNOUNCEMENTS }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-white">客服/公告</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
          <Plus className="w-5 h-5" />
          <span>发布公告</span>
        </button>
      </div>

      <div className="grid gap-4">
        {announcements.map((item) => (
          <div key={item.id} className="p-6 rounded-xl card-luxury border border-aurora-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-medium text-lg">{item.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    item.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.status === 'active' ? '生效中' : '已失效'}
                  </span>
                </div>
                <p className="text-aurora-muted">{item.content}</p>
                <div className="text-aurora-muted text-sm mt-2">发布时间：{item.createdAt}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-aurora-muted hover:text-white hover:bg-aurora-card rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-aurora-muted hover:text-red-400 hover:bg-aurora-card rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
