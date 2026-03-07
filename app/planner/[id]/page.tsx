'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, Heart, MapPin, Phone, Mail, Image, Loader2,
  ChevronLeft, Calendar, Users, DollarSign, Palette
} from 'lucide-react'
import { supabase, UserProfile } from '@/lib/supabase'

interface PlannerProfile extends UserProfile {
  style_tags?: string[]
  color_tags?: string[]
  portfolio_items?: any[]
}

export default function PlannerPublicPage({ params }: { params: { id: string } }) {
  const [planner, setPlanner] = useState<PlannerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlanner = async () => {
      try {
        // 获取策划师资料
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', params.id)
          .eq('user_type', 'planner')
          .single()

        if (!profile) {
          setPlanner(null)
          setLoading(false)
          return
        }

        // 获取风格标签
        const { data: styleTags } = await supabase
          .from('planner_style_tags')
          .select('tag_name, tag_category')
          .eq('planner_id', params.id)

        const styleTagsArray = styleTags?.filter((t: { tag_category: string }) => t.tag_category === 'style').map((t: { tag_name: string }) => t.tag_name) || []
        const colorTagsArray = styleTags?.filter((t: { tag_category: string }) => t.tag_category === 'color').map((t: { tag_name: string }) => t.tag_name) || []

        // 获取公开作品集
        const { data: portfolioItems } = await supabase
          .from('planner_portfolio_items')
          .select('*')
          .eq('planner_id', params.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false })

        // 增加浏览次数
        if (portfolioItems && portfolioItems.length > 0) {
          await supabase
            .from('planner_portfolio_items')
            .update({ views_count: (portfolioItems[0].views_count || 0) + 1 })
            .eq('planner_id', params.id)
        }

        setPlanner({
          ...profile,
          style_tags: styleTagsArray,
          color_tags: colorTagsArray,
          portfolio_items: portfolioItems || []
        })
      } catch (err) {
        console.error('获取策划师信息失败:', err)
        setPlanner(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPlanner()
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-luxury-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-aurora-gold animate-spin" />
      </main>
    )
  }

  if (!planner) {
    return (
      <main className="min-h-screen bg-luxury-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">策划师不存在</h1>
          <a href="/" className="text-aurora-gold hover:underline">返回首页</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-luxury-dark">
      {/* 头部背景 */}
      <div className="h-64 bg-gradient-to-b from-aurora-gold/20 to-transparent relative">
        <a
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          返回
        </a>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-10 pb-20">
        {/* 策划师信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* 头像 */}
            <div className="flex-shrink-0">
              {planner.avatar_url ? (
                <img
                  src={planner.avatar_url}
                  alt={planner.name}
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-aurora-gold"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-aurora-card flex items-center justify-center border-2 border-aurora-gold/30">
                  <Crown className="w-12 h-12 text-aurora-gold" />
                </div>
              )}
            </div>

            {/* 信息 */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display text-3xl text-white mb-2">{planner.name}</h1>
                  {planner.company_name && (
                    <p className="text-aurora-muted mb-2">{planner.company_name}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-aurora-muted text-sm mb-4">
                {planner.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {planner.city}
                  </span>
                )}
                {planner.service_type && (
                  <span className="flex items-center gap-1">
                    {planner.service_type === 'full' ? '全程策划' : '远程策划'}
                  </span>
                )}
                {planner.service_price && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ¥{planner.service_price}
                  </span>
                )}
              </div>

              {planner.bio && (
                <p className="text-white/80 mb-4">{planner.bio}</p>
              )}

              {/* 风格标签 */}
              {planner.style_tags && planner.style_tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm text-aurora-muted mb-2">擅长风格</h3>
                  <div className="flex flex-wrap gap-2">
                    {planner.style_tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-aurora-gold/20 text-aurora-gold text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 颜色标签 */}
              {planner.color_tags && planner.color_tags.length > 0 && (
                <div>
                  <h3 className="text-sm text-aurora-muted mb-2">偏好颜色</h3>
                  <div className="flex flex-wrap gap-2">
                    {planner.color_tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-aurora-rose/20 text-aurora-rose text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 作品集 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-2">
            <Image className="w-6 h-6 text-aurora-gold" />
            作品集
            <span className="text-aurora-muted text-base font-normal">
              ({planner.portfolio_items?.length || 0})
            </span>
          </h2>

          {planner.portfolio_items && planner.portfolio_items.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {planner.portfolio_items.map((item: any) => (
                <div
                  key={item.id}
                  className="card-luxury rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => item.images?.length > 0 && setActiveImage(item.images[0].url)}
                >
                  <div className="aspect-video bg-aurora-card relative">
                    {item.cover_image ? (
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0].url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-12 h-12 text-aurora-muted" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-2">{item.title}</h3>
                    <p className="text-aurora-muted text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.style_tags?.map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-aurora-gold/20 text-aurora-gold text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-aurora-muted text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.city || '未知城市'}
                      </span>
                      {item.wedding_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.wedding_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-luxury p-12 rounded-2xl text-center">
              <Image className="w-12 h-12 text-aurora-muted mx-auto mb-4" />
              <p className="text-aurora-muted">暂无作品集</p>
            </div>
          )}
        </motion.div>

        {/* 底部提示 */}
        <div className="mt-12 text-center">
          <p className="text-aurora-muted text-sm">
            联系策划师？请前往{' '}
            <a href="/" className="text-aurora-gold hover:underline">首页</a>
            {' '}注册并发起需求
          </p>
        </div>
      </div>

      {/* 图片预览弹窗 */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveImage(null)}
        >
          <img
            src={activeImage}
            alt=""
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </main>
  )
}
