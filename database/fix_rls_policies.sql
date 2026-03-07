-- ============================================
-- 修复 RLS 安全策略
-- 只允许用户本人和管理员操作数据
--
-- 执行方式（二选一）：
-- 1. Supabase Dashboard: 进入 SQL Editor，粘贴并执行
-- 2. Supabase CLI: supabase db push 或 supabase db reset
-- ============================================

-- 首先设置 search_path 以修复函数安全问题
SET search_path = 'public';

-- 1. 删除不安全的 user_profiles 策略 (如果存在)
DROP POLICY IF EXISTS "public_insert_user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "public_update_user_profiles" ON user_profiles;

-- 2. 创建安全的 user_profiles INSERT 策略
-- 只有用户本人可以创建自己的资料
CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. 创建安全的 user_profiles UPDATE 策略
-- 只有用户本人可以更新自己的资料
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4. 为管理员添加特殊权限 (通过 service_role)
-- 管理员可以插入任何用户资料
CREATE POLICY "Service role can insert any profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- 5. 为管理员添加特殊权限 (通过 service_role)
-- 管理员可以更新任何用户资料
CREATE POLICY "Service role can update any profile"
    ON user_profiles FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 6. 删除不安全的 weddings 策略 (如果存在)
DROP POLICY IF EXISTS "public_insert_weddings" ON weddings;
DROP POLICY IF EXISTS "public_update_weddings" ON weddings;

-- 7. 创建安全的 weddings INSERT 策略
-- 只有情侣本人可以创建自己的婚礼
CREATE POLICY "Couple can create own wedding"
    ON weddings FOR INSERT
    WITH CHECK (auth.uid() = couple_id);

-- 8. 创建安全的 weddings UPDATE 策略
-- 只有情侣本人或策划师可以更新婚礼
CREATE POLICY "Couple or planner can update wedding"
    ON weddings FOR UPDATE
    USING (auth.uid() = couple_id OR auth.uid() = planner_id)
    WITH CHECK (auth.uid() = couple_id OR auth.uid() = planner_id);

-- 9. 为管理员添加 wedding 权限
CREATE POLICY "Service role can manage weddings"
    ON weddings FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 10. 删除不安全的 wedding_plans 策略 (如果存在)
DROP POLICY IF EXISTS "public_insert_wedding_plans" ON wedding_plans;
DROP POLICY IF EXISTS "public_update_wedding_plans" ON wedding_plans;

-- 11. 为管理员添加 wedding_plans 权限
CREATE POLICY "Service role can manage wedding_plans"
    ON wedding_plans FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 12. 修复函数的 search_path
-- 注意：这需要 Supabase CLI 或直接在 Dashboard 中执行
ALTER FUNCTION public.execute_sql SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column SET search_path = 'public';

-- 13. 启用密码泄露保护
ALTER AUTH CONFIG SET enable_signup_with_password_leak_detection = true;
