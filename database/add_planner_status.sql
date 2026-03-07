-- 添加策划师审核状态字段
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 添加 status 字段到 user_profiles 表
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive'));

-- 2. 更新现有策划师为 approved 状态（可选，让已存在的策划师可以直接用）
UPDATE user_profiles
SET status = 'approved'
WHERE user_type = 'planner' AND status IS NULL;

-- 3. 给情侣用户设置为 active
UPDATE user_profiles
SET status = 'active'
WHERE user_type = 'couple' AND status IS NULL;

-- 4. 添加索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
