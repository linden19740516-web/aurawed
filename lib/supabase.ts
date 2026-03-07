import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// 1. 单例模式，避免 Next.js 每次渲染时重复创建实例化对象
let supabaseInstance: ReturnType<typeof createClient> | null = null;
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,    // 开启会话本地持久化
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseInstance;
}

// 管理员客户端 - 用于服务器端操作，拥有完整权限
export const getSupabaseAdmin = () => {
  if (!supabaseAdminInstance && supabaseServiceKey) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return supabaseAdminInstance;
}

// 导出给业务侧继续使用，不需要改动登录和策划师账号的核心代码
export const supabase = getSupabase();

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

// =========================================
// 数据库表类型定义（解决 Supabase 类型推断问题）
// =========================================

// 婚礼项目表
export interface Wedding {
  id: string
  couple_id: string
  name: string
  city?: string
  wedding_date?: string
  budget?: number
  guest_count?: number
  status: 'story' | 'planning' | 'design' | 'completed' | 'cancelled'
  story?: string // AI生成的故事
  plan?: string // AI生成的方案
  design_url?: string // 设计图URL
  need_planner: boolean
  planner_service_type?: 'remote' | 'full' | null
  planner_id?: string
  planner_status?: 'pending' | 'matched' | 'in_progress' | 'completed' | null
  planner_final_plan?: string // 策划师上传的最终方案
  planner_files?: string[] // 策划师上传的文件
  created_at: string
  updated_at: string
}

// 用户资料表
export interface UserProfileRow {
  id: string
  email: string
  name: string
  user_type: 'couple' | 'planner'
  created_at: string
  updated_at?: string
  avatar_url?: string
  company_name?: string
  phone?: string
  city?: string
  service_type?: 'remote' | 'full' | null
  service_price?: number
  bio?: string
}

// 邀请码表
export interface InviteCodeRow {
  id: string
  code: string
  used: boolean
  used_by?: string
  created_at: string
  expires_at: string
}