'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Search, Heart, Eye, MapPin, User, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Portfolio {
  id: string
  title: string
  description: string
  cover_image: string
  wedding_style: string
  city: string
  views_count: number
  likes_count: number
  planner: {
    name: string
    avatar_url?: string
    company_name?: string
  }
}

const WEDDING_STYLES = [
  '全部风格',
  '户外草坪',
  '酒店宴会',
  '目的地婚礼',
  '中式传统',
  '森系梦幻',
  '简约现代',
  '复古宫廷',
  '海边浪漫',
  '水晶婚礼'
]

const CITIES = [
  '全部城市',
  '北京市', '上海市', '广州市', '深圳市', '杭州市',
  '南京市', '武汉市', '成都市', '重庆市', '西安市'
]

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('全部风格')
  const [selectedCity, setSelectedCity] = useState('全部城市')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    // 每次筛选条件改变时，重置分页和数据
    setPage(1)
    setPortfolios([])
    setHasMore(true)
    fetchPortfolios(1, true)
  }, [selectedStyle, selectedCity])

  const fetchPortfolios = async (pageNumber: number, isInitial = false) => {
    if (isInitial) setLoading(true)
    else setLoadingMore(true)

    try {
      let query = supabase
        .from('planner_portfolios')
        .select(`
          *,
          planner:user_profiles(name, avatar_url, company_name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (selectedStyle !== '全部风格') {
        query = query.eq('wedding_style', selectedStyle)
      }

      if (selectedCity !== '全部城市') {
        query = query.eq('city', selectedCity)
      }

      // 添加分页
      const from = (pageNumber - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error } = await query

      if (error) {
        console.error('获取作品集失败:', error)
        if (isInitial) setPortfolios([])
      } else {
        const newData = data || []
        if (isInitial) {
          setPortfolios(newData)
        } else {
          setPortfolios(prev => [...prev, ...newData])
        }

        // 检查是否还有更多数据
        if (newData.length < ITEMS_PER_PAGE) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('获取作品集失败:', error)
      if (isInitial) setPortfolios([])
    } finally {
      if (isInitial) setLoading(false)
      else setLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPortfolios(nextPage)
    }
  }

  const filteredPortfolios = portfolios.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const featuredPortfolios = filteredPortfolios.slice(0, 5)

  return (
    <main className="min-h-screen bg-luxury-dark relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="glow-ambient top-[-200px] left-[-200px]" />
        <div className="glow-ambient bottom-[-200px] right-[-200px]" style={{ background: 'radial-gradient(circle, rgba(139, 69, 87, 0.06) 0%, transparent 70%)' }} />
      </div>

      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
          onClick={() => window.location.href = '/'}
          style={{ cursor: 'pointer' }}
        >
          <Sparkles className="w-8 h-8 text-aurora-gold" />
          <span className="font-display text-2xl text-gold font-semibold tracking-wide">AuraWed</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 text-aurora-gold-light border border-aurora-gold/30 rounded-full hover:bg-aurora-gold/10 transition-all duration-300"
          >
            返回首页
          </button>
        </motion.div>
      </nav>

      {/* 主内容 */}
      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl text-gold mb-4">
            婚礼作品集
          </h1>
          <p className="text-aurora-muted text-lg max-w-2xl mx-auto">
            探索优秀婚礼策划师的作品灵感，开启您的梦想婚礼
          </p>
        </motion.div>

        {/* 筛选器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-6xl mx-auto mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* 搜索框 */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
              <input
                type="text"
                placeholder="搜索作品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
              />
            </div>

            {/* 风格筛选 */}
            <div className="flex flex-wrap gap-2 justify-center">
              {WEDDING_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedStyle === style
                      ? 'bg-aurora-gold text-aurora-dark'
                      : 'bg-aurora-card text-aurora-muted hover:text-white'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 城市筛选 */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedCity === city
                    ? 'bg-aurora-rose/20 text-aurora-rose-light border border-aurora-rose/30'
                    : 'bg-aurora-card/50 text-aurora-muted hover:text-white'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 作品集展示 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-aurora-gold animate-spin" />
          </div>
        ) : filteredPortfolios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-aurora-card flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-aurora-muted" />
            </div>
            <h3 className="text-xl text-white mb-2">暂无作品</h3>
            <p className="text-aurora-muted">还没有策划师上传作品，敬请期待</p>
          </motion.div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* 精选作品（轮播） */}
            {featuredPortfolios.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-aurora-gold" />
                  精选作品
                </h2>

                <div className="relative">
                  <div className="overflow-hidden rounded-2xl">
                    <div
                      className="flex transition-transform duration-500"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {featuredPortfolios.map((portfolio, index) => (
                        <div
                          key={portfolio.id}
                          className="w-full flex-shrink-0"
                        >
                          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
                            <img
                              src={portfolio.cover_image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCI+6K+35aWz5LiaPC90ZXh0Pjwvc3ZnPg=='}
                              alt={portfolio.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-8">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 bg-aurora-gold/20 text-aurora-gold text-sm rounded-full">
                                  {portfolio.wedding_style}
                                </span>
                                {portfolio.city && (
                                  <span className="px-3 py-1 bg-white/10 text-white text-sm rounded-full flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {portfolio.city}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-3xl text-white font-display mb-2">
                                {portfolio.title}
                              </h3>

                              <p className="text-white/70 mb-4 line-clamp-2">
                                {portfolio.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-aurora-gold/20 flex items-center justify-center">
                                    <User className="w-5 h-5 text-aurora-gold" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">
                                      {portfolio.planner?.name || '知名策划师'}
                                    </p>
                                    {portfolio.planner?.company_name && (
                                      <p className="text-white/50 text-sm">
                                        {portfolio.planner.company_name}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-white/70">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    {portfolio.views_count}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-4 h-4" />
                                    {portfolio.likes_count}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 轮播控制 */}
                  {featuredPortfolios.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentSlide(prev =>
                          prev === 0 ? featuredPortfolios.length - 1 : prev - 1
                        )}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => setCurrentSlide(prev =>
                          prev === featuredPortfolios.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>

                      <div className="flex justify-center gap-2 mt-4">
                        {featuredPortfolios.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              currentSlide === index
                                ? 'w-8 bg-aurora-gold'
                                : 'bg-white/30'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* 全部作品（网格） */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="font-display text-2xl text-white mb-6">
                全部作品 ({filteredPortfolios.length})
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPortfolios.map((portfolio, index) => (
                  <motion.div
                    key={portfolio.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group card-luxury rounded-2xl overflow-hidden cursor-pointer"
                    onClick={() => {
                      // TODO: 跳转到作品详情页
                    }}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={portfolio.cover_image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjU2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzU1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQwIj7or7zlp4vkuJpNPC90ZXh0Pjwvc3ZnPg=='}
                        alt={portfolio.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-1 bg-aurora-gold/80 text-aurora-dark text-xs rounded-full">
                          {portfolio.wedding_style}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg text-white font-medium mb-2 group-hover:text-aurora-gold transition-colors">
                        {portfolio.title}
                      </h3>

                      {portfolio.description && (
                        <p className="text-aurora-muted text-sm mb-3 line-clamp-2">
                          {portfolio.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-aurora-card flex items-center justify-center">
                            <User className="w-4 h-4 text-aurora-gold" />
                          </div>
                          <span className="text-white/70 text-sm">
                            {portfolio.planner?.name || '知名策划师'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-aurora-muted text-sm">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {portfolio.views_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {portfolio.likes_count}
                          </span>
                        </div>
                      </div>

                      {portfolio.city && (
                        <div className="mt-3 flex items-center gap-1 text-aurora-muted text-sm">
                          <MapPin className="w-3 h-3" />
                          {portfolio.city}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 加载更多按钮 */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-aurora-card text-white rounded-full hover:bg-aurora-card/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        加载中...
                      </>
                    ) : (
                      '加载更多作品'
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </main>
  )
}
