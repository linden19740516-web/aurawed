const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('正在检查 wedding-media 存储桶...')

  // 1. 检查 bucket 是否存在
  const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets()

  if (getBucketsError) {
    console.error('获取存储桶列表失败:', getBucketsError)
    return
  }

  const bucketExists = buckets.some(b => b.name === 'wedding-media')

  if (!bucketExists) {
    console.log('创建 wedding-media 存储桶...')
    const { data, error } = await supabase.storage.createBucket('wedding-media', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    })

    if (error) {
      console.error('创建存储桶失败:', error)
      return
    }
    console.log('存储桶创建成功！')
  } else {
    console.log('wedding-media 存储桶已存在。')
  }

  console.log('完成设置。请确保在Supabase控制台中设置了正确的RLS策略，允许用户上传文件。')
}

setupStorage()