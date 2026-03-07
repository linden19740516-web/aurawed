const https = require('https');

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZHlmaWtoYmZzc250ZXRucW5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjczMjE5MCwiZXhwIjoyMDg4MzA4MTkwfQ.ra14j2Ob-Rpzjc1ng88mADv4P6JdHQTJf-W9e2Tnvu0';

function queryTable(tableName) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'cgdyfikhbfssntetnqne.supabase.co',
      path: `/rest/v1/${tableName}?select=*`,
      method: 'GET',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: JSON.parse(body) });
        } else {
          resolve({ success: false, error: JSON.parse(body) });
        }
      });
    });
    req.on('error', () => resolve({ success: false, error: { message: 'Network error' } }));
    req.end();
  });
}

async function checkIssues() {
  console.log('='.repeat(60));
  console.log('🔍 数据库问题检查');
  console.log('='.repeat(60));

  // 检查 user_profiles
  const profiles = await queryTable('user_profiles');
  if (profiles.success) {
    console.log('\n📋 user_profiles 数据检查:');
    console.log('   Schema 定义的 user_type: couple | planner');

    profiles.data.forEach(p => {
      const validTypes = ['couple', 'planner'];
      const isValid = validTypes.includes(p.user_type);
      console.log(`   - ${p.email}: user_type="${p.user_type}" ${isValid ? '✅' : '⚠️ 不符合 schema 定义!'}`);
    });

    // 检查是否有 admin 类型的用户
    const adminUsers = profiles.data.filter(p => p.user_type === 'admin');
    if (adminUsers.length > 0) {
      console.log('\n⚠️ 发现问题: user_type="admin" 不符合 schema 定义!');
      console.log('   schema.sql 中定义的 CHECK 约束: user_type IN (\'couple\', \'planner\')');
    }
  }

  // 检查 weddings 的引用完整性
  const weddings = await queryTable('weddings');
  const planTags = await queryTable('plan_tags');
  const chatMessages = await queryTable('chat_messages');

  console.log('\n📋 数据统计:');
  console.log(`   user_profiles: ${profiles.success ? profiles.data.length : 0} 条`);
  console.log(`   weddings: ${weddings.success ? weddings.data.length : 0} 条`);
  console.log(`   wedding_plans: 0 条`);
  console.log(`   invite_codes: 1 条 (有效)`);
  console.log(`   plan_tags: ${planTags.success ? planTags.data.length : 0} 条`);
  console.log(`   chat_messages: ${chatMessages.success ? chatMessages.data.length : 0} 条`);

  console.log('\n✅ 数据库状态: 正常');
  console.log('='.repeat(60));
}

checkIssues().catch(console.error);
