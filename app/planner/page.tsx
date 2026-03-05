'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, Plus, Search, Users, FileText, Settings,
  Sparkles, Image, Download, Copy, RefreshCw, Trash2,
  ChevronRight, MoreVertical, LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// 项目数据结构
interface Project {
  id: string
  name: string
  clientName: string
  status: 'draft' | 'in_progress' | 'completed'
  createdAt: string
  updatedAt: string
  tags: string[]
  thumbnail?: string
}

// 模拟数据
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: '时间的琥珀',
    clientName: '李先生 & 王女士',
    status: 'in_progress',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    tags: ['古典主义', '怀旧情结', '蒸汽朋克'],
  },
  {
    id: '2',
    name: '星际港口的邂逅',
    clientName: '张先生 & 陈女士',
    status: 'completed',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    tags: ['未来感', '科幻美学', '浪漫主义'],
  },
  {
    id: '3',
    name: '爱丽丝梦游仙境',
    clientName: '刘先生 & 赵女士',
    status: 'draft',
    createdAt: '2024-01-22',
    updatedAt: '2024-01-22',
    tags: ['童话感', '自然主义', '梦幻色调'],
  },
]

const STATUS_LABELS = {
  draft: '草稿',
  in_progress: '进行中',
  completed: '已完成',
}

const STATUS_COLORS = {
  draft: 'bg-aurora-muted/20 text-aurora-muted',
  in_progress: 'bg-aurora-gold/20 text-aurora-gold',
  completed: 'bg-green-500/20 text-green-400',
}

export default function PlannerPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'clients' | 'templates'>('projects')
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)

  // 退出登录
  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    window.location.href = '/'
  }

  // 筛选项目
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-luxury-dark flex">
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
              <p className="text-xs text-aurora-muted">策划师工作台</p>
            </div>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'projects'
                  ? 'bg-aurora-gold/10 text-aurora-gold'
                  : 'text-aurora-muted hover:bg-aurora-card hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">我的项目</span>
              <span className="ml-auto text-xs bg-old/20 px-2 py-0.5 rounded-full">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'clients'
                  ? 'bg-aurora-gold/10 text-aurora-gold'
                  : 'text-aurora-muted hover:bg-aurora-card hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">客户管理</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'templates'
                  ? 'bg-aurora-gold/10 text-aurora-gold'
                  : 'text-aurora-muted hover:bg-aurora-card hover:text-white'
              }`}
            >
              <Copy className="w-5 h-5" />
              <span className="font-medium">方案模板</span>
            </button>
          </div>
        </nav>

        {/* 底部 */}
        <div className="p-4 border-t border-aurora-border">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-aurora-muted hover:bg-aurora-card hover:text-white transition-all">
            <Settings className="w-5 h-5" />
            <span className="font-medium">设置</span>
          </button>
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
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="h-16 bg-aurora-surface border-b border-aurora-border flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
              <input
                type="text"
                placeholder="搜索项目或客户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 rounded-xl bg-aurora-card border border-aurora-border text-white placeholder:text-aurora-muted focus:border-aurora-gold/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-aurora-gold/10 text-aurora-gold hover:bg-aurora-gold/20 transition-colors">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI 助手</span>
            </button>
          </div>
        </header>

        {/* 内容区 */}
        <div className="flex-1 p-8 overflow-auto">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl text-white mb-1">我的项目</h1>
              <p className="text-aurora-muted">管理您的婚礼策划项目</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl btn-gold text-aurora-dark font-semibold">
              <Plus className="w-5 h-5" />
              <span>新建项目</span>
            </button>
          </div>

          {/* 项目列表 */}
          {activeTab === 'projects' && (
            <div className="grid gap-4">
              {filteredProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-6 rounded-xl card-luxury border border-aurora-border hover:border-aurora-gold/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-6">
                    {/* 缩略图占位 */}
                    <div className="w-32 h-24 rounded-lg bg-aurora-card flex items-center justify-center flex-shrink-0">
                      <Image className="w-8 h-8 text-aurora-muted" />
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-display text-xl mb-1 group-hover:text-aurora-gold transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-aurora-muted text-sm">
                            客户：{project.clientName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[project.status]}`}>
                            {STATUS_LABELS[project.status]}
                          </span>
                          <button className="p-2 text-aurora-muted hover:text-white hover:bg-aurora-card rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-aurora-card text-aurora-muted text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-aurora-muted text-xs ml-auto">
                          更新于 {project.updatedAt}
                        </span>
                      </div>
                    </div>

                    {/* 操作 */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-aurora-muted hover:text-white hover:bg-aurora-card rounded-lg transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-aurora-muted hover:text-white hover:bg-aurora-card rounded-lg transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-aurora-muted hover:text-aurora-rose-light hover:bg-aurora-card rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-aurora-gold hover:bg-aurora-gold/10 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredProjects.length === 0 && (
                <div className="text-center py-20">
                  <FileText className="w-16 h-16 text-aurora-muted mx-auto mb-4" />
                  <h3 className="text-white text-xl mb-2">暂无项目</h3>
                  <p className="text-aurora-muted mb-6">创建一个新的婚礼策划项目</p>
                  <button className="px-6 py-3 rounded-xl btn-gold text-aurora-dark font-semibold inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>创建项目</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 客户管理 */}
          {activeTab === 'clients' && (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-aurora-muted mx-auto mb-4" />
              <h3 className="text-white text-xl mb-2">客户管理</h3>
              <p className="text-aurora-muted">客户管理功能开发中...</p>
            </div>
          )}

          {/* 方案模板 */}
          {activeTab === 'templates' && (
            <div className="text-center py-20">
              <Copy className="w-16 h-16 text-aurora-muted mx-auto mb-4" />
              <h3 className="text-white text-xl mb-2">方案模板</h3>
              <p className="text-aurora-muted">模板库功能开发中...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
