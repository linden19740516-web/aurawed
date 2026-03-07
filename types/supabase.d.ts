// Supabase 类型扩展 - 解决数据库表类型推断问题
import { SupabaseClient } from '@supabase/supabase-js'

// 扩展 SupabaseClient 类型
declare module '@supabase/supabase-js' {
  export interface SupabaseClient<Database = any> {
    from(table: 'weddings'): any
    from(table: 'user_profiles'): any
    from(table: 'invite_codes'): any
    from(table: 'planner_portfolios'): any
    from(table: string): any
  }
}

// 作品集数据类型
export interface PlannerPortfolio {
  id: string
  planner_id: string
  title: string
  description?: string
  cover_image?: string
  images?: string[]
  wedding_style?: string
  city?: string
  venue_type?: string
  budget_range?: string
  guest_count?: number
  is_public: boolean
  likes_count: number
  views_count: number
  created_at: string
  updated_at: string
  // 关联的策划师信息
  planner?: {
    name: string
    avatar_url?: string
    company_name?: string
  }
}
