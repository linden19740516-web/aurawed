/**
 * 数据库连接配置示例
 *
 * 使用方法：
 * 1. 复制此文件为 config.js
 * 2. 填入你的 Supabase 配置信息
 */

export const supabaseConfig = {
  // Supabase 项目 URL
  url: 'https://your-project.supabase.co',

  // Supabase Anon Key (公开)
  anonKey: 'your-anon-key-here',

  // Supabase Service Role Key (保密，仅服务端使用)
  serviceRoleKey: 'your-service-role-key-here'
}

export const databaseConfig = {
  // 数据库连接超时(毫秒)
  timeout: 10000,

  // 是否启用实时订阅
  realtime: true
}
