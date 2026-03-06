// 确认用户邮箱脚本 - 使用 REST API
const SUPABASE_URL = 'https://cgdyfikhbfssntetnqne.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZHlmaWtoYmZzc250ZXRucW5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjczMjE5MCwiZXhwIjoyMDg4MzA4MTkwfQ.ra14j2Ob-Rpzjc1ng88mADv4P6JdHQTJf-W9e2Tnvu0'

const USER_ID = '03efe05c-3df8-4151-aef5-0800987c3c51'

async function confirmEmail() {
  // 使用 auth admin API 确认邮箱
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${USER_ID}`, {
    method: 'PUT',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email_confirm: true
    })
  })

  const data = await response.json()
  console.log('Response:', JSON.stringify(data, null, 2))

  if (response.ok) {
    console.log('✓ 邮箱确认成功!')
  } else {
    console.log('✗ 邮箱确认失败:', data)
  }
}

confirmEmail()
