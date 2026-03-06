// 创建策划师账号（自动确认邮箱）
const SUPABASE_URL = 'https://cgdyfikhbfssntetnqne.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZHlmaWtoYmZzc250ZXRucW5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjczMjE5MCwiZXhwIjoyMDg4MzA4MTkwfQ.ra14j2Ob-Rpzjc1ng88mADv4P6JdHQTJf-W9e2Tnvu0'

async function createPlanner() {
  const email = process.argv[2] || 'newplanner@qq.com'
  const password = process.argv[3] || 'password123'
  const name = process.argv[4] || '新策划师'

  // 1. 创建用户并自动确认邮箱
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })
  })

  const userData = await response.json()

  if (!response.ok) {
    console.log('创建失败:', userData)
    return
  }

  console.log('用户创建成功:', userData.id)

  // 2. 创建 user_profiles 记录
  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      id: userData.id,
      email,
      name,
      user_type: 'planner',
      city: 'Shanghai'
    })
  })

  if (profileResponse.ok) {
    console.log('✓ 策划师账号创建成功!')
    console.log('账号:', email)
    console.log('密码:', password)
  } else {
    console.log('创建 profile 失败')
  }
}

createPlanner()
