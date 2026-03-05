import { createClient } from '@supabase/supabase-js'

// Supabase 配置
// 在实际部署时，这些值应从环境变量读取
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 用户类型枚举
export type UserType = 'couple' | 'planner'

// 用户资料接口
export interface UserProfile {
  id: string
  email: string
  name: string
  user_type: UserType
  created_at: string
  updated_at?: string
  avatar_url?: string
  company_name?: string // 策划师专用
  phone?: string
  city?: string // 城市
  service_type?: 'remote' | 'full' | null // 策划师服务类型
  service_price?: number // 服务价格
  bio?: string // 策划师简介
}

// 邀请码接口
export interface InviteCode {
  id: string
  code: string
  used: boolean
  used_by?: string
  created_at: string
  expires_at: string
}
