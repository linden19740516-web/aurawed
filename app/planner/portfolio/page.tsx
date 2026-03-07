'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Search, Image, Trash2, Edit, Eye, EyeOff,
  Upload, X, Loader2, Save, Check, AlertCircle,
  FileImage, DollarSign, Users, MapPin
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Portfolio {
  id: string
  title: string
  description: string
  cover_image: string
  images: string[]
  wedding_style: string
  city: string
  venue_type: string
  budget_range: string
  guest_count: number
  is_public: boolean
  views_count: number
  likes_count: number
  created_at: string
}

// 婚礼风格选项
const WEDDING_STYLES = [
  '户外草坪', '酒店宴会', '目的地婚礼', '中式传统',
  '森系梦幻', '简约现代', '复古宫廷', '海边浪漫', '水晶婚礼'
]

// 场地类型
const VENUE_TYPES = [
  '酒店宴会厅', '户外草坪', '沙滩海边', '特色会所',
  '教堂', '庄园城堡', '游艇', '艺术中心', '其他'
]

// 预算范围
const BUDGET_RANGES = [
  '5万以下', '5-10万', '10-20万', '20-30万',
  '30-50万', '50-100万', '100万以上'
]

export default function PlannerPortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_image: '',
    images: [] as string[],
    wedding_style: '',
    city: '',
    venue_type: '',
    budget_range: '',
    guest_count: '',
    is_public: true
  })

  // 登录状态检查
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

  // 获取作品集列表
  useEffect(() => {
    if (isAuthorized) {
      fetchPortfolios()
    }
  }, [isAuthorized])

  const fetchPortfolios = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('planner_portfolios')
        .select('*')
        .eq('planner_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取作品集失败:', error)
        setPortfolios([])
      } else {
        setPortfolios(data || [])
      }
    } catch (error) {
      console.error('获取作品集失败:', error)
      setPortfolios([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('请先登录')
        return
      }

      const portfolioData = {
        planner_id: session.user.id,
        title: formData.title,
        description: formData.description,
        cover_image: formData.cover_image,
        images: formData.images,
        wedding_style: formData.wedding_style,
        city: formData.city,
        venue_type: formData.venue_type,
        budget_range: formData.budget_range,
        guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
        is_public: formData.is_public
      }

      let error

      if (editingPortfolio) {
        // 更新现有作品集
        const { error: updateError } = await supabase
          .from('planner_portfolios')
          .update(portfolioData)
          .eq('id', editingPortfolio.id)
        error = updateError
      } else {
        // 创建新作品集
        const { error: insertError } = await supabase
          .from('planner_portfolios')
          .insert(portfolioData)
        error = insertError
      }

      if (error) {
        console.error('保存作品集失败:', error)
        alert('保存失败: ' + error.message)
      } else {
        alert(editingPortfolio ? '作品集已更新' : '作品集已创建')
        setShowForm(false)
        setEditingPortfolio(null)
        resetForm()
        fetchPortfolios()
      }
    } catch (error) {
      console.error('保存作品集失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio)
    setFormData({
      title: portfolio.title,
      description: portfolio.description || '',
      cover_image: portfolio.cover_image || '',
      images: portfolio.images || [],
      wedding_style: portfolio.wedding_style || '',
      city: portfolio.city || '',
      venue_type: portfolio.venue_type || '',
      budget_range: portfolio.budget_range || '',
      guest_count: portfolio.guest_count?.toString() || '',
      is_public: portfolio.is_public
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个作品集吗？')) return

    try {
      const { error } = await supabase
        .from('planner_portfolios')
        .delete()
        .eq('id', id)

      if (error) {
        alert('删除失败: ' + error.message)
      } else {
        fetchPortfolios()
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
  }

  const togglePublic = async (portfolio: Portfolio) => {
    try {
      const { error } = await supabase
        .from('planner_portfolios')
        .update({ is_public: !portfolio.is_public })
        .eq('id', portfolio.id)

      if (!error) {
        fetchPortfolios()
      }
    } catch (error) {
      console.error('更新失败:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      cover_image: '',
      images: [],
      wedding_style: '',
      city: '',
      venue_type: '',
      budget_range: '',
      guest_count: '',
      is_public: true
    })
  }

  const openForm = () => {
    resetForm()
    setEditingPortfolio(null)
    setShowForm(true)
  }

  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `portfolios/${fileName}`

      const { error } = await supabase.storage
        .from('wedding-media')
        .upload(filePath, file)

      if (error) {
        throw error
      }

      const { data: { publicUrl } } = supabase.storage
        .from('wedding-media')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('上传失败:', error)
      alert('图片上传失败')
      return null
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'image') => {
    if (!e.target.files || e.target.files.length === 0) return

    if (type === 'cover') {
      setUploadingCover(true)
      const file = e.target.files[0]
      const url = await uploadToSupabase(file)
      if (url) {
        setFormData(prev => ({ ...prev, cover_image: url }))
      }
      setUploadingCover(false)
    } else {
      setUploadingImage(true)
      const files = Array.from(e.target.files)
      const urls: string[] = []

      for (const file of files) {
        const url = await uploadToSupabase(file)
        if (url) urls.push(url)
      }

      if (urls.length > 0) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }))
      }
      setUploadingImage(false)
    }

    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-aurora-gold animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-luxury-dark p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-display text-3xl text-gold mb-2">作品集管理</h1>
            <p className="text-aurora-muted">管理并展示您的婚礼作品</p>
          </div>

          <button
            onClick={openForm}
            className="flex items-center gap-2 px-6 py-3 bg-aurora-gold text-aurora-dark rounded-xl font-semibold hover:bg-aurora-gold-light transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加作品
          </button>
        </motion.div>

        {/* 搜索 */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
          <input
            type="text"
            placeholder="搜索作品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
          />
        </div>

        {/* 作品列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-aurora-gold animate-spin" />
          </div>
        ) : portfolios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-aurora-card flex items-center justify-center">
              <Image className="w-10 h-10 text-aurora-muted" />
            </div>
            <h3 className="text-xl text-white mb-2">暂无作品</h3>
            <p className="text-aurora-muted mb-6">开始添加您的第一个作品集吧</p>
            <button
              onClick={openForm}
              className="inline-flex items-center gap-2 px-6 py-3 bg-aurora-gold text-aurora-dark rounded-xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              添加作品
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios
              .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((portfolio, index) => (
                <motion.div
                  key={portfolio.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-luxury rounded-2xl overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src={portfolio.cover_image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzU1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQwIj7or7zlp4vkuJpNPC90ZXh0Pjwvc3ZnPg=='}
                      alt={portfolio.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                      portfolio.is_public
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {portfolio.is_public ? '已公开' : '草稿'}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg text-white font-medium mb-2">
                      {portfolio.title}
                    </h3>

                    {portfolio.description && (
                      <p className="text-aurora-muted text-sm mb-3 line-clamp-2">
                        {portfolio.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {portfolio.wedding_style && (
                        <span className="px-2 py-1 bg-aurora-gold/10 text-aurora-gold text-xs rounded-full">
                          {portfolio.wedding_style}
                        </span>
                      )}
                      {portfolio.city && (
                        <span className="px-2 py-1 bg-aurora-rose/10 text-aurora-rose-light text-xs rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {portfolio.city}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-aurora-muted mb-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {portfolio.views_count} 浏览
                      </span>
                      <span>{portfolio.images?.length || 0} 张图片</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePublic(portfolio)}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
                          portfolio.is_public
                            ? 'bg-aurora-card text-aurora-muted hover:text-white'
                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        }`}
                      >
                        {portfolio.is_public ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            隐藏
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            公开
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(portfolio)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-aurora-card text-aurora-muted hover:text-white rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(portfolio.id)}
                        className="p-2 bg-aurora-rose/10 text-aurora-rose-light hover:bg-aurora-rose/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        )}

        {/* 添加/编辑弹窗 */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl card-luxury"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-white">
                  {editingPortfolio ? '编辑作品' : '添加新作品'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-aurora-muted hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 标题 */}
                <div>
                  <label className="block text-sm text-aurora-muted mb-2">
                    作品标题 <span className="text-aurora-rose-light">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：浪漫海边婚礼"
                    className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label className="block text-sm text-aurora-muted mb-2">
                    作品描述
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="描述这场婚礼的亮点和特色..."
                    className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted resize-none"
                  />
                </div>

                {/* 封面图 */}
                <div>
                  <label className="block text-sm text-aurora-muted mb-2">
                    封面图片 <span className="text-aurora-rose-light">*</span>
                  </label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-aurora-muted/30 rounded-xl hover:border-aurora-gold/50 hover:bg-aurora-card transition-all cursor-pointer">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingCover ? (
                            <Loader2 className="w-8 h-8 text-aurora-gold animate-spin mb-2" />
                          ) : (
                            <Upload className="w-8 h-8 text-aurora-muted mb-2" />
                          )}
                          <p className="text-sm text-aurora-muted">
                            {uploadingCover ? '上传中...' : '点击或拖拽上传封面'}
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          disabled={uploadingCover}
                          onChange={(e) => handleFileUpload(e, 'cover')}
                        />
                      </label>
                    </div>
                    {formData.cover_image && (
                      <div className="w-32 h-32 rounded-xl overflow-hidden bg-aurora-card relative group">
                        <img
                          src={formData.cover_image}
                          alt="封面预览"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, cover_image: '' })}
                          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 作品图集 */}
                <div>
                  <label className="block text-sm text-aurora-muted mb-2">
                    作品图集
                  </label>
                  <label className="flex items-center justify-center w-full py-4 mb-4 border-2 border-dashed border-aurora-muted/30 rounded-xl hover:border-aurora-gold/50 hover:bg-aurora-card transition-all cursor-pointer">
                    <div className="flex items-center gap-2">
                      {uploadingImage ? (
                        <Loader2 className="w-5 h-5 text-aurora-gold animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5 text-aurora-muted" />
                      )}
                      <span className="text-sm text-aurora-muted">
                        {uploadingImage ? '上传中...' : '点击上传多张图片'}
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      disabled={uploadingImage}
                      onChange={(e) => handleFileUpload(e, 'image')}
                    />
                  </label>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden h-24 bg-aurora-card">
                          <img
                            src={url}
                            alt={`图片 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 风格和城市 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">
                      婚礼风格
                    </label>
                    <select
                      value={formData.wedding_style}
                      onChange={(e) => setFormData({ ...formData, wedding_style: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white appearance-none cursor-pointer"
                    >
                      <option value="">选择风格</option>
                      {WEDDING_STYLES.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">
                      举办城市
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="例如：北京市"
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                    />
                  </div>
                </div>

                {/* 场地和预算 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">
                      场地类型
                    </label>
                    <select
                      value={formData.venue_type}
                      onChange={(e) => setFormData({ ...formData, venue_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white appearance-none cursor-pointer"
                    >
                      <option value="">选择场地</option>
                      {VENUE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-aurora-muted mb-2">
                      预算范围
                    </label>
                    <select
                      value={formData.budget_range}
                      onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl input-luxury text-white appearance-none cursor-pointer"
                    >
                      <option value="">选择预算</option>
                      {BUDGET_RANGES.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 宾客人数 */}
                <div>
                  <label className="block text-sm text-aurora-muted mb-2">
                    宾客人数
                  </label>
                  <input
                    type="number"
                    value={formData.guest_count}
                    onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                    placeholder="例如：150"
                    className="w-full px-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                  />
                </div>

                {/* 是否公开 */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.is_public ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      formData.is_public ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                  <span className="text-white">
                    {formData.is_public ? '公开显示' : '仅自己可见'}
                  </span>
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 bg-aurora-card text-white rounded-xl hover:bg-aurora-card/80 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formData.title}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-aurora-gold text-aurora-dark rounded-xl font-semibold hover:bg-aurora-gold-light transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingPortfolio ? '更新作品' : '发布作品'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
