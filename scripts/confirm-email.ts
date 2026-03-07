// 确认用户邮箱脚本
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cgdyfikhbfssntetnqne.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZHlmaWtoYmZzc250ZXRucW5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjczMjE5MCwiZXhwIjoyMDg4MzA4MTkwfQ.ra14j2Ob-Rpzjc1ng88mADv4P6JdHQTJf-W9e2Tnvu0'

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function confirmUserEmail() {
  // 查找 planner@qq.com 用户
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()

  if (error) {
    console.error('Error listing users:', error)
    return
  }

  const plannerUser = users.users.find(u => u.email === 'planner@qq.com')

  if (!plannerUser) {
    console.log('User not found')
    return
  }

  console.log('Found user:', plannerUser.email, 'ID:', plannerUser.id)

  // 确认邮箱
  const { error: confirmError } = await (supabaseAdmin.auth.admin as any).updateUser(
    plannerUser.id,
    { email_confirm: true }
  )

  if (confirmError) {
    console.error('Error confirming email:', confirmError)
  } else {
    console.log('Email confirmed successfully!')
  }
}

confirmUserEmail()
